import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

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

// GET /api/orders/[id] - Get single order
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const order = await prisma.order.findUnique({
            where: { id: params.id },
            include: {
                product: true,
                buyer: {
                    select: {
                        id: true,
                        username: true,
                        walletAddress: true,
                        avatar: true,
                    },
                },
                seller: {
                    select: {
                        id: true,
                        username: true,
                        walletAddress: true,
                        avatar: true,
                    },
                },
                messages: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                walletAddress: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Check if user is buyer or seller
        if (order.buyerId !== userId && order.sellerId !== userId) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}

// PATCH /api/orders/[id] - Update order
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const order = await prisma.order.findUnique({
            where: { id: params.id },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Check permissions
        if (order.buyerId !== userId && order.sellerId !== userId) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const updated = await prisma.order.update({
            where: { id: params.id },
            data: body,
            include: {
                product: true,
                buyer: {
                    select: {
                        id: true,
                        username: true,
                        walletAddress: true,
                    },
                },
                seller: {
                    select: {
                        id: true,
                        username: true,
                        walletAddress: true,
                    },
                },
            },
        });

        // Create notification for status changes
        if (body.status) {
            const notifyUserId = userId === order.buyerId ? order.sellerId : order.buyerId;
            await prisma.notification.create({
                data: {
                    userId: notifyUserId,
                    type: `ORDER_${body.status}` as any,
                    title: 'Order Update',
                    message: `Order status changed to ${body.status}`,
                },
            });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        );
    }
}
