'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LeagueChat } from '../../../components/LeagueChat';
import { SecureChatService } from '../../../services/secureChatService';
import { useAuth } from '@/contexts/AuthContext';
import { useChatFeature } from '@/contexts/FeatureFlagContext';
import { chatAPI, leaguesAPI } from '@/lib/api';

export default function LeagueChatPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { isChatFeatureEnabled, isLoading: featureFlagLoading } = useChatFeature();
    const leagueId = params.leagueId as string;
    const [leagueName, setLeagueName] = useState('League Chat');
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [loadingPreferences, setLoadingPreferences] = useState(true);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const loadNotificationPreferences = useCallback(async () => {
        try {
            setLoadingPreferences(true);
            const response = await chatAPI.getNotificationPreferences(parseInt(leagueId));
            if (response.data.success) {
                setNotificationsEnabled(response.data.notificationsEnabled);
            }
        } catch (error) {
            console.error('Error loading notification preferences:', error);
        } finally {
            setLoadingPreferences(false);
        }
    }, [leagueId]);

    useEffect(() => {
        // Check if chat feature is enabled
        if (!featureFlagLoading && !isChatFeatureEnabled) {
            alert('Chat functionality is currently not available. Please try again later.');
            router.back();
            return;
        }

        if (!user || !leagueId) {
            if (!user) {
                router.push('/login');
                return;
            }
            return;
        }

        const checkAccess = async () => {
            try {
                // Use secure backend validation instead of client-side checks
                const hasLeagueAccess = await SecureChatService.validateLeagueAccess(leagueId);

                if (hasLeagueAccess) {
                    setHasAccess(true);

                    // Get actual league name from API
                    try {
                        const leagueResponse = await leaguesAPI.getLeague(parseInt(leagueId));
                        if (leagueResponse.data.success) {
                            setLeagueName(leagueResponse.data.data.name);
                        } else {
                            setLeagueName(`League ${leagueId}`);
                        }
                    } catch (error) {
                        console.error('Error fetching league name:', error);
                        setLeagueName(`League ${leagueId}`);
                    }

                    // Load notification preferences for this league
                    await loadNotificationPreferences();
                } else {
                    setHasAccess(false);
                    const errorMsg = `You are not a member of league ${leagueId}. Access denied by server.`;

                    alert(errorMsg);
                    router.back();
                }
            } catch (error: unknown) {
                console.error('Error checking league access:', error);
                const errorMsg = `Failed to load chat: ${error instanceof Error ? error.message : 'Unknown error'}`;

                alert(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        checkAccess();
    }, [user, leagueId, router, loadNotificationPreferences, isChatFeatureEnabled, featureFlagLoading]);

    const toggleNotifications = async () => {
        try {
            const newValue = !notificationsEnabled;
            const response = await chatAPI.updateNotificationPreferences(parseInt(leagueId), newValue);
            if (response.data.success) {
                setNotificationsEnabled(newValue);
            } else {
                alert('Failed to update notification preferences');
            }
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            alert('Failed to update notification preferences');
        }
    };

    const handleBack = () => {
        router.back();
    };

    if (!user) {
        return (
            <div className="page-bg min-h-screen flex items-center justify-center">
                <div className="glass-card p-8 text-center max-w-sm">
                    <h1 className="text-lg font-semibold text-gray-900 mb-2">Please Log In</h1>
                    <p className="text-sm text-gray-500">You need to be logged in to access chat.</p>
                </div>
            </div>
        );
    }

    if (loading || featureFlagLoading) {
        return (
            <div className="page-bg min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="page-bg min-h-screen flex items-center justify-center">
                <div className="glass-card p-8 text-center max-w-sm">
                    <h1 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-sm text-gray-500 mb-5">You are not a member of this league.</p>
                    <button onClick={handleBack} className="btn-primary text-sm py-2 px-4">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen page-bg flex flex-col">
            {/* Header */}
            <div className="glass-nav flex-shrink-0">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBack}
                                className="btn-ghost p-2"
                                title="Go back"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-base font-bold text-gray-900">{leagueName}</h1>
                                <p className="text-xs text-gray-500">League Chat</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowSettingsModal(true)}
                            className="btn-ghost p-2"
                            title="Chat Settings"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat Component */}
            <div className="flex-1 p-4 min-h-0">
                <div className="h-full max-w-4xl mx-auto glass-card flex flex-col overflow-hidden">
                    <LeagueChat
                        leagueId={leagueId}
                        leagueName={leagueName}
                    />
                </div>
            </div>

            {/* Settings Modal */}
            {showSettingsModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass-card w-full max-w-md mx-4 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-semibold text-gray-900">Chat Settings</h3>
                            <button
                                onClick={() => setShowSettingsModal(false)}
                                className="btn-ghost p-1.5"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Get notified when someone sends a message in this league
                                </p>
                            </div>
                            <button
                                onClick={toggleNotifications}
                                disabled={loadingPreferences}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-4 ${
                                    notificationsEnabled ? 'bg-blue-600' : 'bg-gray-200'
                                } ${loadingPreferences ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    notificationsEnabled ? 'translate-x-5' : 'translate-x-1'
                                }`} />
                            </button>
                        </div>

                        <div className="flex justify-end mt-5">
                            <button onClick={() => setShowSettingsModal(false)} className="btn-ghost text-sm py-2 px-4">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
