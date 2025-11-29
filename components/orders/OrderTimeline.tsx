import { OrderStatus } from '@/types';
import { formatDate } from '@/lib/utils';

interface OrderTimelineProps {
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
}

export default function OrderTimeline({ status, createdAt, updatedAt }: OrderTimelineProps) {
    const steps = [
        { id: 'PENDING', label: 'Order Placed' },
        { id: 'PAID', label: 'Payment Escrowed' },
        { id: 'SHIPPED', label: 'Shipped' },
        { id: 'DELIVERED', label: 'Delivered' },
        { id: 'COMPLETED', label: 'Completed' },
    ];

    const getCurrentStepIndex = () => {
        // Map status to step index
        const statusMap: Record<string, number> = {
            PENDING: 0,
            PAYMENT_PENDING: 0,
            PAID: 1,
            PROCESSING: 1,
            SHIPPED: 2,
            DELIVERED: 3,
            COMPLETED: 4,
            DISPUTED: 2, // Dispute usually happens after shipping/during delivery
            CANCELLED: -1,
            REFUNDED: -1,
        };
        return statusMap[status] ?? 0;
    };

    const currentStep = getCurrentStepIndex();

    if (status === 'CANCELLED' || status === 'REFUNDED') {
        return (
            <div className="w-full py-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                    <p className="text-red-600 dark:text-red-400 font-semibold">
                        Order {status === 'CANCELLED' ? 'Cancelled' : 'Refunded'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(updatedAt)}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-6">
            <div className="relative flex items-center justify-between w-full">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10" />
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary-600 transition-all duration-500 -z-10"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center bg-white dark:bg-gray-800 px-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isCompleted
                                        ? 'bg-primary-600 border-primary-600 text-white'
                                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                                    }`}
                            >
                                {isCompleted ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className="text-xs">{index + 1}</span>
                                )}
                            </div>
                            <span
                                className={`mt-2 text-xs sm:text-sm font-medium ${isCompleted ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                {step.label}
                            </span>
                            {isCurrent && (
                                <span className="text-xs text-gray-400 mt-1">
                                    {formatDate(updatedAt)}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
