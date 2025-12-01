'use client';

import { useState, useEffect, useRef } from 'react';
import { formatDate } from '@/lib/utils';

interface DisputeChatProps {
    disputeId: string;
    currentUserId: string;
}

interface Message {
    id: string;
    senderId: string;
    sender: {
        username: string | null;
        walletAddress: string;
    };
    message: string;
    createdAt: string;
}

export default function DisputeChat({ disputeId, currentUserId }: DisputeChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();
        // In production, set up Pusher subscription here
    }, [disputeId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`/api/disputes/${disputeId}/messages`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            const response = await fetch(`/api/disputes/${disputeId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newMessage }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages([...messages, data.message]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isCurrentUser = msg.senderId === currentUserId;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-lg p-3 ${isCurrentUser
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700'
                                        }`}
                                >
                                    {!isCurrentUser && (
                                        <p className="text-xs font-semibold mb-1">
                                            {msg.sender.username || msg.sender.walletAddress.slice(0, 8)}
                                        </p>
                                    )}
                                    <p className="text-sm">{msg.message}</p>
                                    <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-100' : 'text-gray-500'}`}>
                                        {formatDate(msg.createdAt)}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSend} className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSending ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </form>
        </div>
    );
}
