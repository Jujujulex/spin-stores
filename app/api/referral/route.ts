import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { awardPoints } from '@/lib/gamification/points';

function generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getSessionUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let referralCode = await prisma.referralCode.findUnique({
            where: { userId: currentUser.id },
        });

        if (!referralCode) {
            // Generate new code
            const code = generateReferralCode();
            referralCode = await prisma.referralCode.create({
                data: {
                    userId: currentUser.id,
                    code,
                },
            });
        }

        return NextResponse.json({ referralCode });
    } catch (error) {
        console.error('Error fetching referral code:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getSessionUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { code } = body;

        if (!code) {
            return NextResponse.json({ error: 'Code required' }, { status: 400 });
        }

        const referralCode = await prisma.referralCode.findUnique({
            where: { code },
        });

        if (!referralCode) {
            return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
        }

        if (referralCode.userId === currentUser.id) {
            return NextResponse.json({ error: 'Cannot use your own code' }, { status: 400 });
        }

        // Award points to both users
        await Promise.all([
            awardPoints(referralCode.userId, 'REFERRAL_INVITER', `Referred user ${currentUser.id}`),
            awardPoints(currentUser.id, 'REFERRAL_INVITED', `Used referral code ${code}`),
        ]);

        // Increment uses
        await prisma.referralCode.update({
            where: { id: referralCode.id },
            data: { uses: { increment: 1 } },
        });

        return NextResponse.json({ message: 'Referral code applied successfully' });
    } catch (error) {
        console.error('Error applying referral code:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
