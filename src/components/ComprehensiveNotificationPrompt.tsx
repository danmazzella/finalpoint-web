'use client';

import { useNotificationTriggers, NotificationTriggers } from '@/hooks/useNotificationTriggers';
import { useNotificationPrompt } from '@/hooks/useNotificationPrompt';
import { useState, useEffect, useCallback } from 'react';

interface ComprehensiveNotificationPromptProps {
    currentPage: 'dashboard' | 'league' | 'picks' | 'other';
    leagues?: Array<{ id: number; name: string; joinedAt?: string }>;
    className?: string;
}

export const ComprehensiveNotificationPrompt = ({
    currentPage,
    leagues = [],
    className = ''
}: ComprehensiveNotificationPromptProps) => {
    const {
        triggers,
        shouldShowPrompt,
        dismissedUntil,
        updateTriggers,
        markPromptShown,
        dismissPrompt
    } = useNotificationTriggers();

    const [currentTrigger, setCurrentTrigger] = useState<keyof NotificationTriggers | null>(null);

    // Memoize the trigger update logic to prevent infinite loops
    const updatePageTrigger = useCallback(() => {
        if (currentPage === 'dashboard') {
            if (leagues.length > 0) {
                // For dashboard with leagues, show prompt for engaged users
                updateTriggers({ hasJoinedLeague: true });
                setCurrentTrigger('hasJoinedLeague');
            } else {
                // For dashboard without leagues, show generic prompt to encourage engagement
                updateTriggers({ hasJoinedLeague: true });
                setCurrentTrigger('hasJoinedLeague');
            }
        }

        if (currentPage === 'league') {
            updateTriggers({ isViewingLeague: true });
            setCurrentTrigger('isViewingLeague');
        }

        if (currentPage === 'picks') {
            updateTriggers({ isOnPicksPage: true });
            setCurrentTrigger('isOnPicksPage');
        }
    }, [currentPage, leagues, updateTriggers]);

    // Update triggers based on current page and context
    useEffect(() => {
        updatePageTrigger();
    }, [updatePageTrigger]);

    // Get appropriate configuration based on current trigger
    const getPromptConfig = useCallback(() => {
        switch (currentTrigger) {
            case 'hasJoinedLeague':
                return {
                    title: 'Welcome to the League! 🏁',
                    message: 'You\'ve joined a league! Enable notifications to get race reminders, score updates, and never miss making your picks.',
                    enableText: 'Enable Notifications',
                    dismissText: 'Maybe Later',
                    showIcon: true
                };

            case 'isViewingLeague':
                return {
                    title: 'Stay in the Loop! 📊',
                    message: 'Keep track of your league! Enable notifications for race reminders, score updates, and league announcements.',
                    enableText: 'Enable Notifications',
                    dismissText: 'Not Now',
                    showIcon: true
                };

            case 'isOnPicksPage':
                return {
                    title: 'Never Miss a Race! 🏎️',
                    message: 'Making picks? Enable notifications to get timely race reminders and score updates so you can stay competitive!',
                    enableText: 'Enable Notifications',
                    dismissText: 'I\'ll Remember',
                    showIcon: true
                };

            case 'hasUpcomingRace':
                return {
                    title: `Race in ${triggers.daysUntilRace} day${triggers.daysUntilRace > 1 ? 's' : ''}! 🏁`,
                    message: `Don't miss the upcoming race! Enable notifications to get ${triggers.daysUntilRace === 1 ? 'last-minute' : 'timely'} reminders and stay on top of your picks.`,
                    enableText: 'Get Reminders',
                    dismissText: 'Not Now',
                    showIcon: true
                };

            case 'hasRecentScoreUpdate':
                return {
                    title: 'Score Update! 📊',
                    message: 'Your race results are in! Enable notifications to get instant updates when your scores change and stay competitive.',
                    enableText: 'Enable Notifications',
                    dismissText: 'Maybe Later',
                    showIcon: true
                };

            default:
                return {
                    title: 'Stay Updated!',
                    message: 'Get notified about race reminders, score updates, and important league news.',
                    enableText: 'Enable Notifications',
                    dismissText: 'Not Now',
                    showIcon: true
                };
        }
    }, [currentTrigger, triggers.daysUntilRace]);

    // Use the notification prompt hook with our trigger logic
    const {
        showPrompt,
        permission,
        isRequesting,
        isFirefox,
        requestPermission,
        dismiss
    } = useNotificationPrompt(shouldShowPrompt, getPromptConfig());

    // Handle permission request success
    const handleEnable = useCallback(async () => {
        const success = await requestPermission();
        if (success) {
            markPromptShown();
        }
    }, [requestPermission, markPromptShown]);

    // Handle dismiss with different strategies
    const handleDismiss = useCallback((strategy: 'not-now' | 'maybe-later' = 'not-now') => {
        dismiss();
        dismissPrompt(strategy);
    }, [dismiss, dismissPrompt]);

    // Don't show if we shouldn't show prompt
    if (!showPrompt) {
        return null;
    }

    // Show Firefox-specific guidance if needed
    if (isFirefox && permission === 'denied') {
        return (
            <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 ${className}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-yellow-800">
                                Firefox Notification Setup
                            </p>
                            <p className="text-sm text-yellow-700 mt-1">
                                Click the shield icon in your address bar and allow notifications for this site.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleDismiss('maybe-later')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        );
    }

    // Don't show main prompt if permission is already determined
    if (permission !== 'default') {
        return null;
    }

    // Main notification prompt
    return (
        <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-blue-800">
                            {getPromptConfig().title}
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                            {getPromptConfig().message}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleEnable}
                        disabled={isRequesting}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRequesting ? 'Enabling...' : getPromptConfig().enableText}
                    </button>
                    <button
                        onClick={() => handleDismiss('not-now')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        Not Now
                    </button>
                </div>
            </div>
        </div>
    );
};
