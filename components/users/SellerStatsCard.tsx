'use client';

interface SellerStatsCardProps {
    stats: {
        totalSales: number;
        completedOrders: number;
        averageRating: number;
        averageResponseTime: number;
        averageShipTime: number;
        disputeRate: number;
    };
}

export default function SellerStatsCard({ stats }: SellerStatsCardProps) {
    const formatTime = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h`;
    };

    const formatShipTime = (hours: number) => {
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Seller Statistics</h3>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {stats.totalSales}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Sales</div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.completedOrders}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-1">
                        <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {stats.averageRating.toFixed(1)}
                        </span>
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatTime(stats.averageResponseTime)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Response Time</div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatShipTime(stats.averageShipTime)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Ship Time</div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {(stats.disputeRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Dispute Rate</div>
                </div>
            </div>
        </div>
    );
}
