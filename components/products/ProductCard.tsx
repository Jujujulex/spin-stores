import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import WishlistButton from './WishlistButton';

interface ProductCardProps {
    product: Product & {
        seller: {
            id: string;
            username?: string | null;
            walletAddress: string;
            avatar?: string | null;
            isVerified: boolean;
        };
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <Link href={`/products/${product.id}`}>
            <div className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {product.images && product.images.length > 0 ? (
                        <Image
                            src={product.images[0]}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            No Image
                        </div>
                    )}
                    {product.condition !== 'new' && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            {product.condition.toUpperCase()}
                        </div>
                    )}
                    <div className="absolute top-2 left-2">
                        <WishlistButton productId={product.id} initialIsWishlisted={false} />
                    </div>
                </div>

                <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {product.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                        {product.description}
                    </p>

                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {formatPrice(product.price)}
                        </span>

                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            {product.seller.isVerified && (
                                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                            <span className="truncate max-w-[100px]">
                                {product.seller.username || product.seller.walletAddress.slice(0, 6)}
                            </span>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {product.category}
                        </span>
                        <span>
                            {product.quantity} available
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
