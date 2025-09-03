import { ChatMessage, ChatUser } from '../types/chat';

interface WebSocketMessage {
    type: string;
    message?: ChatMessage;
    leagueId?: string;
    userId?: string;
    userName?: string;
    onlineUsers?: ChatUser[];
    [key: string]: unknown;
}

interface WebSocketCallbacks {
    onMessage?: (message: ChatMessage) => void;
    onUserJoined?: (user: ChatUser | ChatUser[]) => void;
    onUserLeft?: (userId: string) => void;
    onError?: (error: string) => void;
    onConnected?: () => void;
    onDisconnected?: () => void;
}

export class SecureWebSocketService {
    private ws: WebSocket | null = null;
    private token: string | null = null;
    private callbacks: WebSocketCallbacks = {};
    private joinedLeagues: Set<string> = new Set();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10; // Increased from 5
    private reconnectDelay = 1000; // Start with 1 second
    private isConnecting = false;
    private lastMessageTimestamps: Map<string, Date> = new Map(); // Track last message time per league
    private offlineMessageQueue: Array<{ leagueId: string, message: { text: string; channelId?: string } }> = []; // Queue messages when offline

    constructor() {
        // Get token from localStorage or auth context
        this.token = localStorage.getItem('token');
    }

    /**
     * Connect to the secure WebSocket server
     */
    async connect(): Promise<void> {
        if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
            return;
        }

        this.isConnecting = true;

