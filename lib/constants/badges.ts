// Badge Types and Criteria
export const BADGE_TYPES = {
    VERIFIED: {
        type: 'VERIFIED',
        name: 'Verified Seller',
        description: 'Identity verified by platform',
        icon: '✓',
        color: 'blue',
    },
    TOP_SELLER: {
        type: 'TOP_SELLER',
        name: 'Top Seller',
        description: '50+ completed orders with 4.5+ rating',
        icon: '⭐',
        color: 'gold',
    },
    FAST_SHIPPER: {
        type: 'FAST_SHIPPER',
        name: 'Fast Shipper',
        description: 'Average ship time under 24 hours',
        icon: '⚡',
        color: 'green',
    },
    RESPONSIVE: {
        type: 'RESPONSIVE',
        name: 'Responsive',
        description: 'Average response time under 30 minutes',
        icon: '💬',
        color: 'purple',
    },
    TRUSTED: {
        type: 'TRUSTED',
        name: 'Trusted',
        description: 'Trust score above 80 with 0% dispute rate',
        icon: '🛡️',
        color: 'indigo',
    },
} as const;

export const BADGE_CRITERIA = {
    VERIFIED: {
        manual: true, // Requires manual verification
    },
    TOP_SELLER: {
        minCompletedOrders: 50,
        minAverageRating: 4.5,
    },
    FAST_SHIPPER: {
        maxAverageShipTime: 24, // hours
    },
    RESPONSIVE: {
        maxAverageResponseTime: 30, // minutes
    },
    TRUSTED: {
        minTrustScore: 80,
        maxDisputeRate: 0,
    },
} as const;

export function getBadgeInfo(type: string) {
    return BADGE_TYPES[type as keyof typeof BADGE_TYPES];
}

export function checkBadgeEligibility(type: string, stats: any): boolean {
    const criteria = BADGE_CRITERIA[type as keyof typeof BADGE_CRITERIA];

    if (!criteria) return false;

    switch (type) {
        case 'VERIFIED':
            return false; // Manual verification only
        case 'TOP_SELLER':
            return stats.completedOrders >= criteria.minCompletedOrders &&
                stats.averageRating >= criteria.minAverageRating;
        case 'FAST_SHIPPER':
            return stats.averageShipTime <= criteria.maxAverageShipTime;
        case 'RESPONSIVE':
            return stats.averageResponseTime <= criteria.maxAverageResponseTime;
        case 'TRUSTED':
            return stats.trustScore >= criteria.minTrustScore &&
                stats.disputeRate <= criteria.maxDisputeRate;
        default:
            return false;
    }
}
