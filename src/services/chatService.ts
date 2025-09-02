import {
    collection,
    doc,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    updateDoc,
    getDocs,
    getDoc,
    setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ChatMessage, ChatChannel, ChatUser } from '../types/chat';
import { leaguesAPI, apiService } from '../lib/api';

// Firestore collection names with environment prefix
const getCollectionName = (baseName: string) => {
    const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
    return `${env}_${baseName}`;
};

const COLLECTIONS = {
    MESSAGES: getCollectionName('chat_messages'),
    CHANNELS: getCollectionName('chat_channels'),
    USERS: getCollectionName('chat_users'),
    LEAGUE_MEMBERS: getCollectionName('league_members')
};

export class ChatService {
    /**
     * Send a message to a league chat (hybrid approach: validate via API, send via Firestore)
     */
    static async sendMessage(
        leagueId: string,
        message: Omit<ChatMessage, 'id' | 'createdAt'>
    ): Promise<string> {
        try {
            // First, validate access via API
            const validationResponse = await apiService.get(`/chat/validate/${leagueId}`);

            if (!validationResponse.data.hasAccess) {
                throw new Error('You are not a member of this league');
            }

            // If access is validated, send message via Firestore for real-time updates
            const messageData: any = {
                text: message.text,
                user: message.user,
                leagueId,
                createdAt: serverTimestamp(),
            };

            // Only add channelId if it's not undefined
            if (message.channelId !== undefined) {
                messageData.channelId = message.channelId;
            }

            // Only add image if it's not undefined
            if (message.image !== undefined) {
                messageData.image = message.image;
            }

            // Only add system if it's not undefined
            if (message.system !== undefined) {
                messageData.system = message.system;
            }

            const docRef = await addDoc(collection(db, COLLECTIONS.MESSAGES), messageData);
            return docRef.id;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    /**
     * Listen to messages in a league chat (with security validation)
     */
    static async subscribeToLeagueMessages(
        leagueId: string,
        channelId: string | null = null,
        callback: (messages: ChatMessage[]) => void
    ): Promise<() => void> {
        try {
            // First, validate access via API
            const validationResponse = await apiService.get(`/chat/validate/${leagueId}`);

            if (!validationResponse.data.hasAccess) {
                throw new Error('You are not a member of this league');
            }

            // If access is validated, set up Firestore listener
            let q = query(
                collection(db, COLLECTIONS.MESSAGES),
                where('leagueId', '==', leagueId),
                orderBy('createdAt', 'desc'),
                limit(50)
            );

            // If channelId is specified, filter by channel
            if (channelId) {
                q = query(
                    collection(db, COLLECTIONS.MESSAGES),
                    where('leagueId', '==', leagueId),
                    where('channelId', '==', channelId),
                    orderBy('createdAt', 'desc'),
                    limit(50)
                );
            }

            return onSnapshot(q, (snapshot) => {
                const messages: ChatMessage[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    messages.push({
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt?.toDate() || new Date(),
                    } as ChatMessage);
                });

                // Reverse to show oldest first
                callback(messages.reverse());
            });
        } catch (error) {
            console.error('Error setting up message subscription:', error);
            // Return a no-op function if validation fails
            return () => { };
        }
    }

    /**
     * Get league channels (with security validation)
     */
    static async getLeagueChannels(leagueId: string): Promise<ChatChannel[]> {
        try {
            // First, validate access via API
            const validationResponse = await apiService.get(`/chat/validate/${leagueId}`);

            if (!validationResponse.data.hasAccess) {
                throw new Error('You are not a member of this league');
            }

            // If access is validated, get channels from Firestore
            const q = query(
                collection(db, COLLECTIONS.CHANNELS),
                where('leagueId', '==', leagueId),
                orderBy('createdAt', 'asc')
            );

            const snapshot = await getDocs(q);
            const channels: ChatChannel[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                channels.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                } as ChatChannel);
            });

