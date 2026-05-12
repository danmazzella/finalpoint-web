'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SecureChatService } from '../services/secureChatService';
import { ChatMessage } from '../types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { chatAPI } from '@/lib/api';

// Deterministic avatar color based on user ID
const AVATAR_COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];

function getAvatarColor(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDateSeparator(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(d);
}

function StatusIcon({ status, onRetry }: { status: string; onRetry?: () => void }) {
    if (status === 'sending') {
        return (
            <svg className="w-3 h-3 text-blue-200 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
        );
    }
    if (status === 'sent') {
        return (
            <svg className="w-3.5 h-3.5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
        );
    }
    if (status === 'failed') {
        return (
            <button
                onClick={onRetry}
                title="Tap to retry"
                className="flex items-center gap-1 text-red-300 hover:text-red-200 active:scale-95 transition-all"
            >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span className="text-[10px] leading-none">Retry</span>
            </button>
        );
    }
    return null;
}

const URL_REGEX = /https?:\/\/[^\s<>"']+/g;

const IG_POST_RE = /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/;

function extractInstagramShortcode(url: string): string | null {
    const m = url.match(IG_POST_RE);
    return m ? m[1] : null;
}

function InstagramEmbed({ url, shortcode }: { url: string; shortcode: string }) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-1.5 no-underline"
            onClick={e => e.stopPropagation()}
        >
            <iframe
                src={`https://www.instagram.com/p/${shortcode}/embed/captioned/`}
                width="100%"
                height="560"
                frameBorder="0"
                scrolling="no"
                allowTransparency
                className="rounded-xl overflow-hidden max-w-sm"
                style={{ border: 'none', minWidth: '280px' }}
            />
        </a>
    );
}

interface TextPart { type: 'text'; content: string }
interface UrlPart  { type: 'url';  content: string }
type MessagePart = TextPart | UrlPart;

function parseMessageText(text: string): MessagePart[] {
    const parts: MessagePart[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const re = new RegExp(URL_REGEX.source, 'g');
    while ((match = re.exec(text)) !== null) {
        if (match.index > lastIndex) parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
        parts.push({ type: 'url', content: match[0] });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push({ type: 'text', content: text.slice(lastIndex) });
    return parts;
}

function extractFirstUrl(text: string): string | null {
    const m = text.match(URL_REGEX);
    return m ? m[0] : null;
}

interface PreviewData {
    title: string;
    description: string | null;
    image: string | null;
    domain: string;
    siteName: string;
    url: string;
}

const previewCache = new Map<string, PreviewData | null>();
const previewPromises = new Map<string, Promise<PreviewData | null>>();

function fetchPreview(url: string): Promise<PreviewData | null> {
    if (previewCache.has(url)) return Promise.resolve(previewCache.get(url)!);
    if (previewPromises.has(url)) return previewPromises.get(url)!;

    const promise = chatAPI.getLinkPreview(url)
        .then(res => {
            const data = res.data?.success ? res.data as PreviewData : null;
            previewCache.set(url, data);
            previewPromises.delete(url);
            return data;
        })
        .catch((): null => {
            previewCache.set(url, null);
            previewPromises.delete(url);
            return null;
        });

    previewPromises.set(url, promise);
    return promise;
}

function LinkPreview({ url, isOwn }: { url: string; isOwn: boolean }) {
    const [preview, setPreview] = useState<PreviewData | null | 'loading'>(
        previewCache.has(url) ? previewCache.get(url)! : 'loading'
    );

    useEffect(() => {
        let cancelled = false;
        fetchPreview(url).then(data => {
            if (!cancelled) setPreview(data);
        });
        return () => { cancelled = true; };
    }, [url]);

    if (!preview || preview === 'loading') return null;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-1.5 rounded-xl overflow-hidden border block no-underline transition-opacity hover:opacity-90 ${isOwn ? 'border-blue-400/40 bg-blue-600/30' : 'border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/60'}`}
        >
            {preview.image && (
                <img
                    src={preview.image}
                    alt=""
                    className="w-full max-h-40 object-cover"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
            )}
            <div className="p-3">
                <p className={`text-[10px] font-medium uppercase tracking-wide mb-1 ${isOwn ? 'text-blue-200' : 'text-gray-400 dark:text-neutral-500'}`}>
                    {preview.siteName || preview.domain}
                </p>
                <p className={`text-sm font-semibold leading-snug line-clamp-2 ${isOwn ? 'text-white' : 'text-gray-800 dark:text-neutral-100'}`}>
                    {preview.title}
                </p>
                {preview.description && (
                    <p className={`text-xs mt-0.5 line-clamp-2 ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-neutral-400'}`}>
                        {preview.description}
                    </p>
                )}
            </div>
        </a>
    );
}

