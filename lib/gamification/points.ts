import { prisma } from '@/lib/prisma';

const POINTS_CONFIG = {
    PURCHASE: 100,
    SALE: 200,
    REFERRAL_INVITER: 500,
    REFERRAL_INVITED: 250,
    REVIEW_WRITTEN: 50,
    BADGE_EARNED: 300,
};

export async function awardPoints(
    userId: string,
    source: string,
    description?: string
): Promise<number> {
    const amount = POINTS_CONFIG[source as keyof typeof POINTS_CONFIG] || 0;

    if (amount === 0) {
        console.warn(`Unknown points source: ${source}`);
        return 0;
    }

    await prisma.pointTransaction.create({
        data: {
            userId,
            amount,
            type: 'EARN',
            source,
            description,
        },
    });

    return amount;
}

export async function getUserPoints(userId: string): Promise<number> {
    const transactions = await prisma.pointTransaction.findMany({
        where: { userId },
    });

    return transactions.reduce((total, tx) => {
        return tx.type === 'EARN' ? total + tx.amount : total - tx.amount;
    }, 0);
}

export async function spendPoints(
    userId: string,
    amount: number,
    description: string
): Promise<boolean> {
    const currentPoints = await getUserPoints(userId);

    if (currentPoints < amount) {
        return false;
    }

    await prisma.pointTransaction.create({
        data: {
            userId,
            amount,
            type: 'SPEND',
            source: 'REDEMPTION',
            description,
        },
    });

    return true;
}

export async function getPointsLeaderboard(limit: number = 10) {
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
                points,
            };
        })
        .sort((a, b) => b.points - a.points)
        .slice(0, limit);

    return leaderboard;
}
