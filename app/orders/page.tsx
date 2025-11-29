'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function OrdersPage() {
    const { isAuthenticated } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'buying' | 'selling'>('all');

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated, filter]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter !== 'all') params.append('type', filter);

            const response = await fetch(`/api/orders?${params}`);
            const data = await response.json();
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            PAYMENT_PENDING: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
            PAID: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            PROCESSING: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
            SHIPPED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
            DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            DISPUTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
            REFUNDED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Please connect your wallet
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        You need to connect your wallet to view your orders
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        My Orders
                    </h1>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        {['all', 'buying', 'selling'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab as any)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === tab
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                            No orders found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {filter === 'buying' ? 'Start shopping to see your purchases here' :
                                filter === 'selling' ? 'List products to start selling' :
                                    'No orders yet'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link key={order.id} href={`/orders/${order.id}`}>
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-lg mb-1">
                                                {order.product.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Order #{order.id.slice(0, 8)}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Amount</span>
                                            <p className="font-semibold">{formatPrice(order.totalAmount)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Date</span>
                                            <p className="font-semibold">{formatDate(order.createdAt)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">
                                                {filter === 'selling' ? 'Buyer' : 'Seller'}
                                            </span>
                                            <p className="font-semibold truncate">
                                                {filter === 'selling'
                                                    ? order.buyer.username || order.buyer.walletAddress.slice(0, 8)
                                                    : order.seller.username || order.seller.walletAddress.slice(0, 8)
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Tracking</span>
                                            <p className="font-semibold">
                                                {order.trackingNumber || 'Not available'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
