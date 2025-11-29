import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        const data = await request.text();
        const [socketId, channelName] = data.split('&').map(str => str.split('=')[1]);

        // Authorize user for private channel
        // Channel format: private-user-{userId}
        if (channelName.startsWith('private-user-')) {
            const channelUserId = channelName.replace('private-user-', '');
            if (channelUserId !== userId) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const authResponse = pusherServer.authorizeChannel(socketId, channelName, {
            user_id: userId,
            user_info: {
                id: userId,
            },
        });

        return NextResponse.json(authResponse);
    } catch (error) {
        console.error('Pusher auth error:', error);
        return NextResponse.json(
            { error: 'Failed to authorize channel' },
            { status: 500 }
        );
    }
}
