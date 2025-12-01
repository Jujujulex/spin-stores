'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProductCard from '@/components/products/ProductCard';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Product {
    id: string;
    title: string;
    price: number;
    images: string[];
    category: string;
    condition: string;
    seller: {
        id: string;
        username: string | null;
        avatar: string | null;
        isVerified: boolean;
        trustScore: number;
    };
}

export default function ActivityFeed() {
    const { data: session } = useSession();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFeed = async () => {
            if (!session) return;

            try {
                const response = await fetch('/api/feed');
                if (!response.ok) {
                    throw new Error('Failed to fetch feed');
                }
                const data = await response.json();
                setProducts(data.products);
            } catch (err) {
                console.error(err);
                setError('Failed to load activity feed');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeed();
    }, [session]);

    if (!session) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Sign in to see updates
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Follow your favorite sellers to see their latest products here.
                </p>
                <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    Sign In
                </Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-500">
                {error}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Your feed is empty
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                    You haven't followed any sellers yet, or they haven't posted anything new.
                </p>
                <Link
                    href="/products"
                    className="text-blue-600 hover:text-blue-500 font-medium"
                >
                    Browse Products to Follow Sellers
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Latest from Sellers You Follow
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
