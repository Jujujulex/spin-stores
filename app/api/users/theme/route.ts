import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
    try {
        const currentUser = await getSessionUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { theme } = body;

        if (!theme || !['light', 'dark', 'system'].includes(theme)) {
            return NextResponse.json({ error: 'Invalid theme value' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: currentUser.id },
            data: { theme },
            select: {
                id: true,
                theme: true,
            },
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error('Error updating theme:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
