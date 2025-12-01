import { prisma } from '@/lib/prisma';
import { calculateTrustScore } from '@/lib/utils/trustScore';
import { checkBadgeEligibility } from '@/lib/constants/badges';

/**
 * Calculate and update trust scores for all sellers
 * This should be run as a cron job (e.g., daily)
 */
export async function calculateAllTrustScores() {
    try {
        console.log('Starting trust score calculation...');

        // Get all users who have sold at least one item
        const sellers = await prisma.user.findMany({
            where: {
                sellingOrders: {
                    some: {},
                },
            },
            include: {
                sellingOrders: {
                    include: {
                        review: true,
                    },
                },
                receivedReviews: true,
                raisedDisputes: true,
            },
        });

        console.log(`Found ${sellers.length} sellers to process`);

        for (const seller of sellers) {
            // Calculate metrics
            const totalOrders = seller.sellingOrders.length;
            const completedOrders = seller.sellingOrders.filter(
                (o) => o.status === 'COMPLETED'
            ).length;

            const averageRating =
                seller.receivedReviews.length > 0
                    ? seller.receivedReviews.reduce((sum, r) => sum + r.rating, 0) /
                    seller.receivedReviews.length
                    : 0;

            const disputeRate =
                totalOrders > 0 ? seller.raisedDisputes.length / totalOrders : 0;

            // Mock response and ship times (in a real app, calculate from actual data)
            const averageResponseTime = 45; // minutes
            const averageShipTime = 36; // hours

            // Calculate trust score
            const trustScore = calculateTrustScore({
                averageRating,
                completedOrders,
                totalOrders,
                disputeRate,
                averageResponseTime,
                averageShipTime,
            });

            // Update or create seller stats
            await prisma.sellerStats.upsert({
                where: { userId: seller.id },
                create: {
                    userId: seller.id,
                    totalSales: totalOrders,
                    completedOrders,
                    averageRating,
                    averageResponseTime,
                    averageShipTime,
                    disputeRate,
                },
                update: {
                    totalSales: totalOrders,
                    completedOrders,
                    averageRating,
                    averageResponseTime,
                    averageShipTime,
                    disputeRate,
                },
            });

            // Update user trust score
            await prisma.user.update({
                where: { id: seller.id },
                data: { trustScore },
            });

            // Check and award badges
            const stats = {
                completedOrders,
                averageRating,
                averageResponseTime,
                averageShipTime,
                trustScore,
                disputeRate,
            };

            const badgeTypes = ['TOP_SELLER', 'FAST_SHIPPER', 'RESPONSIVE', 'TRUSTED'];

            for (const badgeType of badgeTypes) {
                const isEligible = checkBadgeEligibility(badgeType, stats);
                const existingBadge = await prisma.badge.findFirst({
                    where: {
                        userId: seller.id,
                        type: badgeType,
                    },
                });

                if (isEligible && !existingBadge) {
                    // Award new badge
                    await prisma.badge.create({
                        data: {
                            userId: seller.id,
                            type: badgeType,
                            description: `Earned for meeting ${badgeType} criteria`,
                        },
                    });
                    console.log(`Awarded ${badgeType} badge to seller ${seller.id}`);
                } else if (!isEligible && existingBadge) {
                    // Remove badge if no longer eligible
                    await prisma.badge.delete({
                        where: { id: existingBadge.id },
                    });
                    console.log(`Removed ${badgeType} badge from seller ${seller.id}`);
                }
            }
        }

        console.log('Trust score calculation completed successfully');
        return { success: true, processed: sellers.length };
    } catch (error) {
        console.error('Error calculating trust scores:', error);
        return { success: false, error };
    }
}

// Export for cron job or manual execution
if (require.main === module) {
    calculateAllTrustScores()
        .then((result) => {
            console.log('Result:', result);
            process.exit(0);
        })
        .catch((error) => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}