            return channels;
        } catch (error) {
            console.error('Error getting league channels:', error);
            throw error;
        }
    }

    /**
     * Create a default channel for a league
     */
    static async createDefaultChannel(leagueId: string, leagueName: string): Promise<string> {
        try {
            const channelData = {
                name: 'General',
                description: `General chat for ${leagueName}`,
                leagueId,
                type: 'general',
                createdAt: serverTimestamp(),
                createdBy: 'system',
                memberCount: 0,
            };

            const docRef = await addDoc(collection(db, COLLECTIONS.CHANNELS), channelData);
            return docRef.id;
        } catch (error) {
            console.error('Error creating default channel:', error);
            throw error;
        }
    }

    /**
 * Update user's online status
 */
    static async updateUserStatus(userId: string, isOnline: boolean, userInfo?: { name?: string; email?: string }): Promise<void> {
        try {
            // Get user's leagues first
            const userLeagues = await this.getUserLeagues(userId);

            const userRef = doc(db, COLLECTIONS.USERS, userId);
            const userData: any = {
                id: userId,
                isOnline,
                lastSeen: serverTimestamp(),
                leagues: userLeagues, // Include user's leagues for filtering
            };

            // Include user info if provided
            if (userInfo) {
                if (userInfo.name) userData.name = userInfo.name;
                if (userInfo.email) userData.email = userInfo.email;
            }

            await setDoc(userRef, userData, { merge: true }); // merge: true creates the document if it doesn't exist
        } catch (error) {
            console.error('Error updating user status:', error);
            throw error;
        }
    }

    /**
     * Create or update chat user profile
     */
    static async createChatUser(userData: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
        leagues: string[];
    }): Promise<void> {
        try {
            const userRef = doc(db, COLLECTIONS.USERS, userData.id);
            await setDoc(userRef, {
                ...userData,
                isOnline: true,
                lastSeen: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error creating chat user:', error);
            throw error;
        }
    }

    /**
 * Get user's leagues for chat access (using existing leagues API)
 */
    static async getUserLeagues(userId: string): Promise<string[]> {
        try {
            // Use the existing leagues API to get user's leagues
            const response = await leaguesAPI.getLeagues();
            const leagues = response.data.data || [];

            // Map league IDs to strings
            const userLeagues = leagues.map((league: any) => league.id.toString());

            console.log('User leagues from API:', userLeagues);
            return userLeagues;
        } catch (error) {
            console.error('Error getting user leagues from API:', error);
            throw error;
        }
    }

    /**
 * Get online users for a league
 */
    static subscribeToOnlineUsers(
        leagueId: string,
        callback: (users: any[]) => void
    ): () => void {
        try {
            const q = query(
                collection(db, COLLECTIONS.USERS),
                where('leagues', 'array-contains', leagueId),
                where('isOnline', '==', true)
            );

            return onSnapshot(q, (snapshot) => {
                const users: any[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    users.push({
                        id: doc.id,
                        ...data,
                        lastSeen: data.lastSeen?.toDate() || new Date(),
                    });
                });
                callback(users);
            }, (error) => {
                console.error('Error in online users snapshot:', error);
            });
        } catch (error) {
            console.error('Error setting up online users subscription:', error);
            return () => { };
        }
    }

    /**
     * Add user to league for chat access
     */
    static async addUserToLeague(userId: string, leagueId: string): Promise<void> {
        try {
            const memberRef = doc(db, COLLECTIONS.LEAGUE_MEMBERS, `${userId}_${leagueId}`);
            await setDoc(memberRef, {
                userId,
                leagueId,
                joinedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error adding user to league:', error);
            throw error;
        }
    }

    /**
     * Remove user from league chat
     */
    static async removeUserFromLeague(userId: string, leagueId: string): Promise<void> {
        try {
            const memberRef = doc(db, COLLECTIONS.LEAGUE_MEMBERS, `${userId}_${leagueId}`);
            await updateDoc(memberRef, {
                leftAt: serverTimestamp(),
                active: false,
            });
        } catch (error) {
            console.error('Error removing user from league:', error);
            throw error;
        }
    }
}
