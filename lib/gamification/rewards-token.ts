// Spin Rewards Token (Database-level implementation)
// Tracks user reward token balances and transactions

import { prisma } from '@/lib/prisma';

export interface RewardToken {
    userId: string;
    balance: number;
    earned: number;
    spent: number;
}

// Conversion rate: 1000 points = 1 SPIN token
const POINTS_TO_SPIN_RATE = 1000;

export async function getRewardTokenBalance(userId: string): Promise<RewardToken> {
    const transactions = await prisma.pointTransaction.findMany({
        where: { userId },
    });

    const totalPoints = transactions.reduce((total, tx) => {
        return tx.type === 'EARN' ? total + tx.amount : total - tx.amount;
    }, 0);

    const spinBalance = Math.floor(totalPoints / POINTS_TO_SPIN_RATE);

    return {
        userId,
        balance: spinBalance,
        earned: spinBalance,
        spent: 0,
    };
}

export async function convertPointsToSpin(
    userId: string,
    points: number
): Promise<{ success: boolean; spinTokens?: number }> {
    if (points < POINTS_TO_SPIN_RATE) {
        return { success: false };
    }

    const spinTokens = Math.floor(points / POINTS_TO_SPIN_RATE);
    const pointsToSpend = spinTokens * POINTS_TO_SPIN_RATE;

    // Deduct points
    await prisma.pointTransaction.create({
        data: {
            userId,
            amount: pointsToSpend,
            type: 'SPEND',
            source: 'SPIN_CONVERSION',
            description: `Converted ${pointsToSpend} points to ${spinTokens} SPIN tokens`,
        },
    });

    return { success: true, spinTokens };
}

export async function getTopSpinHolders(limit: number = 10): Promise<RewardToken[]> {
    const users = await prisma.user.findMany({
        include: {
            pointTransactions: true,
        },
    });

    const holders = users.map((user) => {
        const totalPoints = user.pointTransactions.reduce((total, tx) => {
            return tx.type === 'EARN' ? total + tx.amount : total - tx.amount;
        }, 0);

        const spinBalance = Math.floor(totalPoints / POINTS_TO_SPIN_RATE);

        return {
            userId: user.id,
            balance: spinBalance,
            earned: spinBalance,
            spent: 0,
        };
    });

    return holders
        .sort((a, b) => b.balance - a.balance)
        .slice(0, limit);
}
