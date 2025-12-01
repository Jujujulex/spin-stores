'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';

interface FollowButtonProps {
    targetUserId: string;
    initialIsFollowing: boolean;
    onToggle?: (isFollowing: boolean) => void;
    className?: string;
}

export default function FollowButton({
    targetUserId,
    initialIsFollowing,
    onToggle,
    className = '',
}: FollowButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggleFollow = async () => {
        if (!session) {
            toast.error('Please sign in to follow users');
            router.push('/login');
            return;
        }

        if (session.user.id === targetUserId) {
            return; // Cannot follow self
        }

        setIsLoading(true);
        const previousState = isFollowing;

        // Optimistic update
        setIsFollowing(!previousState);

        try {
            const method = previousState ? 'DELETE' : 'POST';
            const response = await fetch(`/api/users/${targetUserId}/follow`, {
                method,
            });

            if (!response.ok) {
                throw new Error('Failed to update follow status');
            }

            const data = await response.json();

            if (onToggle) {
                onToggle(!previousState);
            }

            toast.success(previousState ? 'Unfollowed user' : 'Following user');
            router.refresh();
        } catch (error) {
            // Revert optimistic update
            setIsFollowing(previousState);
            toast.error('Something went wrong. Please try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (session?.user?.id === targetUserId) {
        return null;
    }

    return (
        <button
            onClick={handleToggleFollow}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } ${className}`}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isFollowing ? (
                <>
                    <UserMinus className="w-4 h-4" />
                    Unfollow
                </>
            ) : (
                <>
                    <UserPlus className="w-4 h-4" />
                    Follow
                </>
            )}
        </button>
    );
}
