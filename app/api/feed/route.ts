import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Get IDs of users the current user follows
        const following = await prisma.follow.findMany({
            where: {
                followerId: user.id,
            },
            select: {
                followingId: true,
            },
        });

        const followingIds = following.map((f) => f.followingId);

        if (followingIds.length === 0) {
            return NextResponse.json({
                products: [],
                pagination: {
                    total: 0,
                    pages: 0,
                    page,
                    limit,
                },
            });
        }

        // Fetch products from followed sellers
        const [products, total] = await prisma.$transaction([
            prisma.product.findMany({
                where: {
                    sellerId: {
                        in: followingIds,
                    },
                },
                include: {
                    seller: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                            isVerified: true,
                            trustScore: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.product.count({
                where: {
                    sellerId: {
                        in: followingIds,
                    },
                },
            }),
        ]);

        return NextResponse.json({
            products,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit,
            },
        });
    } catch (error) {
        console.error('Error fetching activity feed:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
