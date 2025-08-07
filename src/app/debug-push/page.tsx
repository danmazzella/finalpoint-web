'use client';

import { useState, useEffect } from 'react';
import { notificationsAPI } from '@/lib/api';

interface DebugInfo {
    browserSupport?: {
        serviceWorker: boolean;
        pushManager: boolean;
        notification: boolean;
        userAgent: string;
    };
    notificationPermission?: string;
    serviceWorkerRegistrations?: number;
    serviceWorkerDetails?: Array<{
        scope: string;
        active: boolean;
        waiting: boolean;
        installing: boolean;
    }>;
    serviceWorkerError?: string;
    environmentVariables?: {
        NEXT_PUBLIC_VAPID_PUBLIC_KEY: string;
        NEXT_PUBLIC_API_URL: string;
    };
    currentLocation?: {
        href: string;
        origin: string;
        protocol: string;
        hostname: string;
    };
    apiConnection?: {
        success: boolean;
        status?: number;
        error?: string;
    };
}

export default function DebugPushPage() {
    const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
    const [isLoading, setIsLoading] = useState(true);
    const [testResult, setTestResult] = useState('');

    useEffect(() => {
        runDebugChecks();
    }, []);

    const runDebugChecks = async () => {
        const info: any = {};

        // Check browser support
        info.browserSupport = {
            serviceWorker: 'serviceWorker' in navigator,
            pushManager: 'PushManager' in window,
            notification: 'Notification' in window,
            userAgent: navigator.userAgent
        };

        // Check current permission
        if ('Notification' in window) {
            info.notificationPermission = Notification.permission;
        }

        // Check service worker registration
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            info.serviceWorkerRegistrations = registrations.length;
            info.serviceWorkerDetails = registrations.map(reg => ({
                scope: reg.scope,
                active: !!reg.active,
                waiting: !!reg.waiting,
                installing: !!reg.installing
            }));
        } catch (error) {
            info.serviceWorkerError = error instanceof Error ? error.message : 'Unknown error';
        }

        // Check environment variables
        info.environmentVariables = {
            NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? 'Set' : 'Missing',
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'Missing'
        };

        // Check current URL and domain
        info.currentLocation = {
            href: window.location.href,
            origin: window.location.origin,
            protocol: window.location.protocol,
            hostname: window.location.hostname
        };

        // Test API connection
        try {
            const response = await notificationsAPI.getPreferences();
            info.apiConnection = {
                success: response.data.success,
                status: response.status
            };
        } catch (error) {
            info.apiConnection = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }

        setDebugInfo(info);
        setIsLoading(false);
    };

    const testPushRegistration = async () => {
        setTestResult('Testing push registration...');

        try {
            // Check if service worker is registered
            let registrations = await navigator.serviceWorker.getRegistrations();

            if (registrations.length === 0) {
                setTestResult('📝 No service worker registered, attempting to register...');

                // Try to register the service worker
                try {
                    const registration = await navigator.serviceWorker.register('/sw.js', {
                        scope: '/'
                    });
                    setTestResult(prev => prev + '\n✅ Service worker registered successfully');

                    // Wait for service worker to be ready
                    await navigator.serviceWorker.ready;
                    setTestResult(prev => prev + '\n✅ Service worker is ready');

                    // Get updated registrations
                    registrations = await navigator.serviceWorker.getRegistrations();
                } catch (swError) {
                    const errorMessage = swError instanceof Error ? swError.message : 'Unknown error';
                    setTestResult(`❌ Failed to register service worker: ${errorMessage}`);
                    return;
                }
            }

            const registration = registrations[0];

            // Check current subscription
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                setTestResult(`✅ Found existing subscription: ${existingSubscription.endpoint.substring(0, 50)}...`);
                return;
            }

            // Try to subscribe
            if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
                setTestResult('❌ VAPID public key not configured');
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            });

            setTestResult(`✅ Successfully subscribed: ${subscription.endpoint.substring(0, 50)}...`);

            // Try to register with server
            try {
                await notificationsAPI.registerPushToken(
                    JSON.stringify(subscription),
                    'web'
                );
                setTestResult(prev => prev + '\n✅ Token registered with server');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                setTestResult(prev => prev + `\n❌ Failed to register with server: ${errorMessage}`);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setTestResult(`❌ Error: ${errorMessage}`);
        }
    };

    const testPushNotification = async () => {
        setTestResult('Testing push notification...');

        try {
            const response = await notificationsAPI.testPush();
            if (response.data.success) {
                setTestResult(`✅ Test notification sent: ${response.data.message || 'Success'}`);
            } else {
                setTestResult(`❌ Test failed: ${response.data.error || 'Unknown error'}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setTestResult(`❌ Error sending test notification: ${errorMessage}`);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-2xl font-bold text-gray-900 mb-8">Push Notification Debug</h1>
                    <div className="bg-white shadow rounded-lg p-6">
                        <p>Loading debug information...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Push Notification Debug</h1>

                {/* Browser Support */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Browser Support</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="font-medium">Service Worker:</span>
                            <span className={`ml-2 ${debugInfo.browserSupport?.serviceWorker ? 'text-green-600' : 'text-red-600'}`}>
                                {debugInfo.browserSupport?.serviceWorker ? '✅ Supported' : '❌ Not Supported'}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium">Push Manager:</span>
                            <span className={`ml-2 ${debugInfo.browserSupport?.pushManager ? 'text-green-600' : 'text-red-600'}`}>
                                {debugInfo.browserSupport?.pushManager ? '✅ Supported' : '❌ Not Supported'}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium">Notifications:</span>
                            <span className={`ml-2 ${debugInfo.browserSupport?.notification ? 'text-green-600' : 'text-red-600'}`}>
                                {debugInfo.browserSupport?.notification ? '✅ Supported' : '❌ Not Supported'}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium">Permission:</span>
                            <span className={`ml-2 ${debugInfo.notificationPermission === 'granted' ? 'text-green-600' :
                                debugInfo.notificationPermission === 'denied' ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                                {debugInfo.notificationPermission || 'Unknown'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Service Worker */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Worker</h2>
                    <div className="space-y-2">
                        <div>
                            <span className="font-medium">Registrations:</span>
                            <span className="ml-2">{debugInfo.serviceWorkerRegistrations || 0}</span>
                        </div>
                        {debugInfo.serviceWorkerDetails && debugInfo.serviceWorkerDetails.map((sw, index: number) => (
                            <div key={index} className="ml-4 text-sm">
                                <div>Scope: {sw.scope}</div>
                                <div>Active: {sw.active ? 'Yes' : 'No'}</div>
                                <div>Waiting: {sw.waiting ? 'Yes' : 'No'}</div>
                                <div>Installing: {sw.installing ? 'Yes' : 'No'}</div>
                            </div>
                        ))}
                        {debugInfo.serviceWorkerError && (
                            <div className="text-red-600">Error: {debugInfo.serviceWorkerError}</div>
                        )}
                    </div>
                </div>

                {/* Environment Variables */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Environment Variables</h2>
                    <div className="space-y-2">
                        <div>
                            <span className="font-medium">VAPID Public Key:</span>
                            <span className={`ml-2 ${debugInfo.environmentVariables?.NEXT_PUBLIC_VAPID_PUBLIC_KEY === 'Set' ? 'text-green-600' : 'text-red-600'}`}>
                                {debugInfo.environmentVariables?.NEXT_PUBLIC_VAPID_PUBLIC_KEY}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium">API URL:</span>
                            <span className={`ml-2 ${debugInfo.environmentVariables?.NEXT_PUBLIC_API_URL !== 'Missing' ? 'text-green-600' : 'text-red-600'}`}>
                                {debugInfo.environmentVariables?.NEXT_PUBLIC_API_URL}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Current Location */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Location</h2>
                    <div className="space-y-2">
                        <div>
                            <span className="font-medium">Protocol:</span>
                            <span className="ml-2">{debugInfo.currentLocation?.protocol}</span>
                        </div>
                        <div>
                            <span className="font-medium">Hostname:</span>
                            <span className="ml-2">{debugInfo.currentLocation?.hostname}</span>
                        </div>
                        <div>
                            <span className="font-medium">Origin:</span>
                            <span className="ml-2">{debugInfo.currentLocation?.origin}</span>
                        </div>
                    </div>
                </div>

                {/* API Connection */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">API Connection</h2>
                    <div>
                        <span className="font-medium">Status:</span>
                        <span className={`ml-2 ${debugInfo.apiConnection?.success ? 'text-green-600' : 'text-red-600'}`}>
                            {debugInfo.apiConnection?.success ? '✅ Connected' : '❌ Failed'}
                        </span>
                    </div>
                    {debugInfo.apiConnection?.error && (
                        <div className="mt-2 text-red-600">Error: {debugInfo.apiConnection.error}</div>
                    )}
                </div>

                {/* Test Buttons */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Tests</h2>
                    <div className="space-y-4">
                        <button
                            onClick={testPushRegistration}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Test Push Registration
                        </button>
                        <button
                            onClick={testPushNotification}
                            className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Test Push Notification
                        </button>
                    </div>
                    {testResult && (
                        <div className="mt-4 p-4 bg-gray-100 rounded-md">
                            <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
                        </div>
                    )}
                </div>

                {/* Debug Info */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Raw Debug Info</h2>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
