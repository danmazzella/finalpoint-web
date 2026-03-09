'use client';

import { useAuth } from '@/contexts/AuthContext';
import { notificationsAPI, NotificationPreferences } from '@/lib/api';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PageTitle from '@/components/PageTitle';

export default function NotificationsPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        emailReminders: true,
        emailScoreUpdates: true,
        pushReminders: true,
        pushScoreUpdates: true,
        emailReminder5Days: true,
        emailReminder3Days: true,
        emailReminder1Day: true,
        emailReminder1Hour: true,
        pushReminder5Days: true,
        pushReminder3Days: true,
        pushReminder1Day: true,
        pushReminder1Hour: true,
        emailOther: true,
        pushOther: true,
        pushChatMessages: true
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
                    pushScoreUpdates: Boolean(rawData.pushScoreUpdates),
                    emailReminder5Days: Boolean(rawData.emailReminder5Days ?? true),
                    emailReminder3Days: Boolean(rawData.emailReminder3Days ?? true),
                    emailReminder1Day: Boolean(rawData.emailReminder1Day ?? true),
                    emailReminder1Hour: Boolean(rawData.emailReminder1Hour ?? true),
                    pushReminder5Days: Boolean(rawData.pushReminder5Days ?? true),
                    pushReminder3Days: Boolean(rawData.pushReminder3Days ?? true),
                    pushReminder1Day: Boolean(rawData.pushReminder1Day ?? true),
                    pushReminder1Hour: Boolean(rawData.pushReminder1Hour ?? true),
                    emailOther: Boolean(rawData.emailOther ?? true),
                    pushOther: Boolean(rawData.pushOther ?? true),
                    pushChatMessages: Boolean(rawData.pushChatMessages ?? true)
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
                        setSuccess('Push notifications enabled (development mode - service worker disabled)');
                        return;
                    }

                    // Register service worker with proper scope
                    const registration = await navigator.serviceWorker.register('/sw.js', {
                        scope: '/'
                    });

                    // Wait for service worker to be ready
                    await navigator.serviceWorker.ready;

                    // Use the notification refresh service to handle subscription
                    const { notificationRefreshService } = await import('@/services/notificationRefreshService');
                    await notificationRefreshService.initialize();

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
            <div className="page-bg min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="page-bg min-h-screen">
            <main className="max-w-2xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                <PageTitle title="Notifications" subtitle="Manage your notification preferences">
                    <Link href={`/profile?redirect=${encodeURIComponent(redirectTo)}`} className="btn-ghost text-xs px-3 py-1.5 sm:text-sm sm:px-4 sm:py-2">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </Link>
                </PageTitle>

                <div className="space-y-5">
                    {/* Success/Error Messages */}
                    {success && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {success}
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Email Notifications */}
                    <div className="glass-card overflow-hidden">
                        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Notifications</h3>
                        </div>
                        <div className="px-5 py-4 space-y-5">
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

                                {/* 5-Day Reminder */}
                                <div className="flex items-center justify-between ml-6">
                                    <div>
                                        <p className="font-medium text-gray-900">5-Day Reminder</p>
                                        <p className="text-sm text-gray-500">
                                            Get reminded 5 days before races
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('emailReminder5Days')}
                                        disabled={!preferences.emailReminders}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.emailReminder5Days && preferences.emailReminders ? 'bg-blue-600' : 'bg-gray-200'} ${!preferences.emailReminders ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.emailReminder5Days && preferences.emailReminders ? 'translate-x-5' : 'translate-x-1'}`}
                                        />
                                    </button>
                                </div>

                                {/* 3-Day Reminder */}
                                <div className="flex items-center justify-between ml-6">
                                    <div>
                                        <p className="font-medium text-gray-900">3-Day Reminder</p>
                                        <p className="text-sm text-gray-500">
                                            Get reminded 3 days before races
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('emailReminder3Days')}
                                        disabled={!preferences.emailReminders}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.emailReminder3Days && preferences.emailReminders ? 'bg-blue-600' : 'bg-gray-200'} ${!preferences.emailReminders ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.emailReminder3Days && preferences.emailReminders ? 'translate-x-5' : 'translate-x-1'}`}
                                        />
                                    </button>
                                </div>

                                {/* 1-Day Reminder */}
                                <div className="flex items-center justify-between ml-6">
                                    <div>
                                        <p className="font-medium text-gray-900">1-Day Reminder</p>
                                        <p className="text-sm text-gray-500">
                                            Get reminded 1 day before races
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('emailReminder1Day')}
                                        disabled={!preferences.emailReminders}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.emailReminder1Day && preferences.emailReminders ? 'bg-blue-600' : 'bg-gray-200'} ${!preferences.emailReminders ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.emailReminder1Day && preferences.emailReminders ? 'translate-x-5' : 'translate-x-1'}`}
                                        />
                                    </button>
                                </div>

                                {/* 1-Hour Reminder */}
                                <div className="flex items-center justify-between ml-6">
                                    <div>
                                        <p className="font-medium text-gray-900">1-Hour Reminder</p>
                                        <p className="text-sm text-gray-500">
                                            Get reminded 1 hour before races
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('emailReminder1Hour')}
                                        disabled={!preferences.emailReminders}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.emailReminder1Hour && preferences.emailReminders ? 'bg-blue-600' : 'bg-gray-200'} ${!preferences.emailReminders ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.emailReminder1Hour && preferences.emailReminders ? 'translate-x-5' : 'translate-x-1'}`}
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

                                {/* Other Notifications */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Other Notifications</p>
                                        <p className="text-sm text-gray-500">
                                            Welcome messages, league invitations, and custom messages
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('emailOther')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.emailOther ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.emailOther ? 'translate-x-5' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Push Notifications */}
                    <div className="glass-card overflow-hidden">
                        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Push Notifications</h3>
                            <div className="flex items-center gap-2">
                                    {pushSupported && pushPermission === 'default' && (
                                        <button onClick={requestPushPermission} className="btn-primary text-xs py-1.5 px-3">
                                            Enable Push
                                        </button>
                                    )}
                                    {pushPermission === 'granted' && (
                                        <span className="badge badge-green">Enabled</span>
                                    )}
                                    {pushPermission === 'denied' && (
                                        <div className="flex items-center gap-2">
                                            <span className="badge badge-gray">Blocked</span>
                                            <button onClick={resetPushPermission} className="btn-ghost text-xs py-1 px-2">Reset</button>
                                        </div>
                                    )}
                            </div>
                        </div>

                        <div className="px-5 py-4 space-y-5">
                            {!pushSupported && (
                                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                                    <p className="text-sm text-amber-800">Push notifications are not supported in this browser.</p>
                                </div>
                            )}

                            {pushPermission === 'denied' && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                                    <p className="text-sm text-red-800 font-medium mb-1">Push notifications are blocked. To enable them:</p>
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

                                {/* 5-Day Reminder */}
                                <div className="flex items-center justify-between ml-6">
                                    <div>
                                        <p className="font-medium text-gray-900">5-Day Reminder</p>
                                        <p className="text-sm text-gray-500">
                                            Get reminded 5 days before races
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('pushReminder5Days')}
                                        disabled={!pushSupported || pushPermission !== 'granted'}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.pushReminder5Days && pushPermission === 'granted' ? 'bg-blue-600' : 'bg-gray-200'} ${!pushSupported || pushPermission !== 'granted' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.pushReminder5Days && pushPermission === 'granted' ? 'translate-x-5' : 'translate-x-1'}`}
                                        />
                                    </button>
                                </div>

                                {/* 3-Day Reminder */}
                                <div className="flex items-center justify-between ml-6">
                                    <div>
                                        <p className="font-medium text-gray-900">3-Day Reminder</p>
                                        <p className="text-sm text-gray-500">
                                            Get reminded 3 days before races
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('pushReminder3Days')}
                                        disabled={!pushSupported || pushPermission !== 'granted'}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.pushReminder3Days && pushPermission === 'granted' ? 'bg-blue-600' : 'bg-gray-200'} ${!pushSupported || pushPermission !== 'granted' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.pushReminder3Days && pushPermission === 'granted' ? 'translate-x-5' : 'translate-x-1'}`}
                                        />
                                    </button>
                                </div>

                                {/* 1-Day Reminder */}
                                <div className="flex items-center justify-between ml-6">
                                    <div>
                                        <p className="font-medium text-gray-900">1-Day Reminder</p>
                                        <p className="text-sm text-gray-500">
                                            Get reminded 1 day before races
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('pushReminder1Day')}
                                        disabled={!pushSupported || pushPermission !== 'granted'}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.pushReminder1Day && pushPermission === 'granted' ? 'bg-blue-600' : 'bg-gray-200'} ${!pushSupported || pushPermission !== 'granted' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.pushReminder1Day && pushPermission === 'granted' ? 'translate-x-5' : 'translate-x-1'}`}
                                        />
                                    </button>
                                </div>

                                {/* 1-Hour Reminder */}
                                <div className="flex items-center justify-between ml-6">
                                    <div>
                                        <p className="font-medium text-gray-900">1-Hour Reminder</p>
                                        <p className="text-sm text-gray-500">
                                            Get reminded 1 hour before races
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('pushReminder1Hour')}
                                        disabled={!pushSupported || pushPermission !== 'granted'}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.pushReminder1Hour && pushPermission === 'granted' ? 'bg-blue-600' : 'bg-gray-200'} ${!pushSupported || pushPermission !== 'granted' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.pushReminder1Hour && pushPermission === 'granted' ? 'translate-x-5' : 'translate-x-1'}`}
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

                                {/* Chat Messages */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Chat Messages</p>
                                        <p className="text-sm text-gray-500">
                                            Get notified when someone sends a message in league chats
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('pushChatMessages')}
                                        disabled={!pushSupported || pushPermission !== 'granted'}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.pushChatMessages && pushPermission === 'granted' ? 'bg-blue-600' : 'bg-gray-200'
                                            } ${(!pushSupported || pushPermission !== 'granted') ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.pushChatMessages && pushPermission === 'granted' ? 'translate-x-5' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* Other Notifications */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Other Notifications</p>
                                        <p className="text-sm text-gray-500">
                                            Welcome messages, league invitations, and custom messages
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('pushOther')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.pushOther ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.pushOther ? 'translate-x-5' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Test Notifications */}
                    <div className="glass-card p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">Test Notifications</h3>
                        <p className="text-xs text-gray-500 mb-4">Send a test to verify your settings are working correctly.</p>
                        <div className="flex gap-3">
                            <button onClick={() => testNotification('email')} className="btn-primary text-sm py-2 px-4">
                                Test Email
                            </button>
                            <button
                                onClick={() => testNotification('push')}
                                disabled={!pushSupported || pushPermission !== 'granted'}
                                className={`btn-secondary text-sm py-2 px-4 ${(!pushSupported || pushPermission !== 'granted') ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                                Test Push
                            </button>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={savePreferences}
                        disabled={isSaving}
                        className="btn-primary w-full py-3 text-sm disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </main>
        </div>
    );
}
