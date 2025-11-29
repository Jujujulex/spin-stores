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

export async function GET(request: NextRequest) {
    try {
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get stats
        const [
            totalProducts,
            activeOrders,
            completedOrders,
            totalRevenue
        ] = await Promise.all([
            prisma.product.count({
                where: { sellerId: userId },
            }),
            prisma.order.count({
                where: {
                    sellerId: userId,
                    status: { notIn: ['COMPLETED', 'CANCELLED', 'REFUNDED'] }
                },
            }),
            prisma.order.count({
                where: {
                    sellerId: userId,
                    status: 'COMPLETED'
                },
            }),
            prisma.order.aggregate({
                where: {
                    sellerId: userId,
                    status: 'COMPLETED'
                },
                _sum: {
                    totalAmount: true,
                },
            }),
        ]);

        // Get recent orders
        const recentOrders = await prisma.order.findMany({
            where: { sellerId: userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                product: {
                    select: { title: true, price: true }
                },
                buyer: {
                    select: { username: true, walletAddress: true }
                }
            }
        });

        return NextResponse.json({
            stats: {
                totalProducts,
                activeOrders,
                completedOrders,
                totalRevenue: totalRevenue._sum.totalAmount || 0,
            },
            recentOrders,
        });
    } catch (error) {
        console.error('Error fetching seller dashboard:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
