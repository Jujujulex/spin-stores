'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { pusherClient } from '@/lib/pusher';
import { formatRelativeTime, formatAddress } from '@/lib/utils';
import Image from 'next/image';

export default function MessagesPage() {
    const { isAuthenticated, user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
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
        if (selectedOrderId) {
            fetchMessages(selectedOrderId);
        }
    }, [selectedOrderId]);

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
