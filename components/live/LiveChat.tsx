'use client';

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

interface LiveChatProps {
    streamId: string;
}

interface ChatMessage {
    id: string;
    username: string;
    message: string;
    timestamp: Date;
}

export default function LiveChat({ streamId }: LiveChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputMessage.trim()) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            username: 'You',
            message: inputMessage,
            timestamp: new Date(),
        };

        setMessages([...messages, newMessage]);
        setInputMessage('');

        // In production, send to WebSocket server
    };

    return (
        <div className="flex flex-col h-full bg-gray-800 rounded-lg">
            <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Live Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                    <div key={msg.id} className="text-sm">
                        <span className="font-semibold text-blue-400">{msg.username}: </span>
                        <span className="text-gray-300">{msg.message}</span>
                    </div>
                ))}
                {messages.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                        No messages yet. Start the conversation!
                    </p>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
