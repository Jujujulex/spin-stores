import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const follower = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!follower) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const followingId = params.id;

        if (follower.id === followingId) {
            return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
        }

        // Check if already following
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: follower.id,
                    followingId: followingId,
                },
            },
        });

        if (existingFollow) {
            return NextResponse.json({ message: 'Already following' }, { status: 200 });
        }

        await prisma.follow.create({
            data: {
                followerId: follower.id,
                followingId: followingId,
            },
        });

        return NextResponse.json({ message: 'Followed successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error following user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const follower = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!follower) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const followingId = params.id;

        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: follower.id,
                    followingId: followingId,
                },
            },
        });

        return NextResponse.json({ message: 'Unfollowed successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
