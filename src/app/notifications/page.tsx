'use client';

import { useAuth } from '@/contexts/AuthContext';
import { notificationsAPI, NotificationPreferences } from '@/lib/api';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function NotificationsPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        emailReminders: true,
        emailScoreUpdates: true,
        pushReminders: true,
        pushScoreUpdates: true
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [pushSupported, setPushSupported] = useState(false);
    const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        loadPreferences();
        checkPushSupport();
    }, []);

    const loadPreferences = async () => {
        try {
            const response = await notificationsAPI.getPreferences();
            if (response.data.success) {
                // Convert database values (1/0) to proper booleans
                const rawData = response.data.data;
                setPreferences({
                    emailReminders: Boolean(rawData.emailReminders),
                    emailScoreUpdates: Boolean(rawData.emailScoreUpdates),
                    pushReminders: Boolean(rawData.pushReminders),
                    pushScoreUpdates: Boolean(rawData.pushScoreUpdates)
                });
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
            setError('Failed to load notification preferences');
        } finally {
            setIsLoading(false);
        }
    };

    const checkPushSupport = () => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setPushSupported(true);

            if ('Notification' in window) {
                setPushPermission(Notification.permission);
            }
        }
    };

    const handlePreferenceChange = (key: keyof NotificationPreferences) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const savePreferences = async () => {
        setIsSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await notificationsAPI.updatePreferences(preferences);
            if (response.data.success) {
                setSuccess('Notification preferences updated successfully!');
            } else {
                setError(response.data.error || 'Failed to update preferences');
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
            setError('Failed to save notification preferences');
        } finally {
            setIsSaving(false);
        }
    };

    const requestPushPermission = async () => {
        if (!pushSupported) {
            setError('Push notifications are not supported in this browser');
            return;
        }

        try {
            // Check current permission first
            const currentPermission = Notification.permission;

            if (currentPermission === 'granted') {
                setSuccess('Push notifications are already enabled!');
                return;
            }

            if (currentPermission === 'denied') {
                // Detect Firefox and provide specific instructions
                const isFirefox = navigator.userAgent.includes('Firefox');
                if (isFirefox) {
                    setError('Push notifications are blocked in Firefox. Please click the shield icon in the address bar and allow notifications for this site.');
                } else {
                    setError('Push notifications are blocked. Please enable them in your browser settings and try again.');
                }
                return;
            }

            // Request permission
            const permission = await Notification.requestPermission();
            setPushPermission(permission);

            if (permission === 'granted') {
                try {
                    // Skip service worker registration in development to avoid caching issues
                    if (process.env.NODE_ENV === 'development') {
                        console.log('Skipping service worker registration in development mode');
                        setSuccess('Push notifications enabled (development mode - service worker disabled)');
                        return;
                    }

                    // Register service worker with proper scope
                    const registration = await navigator.serviceWorker.register('/sw.js', {
                        scope: '/'
                    });

                    console.log('Service worker registered:', registration);

                    // Wait for service worker to be ready
                    await navigator.serviceWorker.ready;

                    // Check if already subscribed
                    let subscription = await registration.pushManager.getSubscription();

                    if (!subscription) {
                        // Subscribe to push notifications
                        subscription = await registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
                        });
                        console.log('Push subscription created:', subscription);
                    } else {
                        console.log('Existing push subscription found:', subscription);
                    }

                    // Send subscription to server
                    await notificationsAPI.registerPushToken(
                        JSON.stringify(subscription),
                        'web'
                    );

                    setSuccess('Push notifications enabled successfully!');
                } catch (subscriptionError) {
                    console.error('Error setting up push subscription:', subscriptionError);
                    const errorMessage = subscriptionError instanceof Error ? subscriptionError.message : 'Unknown error';
                    setError(`Failed to set up push notifications: ${errorMessage}`);
                }
            } else if (permission === 'denied') {
                const isFirefox = navigator.userAgent.includes('Firefox');
                if (isFirefox) {
                    setError('Push notification permission was denied. Please click the shield icon in the address bar and allow notifications for this site.');
                } else {
                    setError('Push notification permission was denied. You can enable them later in your browser settings.');
                }
            } else {
                setError('Push notification permission was not granted.');
            }
        } catch (error) {
            console.error('Error requesting push permission:', error);
            setError('Failed to request push notification permission');
        }
    };

    const resetPushPermission = async () => {
        try {
            // Clear any existing service worker registration
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
            }

            // Reset permission state
            setPushPermission('default');
            setSuccess('Push notification settings reset. You can now request permission again.');
        } catch (error) {
            console.error('Error resetting push permission:', error);
            setError('Failed to reset push notification settings');
        }
    };

    const testNotification = async (type: 'email' | 'push') => {
        try {
            const response = type === 'email'
                ? await notificationsAPI.testEmail()
                : await notificationsAPI.testPush();

            if (response.data.success) {
                if (response.data.developmentMode) {
                    setSuccess(`Test ${type} notification queued (development mode). Check browser console for details.`);
                    // Show a console notification for development
                    console.log(`🔔 Test ${type} notification:`, {
                        title: 'FinalPoint Test Notification',
                        body: `This is a test ${type} notification from FinalPoint.`,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    setSuccess(`Test ${type} notification sent successfully!`);
                }
            } else {
                setError(response.data.error || `Failed to send test ${type} notification`);
            }
        } catch (error) {
            console.error(`Error sending test ${type} notification:`, error);
            setError(`Failed to send test ${type} notification`);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading notification settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Success/Error Messages */}
                    {success && (
                        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                            {success}
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Back to Profile Button */}
                    <div className="mb-6">
                        <Link
                            href={`/profile?redirect=${encodeURIComponent(redirectTo)}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Profile
                        </Link>
                    </div>

                    {/* Email Notifications */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                Email Notifications
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Race Reminders</p>
                                        <p className="text-sm text-gray-500">
                                            Get reminded 5, 3, and 1 day before races if you haven&apos;t made picks
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('emailReminders')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.emailReminders ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.emailReminders ? 'translate-x-5' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Score Updates</p>
                                        <p className="text-sm text-gray-500">
                                            Get notified when your scores are updated after races
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('emailScoreUpdates')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.emailScoreUpdates ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.emailScoreUpdates ? 'translate-x-5' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Push Notifications */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Push Notifications
                                </h3>
                                <div className="flex items-center space-x-2">
                                    {pushSupported && pushPermission === 'default' && (
                                        <button
                                            onClick={requestPushPermission}
                                            className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
                                        >
                                            Enable Push
                                        </button>
                                    )}
                                    {pushPermission === 'granted' && (
                                        <span className="text-sm text-green-600 font-medium">✓ Enabled</span>
                                    )}
                                    {pushPermission === 'denied' && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-red-600 font-medium">✗ Blocked</span>
                                            <button
                                                onClick={resetPushPermission}
                                                className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!pushSupported && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <p className="text-sm text-yellow-800">
                                        Push notifications are not supported in this browser
                                    </p>
                                </div>
                            )}

                            {pushPermission === 'denied' && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-800">
                                        Push notifications are blocked. To enable them:
                                    </p>
                                    {navigator.userAgent.includes('Firefox') ? (
                                        <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
                                            <li>Click the shield icon in your browser&apos;s address bar</li>
                                            <li>Click &quot;Permissions&quot; or &quot;Site Permissions&quot;</li>
                                            <li>Find &quot;Send Notifications&quot; and change it to &quot;Allow&quot;</li>
                                            <li>Refresh this page and try again</li>
                                        </ul>
                                    ) : (
                                        <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
                                            <li>Click the lock/info icon in your browser&apos;s address bar</li>
                                            <li>Change &quot;Notifications&quot; to &quot;Allow&quot;</li>
                                            <li>Refresh this page and try again</li>
                                        </ul>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Race Reminders</p>
                                        <p className="text-sm text-gray-500">
                                            Get reminded 5, 3, and 1 day before races if you haven&apos;t made picks
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('pushReminders')}
                                        disabled={!pushSupported || pushPermission !== 'granted'}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.pushReminders && pushPermission === 'granted' ? 'bg-blue-600' : 'bg-gray-200'
                                            } ${(!pushSupported || pushPermission !== 'granted') ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.pushReminders && pushPermission === 'granted' ? 'translate-x-5' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Score Updates</p>
                                        <p className="text-sm text-gray-500">
                                            Get notified when your scores are updated after races
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('pushScoreUpdates')}
                                        disabled={!pushSupported || pushPermission !== 'granted'}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.pushScoreUpdates && pushPermission === 'granted' ? 'bg-blue-600' : 'bg-gray-200'
                                            } ${(!pushSupported || pushPermission !== 'granted') ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.pushScoreUpdates && pushPermission === 'granted' ? 'translate-x-5' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Test Notifications */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                Test Notifications
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Send test notifications to verify your settings are working correctly
                            </p>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => testNotification('email')}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    Test Email
                                </button>
                                <button
                                    onClick={() => testNotification('push')}
                                    disabled={!pushSupported || pushPermission !== 'granted'}
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-md ${pushSupported && pushPermission === 'granted'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    Test Push
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <button
                                onClick={savePreferences}
                                disabled={isSaving}
                                className="w-full px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Preferences'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
