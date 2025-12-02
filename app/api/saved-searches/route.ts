import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getSessionUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const savedSearches = await prisma.savedSearch.findMany({
            where: {
                userId: currentUser.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ savedSearches });
    } catch (error) {
        console.error('Error fetching saved searches:', error);
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
        const { name, query, category, minPrice, maxPrice, condition } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const savedSearch = await prisma.savedSearch.create({
            data: {
                userId: currentUser.id,
                name,
                query,
                category,
                minPrice,
                maxPrice,
                condition,
            },
        });

        return NextResponse.json({ savedSearch }, { status: 201 });
    } catch (error) {
        console.error('Error creating saved search:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
