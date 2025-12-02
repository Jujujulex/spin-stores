// Leaderboard Calculation Job
// Periodically calculates and snapshots leaderboard rankings

import { prisma } from '@/lib/prisma';
import { getUserPoints } from '@/lib/gamification/points';

export async function calculateLeaderboard(
    period: 'WEEKLY' | 'MONTHLY' | 'ALL_TIME' = 'ALL_TIME'
) {
    try {
        // Get all users with their stats
        const users = await prisma.user.findMany({
            include: {
                pointTransactions: true,
                sellingOrders: true,
                buyingOrders: true,
            },
        });

        // Calculate points leaderboard
        const pointsLeaderboard = users
            .map((user) => {
                const points = user.pointTransactions.reduce((total, tx) => {
                    return tx.type === 'EARN' ? total + tx.amount : total - tx.amount;
                }, 0);
                return { userId: user.id, value: points };
            })
            .sort((a, b) => b.value - a.value);

        // Calculate seller leaderboard
        const sellerLeaderboard = users
            .map((user) => ({
                userId: user.id,
                value: user.sellingOrders.length,
            }))
            .sort((a, b) => b.value - a.value);

        // Calculate buyer leaderboard
        const buyerLeaderboard = users
            .map((user) => ({
                userId: user.id,
                value: user.buyingOrders.length,
            }))
            .sort((a, b) => b.value - a.value);

        // Save snapshots
        const snapshots = [];
        const timestamp = new Date();

        for (let i = 0; i < Math.min(50, pointsLeaderboard.length); i++) {
            snapshots.push({
                userId: pointsLeaderboard[i].userId,
                period,
                type: 'POINTS',
                rank: i + 1,
                value: pointsLeaderboard[i].value,
                createdAt: timestamp,
            });
        }

        for (let i = 0; i < Math.min(50, sellerLeaderboard.length); i++) {
            snapshots.push({
                userId: sellerLeaderboard[i].userId,
                period,
                type: 'SELLER',
                rank: i + 1,
                value: sellerLeaderboard[i].value,
                createdAt: timestamp,
            });
        }

        for (let i = 0; i < Math.min(50, buyerLeaderboard.length); i++) {
            snapshots.push({
                userId: buyerLeaderboard[i].userId,
                period,
                type: 'BUYER',
                rank: i + 1,
                value: buyerLeaderboard[i].value,
                createdAt: timestamp,
            });
        }

        // Bulk insert snapshots
        await prisma.leaderboardSnapshot.createMany({
            data: snapshots,
            skipDuplicates: true,
        });

        console.log(`Created ${snapshots.length} leaderboard snapshots for ${period}`);

        return { success: true, count: snapshots.length };
    } catch (error) {
        console.error('Error calculating leaderboard:', error);
        return { success: false, error };
    }
}

// Run this periodically (e.g., daily for ALL_TIME, weekly for WEEKLY, etc.)
export async function runLeaderboardJob() {
    const results = await Promise.all([
        calculateLeaderboard('ALL_TIME'),
        calculateLeaderboard('MONTHLY'),
        calculateLeaderboard('WEEKLY'),
    ]);

    return results;
}
