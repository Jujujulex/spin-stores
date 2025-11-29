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

export async function POST(request: NextRequest) {
    try {
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { orderId, content, receiverId } = body;

        if (!orderId || !content || !receiverId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create message in database
        const message = await prisma.message.create({
            data: {
                content,
                orderId,
                senderId: userId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        walletAddress: true,
                        avatar: true,
                    },
                },
            },
        });

        // Trigger real-time event
        // Channel: private-user-{receiverId}
        await pusherServer.trigger(`private-user-${receiverId}`, 'new-message', {
            message,
            orderId,
        });

        // Also trigger for sender (for multi-device sync)
        await pusherServer.trigger(`private-user-${userId}`, 'new-message', {
            message,
            orderId,
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
