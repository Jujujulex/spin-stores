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

export async function POST(request: NextRequest) {
    try {
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { orderId, targetUserId, rating, comment } = body;

        if (!orderId || !targetUserId || !rating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify order exists and user is involved
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Ensure user is either buyer or seller, and target is the other party
        const isBuyer = order.buyerId === userId;
        const isSeller = order.sellerId === userId;

        if (!isBuyer && !isSeller) {
            return NextResponse.json({ error: 'Not authorized to review this order' }, { status: 403 });
        }

        if (isBuyer && order.sellerId !== targetUserId) {
            return NextResponse.json({ error: 'Invalid target user' }, { status: 400 });
        }

        if (isSeller && order.buyerId !== targetUserId) {
            return NextResponse.json({ error: 'Invalid target user' }, { status: 400 });
        }

        // Check if review already exists
        const existingReview = await prisma.review.findUnique({
            where: { orderId },
        });

        if (existingReview) {
            return NextResponse.json({ error: 'Review already exists for this order' }, { status: 400 });
        }

        const review = await prisma.review.create({
            data: {
                rating,
                comment,
                authorId: userId,
                targetId: targetUserId,
                orderId,
            },
        });

        return NextResponse.json({ review });
    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            { error: 'Failed to create review' },
            { status: 500 }
        );
    }
}
