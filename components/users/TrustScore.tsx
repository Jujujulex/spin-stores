'use client';

import { getTrustScoreLevel } from '@/lib/utils/trustScore';

interface TrustScoreProps {
    score: number;
}

export default function TrustScore({ score }: TrustScoreProps) {
    const { level, color, description } = getTrustScoreLevel(score);

    const colorClasses = {
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        yellow: 'bg-yellow-500',
        orange: 'bg-orange-500',
        red: 'bg-red-500',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Trust Score</span>
                <span className="text-2xl font-bold">{score.toFixed(1)}</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                <div
                    className={`h-3 rounded-full transition-all duration-500 ${colorClasses[color as keyof typeof colorClasses]
                        }`}
                    style={{ width: `${score}%` }}
                />
            </div>

            <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700 dark:text-gray-300">{level}</span>
                <span className="text-gray-500 dark:text-gray-400">{description}</span>
            </div>
        </div>
    );
}
