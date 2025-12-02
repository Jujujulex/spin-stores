import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Video, Users, ShoppingBag } from 'lucide-react';

async function getLivestream(id: string) {
    const stream = await prisma.liveStream.findUnique({
        where: { id },
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
    });

    return stream;
}

export default async function LivestreamViewerPage({ params }: { params: { id: string } }) {
    const stream = await getLivestream(params.id);

    if (!stream) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video Player */}
                    <div className="lg:col-span-2">
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Video className="w-24 h-24 text-gray-600" />
                                <p className="absolute bottom-4 text-white text-sm">
                                    Video player placeholder - integrate with streaming service
                                </p>
                            </div>
                            {stream.isLive && (
                                <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-sm font-medium rounded">
                                    LIVE
                                </div>
                            )}
                            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-black/70 text-white text-sm rounded">
                                <Users className="w-4 h-4" />
                                {stream.viewerCount}
                            </div>
                        </div>

                        <div className="mt-4 bg-gray-800 rounded-lg p-6">
                            <h1 className="text-2xl font-bold text-white mb-2">{stream.title}</h1>
                            {stream.description && (
                                <p className="text-gray-400">{stream.description}</p>
                            )}

                            <div className="flex items-center gap-3 mt-4">
                                {stream.host.avatar && (
                                    <img
                                        src={stream.host.avatar}
                                        alt={stream.host.username || 'Host'}
                                        className="w-10 h-10 rounded-full"
                                    />
                                )}
                                <div>
                                    <p className="text-white font-medium">
                                        {stream.host.username || 'Anonymous'}
                                    </p>
                                    <p className="text-sm text-gray-400">Host</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <ShoppingBag className="w-5 h-5 text-white" />
                                <h2 className="text-xl font-bold text-white">Featured Products</h2>
                            </div>

                            <div className="space-y-4">
                                {stream.products.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
                                    >
                                        <h3 className="text-white font-medium mb-1">
                                            {item.product.title}
                                        </h3>
                                        <p className="text-2xl font-bold text-blue-400">
                                            {item.product.price} ETH
                                        </p>
                                        <button className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                            Buy Now
                                        </button>
                                    </div>
                                ))}

                                {stream.products.length === 0 && (
                                    <p className="text-gray-400 text-center py-8">
                                        No products featured yet
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
