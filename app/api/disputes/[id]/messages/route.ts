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

// GET /api/disputes/[id]/messages - Get dispute messages
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const messages = await prisma.disputeMessage.findMany({
            where: { disputeId: params.id },
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
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Error fetching dispute messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

// POST /api/disputes/[id]/messages - Send message
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { message } = body;

        if (!message || !message.trim()) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Verify user is part of the dispute
        const dispute = await prisma.dispute.findUnique({
            where: { id: params.id },
            include: { order: true },
        });

        if (!dispute) {
            return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
        }

        const isParticipant =
            dispute.raisedBy === userId ||
            dispute.order.buyerId === userId ||
            dispute.order.sellerId === userId;

        if (!isParticipant) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Create message
        const newMessage = await prisma.disputeMessage.create({
            data: {
                disputeId: params.id,
                senderId: userId,
                message: message.trim(),
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        walletAddress: true,
                    },
                },
            },
        });

        // In production, trigger Pusher event here
        // pusher.trigger(`dispute-${params.id}`, 'new-message', newMessage);

        return NextResponse.json({ message: newMessage }, { status: 201 });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
