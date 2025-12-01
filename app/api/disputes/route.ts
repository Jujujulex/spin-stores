import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
);

async function getUserFromToken(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.userId as string;
    } catch {
        return null;
    }
}

// GET /api/disputes - List user's disputes
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');

        const where: any = {
            OR: [
                { raisedBy: userId },
                {
                    order: {
                        OR: [
                            { buyerId: userId },
                            { sellerId: userId },
                        ],
                    },
                },
            ],
        };

        if (status) {
            where.status = status;
        }

        const disputes = await prisma.dispute.findMany({
            where,
            include: {
                order: {
                    include: {
                        product: {
                            select: {
                                title: true,
                                images: true,
                            },
                        },
                    },
                },
                raiser: {
                    select: {
                        id: true,
                        username: true,
                        walletAddress: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ disputes });
    } catch (error) {
        console.error('Error fetching disputes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch disputes' },
            { status: 500 }
        );
    }
}

// POST /api/disputes - Create new dispute
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { orderId, reason, description } = body;

        if (!orderId || !reason || !description) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if order exists and user is part of it
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { dispute: true },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.buyerId !== userId && order.sellerId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (order.dispute) {
            return NextResponse.json(
                { error: 'Dispute already exists for this order' },
                { status: 400 }
            );
        }

        // Check if order is eligible for dispute (SHIPPED or DELIVERED)
        if (!['SHIPPED', 'DELIVERED'].includes(order.status)) {
            return NextResponse.json(
                { error: 'Order is not eligible for dispute' },
                { status: 400 }
            );
        }

        // Create dispute
        const dispute = await prisma.dispute.create({
            data: {
                orderId,
                raisedBy: userId,
                reason,
                description,
                status: 'OPEN',
            },
            include: {
                order: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        // Update order status
        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'DISPUTED' },
        });

        // Create notifications for both parties
        const otherPartyId = order.buyerId === userId ? order.sellerId : order.buyerId;
        await prisma.notification.create({
            data: {
                userId: otherPartyId,
                title: 'Dispute Raised',
                message: `A dispute has been raised for order #${orderId.slice(0, 8)}`,
                type: 'ORDER_UPDATE',
                link: `/disputes/${dispute.id}`,
            },
        });

        return NextResponse.json(dispute, { status: 201 });
    } catch (error) {
        console.error('Error creating dispute:', error);
        return NextResponse.json(
            { error: 'Failed to create dispute' },
            { status: 500 }
        );
    }
}
