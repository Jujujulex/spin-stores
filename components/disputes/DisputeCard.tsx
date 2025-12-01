'use client';

import { formatDate } from '@/lib/utils';

interface DisputeCardProps {
    dispute: {
        id: string;
        reason: string;
        description: string;
        status: string;
        createdAt: string;
        order: {
            id: string;
            product: {
                title: string;
            };
        };
    };
}

const STATUS_COLORS = {
    OPEN: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    IN_REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export default function DisputeCard({ dispute }: DisputeCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-lg mb-1">{dispute.order.product.title}</h3>
                    <p className="text-sm text-gray-500">Order #{dispute.order.id.slice(0, 8)}</p>
                </div>
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[dispute.status as keyof typeof STATUS_COLORS]
                        }`}
                >
                    {dispute.status.replace('_', ' ')}
                </span>
            </div>

            <div className="space-y-2">
                <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason:</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{dispute.reason}</p>
                </div>
                <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Description:</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{dispute.description}</p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs text-gray-500">Raised {formatDate(dispute.createdAt)}</span>
                <a
                    href={`/disputes/${dispute.id}`}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                    View Details →
                </a>
            </div>
        </div>
    );
}
