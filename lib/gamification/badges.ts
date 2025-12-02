// Gamification Badge Definitions
// Additional badges for gamification achievements

import { prisma } from '@/lib/prisma';

export const GAMIFICATION_BADGES = {
    POINTS_MASTER: {
        id: 'POINTS_MASTER',
        name: 'Points Master',
        description: 'Earned 10,000+ points',
        icon: '🏆',
        criteria: { minPoints: 10000 },
    },
    REFERRAL_CHAMPION: {
        id: 'REFERRAL_CHAMPION',
        name: 'Referral Champion',
        description: 'Referred 10+ users',
        icon: '🎯',
        criteria: { minReferrals: 10 },
    },
    LEADERBOARD_ELITE: {
        id: 'LEADERBOARD_ELITE',
        name: 'Leaderboard Elite',
        description: 'Reached top 10 on leaderboard',
        icon: '⭐',
        criteria: { maxRank: 10 },
    },
    EARLY_ADOPTER: {
        id: 'EARLY_ADOPTER',
        name: 'Early Adopter',
        description: 'Joined in the first month',
        icon: '🚀',
        criteria: { joinedBefore: '2024-01-01' },
    },
    SOCIAL_BUTTERFLY: {
        id: 'SOCIAL_BUTTERFLY',
        name: 'Social Butterfly',
        description: 'Following 50+ users',
        icon: '🦋',
        criteria: { minFollowing: 50 },
    },
};

export async function checkGamificationBadges(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            pointTransactions: true,
            referralCode: true,
            following: true,
            badges: true,
        },
    });

    if (!user) return [];

    const earnedBadges = [];

    // Calculate total points
    const totalPoints = user.pointTransactions.reduce((total, tx) => {
        return tx.type === 'EARN' ? total + tx.amount : total - tx.amount;
    }, 0);

    // Check Points Master
    if (
        totalPoints >= GAMIFICATION_BADGES.POINTS_MASTER.criteria.minPoints &&
        !user.badges.some((b) => b.type === 'POINTS_MASTER')
    ) {
        earnedBadges.push('POINTS_MASTER');
    }

    // Check Referral Champion
    if (
        user.referralCode &&
        user.referralCode.uses >= GAMIFICATION_BADGES.REFERRAL_CHAMPION.criteria.minReferrals &&
        !user.badges.some((b) => b.type === 'REFERRAL_CHAMPION')
    ) {
        earnedBadges.push('REFERRAL_CHAMPION');
    }

    // Check Social Butterfly
    if (
        user.following.length >= GAMIFICATION_BADGES.SOCIAL_BUTTERFLY.criteria.minFollowing &&
        !user.badges.some((b) => b.type === 'SOCIAL_BUTTERFLY')
    ) {
        earnedBadges.push('SOCIAL_BUTTERFLY');
    }

    // Award new badges
    for (const badgeType of earnedBadges) {
        const badge = GAMIFICATION_BADGES[badgeType as keyof typeof GAMIFICATION_BADGES];
        await prisma.badge.create({
            data: {
                userId,
                type: badgeType,
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
            },
        });
    }

    return earnedBadges;
}
