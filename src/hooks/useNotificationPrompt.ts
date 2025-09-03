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
            setShowPrompt(true);
        } else {
            setShowPrompt(false);
        }
    }, [triggerCondition, isSupported, permission, finalConfig]);

    const requestPermission = useCallback(async () => {
        if (permission !== 'default' || !isSupported) return false;

        setIsRequesting(true);
        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                setShowPrompt(false);

                // Try to register service worker and subscribe to push notifications
                try {
                    const registration = await navigator.serviceWorker.register('/sw.js', {
                        scope: '/'
                    });

                    await navigator.serviceWorker.ready;

                    // Use the notification refresh service to handle subscription
                    try {
                        const { notificationRefreshService } = await import('@/services/notificationRefreshService');
                        await notificationRefreshService.initialize();
                        console.log('✅ Push token registered with server');
                    } catch (apiError) {
                        console.error('❌ Failed to register push token with server:', apiError);
                    }
                } catch (error) {
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Error setting up push subscription:', error);
                    }
                }

                return true;
            } else if (result === 'denied') {
                // Provide Firefox-specific guidance
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
