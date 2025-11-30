'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface WishlistButtonProps {
    productId: string;
    initialIsWishlisted?: boolean;
}

export default function WishlistButton({ productId, initialIsWishlisted = false }: WishlistButtonProps) {
    const { isAuthenticated } = useAuth();
    const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
    const [isLoading, setIsLoading] = useState(false);

    // If initial state is not provided, we could fetch it, but usually parent provides it.
    // For now, we rely on the prop or default false. 
    // In a real app, we might want to check status on mount if not provided.

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation if inside a Link
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Please connect your wallet to use wishlist');
            return;
        }

        setIsLoading(true);
        const previousState = isWishlisted;
        setIsWishlisted(!previousState); // Optimistic update

        try {
            const method = previousState ? 'DELETE' : 'POST';
            const response = await fetch('/api/wishlist', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
            });

            if (!response.ok) {
                throw new Error('Failed to update wishlist');
            }

            toast.success(previousState ? 'Removed from wishlist' : 'Added to wishlist');
        } catch (error) {
            console.error('Error updating wishlist:', error);
            setIsWishlisted(previousState); // Revert on error
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={toggleWishlist}
            disabled={isLoading}
            className={`p-2 rounded-full transition-colors ${isWishlisted
                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            <svg
                className={`w-6 h-6 ${isWishlisted ? 'fill-current' : 'fill-none'}`}
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
        </button>
    );
}
