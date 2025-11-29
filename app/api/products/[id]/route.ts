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

// GET /api/products/[id] - Get single product
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const product = await prisma.product.findUnique({
            where: { id: params.id },
            include: {
                seller: {
                    select: {
                        id: true,
                        username: true,
                        walletAddress: true,
                        avatar: true,
                        isVerified: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

// PATCH /api/products/[id] - Update product
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const product = await prisma.product.findUnique({
            where: { id: params.id },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        if (product.sellerId !== userId) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const updated = await prisma.product.update({
            where: { id: params.id },
            data: body,
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

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const product = await prisma.product.findUnique({
            where: { id: params.id },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        if (product.sellerId !== userId) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        await prisma.product.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}
