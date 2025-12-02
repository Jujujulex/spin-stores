import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Video, Plus } from 'lucide-react';
import Link from 'next/link';

async function getStreamerStreams() {
    const currentUser = await getSessionUser();

    if (!currentUser) {
        redirect('/login');
    }

    const streams = await prisma.liveStream.findMany({
        where: {
            hostId: currentUser.id,
        },
        include: {
            products: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return { currentUser, streams };
}

export default async function StreamerDashboard() {
    const { currentUser, streams } = await getStreamerStreams();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Streamer Dashboard
                    </h1>
                    <Link
                        href="/live/create"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <Plus className="w-5 h-5" />
                        Create Stream
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {streams.map((stream) => (
                        <div
                            key={stream.id}
                            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm"
                        >
                            <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Video className="w-16 h-16 text-gray-400" />
                                </div>
                                {stream.isLive && (
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs font-medium rounded">
                                        LIVE
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {stream.title}
                                </h3>

                                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>{stream.products.length} products</span>
                                    <span>{stream.viewerCount} viewers</span>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <Link
                                        href={`/live/${stream.id}`}
                                        className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-center"
                                    >
                                        View
                                    </Link>
                                    <Link
                                        href={`/live/${stream.id}/manage`}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
                                    >
                                        Manage
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    {streams.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                            <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No streams yet
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Create your first livestream to start selling!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
