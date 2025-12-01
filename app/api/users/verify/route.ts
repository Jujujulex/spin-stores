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

// POST /api/users/verify - Submit verification application
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { businessName, businessType, documents } = body;

        // In a real implementation, this would:
        // 1. Store verification documents
        // 2. Create a verification request
        // 3. Notify admins for review

        // For now, we'll just return success
        return NextResponse.json({
            message: 'Verification application submitted successfully',
            status: 'PENDING_REVIEW',
        });
    } catch (error) {
        console.error('Error submitting verification:', error);
        return NextResponse.json(
            { error: 'Failed to submit verification' },
            { status: 500 }
        );
    }
}
