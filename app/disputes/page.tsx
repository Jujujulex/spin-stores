'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DisputeCard from '@/components/disputes/DisputeCard';
import Link from 'next/link';

export default function DisputesPage() {
    const { isAuthenticated } = useAuth();
    const [disputes, setDisputes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        if (isAuthenticated) {
            fetchDisputes();
        }
    }, [isAuthenticated, filter]);

    const fetchDisputes = async () => {
        try {
            const url = filter === 'all' ? '/api/disputes' : `/api/disputes?status=${filter}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setDisputes(data.disputes || []);
            }
        } catch (error) {
            console.error('Error fetching disputes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Please connect your wallet</h2>
                    <p className="text-gray-600 dark:text-gray-400">You need to be authenticated to view disputes</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Disputes</h1>
                    <Link
                        href="/orders"
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                        ← Back to Orders
                    </Link>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    {['all', 'OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${filter === status
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {status === 'all' ? 'All' : status.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Disputes List */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
                    </div>
                ) : disputes.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                        <svg
                            className="w-16 h-16 mx-auto mb-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <h3 className="text-lg font-semibold mb-2">No disputes found</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {filter === 'all'
                                ? "You don't have any disputes"
                                : `No ${filter.toLowerCase().replace('_', ' ')} disputes`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {disputes.map((dispute) => (
                            <DisputeCard key={dispute.id} dispute={dispute} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
