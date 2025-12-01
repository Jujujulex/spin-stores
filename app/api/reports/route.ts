import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getSessionUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { targetType, targetId, reason, description } = body;

        if (!targetType || !targetId || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!['PRODUCT', 'USER'].includes(targetType)) {
            return NextResponse.json({ error: 'Invalid target type' }, { status: 400 });
        }

        // Verify target exists
        if (targetType === 'PRODUCT') {
            const product = await prisma.product.findUnique({
                where: { id: targetId },
            });
            if (!product) {
                return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }
        } else if (targetType === 'USER') {
            const user = await prisma.user.findUnique({
                where: { id: targetId },
            });
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
        }

        const report = await prisma.report.create({
            data: {
                reporterId: currentUser.id,
                targetType,
                targetId,
                reason,
                description,
                productId: targetType === 'PRODUCT' ? targetId : null,
            },
        });

        return NextResponse.json({ report }, { status: 201 });
    } catch (error) {
        console.error('Error creating report:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getSessionUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only admins can view all reports (for now, we'll just return user's own reports)
        const reports = await prisma.report.findMany({
            where: {
                reporterId: currentUser.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ reports });
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
