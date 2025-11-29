import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
    try {
        const { message, signature } = await request.json();

        // Get nonce from cookie
        const nonce = request.cookies.get('siwe-nonce')?.value;

        if (!nonce) {
            return NextResponse.json(
                { error: 'Nonce not found' },
                { status: 400 }
            );
        }

        // Verify SIWE message
        const siweMessage = new SiweMessage(message);
        const fields = await siweMessage.verify({ signature, nonce });

        if (!fields.data) {
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        // Create or update user in database
        const user = await prisma.user.upsert({
            where: { walletAddress: fields.data.address.toLowerCase() },
            update: { updatedAt: new Date() },
            create: {
                walletAddress: fields.data.address.toLowerCase(),
            },
        });

        // Create JWT token
        const token = await new SignJWT({ userId: user.id, address: user.walletAddress })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(JWT_SECRET);

        const response = NextResponse.json({ success: true, user });

        // Set auth cookie
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        // Clear nonce cookie
        response.cookies.delete('siwe-nonce');

        return response;
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { error: 'Verification failed' },
            { status: 500 }
        );
    }
}
