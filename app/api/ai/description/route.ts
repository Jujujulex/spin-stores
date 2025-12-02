import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { generateProductDescription } from '@/lib/ai/service';

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getSessionUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, category, condition } = body;

        if (!title || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const description = await generateProductDescription(
            title,
            category,
            condition || 'New'
        );

        if (!description) {
            return NextResponse.json(
                { error: 'AI service unavailable' },
                { status: 503 }
            );
        }

        return NextResponse.json({ description });
    } catch (error) {
        console.error('Error generating description:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