        try {
            if (!this.token) {
                throw new Error('No authentication token available');
            }

            // Get the API base URL
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6075';
            // Remove /api suffix if it exists to avoid double /api/api
            const baseUrl = apiBaseUrl.endsWith('/api') ? apiBaseUrl.slice(0, -4) : apiBaseUrl;
            // Convert to WebSocket URL and ensure proper path construction
            const wsBaseUrl = baseUrl.replace('http', 'ws');
            const wsUrl = `${wsBaseUrl}/api/chat/ws?token=${encodeURIComponent(this.token)}`;



            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                this.reconnectDelay = 1000;
                this.callbacks.onConnected?.();

                // Rejoin all previously joined leagues
                this.joinedLeagues.forEach(leagueId => {
                    this.joinLeague(leagueId);
                });

                // Synchronize missed messages for all joined leagues
                this.synchronizeMissedMessages();

                // Retry sending queued offline messages
                this.retryOfflineMessages();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data: WebSocketMessage = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.ws.onclose = (event) => {
                this.isConnecting = false;
                this.callbacks.onDisconnected?.();

                // Attempt to reconnect if not a manual close
                if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.attemptReconnect();
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.isConnecting = false;
                this.callbacks.onError?.('WebSocket connection error');
            };

        } catch (error) {
            console.error('Error connecting to WebSocket:', error);
            this.isConnecting = false;
            this.callbacks.onError?.(error instanceof Error ? error.message : 'Connection failed');
        }
    }

    /**
     * Disconnect from the WebSocket server
     */
    disconnect(): void {
        if (this.ws) {
            this.ws.close(1000, 'Manual disconnect');
            this.ws = null;
        }
        this.joinedLeagues.clear();
    }

    /**
     * Join a league's chat room
     */
    joinLeague(leagueId: string): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket not connected, cannot join league');
            this.connect();
            return;
        }

        this.send({
            type: 'join_league',
            leagueId: leagueId
        });

        this.joinedLeagues.add(leagueId);

        // Initialize last message timestamp if not already set
        if (!this.lastMessageTimestamps.has(leagueId)) {
            this.lastMessageTimestamps.set(leagueId, new Date());
        }

    }

    /**
     * Leave a league's chat room
     */
    leaveLeague(leagueId: string): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return;
        }

        this.send({
            type: 'leave_league',
            leagueId: leagueId
        });

        this.joinedLeagues.delete(leagueId);

    }

    /**
     * Send a message to a league's chat
     */
    sendMessage(leagueId: string, text: string, channelId?: string): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket not connected, queuing message for later');
            // Queue the message for later sending
            this.queueOfflineMessage(leagueId, { text, channelId });
            return;
        }

        this.send({
            type: 'send_message',
            leagueId: leagueId,
            text: text,
            channelId: channelId
        });
    }

    /**
     * Set callbacks for WebSocket events
     */
    setCallbacks(callbacks: WebSocketCallbacks): void {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * Check if WebSocket is connected
     */
    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    /**
     * Get list of joined leagues
     */
    getJoinedLeagues(): string[] {
        return Array.from(this.joinedLeagues);
    }

    /**
     * Update authentication token
     */
    updateToken(token: string): void {
        this.token = token;
        // Reconnect with new token if currently connected
        if (this.isConnected()) {
            this.disconnect();
            this.connect();
        }
    }

    /**
     * Send data through WebSocket
     */
    public send(data: Record<string, unknown>): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    private handleMessage(data: WebSocketMessage): void {
        switch (data.type) {
            case 'authenticated':
                // Handle token migration if new token is provided
                if (data.newToken && data.tokenMigration && typeof data.newToken === 'string') {
                    localStorage.setItem('token', data.newToken);
                    this.token = data.newToken;
                }
                break;

            case 'league_joined':
                // Handle league joined event with online users list
                if (data.onlineUsers && Array.isArray(data.onlineUsers)) {
                    // Send the online users list to the callback
                    this.callbacks.onUserJoined?.(data.onlineUsers as ChatUser[]);
                }
                break;

            case 'league_left':
                break;

            case 'new_message':
                if (data.message) {
                    this.callbacks.onMessage?.(data.message);
                    // Update last message timestamp for the league
                    if (data.message.leagueId) {
                        this.updateLastMessageTimestamp(data.message.leagueId, new Date(data.message.createdAt));
                    }
                }
                break;

            case 'user_joined':
                if (data.userId) {
                    this.callbacks.onUserJoined?.({
                        id: data.userId,
                        name: (data.userName as string) || 'Unknown User',
                        email: '',
                        isOnline: true,
                        lastSeen: new Date(),
                        leagues: []
                    });
                }
                break;

            case 'user_left':
                if (data.userId) {
                    this.callbacks.onUserLeft?.(data.userId);
                }
                break;

            case 'error':
                console.error('WebSocket error:', data.message);
                this.callbacks.onError?.(typeof data.message === 'string' ? data.message : 'Unknown error');
                break;

            case 'pong':
                // Handle ping/pong for connection health
                break;

            default:
                console.warn('Unknown WebSocket message type:', data.type);
        }
    }

    private attemptReconnect(): void {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff



        setTimeout(() => {
            this.connect();
        }, delay);
    }

    /**
     * Synchronize missed messages for all joined leagues
     */
    private async synchronizeMissedMessages(): Promise<void> {
        for (const leagueId of this.joinedLeagues) {
            try {
                const lastTimestamp = this.lastMessageTimestamps.get(leagueId);
                if (lastTimestamp) {
                    const { SecureChatService } = await import('./secureChatService');
                    const missedMessages = await SecureChatService.getMessagesSince(leagueId, lastTimestamp);

                    // Process missed messages
                    missedMessages.forEach(message => {
                        this.callbacks.onMessage?.(message);
                        // Update the last message timestamp
                        this.lastMessageTimestamps.set(leagueId, message.createdAt);
                    });
                }
            } catch (error) {
                console.error(`Error synchronizing messages for league ${leagueId}:`, error);
            }
        }
    }

    /**
     * Retry sending queued offline messages
     */
    private async retryOfflineMessages(): Promise<void> {
        const messagesToRetry = [...this.offlineMessageQueue];
        this.offlineMessageQueue = [];

        for (const { leagueId, message } of messagesToRetry) {
            try {
                await this.sendMessage(leagueId, message.text, message.channelId);
            } catch (error) {
                console.error('Error retrying offline message:', error);
                // Re-queue the message if it fails
                this.offlineMessageQueue.push({ leagueId, message });
            }
        }
    }

    /**
     * Queue a message for later sending when offline
     */
    private queueOfflineMessage(leagueId: string, message: { text: string; channelId?: string }): void {
        this.offlineMessageQueue.push({ leagueId, message });
    }

    /**
     * Update last message timestamp for a league
     */
    private updateLastMessageTimestamp(leagueId: string, timestamp: Date): void {
        this.lastMessageTimestamps.set(leagueId, timestamp);
    }
}

// Export a singleton instance
export const secureWebSocketService = new SecureWebSocketService();
