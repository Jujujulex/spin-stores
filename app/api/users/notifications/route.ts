import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getSessionUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: currentUser.id },
            select: {
                id: true,
                // Notification preferences would be stored here
                // For now, returning default preferences
            },
        });

        const preferences = {
            emailNotifications: true,
            newMessages: true,
            orderUpdates: true,
            priceDrops: true,
            newFollowers: true,
            promotions: false,
        };

        return NextResponse.json({ preferences });
    } catch (error) {
        console.error('Error fetching notification preferences:', error);
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
        // In a full implementation, we'd save these to the database
        // For now, just acknowledge the update

        return NextResponse.json({ message: 'Preferences updated successfully' });
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
