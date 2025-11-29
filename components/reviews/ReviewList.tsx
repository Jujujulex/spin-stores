'use client';

import { formatRelativeTime, formatAddress } from '@/lib/utils';
import Image from 'next/image';

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    author: {
        username: string | null;
        walletAddress: string;
        avatar: string | null;
    };
}

interface ReviewListProps {
    reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No reviews yet.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                {review.author.avatar ? (
                                    <Image
                                        src={review.author.avatar}
                                        alt={review.author.username || 'User'}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400 font-bold">
                                        {(review.author.username?.[0] || 'U').toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {review.author.username || formatAddress(review.author.walletAddress)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatRelativeTime(review.createdAt)}
                                </p>
                            </div>
                        </div>
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                    key={star}
                                    className={`w-5 h-5 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                                        }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                    </div>
                    {review.comment && (
                        <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm">
                            {review.comment}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}
