'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { pusherClient } from '@/lib/pusher';
import { toast } from 'react-hot-toast';

interface NotificationContextType {
    unreadCount: number;
    incrementUnread: () => void;
    decrementUnread: () => void;
    resetUnread: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
    unreadCount: 0,
    incrementUnread: () => { },
    decrementUnread: () => { },
    resetUnread: () => { },
});

export const useNotifications = () => useContext(NotificationContext);

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            // Fetch initial count
            fetch('/api/notifications')
                .then(res => res.json())
                .then(data => setUnreadCount(data.unreadCount || 0))
                .catch(console.error);

            // Subscribe to real-time notifications
            const channel = pusherClient.subscribe(`private-user-${user.id}`);

            channel.bind('notification', (data: any) => {
                setUnreadCount(prev => prev + 1);
                toast(data.message, {
                    icon: '🔔',
                    duration: 4000,
                });
            });

            return () => {
                pusherClient.unsubscribe(`private-user-${user.id}`);
            };
        }
    }, [isAuthenticated, user?.id]);

    const incrementUnread = () => setUnreadCount(prev => prev + 1);
    const decrementUnread = () => setUnreadCount(prev => Math.max(0, prev - 1));
    const resetUnread = () => setUnreadCount(0);

    return (
        <NotificationContext.Provider value={{ unreadCount, incrementUnread, decrementUnread, resetUnread }}>
            {children}
        </NotificationContext.Provider>
    );
}
