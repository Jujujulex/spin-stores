import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserPoints } from '@/lib/gamification/points';
import { Trophy, Star, Gift, TrendingUp } from 'lucide-react';

async function getUserRewards() {
    const currentUser = await getSessionUser();

    if (!currentUser) {
        redirect('/login');
    }

    const [points, referralCode, transactions] = await Promise.all([
        getUserPoints(currentUser.id),
        prisma.referralCode.findUnique({
            where: { userId: currentUser.id },
        }),
        prisma.pointTransaction.findMany({
            where: { userId: currentUser.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
        }),
    ]);

    return { currentUser, points, referralCode, transactions };
}

export default async function RewardsDashboard() {
    const { currentUser, points, referralCode, transactions } = await getUserRewards();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Rewards Dashboard
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <Star className="w-6 h-6 text-yellow-500" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Total Points
                            </h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {points.toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <Gift className="w-6 h-6 text-blue-500" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Referral Code
                            </h3>
                        </div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {referralCode?.code || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {referralCode?.uses || 0} uses
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-6 h-6 text-green-500" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Recent Activity
                            </h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {transactions.length}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            transactions
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Recent Transactions
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Source
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Points
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {transactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${tx.type === 'EARN'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    }`}
                                            >
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            {tx.source}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <span
                                                className={
                                                    tx.type === 'EARN'
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                }
                                            >
                                                {tx.type === 'EARN' ? '+' : '-'}
                                                {tx.amount}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            No transactions yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
