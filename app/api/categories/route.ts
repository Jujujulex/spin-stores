import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Get all categories with product counts
        const categories = await prisma.product.groupBy({
            by: ['category'],
            _count: {
                category: true,
            },
        });

        // Get subcategories for each category
        const categoriesWithSubcategories = await Promise.all(
            categories.map(async (cat) => {
                const subcategories = await prisma.product.groupBy({
                    by: ['subcategory'],
                    where: {
                        category: cat.category,
                        subcategory: { not: null },
                    },
                    _count: {
                        subcategory: true,
                    },
                });

                return {
                    category: cat.category,
                    count: cat._count.category,
                    subcategories: subcategories.map(sub => ({
                        name: sub.subcategory,
                        count: sub._count.subcategory,
                    })),
                };
            })
        );

        return NextResponse.json({ categories: categoriesWithSubcategories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}
