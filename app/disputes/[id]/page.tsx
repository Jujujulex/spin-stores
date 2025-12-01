'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import DisputeChat from '@/components/disputes/DisputeChat';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function DisputeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [dispute, setDispute] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchDispute();
        }
    }, [params.id]);

    const fetchDispute = async () => {
        try {
            const response = await fetch(`/api/disputes?id=${params.id}`);
            if (response.ok) {
                const data = await response.json();
                setDispute(data.disputes?.[0] || null);
            }
        } catch (error) {
            console.error('Error fetching dispute:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    if (!dispute) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Dispute not found</h2>
                    <Link href="/disputes" className="text-primary-600 hover:underline">
                        ← Back to Disputes
                    </Link>
                </div>
            </div>
        );
    }

    const statusColors = {
        OPEN: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        IN_REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Dispute #{dispute.id.slice(0, 8)}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Raised on {formatDate(dispute.createdAt)}
                        </p>
                    </div>
                    <Link
                        href="/disputes"
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                        ← Back to Disputes
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Dispute Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Dispute Information</h2>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[dispute.status as keyof typeof statusColors]
                                        }`}
                                >
                                    {dispute.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Reason
                                    </h3>
                                    <p className="text-gray-900 dark:text-white">{dispute.reason}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                    </h3>
                                    <p className="text-gray-900 dark:text-white">{dispute.description}</p>
                                </div>

                                {dispute.resolution && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Resolution
                                        </h3>
                                        <p className="text-gray-900 dark:text-white">{dispute.resolution}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat */}
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Discussion</h2>
                            {user && <DisputeChat disputeId={dispute.id} currentUserId={user.id} />}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <h3 className="font-semibold mb-4">Related Order</h3>
                            <div className="space-y-2">
                                <p className="text-sm">
                                    <span className="text-gray-500">Order ID:</span>{' '}
                                    <Link
                                        href={`/orders/${dispute.order.id}`}
                                        className="text-primary-600 hover:underline"
                                    >
                                        #{dispute.order.id.slice(0, 8)}
                                    </Link>
                                </p>
                                <p className="text-sm">
                                    <span className="text-gray-500">Product:</span>{' '}
                                    {dispute.order.product.title}
                                </p>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <h3 className="font-semibold mb-4">Timeline</h3>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-1.5" />
                                    <div>
                                        <p className="text-sm font-medium">Dispute Raised</p>
                                        <p className="text-xs text-gray-500">{formatDate(dispute.createdAt)}</p>
                                    </div>
                                </div>
                                {dispute.status !== 'OPEN' && (
                                    <div className="flex gap-3">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5" />
                                        <div>
                                            <p className="text-sm font-medium">Under Review</p>
                                            <p className="text-xs text-gray-500">{formatDate(dispute.updatedAt)}</p>
                                        </div>
                                    </div>
                                )}
                                {dispute.status === 'RESOLVED' && (
                                    <div className="flex gap-3">
                                        <div className="w-2 h-2 bg-green-600 rounded-full mt-1.5" />
                                        <div>
                                            <p className="text-sm font-medium">Resolved</p>
                                            <p className="text-xs text-gray-500">{formatDate(dispute.updatedAt)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
