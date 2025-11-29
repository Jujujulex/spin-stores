import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Verify JWT
        const { payload } = await jwtVerify(token, JWT_SECRET);

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: {
                id: true,
                walletAddress: true,
                username: true,
                email: true,
                bio: true,
                avatar: true,
                isVerified: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 401 }
        );
    }
}
