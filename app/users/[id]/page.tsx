import { prisma } from '@/lib/prisma';
import { formatAddress, formatDate } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import VerificationBadge from '@/components/users/VerificationBadge';
import TrustScore from '@/components/users/TrustScore';
import BadgeList from '@/components/users/BadgeList';
import SellerStatsCard from '@/components/users/SellerStatsCard';

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
            _count: {
                select: { sellingOrders: true, buyingOrders: true }
            }
        }
    });
    return user;
}

export default async function UserProfilePage({ params }: { params: { id: string } }) {
    const user = await getUser(params.id);

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
                            <div className="ml-6 mb-2">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {user.username || formatAddress(user.walletAddress)}
                                    </h1>
                                    <VerificationBadge
                                        isVerified={user.isVerified}
                                        verificationDate={user.verificationDate}
                                    />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Joined {formatDate(user.createdAt)}
                                </p>
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
