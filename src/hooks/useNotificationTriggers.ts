import { useState, useEffect, useCallback } from 'react';

// Hook for managing notification trigger conditions
// This hook manages when to show notification prompts based on user actions
// Updated for production use

export interface NotificationTriggers {
    hasJoinedLeague: boolean;
    isViewingLeague: boolean;
    isOnPicksPage: boolean;
    hasUpcomingRace: boolean;
    daysUntilRace: number;
    hasRecentScoreUpdate: boolean;
}

export const useNotificationTriggers = () => {
    const [triggers, setTriggers] = useState<NotificationTriggers>({
        hasJoinedLeague: false,
        isViewingLeague: false,
        isOnPicksPage: false,
        hasUpcomingRace: false,
        daysUntilRace: 3,
        hasRecentScoreUpdate: false
    });

    const [hasShownPrompt, setHasShownPrompt] = useState(false);
    const [dismissedUntil, setDismissedUntil] = useState<Date | null>(null);

    // Check if user has joined a league recently
    const checkLeagueJoin = useCallback((leagues: Array<{ joinedAt?: string }>) => {
        if (leagues.length === 0) return false;

        // Check if any league was joined recently (within last 24 hours)
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        return leagues.some(league => {
            if (league.joinedAt) {
                const joinedAt = new Date(league.joinedAt);
                return joinedAt > oneDayAgo;
            }
            // If no joinedAt timestamp, assume it's recent if it's the first league
            return leagues.length === 1;
        });
    }, []);

    // Check for upcoming races
    const checkUpcomingRaces = useCallback(async () => {
        try {
            // This would typically call your API to get race schedule
            // For now, we'll simulate it
            const hasUpcoming = Math.random() > 0.3; // 70% chance for demo
            if (hasUpcoming) {
                const daysUntil = Math.floor(Math.random() * 3) + 1;
                setTriggers(prev => ({
                    ...prev,
                    hasUpcomingRace: true,
                    daysUntilRace: daysUntil
                }));
            }
        } catch (error) {
            console.error('Error checking upcoming races:', error);
        }
    }, []);

    // Update triggers based on current context
    const updateTriggers = useCallback((updates: Partial<NotificationTriggers>) => {
        setTriggers(prev => {
            const newTriggers = { ...prev, ...updates };
            return newTriggers;
        });
    }, []);

    // Check if we should show a notification prompt
    const shouldShowPrompt = useCallback((): boolean => {
        const now = new Date();

        // Check if we're still within the dismissal period
        if (dismissedUntil && now < dismissedUntil) {
            return false;
        }

        // Show prompt if any of these conditions are met
        const shouldShow = (
            triggers.hasJoinedLeague ||
            triggers.isViewingLeague ||
            triggers.isOnPicksPage ||
            (triggers.hasUpcomingRace && triggers.daysUntilRace <= 3) ||
            triggers.hasRecentScoreUpdate
        );

        return shouldShow;
    }, [triggers, dismissedUntil]);

    // Mark that we've shown a prompt
    const markPromptShown = useCallback(() => {
        setHasShownPrompt(true);
        // Store in localStorage to remember across sessions
        localStorage.setItem('notification-prompt-shown', 'true');
    }, []);

    // Dismiss prompt with different strategies
    const dismissPrompt = useCallback((strategy: 'not-now' | 'maybe-later' | 'never') => {
        const now = new Date();
        let dismissUntil: Date;

        switch (strategy) {
            case 'not-now':
                // Show again in 3 days
                dismissUntil = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
                break;

            case 'maybe-later':
                // Show again in 1 week
                dismissUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                break;

            case 'never':
                // Never show again (or show in 30 days as a fallback)
                dismissUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                break;
        }

        setDismissedUntil(dismissUntil);
        localStorage.setItem('notification-prompt-dismissed-until', dismissUntil.toISOString());
    }, []);

    // Reset triggers (useful for testing)
    const resetTriggers = useCallback(() => {
        setTriggers({
            hasJoinedLeague: false,
            isViewingLeague: false,
            isOnPicksPage: false,
            hasUpcomingRace: false,
            daysUntilRace: 3,
            hasRecentScoreUpdate: false
        });
        setHasShownPrompt(false);
        setDismissedUntil(null);
        localStorage.removeItem('notification-prompt-shown');
        localStorage.removeItem('notification-prompt-dismissed-until');
    }, []);

    // Initialize triggers from localStorage
    useEffect(() => {
        const shown = localStorage.getItem('notification-prompt-shown');
        const dismissedUntilStr = localStorage.getItem('notification-prompt-dismissed-until');

        if (shown) {
            setHasShownPrompt(true);
        }

        if (dismissedUntilStr) {
            const dismissedUntil = new Date(dismissedUntilStr);
            const now = new Date();

            if (now < dismissedUntil) {
                setDismissedUntil(dismissedUntil);
            } else {
                localStorage.removeItem('notification-prompt-dismissed-until');
            }
        }
    }, []);

    return {
        triggers,
        shouldShowPrompt: shouldShowPrompt(),
        hasShownPrompt,
        dismissedUntil,
        updateTriggers,
        markPromptShown,
        dismissPrompt,
        resetTriggers,
        checkLeagueJoin,
        checkUpcomingRaces
    };
};
