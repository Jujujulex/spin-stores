'use client';

import { getBadgeInfo } from '@/lib/constants/badges';

interface BadgeListProps {
    badges: Array<{
        id: string;
        type: string;
        earnedAt: string;
        description: string;
    }>;
}

export default function BadgeList({ badges }: BadgeListProps) {
    if (badges.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No badges earned yet</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map((badge) => {
                const badgeInfo = getBadgeInfo(badge.type);
                if (!badgeInfo) return null;

                return (
                    <div
                        key={badge.id}
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                        title={badge.description}
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">{badgeInfo.icon}</div>
                            <h4 className="font-semibold text-sm mb-1">{badgeInfo.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                {badgeInfo.description}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                Earned {new Date(badge.earnedAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
