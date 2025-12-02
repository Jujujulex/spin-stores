import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Trophy, Medal, Award } from 'lucide-react';
import Link from 'next/link';

async function getLeaderboard() {
    const users = await prisma.user.findMany({
        include: {
            pointTransactions: true,
        },
    });

    const leaderboard = users
        .map((user) => {
            const points = user.pointTransactions.reduce((total, tx) => {
                return tx.type === 'EARN' ? total + tx.amount : total - tx.amount;
            }, 0);
            return {
                userId: user.id,
                username: user.username,
                walletAddress: user.walletAddress,
                avatar: user.avatar,
                points,
            };
        })
        .sort((a, b) => b.points - a.points)
        .slice(0, 50);

    return leaderboard;
}

export default async function LeaderboardPage() {
    const currentUser = await getSessionUser();
    const leaderboard = await getLeaderboard();

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
        if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Points Leaderboard
                </h1>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Rank
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Points
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {leaderboard.map((entry, index) => {
                                    const rank = index + 1;
                                    const isCurrentUser = currentUser?.id === entry.userId;

                                    return (
                                        <tr
                                            key={entry.userId}
                                            className={`${isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {getRankIcon(rank)}
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        #{rank}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link
                                                    href={`/users/${entry.userId}`}
                                                    className="flex items-center gap-3 hover:text-blue-600 dark:hover:text-blue-400"
                                                >
                                                    {entry.avatar && (
                                                        <img
                                                            src={entry.avatar}
                                                            alt={entry.username || 'User'}
                                                            className="w-8 h-8 rounded-full"
                                                        />
                                                    )}
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {entry.username || entry.walletAddress.slice(0, 8)}
                                                        {isCurrentUser && (
                                                            <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(You)</span>
                                                        )}
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {entry.points.toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {leaderboard.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            No users on the leaderboard yet
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