interface LeagueChatProps {
    leagueId: string;
    leagueName: string;
    channelId?: string | null;
}

export const LeagueChat: React.FC<LeagueChatProps> = ({
    leagueId,
    leagueName,
    channelId = null,
}) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState<{ id: string; name: string; isOnline: boolean }[]>([]);
    const [showSidebar, setShowSidebar] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [newMsgBadge, setNewMsgBadge] = useState(0);
    const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
    const [wsConnected, setWsConnected] = useState(true);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isAtBottomRef = useRef(true);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scrollToBottom = useCallback((animated = true) => {
        messagesEndRef.current?.scrollIntoView({
            behavior: animated ? 'smooth' : 'auto',
            block: 'end',
        });
        setNewMsgBadge(0);
        setIsAtBottom(true);
        isAtBottomRef.current = true;
    }, []);

    const handleScroll = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
        const atBottom = dist < 80;
        setIsAtBottom(atBottom);
        isAtBottomRef.current = atBottom;
        if (atBottom) setNewMsgBadge(0);
    }, []);

    // Load messages + subscribe
    useEffect(() => {
        if (!user || !leagueId) return;

        let unsubscribe: (() => void) | undefined;
        let isInitialLoad = true;
        const currentUserId = user.id.toString();

        const setupSubscription = async () => {
            try {
                unsubscribe = await SecureChatService.subscribeToLeagueMessages(
                    leagueId,
                    channelId || undefined,
                    (chatMessages: ChatMessage[]) => {
                        if (isInitialLoad) {
                            const processed = chatMessages.map(msg => ({
                                ...msg,
                                createdAt: typeof msg.createdAt === 'string' ? new Date(msg.createdAt) : msg.createdAt,
                            }));
                            setMessages(processed);
                            setLoading(false);
                            isInitialLoad = false;
                            SecureChatService.markMessagesAsRead(leagueId).catch(() => {});
                            setTimeout(() => scrollToBottom(false), 50);
                        } else {
                            setMessages(prev => {
                                const newMsg = chatMessages[0];
                                if (!newMsg) return prev;

                                if (prev.some(m => m.id === newMsg.id)) return prev;

                                const existsByContent = prev.some(m =>
                                    m.text === newMsg.text &&
                                    m.user._id === newMsg.user._id &&
                                    Math.abs(new Date(m.createdAt).getTime() - new Date(newMsg.createdAt).getTime()) < 5000
                                );

                                if (existsByContent) {
                                    return prev.map(m =>
                                        m.text === newMsg.text && m.user._id === newMsg.user._id
                                            ? { ...newMsg, status: 'sent' as const, createdAt: new Date(newMsg.createdAt) }
                                            : m
                                    );
                                }

                                SecureChatService.markMessagesAsRead(leagueId).catch(() => {});

                                if (!isAtBottomRef.current && newMsg.user._id !== currentUserId) {
                                    setNewMsgBadge(n => n + 1);
                                }

                                const processed = chatMessages.map(m => ({
                                    ...m,
                                    createdAt: typeof m.createdAt === 'string' ? new Date(m.createdAt) : m.createdAt,
                                }));
                                return [...prev, ...processed];
                            });
                        }
                    }
                );
            } catch (error) {
                console.error('Failed to set up chat subscription:', error);
                setLoading(false);
            }
        };

        setupSubscription();
        return () => unsubscribe?.();
    }, [leagueId, channelId, user, scrollToBottom]);

    // Auto-scroll when at bottom and new messages arrive
    useEffect(() => {
        if (isAtBottomRef.current && !loading) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [messages, loading]);

    // Online users
    useEffect(() => {
        if (!user || !leagueId) return;

        SecureChatService.updateUserStatus(user.id.toString(), true, {
            name: user.name || user.email,
            email: user.email,
        });

        setOnlineUsers([{
            id: user.id.toString(),
            name: user.name || user.email || 'You',
            isOnline: true,
        }]);

        let unsubscribeOnlineUsers: (() => void) | undefined;

        SecureChatService.subscribeToOnlineUsers(leagueId, (users) => {
            setOnlineUsers(prev => {
                const cu = { id: user.id.toString(), name: user.name || user.email || 'You', isOnline: true };
                if (Array.isArray(users)) {
                    const has = users.some(u => u.id === cu.id);
                    return has ? users : [cu, ...users];
                }
                if (users.isOnline) {
                    return prev.some(u => u.id === users.id) ? prev : [...prev, users];
                }
                return prev.filter(u => u.id !== users.id);
            });
        }).then(unsub => { unsubscribeOnlineUsers = unsub; }).catch(console.error);

        return () => {
            SecureChatService.updateUserStatus(user.id.toString(), false);
            unsubscribeOnlineUsers?.();
        };
    }, [user, leagueId]);

    // Subscribe to typing events
    useEffect(() => {
        const unsub = SecureChatService.subscribeToTypingEvents((event) => {
            setTypingUsers(prev => {
                const next = new Map(prev);
                if (event.type === 'typing') {
                    next.set(event.userId, event.userName || 'Someone');
                } else {
                    next.delete(event.userId);
                }
                return next;
            });
        });
        return unsub;
    }, []);

    // Subscribe to connection state
    useEffect(() => {
        const unsub = SecureChatService.subscribeToConnectionState(
            () => setWsConnected(true),
            () => setWsConnected(false)
        );
        return unsub;
    }, []);

    const handleRetry = useCallback(async (failedMsg: ChatMessage) => {
        if (!user) return;
        setMessages(prev => prev.filter(m => m.id !== failedMsg.id));
        const sent = await SecureChatService.sendMessage(leagueId, {
            text: failedMsg.text,
            user: failedMsg.user,
            leagueId,
            channelId: channelId || undefined,
        });
        if (sent.status === 'sent' || sent.status === 'sending') {
            setMessages(prev => [
                ...prev,
                { ...sent, createdAt: sent.createdAt instanceof Date ? sent.createdAt : new Date(sent.createdAt) },
            ]);
        }
    }, [user, leagueId, channelId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newMessage.trim()) return;

        const text = newMessage.trim();
        setNewMessage('');
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        SecureChatService.sendTypingStop(leagueId);
        inputRef.current?.focus();

        try {
            const sent = await SecureChatService.sendMessage(leagueId, {
                text,
                user: { _id: user.id.toString(), name: user.name || user.email, avatar: user.avatar },
                leagueId,
                channelId: channelId || undefined,
            });

            if (sent.status === 'sent' || sent.status === 'sending') {
                setMessages(prev => [
                    ...prev,
                    { ...sent, createdAt: sent.createdAt instanceof Date ? sent.createdAt : new Date(sent.createdAt) },
                ]);
            }

            setTimeout(() => scrollToBottom(true), 50);
        } catch {
            setNewMessage(text);
        }
    };

    // Annotate messages with grouping + date separator flags
    const grouped = messages.map((msg, i) => {
        const prev = messages[i - 1];
        const isGrouped = !!prev &&
            prev.user._id === msg.user._id &&
            Math.abs(new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime()) < 5 * 60 * 1000;
        const showDate = !prev ||
            new Date(msg.createdAt).toDateString() !== new Date(prev.createdAt).toDateString();
        return { msg, isGrouped, showDate };
    });

    const currentUserId = user?.id?.toString();

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-neutral-900">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Loading chat…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-gray-50 dark:bg-neutral-900 relative">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-h-0">

                {/* Mobile header — stacked avatars + members button */}
                <div className="lg:hidden bg-white dark:bg-neutral-800 border-b border-gray-100 dark:border-neutral-700 px-3 py-2 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5">
                            {onlineUsers.slice(0, 3).map(u => (
                                <div
                                    key={u.id}
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-neutral-800"
                                    style={{ backgroundColor: getAvatarColor(u.id) }}
                                >
                                    {u.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                            ))}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-neutral-400">
                            <span className="font-semibold text-gray-700 dark:text-neutral-200">{onlineUsers.length}</span> online
                        </span>
                    </div>
                    <button
                        onClick={() => setShowSidebar(true)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                        aria-label="View online members"
                    >
                        <svg className="w-5 h-5 text-gray-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </button>
                </div>

                {/* Connection banner */}
                {!wsConnected && (
                    <div className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center gap-2 flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">Reconnecting…</span>
                    </div>
                )}

                {/* Messages scroll area */}
                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto min-h-0 px-3 sm:px-4 py-4"
                    onScroll={handleScroll}
                >
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12 select-none">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="font-semibold text-gray-700 dark:text-neutral-200 mb-1">No messages yet</p>
                            <p className="text-sm text-gray-400 dark:text-neutral-500">Be the first to say something!</p>
                        </div>
                    ) : (
                        <>
                            {grouped.map(({ msg, isGrouped, showDate }) => {
                                const isOwn = msg.user._id === currentUserId;
                                const color = getAvatarColor(msg.user._id);
                                const date = msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt);

                                const firstUrl = extractFirstUrl(msg.text);
                                const igShortcode = firstUrl ? extractInstagramShortcode(firstUrl) : null;
                                return (
                                    <React.Fragment key={msg.id}>
                                        {showDate && (
                                            <div className="flex items-center gap-3 my-5">
                                                <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
                                                <span className="text-xs text-gray-400 dark:text-neutral-500 font-medium whitespace-nowrap px-1">
                                                    {formatDateSeparator(date)}
                                                </span>
                                                <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
                                            </div>
                                        )}

                                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-0.5' : 'mt-3'}`}>
                                            {/* Avatar column — incoming messages */}
                                            {!isOwn && (
                                                <div className="w-8 flex-shrink-0 mr-2 self-end mb-5">
                                                    {!isGrouped && (
                                                        <div
                                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                            style={{ backgroundColor: color }}
                                                        >
                                                            {msg.user.name?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%] sm:max-w-sm lg:max-w-md`}>
                                                {!isOwn && !isGrouped && (
                                                    <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-1 ml-0.5">
                                                        {msg.user.name}
                                                    </span>
                                                )}

                                                <div className={[
                                                    'px-4 py-2.5 text-sm leading-relaxed break-words',
                                                    'rounded-2xl',
                                                    isOwn
                                                        ? `bg-blue-500 text-white ${isGrouped ? '' : 'rounded-br-sm'}`
                                                        : `bg-white dark:bg-neutral-800 text-gray-800 dark:text-neutral-100 border border-gray-100 dark:border-neutral-700 shadow-sm ${isGrouped ? '' : 'rounded-bl-sm'}`,
                                                ].join(' ')}>
                                                    {parseMessageText(msg.text).map((part, pi) =>
                                                        part.type === 'url' ? (
                                                            <a
                                                                key={pi}
                                                                href={part.content}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={isOwn ? 'underline text-blue-100 hover:text-white' : 'underline text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'}
                                                                onClick={e => e.stopPropagation()}
                                                            >
                                                                {part.content}
                                                            </a>
                                                        ) : (
                                                            <React.Fragment key={pi}>{part.content}</React.Fragment>
                                                        )
                                                    )}
                                                    {firstUrl && igShortcode && (
                                                        <InstagramEmbed url={firstUrl} shortcode={igShortcode} />
                                                    )}
                                                    {firstUrl && !igShortcode && (
                                                        <LinkPreview url={firstUrl} isOwn={isOwn} />
                                                    )}
                                                </div>

                                                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                                    <span className="text-xs text-gray-400 dark:text-neutral-500">
                                                        {formatTime(date)}
                                                    </span>
                                                    {isOwn && msg.status && (
                                                        <StatusIcon
                                                            status={msg.status}
                                                            onRetry={msg.status === 'failed' ? () => handleRetry(msg) : undefined}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                            <div ref={messagesEndRef} className="h-px" />
                        </>
                    )}
                </div>

                {/* Jump-to-bottom button */}
                {!isAtBottom && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
                        <button
                            onClick={() => scrollToBottom(true)}
                            className="flex items-center gap-1.5 bg-white dark:bg-neutral-800 shadow-md border border-gray-200 dark:border-neutral-600 rounded-full px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700 active:scale-95 transition-all"
                        >
                            {newMsgBadge > 0 && (
                                <span className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none font-bold">
                                    {newMsgBadge > 9 ? '9+' : newMsgBadge}
                                </span>
                            )}
                            <span>{newMsgBadge > 0 ? 'New messages' : 'Jump to bottom'}</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Typing indicator */}
                {typingUsers.size > 0 && (
                    <div className="px-4 pb-1 flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 shadow-sm rounded-2xl rounded-bl-sm px-3 py-2">
                            <span className="flex gap-0.5 items-end h-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-neutral-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-neutral-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-neutral-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </span>
                            <span className="text-xs text-gray-400 dark:text-neutral-500 ml-1">
                                {Array.from(typingUsers.values()).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing
                            </span>
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="border-t border-gray-100 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 sm:px-4 py-3 flex-shrink-0">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={newMessage}
                                onChange={e => {
                                    setNewMessage(e.target.value);
                                    SecureChatService.sendTypingStart(leagueId);
                                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                    typingTimeoutRef.current = setTimeout(() => {
                                        SecureChatService.sendTypingStop(leagueId);
                                    }, 2000);
                                }}
                                placeholder={`Message ${leagueName}…`}
                                maxLength={1000}
                                className="w-full bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white dark:focus:bg-neutral-600 transition-all pr-12"
                                autoComplete="off"
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (newMessage.trim()) handleSendMessage(e as unknown as React.FormEvent);
                                    }
                                }}
                            />
                            {newMessage.length > 800 && (
                                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums pointer-events-none ${newMessage.length > 950 ? 'text-red-400 font-semibold' : 'text-gray-400 dark:text-neutral-500'}`}>
                                    {1000 - newMessage.length}
                                </span>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="w-9 h-9 flex-shrink-0 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                            aria-label="Send message"
                        >
                            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:flex flex-col w-52 bg-white dark:bg-neutral-800 border-l border-gray-100 dark:border-neutral-700 flex-shrink-0">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-neutral-700">
                    <p className="text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">Online now</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
                    {onlineUsers.length === 0 ? (
                        <p className="text-xs text-gray-400 dark:text-neutral-500 text-center py-6">No one online</p>
                    ) : (
                        onlineUsers.map(u => (
                            <div key={u.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors">
                                <div className="relative flex-shrink-0">
                                    <div
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                        style={{ backgroundColor: getAvatarColor(u.id) }}
                                    >
                                        {u.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white dark:border-neutral-800 rounded-full" />
                                </div>
                                <span className="text-sm text-gray-700 dark:text-neutral-200 truncate">{u.name || 'Unknown'}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Mobile sidebar overlay */}
            {showSidebar && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/40 dark:bg-black/60" onClick={() => setShowSidebar(false)} />
                    <div className="w-72 bg-white dark:bg-neutral-800 shadow-xl flex flex-col">
                        <div className="p-4 border-b border-gray-100 dark:border-neutral-700 flex justify-between items-center">
                            <p className="font-semibold text-gray-900 dark:text-neutral-100">Online Members</p>
                            <button onClick={() => setShowSidebar(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700">
                                <svg className="w-5 h-5 text-gray-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-1">
                            {onlineUsers.length === 0 ? (
                                <p className="text-sm text-gray-400 dark:text-neutral-500 text-center py-8">No one online</p>
                            ) : (
                                onlineUsers.map(u => (
                                    <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors">
                                        <div className="relative flex-shrink-0">
                                            <div
                                                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                                style={{ backgroundColor: getAvatarColor(u.id) }}
                                            >
                                                {u.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-neutral-800 rounded-full" />
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-neutral-100 text-sm">{u.name || 'Unknown'}</span>
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
