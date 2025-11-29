'use client';

import { formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';

interface Notification {
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    link?: string;
}

interface NotificationListProps {
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onClose?: () => void;
}

export default function NotificationList({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onClose
}: NotificationListProps) {
    if (notifications.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500 text-sm">
                No notifications
            </div>
        );
    }

    return (
        <div>
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                <button
                    onClick={onMarkAllAsRead}
                    className="text-xs text-primary-600 hover:underline"
                >
                    Mark all read
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-white dark:bg-gray-800'
                            }`}
                        onClick={() => !notification.read && onMarkAsRead(notification.id)}
                    >
                        <div className="flex justify-between items-start">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500">
                                {formatRelativeTime(notification.createdAt)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {notification.message}
                        </p>
                        {notification.link && (
                            <Link
                                href={notification.link}
                                className="text-xs text-primary-600 hover:underline mt-2 block"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onClose) onClose();
                                }}
                            >
                                View Details
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
