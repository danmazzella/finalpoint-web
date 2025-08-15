import { useState, useEffect, useCallback } from 'react';

export interface NotificationPromptConfig {
    title?: string;
    message?: string;
    enableText?: string;
    dismissText?: string;
    showIcon?: boolean;
}

export const useNotificationPrompt = (
    triggerCondition: boolean,
    config: NotificationPromptConfig = {}
) => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isRequesting, setIsRequesting] = useState(false);
    const [isFirefox, setIsFirefox] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    // Default configuration
    const defaultConfig: Required<NotificationPromptConfig> = {
        title: 'Stay Updated!',
        message: 'Get notified about race reminders, score updates, and important league news.',
        enableText: 'Enable Notifications',
        dismissText: 'Not Now',
        showIcon: true
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Check browser support and current permission status
    const checkNotificationSupport = useCallback(() => {
        const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
        setIsSupported(supported);

        if (supported) {
            const currentPermission = Notification.permission;
            setPermission(currentPermission);
            setIsFirefox(navigator.userAgent.includes('Firefox'));

            // Log for debugging (only in development)
            if (process.env.NODE_ENV === 'development') {
                console.log('Notification support check:', {
                    supported,
                    permission: currentPermission,
                    isFirefox,
                    userAgent: navigator.userAgent
                });
            }
        }
    }, []);

    useEffect(() => {
        checkNotificationSupport();
    }, [checkNotificationSupport]);

    useEffect(() => {
        // Only show prompt if:
        // 1. Trigger condition is met
        // 2. Notifications are supported
        // 3. Permission is still default (not granted/denied)
        // 4. We haven't already shown it
        if (triggerCondition && isSupported && permission === 'default') {
            if (process.env.NODE_ENV === 'development') {
                console.log('Showing notification prompt:', {
                    triggerCondition,
                    isSupported,
                    permission,
                    config: finalConfig
                });
            }
            setShowPrompt(true);
        } else {
            if (process.env.NODE_ENV === 'development') {
                console.log('Not showing notification prompt:', {
                    triggerCondition,
                    isSupported,
                    permission,
                    shouldShow: triggerCondition && isSupported && permission === 'default'
                });
            }
            setShowPrompt(false);
        }
    }, [triggerCondition, isSupported, permission, finalConfig]);

    const requestPermission = useCallback(async () => {
        if (permission !== 'default' || !isSupported) return false;

        setIsRequesting(true);
        try {
            if (process.env.NODE_ENV === 'development') {
                console.log('Requesting notification permission...');
            }
            const result = await Notification.requestPermission();
            if (process.env.NODE_ENV === 'development') {
                console.log('Permission request result:', result);
            }
            setPermission(result);

            if (result === 'granted') {
                setShowPrompt(false);

                // Try to register service worker and subscribe to push notifications
                try {
                    const registration = await navigator.serviceWorker.register('/sw.js', {
                        scope: '/'
                    });

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
                        console.log('Push subscription already exists:', subscription);
                    }

                    // Send subscription to server (you'll need to implement this)
                    // await notificationsAPI.registerPushToken(JSON.stringify(subscription), 'web');
                } catch (error) {
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Error setting up push subscription:', error);
                    }
                }

                return true;
            } else if (result === 'denied') {
                // Provide Firefox-specific guidance
                if (isFirefox && process.env.NODE_ENV === 'development') {
                    console.log('Firefox: Notifications blocked. User needs to click the shield icon in the address bar.');
                }
                setShowPrompt(false);
            }
            return false;
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Error requesting notification permission:', error);
            }
            return false;
        } finally {
            setIsRequesting(false);
        }
    }, [permission, isSupported, isFirefox]);

    const dismiss = useCallback(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('Dismissing notification prompt');
        }
        setShowPrompt(false);
    }, []);

    // Force refresh permission status (useful for debugging)
    const refreshPermissionStatus = useCallback(() => {
        checkNotificationSupport();
    }, [checkNotificationSupport]);

    return {
        showPrompt,
        permission,
        isRequesting,
        isFirefox,
        isSupported,
        requestPermission,
        dismiss,
        refreshPermissionStatus,
        config: finalConfig
    };
};
