import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getSessionUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const stream = await prisma.liveStream.create({
            data: {
                hostId: currentUser.id,
                title,
                description,
                isLive: false,
            },
        });

        return NextResponse.json({ stream }, { status: 201 });
    } catch (error) {
        console.error('Error creating livestream:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const currentUser = await getSessionUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { streamId, isLive } = body;

        const stream = await prisma.liveStream.findUnique({
            where: { id: streamId },
        });

        if (!stream || stream.hostId !== currentUser.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const updatedStream = await prisma.liveStream.update({
            where: { id: streamId },
            data: {
                isLive,
                startedAt: isLive ? new Date() : stream.startedAt,
                endedAt: !isLive ? new Date() : null,
            },
        });

        return NextResponse.json({ stream: updatedStream });
    } catch (error) {
        console.error('Error updating livestream:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
