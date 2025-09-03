'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LeagueChat } from '../../../components/LeagueChat';
import { SecureChatService } from '../../../services/secureChatService';
import { useAuth } from '@/contexts/AuthContext';
import { chatAPI, leaguesAPI } from '@/lib/api';

export default function LeagueChatPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
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
    }, [user, leagueId, router, loadNotificationPreferences]);

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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Please Log In</h1>
                    <p className="text-gray-600">You need to be logged in to access chat.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Loading chat...</div>
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-6">You are not a member of this league.</p>
                    <button
                        onClick={handleBack}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* Enhanced Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleBack}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Go back"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{leagueName}</h1>
                                <p className="text-sm text-gray-500">League Chat</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Settings Button */}
                            <button
                                onClick={() => setShowSettingsModal(true)}
                                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
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
            </div>

            {/* Chat Component */}
            <div className="flex-1 p-4 min-h-0">
                <div className="h-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm border flex flex-col">
                    <LeagueChat
                        leagueId={leagueId}
                        leagueName={leagueName}
                    />
                </div>
            </div>

            {/* Settings Modal */}
            {showSettingsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Chat Settings</h3>
                                <button
                                    onClick={() => setShowSettingsModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Push Notifications</p>
                                    <p className="text-sm text-gray-500">
                                        Get notified when someone sends a message in this league
                                    </p>
                                </div>
                                <button
                                    onClick={toggleNotifications}
                                    disabled={loadingPreferences}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsEnabled ? 'bg-blue-600' : 'bg-gray-200'
                                        } ${loadingPreferences ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowSettingsModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
