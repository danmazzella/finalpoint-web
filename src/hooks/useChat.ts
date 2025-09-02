import { useEffect, useState } from 'react';
import { ChatService } from '../services/chatService';
import { useAuth } from '@/contexts/AuthContext';

export const useChat = () => {
    const { user } = useAuth();
    const [userLeagues, setUserLeagues] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setUserLeagues([]);
            setLoading(false);
            return;
        }

        const loadUserLeagues = async () => {
            try {
                const leagues = await ChatService.getUserLeagues(user.id.toString());
                setUserLeagues(leagues);
            } catch (error) {
                console.error('Error loading user leagues:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUserLeagues();
    }, [user]);

    const joinLeague = async (leagueId: string) => {
        if (!user) return false;

        try {
            await ChatService.addUserToLeague(user.id.toString(), leagueId);
            setUserLeagues(prev => [...prev, leagueId]);
            return true;
        } catch (error) {
            console.error('Error joining league:', error);
            return false;
        }
    };

    const leaveLeague = async (leagueId: string) => {
        if (!user) return false;

        try {
            await ChatService.removeUserFromLeague(user.id.toString(), leagueId);
            setUserLeagues(prev => prev.filter(id => id !== leagueId));
            return true;
        } catch (error) {
            console.error('Error leaving league:', error);
            return false;
        }
    };

    const hasLeagueAccess = (leagueId: string) => {
        return userLeagues.includes(leagueId);
    };

    return {
        userLeagues,
        loading,
        joinLeague,
        leaveLeague,
        hasLeagueAccess,
    };
};
