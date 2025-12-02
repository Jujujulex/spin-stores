import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const currentUser = await getSessionUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const savedSearch = await prisma.savedSearch.findUnique({
            where: { id: params.id },
        });

        if (!savedSearch) {
            return NextResponse.json({ error: 'Saved search not found' }, { status: 404 });
        }

        if (savedSearch.userId !== currentUser.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.savedSearch.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Saved search deleted' });
    } catch (error) {
        console.error('Error deleting saved search:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
