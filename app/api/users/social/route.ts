import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json();
        const { platform, username, url } = body;

        if (!platform || !username) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // In a real implementation with OAuth, we would verify the token here.
        // For this MVP, we are allowing manual linking but marking as unverified initially
        // unless it's a known trusted input (which we don't have yet).
        // To strictly follow the "Verification" part, we could integrate a simple
        // "Post this code to your bio" verification flow, but for now we'll save it.

        const socialProfile = await prisma.socialProfile.upsert({
            where: {
                userId_platform: {
                    userId: user.id,
                    platform,
                },
            },
            update: {
                username,
                url,
                // verified: false, // Reset verification on update
            },
            create: {
                userId: user.id,
                platform,
                username,
                url,
                verified: false, // Default to false
            },
        });

        return NextResponse.json({ socialProfile }, { status: 201 });
    } catch (error) {
        console.error('Error linking social profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const platform = searchParams.get('platform');

        if (!platform) {
            return NextResponse.json({ error: 'Platform required' }, { status: 400 });
        }

        await prisma.socialProfile.delete({
            where: {
                userId_platform: {
                    userId: user.id,
                    platform,
                },
            },
        });

        return NextResponse.json({ message: 'Social profile removed' }, { status: 200 });
    } catch (error) {
        console.error('Error removing social profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
