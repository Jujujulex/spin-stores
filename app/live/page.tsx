import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Video, Users, Calendar } from 'lucide-react';

async function getLiveStreams() {
    const streams = await prisma.liveStream.findMany({
        where: {
            isLive: true,
        },
        include: {
            host: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                },
            },
            products: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: {
            startedAt: 'desc',
        },
    });

    return streams;
}

export default async function LiveNowPage() {
    const streams = await getLiveStreams();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-8">
                    <Video className="w-8 h-8 text-red-600" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Live Now
                    </h1>
                    <span className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full animate-pulse">
                        LIVE
                    </span>
                </div>

                {streams.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                        <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No live streams right now
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Check back later for live shopping events!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {streams.map((stream) => (
                            <Link
                                key={stream.id}
                                href={`/live/${stream.id}`}
                                className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                                    {/* Placeholder for stream thumbnail */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Video className="w-16 h-16 text-gray-400" />
                                    </div>
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs font-medium rounded">
                                        LIVE
                                    </div>
                                    <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/70 text-white text-xs rounded">
                                        <Users className="w-3 h-3" />
                                        {stream.viewerCount}
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                        {stream.title}
                                    </h3>

                                    <div className="flex items-center gap-2 mb-3">
                                        {stream.host.avatar && (
                                            <img
                                                src={stream.host.avatar}
                                                alt={stream.host.username || 'Host'}
                                                className="w-6 h-6 rounded-full"
                                            />
                                        )}
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {stream.host.username || 'Anonymous'}
                                        </span>
                                    </div>

                                    {stream.products.length > 0 && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {stream.products.length} product{stream.products.length !== 1 ? 's' : ''} featured
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
