'use client';

import { useAuth } from '@/contexts/AuthContext';
import { notificationsAPI, NotificationPreferences } from '@/lib/api';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageTitle from '@/components/PageTitle';

export default function NotificationsPage() {
    const { user } = useAuth();
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
                setPreferences(response.data.data);
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading notification settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                <PageTitle
                    title="Notification Settings"
                    subtitle="Manage your email and push notification preferences"
                />

                <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6 border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800 mb-6">Email Notifications</h2>

                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">Race Reminders</h3>
                                        <p className="text-sm text-slate-600">Get notified when races are about to start</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">Results Available</h3>
                                        <p className="text-sm text-slate-600">Get notified when race results are posted</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">League Updates</h3>
                                        <p className="text-sm text-slate-600">Get notified about league activity and new members</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6 mt-6 border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800 mb-6">Push Notifications</h2>

                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.583 4.583A1 1 0 015.5 4.5h9a1 1 0 01.917 1.083l-1.5 9a1 1 0 01-.917.917h-6.5a1 1 0 01-.917-.917l-1.5-9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">Mobile Notifications</h3>
                                        <p className="text-sm text-slate-600">Receive push notifications on your mobile device</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-4 border border-pink-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">Pick Reminders</h3>
                                        <p className="text-sm text-slate-600">Get reminded to make your picks before races</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm">
                        Save Settings
                    </button>
                </div>
            </main>
        </div>
    );
}
