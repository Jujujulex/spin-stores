import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

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

// GET /api/products - List all products with filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');
        const tags = searchParams.get('tags')?.split(',').filter(Boolean);
        const conditions = searchParams.get('conditions')?.split(',').filter(Boolean);
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'newest';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const where: any = {};

        // Category filters
        if (category) where.category = category;
        if (subcategory) where.subcategory = subcategory;
        if (tags && tags.length > 0) {
            where.tags = { hasSome: tags };
        }

        // Condition filter
        if (conditions && conditions.length > 0) {
            where.condition = { in: conditions };
        }

        // Price range filter
        if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
        if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };

        // Search filter
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Sort options
        let orderBy: any = { createdAt: 'desc' }; // default: newest
        switch (sortBy) {
            case 'price-low':
                orderBy = { price: 'asc' };
                break;
            case 'price-high':
                orderBy = { price: 'desc' };
                break;
            case 'most-liked':
                orderBy = { wishlistedBy: { _count: 'desc' } };
                break;
            case 'newest':
            default:
                orderBy = { createdAt: 'desc' };
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    seller: {
                        select: {
                            id: true,
                            username: true,
                            walletAddress: true,
                            avatar: true,
                            isVerified: true,
                            trustScore: true,
                        },
                    },
                    _count: {
                        select: {
                            wishlistedBy: true,
                        },
                    },
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.product.count({ where }),
        ]);

        return NextResponse.json({
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, description, price, images, category, condition } = body;

        // Validation
        if (!title || !description || !price || !images || !category) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const product = await prisma.product.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                images,
                category,
                condition: condition || 'new',
                sellerId: userId,
            },
            include: {
                seller: {
                    select: {
                        id: true,
                        username: true,
                        walletAddress: true,
                        avatar: true,
                    },
                },
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}
