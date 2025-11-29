'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { pusherClient } from '@/lib/pusher';
import { formatRelativeTime, formatAddress } from '@/lib/utils';
import Image from 'next/image';
import MessageSearch from '@/components/messages/MessageSearch';

export default function MessagesPage() {
    const { isAuthenticated, user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [filteredConversations, setFilteredConversations] = useState<any[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchConversations();

            // Subscribe to user's private channel
            if (user?.id) {
                const channel = pusherClient.subscribe(`private-user-${user.id}`);
                channel.bind('new-message', (data: any) => {
                    handleNewMessage(data);
                });

                return () => {
                    pusherClient.unsubscribe(`private-user-${user.id}`);
                };
            }
        }
    }, [isAuthenticated, user?.id]);

    useEffect(() => {
        setFilteredConversations(conversations);
    }, [conversations]);

    useEffect(() => {
        if (selectedOrderId) {
            fetchMessages(selectedOrderId);
            markAsRead(selectedOrderId);
        }
    }, [selectedOrderId]);

    const markAsRead = async (orderId: string) => {
        try {
            await fetch(`/api/messages/${orderId}/read`, { method: 'POST' });
            // Update local state to reflect read status
            setConversations(prev => prev.map(conv => {
                if (conv.id === orderId && conv.lastMessage) {
                    return {
                        ...conv,
                        lastMessage: { ...conv.lastMessage, isRead: true }
                    };
                }
                return conv;
            }));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const response = await fetch('/api/conversations');
            if (response.ok) {
                const data = await response.json();
                setConversations(data);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        if (!query.trim()) {
            setFilteredConversations(conversations);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filtered = conversations.filter(conv =>
            conv.otherUser.username?.toLowerCase().includes(lowerQuery) ||
            conv.product.title.toLowerCase().includes(lowerQuery) ||
            conv.lastMessage?.content.toLowerCase().includes(lowerQuery)
        );
        setFilteredConversations(filtered);
    };

    const fetchMessages = async (orderId: string) => {
        try {
            const response = await fetch(`/api/orders/${orderId}`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleNewMessage = (data: any) => {
        const { message, orderId } = data;

        // Update messages if viewing this conversation
        if (selectedOrderId === orderId) {
            setMessages(prev => [...prev, message]);
        }

        // Update conversation list preview
        setConversations(prev => prev.map(conv => {
            if (conv.id === orderId) {
                return {
                    ...conv,
                    lastMessage: {
                        content: message.content,
                        createdAt: message.createdAt,
                        senderId: message.senderId,
                    }
                };
            }
            return conv;
        }));
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedOrderId) return;

        const conversation = conversations.find(c => c.id === selectedOrderId);
        if (!conversation) return;

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newMessage,
                    orderId: selectedOrderId,
                    receiverId: conversation.otherUser.id,
                }),
            });

            if (response.ok) {
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Messages
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Please connect your wallet to view messages
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Messages
                </h1>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-[600px] flex">
                    {/* Conversations List */}
                    <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <MessageSearch onSearch={handleSearch} />
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {filteredConversations.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    No conversations found
                                </div>
                            ) : (
                                filteredConversations.map((conv) => (
                                    <button
                                        key={conv.id}
                                        onClick={() => setSelectedOrderId(conv.id)}
                                        className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${selectedOrderId === conv.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                                {conv.otherUser.username?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-semibold text-sm truncate">
                                                        {conv.otherUser.username || formatAddress(conv.otherUser.walletAddress)}
                                                    </span>
                                                    {conv.lastMessage && (
                                                        <span className="text-xs text-gray-500">
                                                            {formatRelativeTime(conv.lastMessage.createdAt)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-primary-600 dark:text-primary-400 mb-1 truncate">
                                                    {conv.product.title}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                    {conv.lastMessage?.content || 'No messages yet'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
