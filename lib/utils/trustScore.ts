/**
 * Calculate trust score for a seller based on multiple factors
 * Trust Score Formula:
 * - Average Rating (30%)
 * - Completion Rate (25%)
 * - Low Dispute Rate (20%)
 * - Response Time (15%)
 * - Ship Time (10%)
 */

interface SellerMetrics {
    averageRating: number; // 0-5
    completedOrders: number;
    totalOrders: number;
    disputeRate: number; // 0-1 (percentage as decimal)
    averageResponseTime: number; // in minutes
    averageShipTime: number; // in hours
}

export function calculateTrustScore(metrics: SellerMetrics): number {
    // Rating Score (30%) - normalize to 0-100
    const ratingScore = (metrics.averageRating / 5) * 30;

    // Completion Rate (25%)
    const completionRate = metrics.totalOrders > 0
        ? metrics.completedOrders / metrics.totalOrders
        : 0;
    const completionScore = completionRate * 25;

    // Dispute Rate Score (20%) - inverse, lower is better
    const disputeScore = (1 - metrics.disputeRate) * 20;

    // Response Time Score (15%) - faster is better
    // Excellent: < 30 min, Good: < 60 min, Fair: < 120 min, Poor: > 120 min
    let responseScore = 0;
    if (metrics.averageResponseTime <= 30) {
        responseScore = 15;
    } else if (metrics.averageResponseTime <= 60) {
        responseScore = 12;
    } else if (metrics.averageResponseTime <= 120) {
        responseScore = 8;
    } else {
        responseScore = Math.max(0, 15 - (metrics.averageResponseTime / 120) * 15);
    }

    // Ship Time Score (10%) - faster is better
    // Excellent: < 24 hrs, Good: < 48 hrs, Fair: < 72 hrs, Poor: > 72 hrs
    let shipScore = 0;
    if (metrics.averageShipTime <= 24) {
        shipScore = 10;
    } else if (metrics.averageShipTime <= 48) {
        shipScore = 7;
    } else if (metrics.averageShipTime <= 72) {
        shipScore = 4;
    } else {
        shipScore = Math.max(0, 10 - (metrics.averageShipTime / 72) * 10);
    }

    // Total score (0-100)
    const totalScore = ratingScore + completionScore + disputeScore + responseScore + shipScore;

    return Math.min(100, Math.max(0, totalScore));
}

export function getTrustScoreLevel(score: number): {
    level: string;
    color: string;
    description: string;
} {
    if (score >= 90) {
        return {
            level: 'Excellent',
            color: 'green',
            description: 'Outstanding seller with exceptional performance',
        };
    } else if (score >= 75) {
        return {
            level: 'Very Good',
            color: 'blue',
            description: 'Reliable seller with strong track record',
        };
    } else if (score >= 60) {
        return {
            level: 'Good',
            color: 'yellow',
            description: 'Dependable seller with good performance',
        };
    } else if (score >= 40) {
        return {
            level: 'Fair',
            color: 'orange',
            description: 'Average seller, exercise caution',
        };
    } else {
        return {
            level: 'Poor',
            color: 'red',
            description: 'New or underperforming seller',
        };
    }
}

export function formatTrustScore(score: number): string {
    return `${score.toFixed(1)}/100`;
}
