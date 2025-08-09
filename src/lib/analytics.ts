'use client';

import { logEvent, setUserProperties, setUserId } from 'firebase/analytics';
import { analytics } from './firebase';

// Analytics utility functions
export const analyticsUtils = {
    // Log custom events
    logEvent: (eventName: string, parameters?: Record<string, any>) => {
        if (analytics && typeof window !== 'undefined') {
            // Add debug info in development
            if (process.env.NODE_ENV === 'development') {
                console.log('🔥 Analytics Event:', eventName, parameters);
            }
            logEvent(analytics, eventName, parameters);
        }
    },

    // Set user properties
    setUserProperties: (properties: Record<string, any>) => {
        if (analytics && typeof window !== 'undefined') {
            setUserProperties(analytics, properties);
        }
    },

    // Set user ID
    setUserId: (userId: string) => {
        if (analytics && typeof window !== 'undefined') {
            setUserId(analytics, userId);
        }
    },

    // Common events
    pageView: (pageName: string, pageTitle?: string) => {
        analyticsUtils.logEvent('page_view', {
            page_name: pageName,
            page_title: pageTitle || document.title,
            page_location: window.location.href
        });
    },

    login: (method: string) => {
        analyticsUtils.logEvent('login', { method });
    },

    signUp: (method: string) => {
        analyticsUtils.logEvent('sign_up', { method });
    },

    buttonClick: (buttonName: string, location?: string) => {
        analyticsUtils.logEvent('button_click', {
            button_name: buttonName,
            location: location || 'unknown'
        });
    },

    search: (searchTerm: string) => {
        analyticsUtils.logEvent('search', {
            search_term: searchTerm
        });
    },

    // League-specific events
    leagueJoin: (leagueId: string, leagueName: string) => {
        analyticsUtils.logEvent('league_join', {
            league_id: leagueId,
            league_name: leagueName
        });
    },

    leagueCreate: (leagueId: string, leagueName: string) => {
        analyticsUtils.logEvent('league_create', {
            league_id: leagueId,
            league_name: leagueName
        });
    },

    raceResultView: (leagueId: string, week: number) => {
        analyticsUtils.logEvent('race_result_view', {
            league_id: leagueId,
            week: week
        });
    }
};

// Hook for easier usage in React components
export const useAnalytics = () => {
    return analyticsUtils;
};
