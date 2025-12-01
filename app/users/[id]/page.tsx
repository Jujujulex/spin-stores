import { prisma } from '@/lib/prisma';
import { formatAddress, formatDate } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import VerificationBadge from '@/components/users/VerificationBadge';
import TrustScore from '@/components/users/TrustScore';
import BadgeList from '@/components/users/BadgeList';
import SellerStatsCard from '@/components/users/SellerStatsCard';
import FollowButton from '@/components/social/FollowButton';
import { getSessionUser } from '@/lib/auth';

async function getUser(id: string) {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            products: {
                orderBy: { createdAt: 'desc' },
                include: {
                    seller: {
                        select: {
                            id: true,
                            username: true,
                            walletAddress: true,
                            avatar: true,
                            isVerified: true,
                        }
                    }
                }
            },
            badges: true,
            sellerStats: true,
            socialProfiles: true,
            followers: {
                where: {
                    // We'll filter this in the component or check client-side
                    // but for now let's just get the count or list
                },
                select: {
                    followerId: true
                }
            },
            _count: {
                select: {
                    sellingOrders: true,
                    buyingOrders: true,
                    followers: true,
                    following: true
                }
            }
        }
    });
    return user;
}

export default async function UserProfilePage({ params }: { params: { id: string } }) {
    const user = await getUser(params.id);
    const currentUser = await getSessionUser();

    // Check if current user is following
    const isFollowing = currentUser
        ? user?.followers.some((f: any) => f.followerId === currentUser.id)
        : false;

    if (!user) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-primary-500 to-purple-600"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex items-end -mt-16 mb-6">
                            <div className="relative h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700">
                                {user.avatar ? (
                                    <Image
                                        src={user.avatar}
                                        alt={user.username || 'User'}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-700">
                                        <span className="text-4xl font-bold">
                                            {(user.username?.[0] || 'U').toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="ml-6 mb-2 flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {user.username || formatAddress(user.walletAddress)}
                                        </h1>
                                        <VerificationBadge
                                            isVerified={user.isVerified}
                                            verificationDate={user.verificationDate}
                                        />
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        <span>Joined {formatDate(user.createdAt)}</span>
                                        <span>•</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {user._count.followers} Followers
                                        </span>
                                        <span>•</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {user._count.following} Following
                                        </span>
                                    </div>

                                    {/* Social Links */}
                                    {user.socialProfiles && user.socialProfiles.length > 0 && (
                                        <div className="flex items-center gap-3 mt-3">
                                            {user.socialProfiles.map((profile: any) => (
                                                <a
                                                    key={profile.id}
                                                    href={profile.url || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                                    title={profile.platform}
                                                >
                                                    {profile.platform === 'TWITTER' && (
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                                        </svg>
                                                    )}
                                                    {profile.platform === 'GITHUB' && (
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <FollowButton
                                    targetUserId={user.id}
                                    initialIsFollowing={isFollowing}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About</h2>
                                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                    {user.bio || 'No bio provided.'}
                                </p>
                            </div>

                            {user.badges.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Badges</h2>
                                    <BadgeList badges={user.badges} />
                                </div>
                            )}

                            {user.sellerStats && (
                                <SellerStatsCard stats={user.sellerStats} />
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trust Score</h3>
                                <TrustScore score={user.trustScore} />
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Listings</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{user.products.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Sales</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{user._count.sellingOrders}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Purchases</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{user._count.buyingOrders}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Active Listings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {user.products.map((product: any) => (
                        <Link key={product.id} href={`/products/${product.id}`} className="group">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 dark:bg-gray-700 relative h-48">
                                    {product.images[0] ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.title}
                                            fill
                                            className="object-cover group-hover:opacity-75 transition-opacity"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                                        {product.title}
                                    </h3>
                                    <p className="mt-1 text-lg font-bold text-primary-600 dark:text-primary-400">
                                        {product.price} ETH
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {user.products.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                            No active listings
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
