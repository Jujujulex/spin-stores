import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';
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

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orderId = params.id;

        // Update all unread messages in this order sent by the other party
        const result = await prisma.message.updateMany({
            where: {
                orderId: orderId,
                senderId: { not: userId },
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        if (result.count > 0) {
            // Trigger read receipt event
            // We need to find the other user ID to send the event to their channel
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                select: { buyerId: true, sellerId: true }
            });

            if (order) {
                const otherUserId = order.buyerId === userId ? order.sellerId : order.buyerId;
                await pusherServer.trigger(`private-user-${otherUserId}`, 'messages-read', {
                    orderId,
                    readAt: new Date(),
                });
            }
        }

        return NextResponse.json({ success: true, count: result.count });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark messages as read' },
            { status: 500 }
        );
    }
}
