'use client';

import { useState } from 'react';

export default function MessagesPage() {
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

    // Mock data - in production, fetch from API
    const conversations = [
        {
            id: '1',
            user: { name: 'Alice', avatar: '👤' },
            lastMessage: 'Is the item still available?',
            timestamp: '2 hours ago',
            unread: 2,
        },
        {
            id: '2',
            user: { name: 'Bob', avatar: '👤' },
            lastMessage: 'When can you ship it?',
            timestamp: '1 day ago',
            unread: 0,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Messages
                </h1>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
                        {/* Conversations List */}
                        <div className="border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                            <div className="p-4">
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {conversations.map((conv) => (
                                    <button
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv.id)}
                                        className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedConversation === conv.id ? 'bg-primary-50 dark:bg-primary-900' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">{conv.user.avatar}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-semibold text-sm truncate">
                                                        {conv.user.name}
                                                    </span>
                                                    {conv.unread > 0 && (
                                                        <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
                                                            {conv.unread}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                    {conv.lastMessage}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">{conv.timestamp}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="md:col-span-2 flex flex-col">
                            {selectedConversation ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">👤</div>
                                            <div>
                                                <h3 className="font-semibold">
                                                    {conversations.find((c) => c.id === selectedConversation)?.user.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">Active now</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 p-4 overflow-y-auto">
                                        <div className="space-y-4">
                                            <div className="flex justify-start">
                                                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-xs">
                                                    <p className="text-sm">Is the item still available?</p>
                                                    <span className="text-xs text-gray-500 mt-1 block">10:30 AM</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <div className="bg-primary-600 text-white rounded-lg p-3 max-w-xs">
                                                    <p className="text-sm">Yes, it's still available!</p>
                                                    <span className="text-xs text-primary-200 mt-1 block">10:32 AM</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Type a message..."
                                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            />
                                            <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400 mb-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                            />
                                        </svg>
                                        <p>Select a conversation to start messaging</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
