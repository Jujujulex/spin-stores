'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatPrice, formatAddress } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, login } = useAuth();
    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        if (params.id) {
            fetchProduct();
        }
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            const response = await fetch(`/api/products/${params.id}`);
            const data = await response.json();
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            await login();
            return;
        }
        router.push(`/checkout/${product.id}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Product not found
                    </h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                        {/* Image Gallery */}
                        <div>
                            <div className="relative h-96 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
                                {product.images && product.images.length > 0 ? (
                                    <Image
                                        src={product.images[selectedImage]}
                                        alt={product.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {product.images && product.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {product.images.map((image: string, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`relative h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index
                                                    ? 'border-primary-600'
                                                    : 'border-gray-200 dark:border-gray-700'
                                                }`}
                                        >
                                            <Image src={image} alt={`${product.title} ${index + 1}`} fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                {product.title}
                            </h1>

                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                                    {formatPrice(product.price)}
                                </span>
                                <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                                    {product.condition}
                                </span>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-2">Description</h2>
                                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                    {product.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <span className="text-sm text-gray-500">Category</span>
                                    <p className="font-semibold">{product.category}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Quantity</span>
                                    <p className="font-semibold">{product.quantity} available</p>
                                </div>
                            </div>

                            {/* Seller Info */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                                <h3 className="text-lg font-semibold mb-3">Seller Information</h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {product.seller.username?.[0]?.toUpperCase() || 'S'}
                                    </div>
                                    <div>
                                        <p className="font-semibold flex items-center gap-2">
                                            {product.seller.username || 'Anonymous'}
                                            {product.seller.isVerified && (
                                                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatAddress(product.seller.walletAddress)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Buy Button */}
                            <button
                                onClick={handleBuyNow}
                                disabled={product.quantity < 1}
                                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
                            >
                                {product.quantity < 1 ? 'Out of Stock' : 'Buy Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
