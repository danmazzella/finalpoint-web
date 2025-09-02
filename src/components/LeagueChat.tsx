'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatService } from '../services/chatService';
import { ChatMessage } from '../types/chat';
import { useAuth } from '@/contexts/AuthContext';

interface LeagueChatProps {
    leagueId: string;
    leagueName: string;
    channelId?: string;
}

export const LeagueChat: React.FC<LeagueChatProps> = ({
    leagueId,
    leagueName,
    channelId = null
}) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState<{ id: string; name: string; isOnline: boolean }[]>([]);
    const [showSidebar, setShowSidebar] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load messages when component mounts
    useEffect(() => {
        if (!user || !leagueId) return;

        let unsubscribe: (() => void) | undefined;

        const setupSubscription = async () => {
            try {
                unsubscribe = await ChatService.subscribeToLeagueMessages(
                    leagueId,
                    channelId,
                    (chatMessages: ChatMessage[]) => {
                        setMessages(chatMessages);
                        setLoading(false);
                    }
                );
            } catch (error) {
                console.error('Failed to set up chat subscription:', error);
                setLoading(false);
                // You could set an error state here to show a message to the user
            }
        };

        setupSubscription();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [leagueId, channelId, user]);

    // Update user online status and subscribe to online users
    useEffect(() => {
        if (!user || !leagueId) return;

        // Set user online when component mounts
        ChatService.updateUserStatus(user.id.toString(), true, {
            name: user.name || user.email,
            email: user.email
        });

        // Subscribe to online users
        const unsubscribeOnlineUsers = ChatService.subscribeToOnlineUsers(
            leagueId,
            (users) => {
                setOnlineUsers(users);
            }
        );

        // Set user offline when component unmounts
        return () => {
            ChatService.updateUserStatus(user.id.toString(), false);
            unsubscribeOnlineUsers();
        };
    }, [user, leagueId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages]);

    // Send a new message
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newMessage.trim()) return;

        try {
            await ChatService.sendMessage(leagueId, {
                text: newMessage.trim(),
                user: {
                    _id: user.id.toString(),
                    name: user.name || user.email,
                    avatar: user.avatar,
                },
                leagueId,
                channelId: channelId || undefined,
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    };

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading chat...</div>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-gray-50 relative">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Sidebar Toggle */}
                <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">League Chat</h3>
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </button>
                </div>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.user._id === user?.id?.toString() ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[90%] sm:max-w-sm lg:max-w-lg px-3 sm:px-4 py-2 rounded-lg ${message.user._id === user?.id?.toString()
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white text-gray-800 border'
                                        }`}
                                >
                                    {message.user._id !== user?.id?.toString() && (
                                        <div className="text-xs font-semibold text-gray-600 mb-1">
                                            {message.user.name}
                                        </div>
                                    )}
                                    <div className="text-sm break-words">{message.text}</div>
                                    <div
                                        className={`text-xs mt-1 ${message.user._id === user?.id?.toString()
                                            ? 'text-blue-100'
                                            : 'text-gray-500'
                                            }`}
                                    >
                                        {formatTime(message.createdAt)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t bg-white p-2 sm:p-4">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={`Message ${leagueName}...`}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[44px] max-h-[120px]"
                            rows={1}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base whitespace-nowrap"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>

            {/* Online Users Sidebar - Desktop */}
            <div className="hidden lg:block w-64 bg-white border-l border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Online Members</h3>
                <div className="space-y-2">
                    {onlineUsers.length === 0 ? (
                        <div className="text-xs text-gray-500">No one online</div>
                    ) : (
                        onlineUsers.map((onlineUser) => (
                            <div key={onlineUser.id} className="flex items-center space-x-2">
                                <div className="relative">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                        {onlineUser.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                        {onlineUser.name || 'Unknown User'}
                                    </div>
                                    <div className="text-xs text-gray-500">Online</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {showSidebar && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div
                        className="flex-1 bg-black bg-opacity-50"
                        onClick={() => setShowSidebar(false)}
                    ></div>

                    {/* Sidebar */}
                    <div className="w-80 bg-white shadow-xl">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Online Members</h3>
                            <button
                                onClick={() => setShowSidebar(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                            {onlineUsers.length === 0 ? (
                                <div className="text-sm text-gray-500 text-center py-4">No one online</div>
                            ) : (
                                onlineUsers.map((onlineUser) => (
                                    <div key={onlineUser.id} className="flex items-center space-x-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                {onlineUser.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-base font-medium text-gray-900 truncate">
                                                {onlineUser.name || 'Unknown User'}
                                            </div>
                                            <div className="text-sm text-gray-500">Online</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
