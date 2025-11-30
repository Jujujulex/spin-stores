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

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'buying' or 'selling'
        const status = searchParams.get('status');

        const where: any = {};
        if (type === 'buying') {
            where.buyerId = userId;
        } else if (type === 'selling') {
            where.sellerId = userId;
        } else {
            where.OR = [{ buyerId: userId }, { sellerId: userId }];
        }

        if (status) {
            where.status = status;
        }

        const orders = await prisma.order.findMany({
            where,
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
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { productId, escrowAddress } = body;

        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        if (product.sellerId === userId) {
            return NextResponse.json(
                { error: 'Cannot buy your own product' },
                { status: 400 }
            );
        }

        const order = await prisma.order.create({
            data: {
                buyerId: userId,
                sellerId: product.sellerId,
                productId: product.id,
                totalAmount: product.price,
                escrowAddress,
                status: 'PAYMENT_PENDING',
            },
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

        // Create notification for seller
        await prisma.notification.create({
            data: {
                userId: product.sellerId,
                type: 'ORDER_CREATED',
                title: 'New Order',
                message: `You have a new order for ${product.title}`,
            },
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        );
    }
}
