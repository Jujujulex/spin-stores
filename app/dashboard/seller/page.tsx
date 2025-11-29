'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, formatDate, formatAddress } from '@/lib/utils';
import Link from 'next/link';

export default function SellerDashboard() {
    const { isAuthenticated, user } = useAuth();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            fetchDashboardData();
        }
    }, [isAuthenticated]);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/dashboard/seller');
            if (response.ok) {
                const dashboardData = await response.json();
                setData(dashboardData);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Seller Dashboard
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Please connect your wallet to view your dashboard
                    </p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Seller Dashboard
                    </h1>
                    <Link
                        href="/sell"
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                        + List New Product
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Revenue</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                            {formatPrice(data?.stats.totalRevenue || 0)}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Orders</h3>
                        <p className="text-2xl font-bold text-blue-600 mt-2">
                            {data?.stats.activeOrders || 0}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Completed Orders</h3>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                            {data?.stats.completedOrders || 0}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Products</h3>
                        <p className="text-2xl font-bold text-purple-600 mt-2">
                            {data?.stats.totalProducts || 0}
                        </p>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Recent Orders</h2>
                        <Link href="/orders?type=selling" className="text-primary-600 hover:underline text-sm">
                            View All
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {data?.recentOrders.length > 0 ? (
                            data.recentOrders.map((order: any) => (
                                <div key={order.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                                                📦
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {order.product.title}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Buyer: {order.buyer.username || formatAddress(order.buyer.walletAddress)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 dark:text-white">
                                                {formatPrice(order.totalAmount)}
                                            </p>
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1
                        ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                No orders yet
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
