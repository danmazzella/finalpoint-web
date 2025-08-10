'use client';

import { logEvent as firebaseLogEvent } from 'firebase/analytics';
import { analytics } from './firebase';

// Check if gtag is available (Google Tag Manager)
declare global {
    interface Window {
        gtag: (command: string, eventName: string, eventParams?: Record<string, string | number | boolean>) => void;
    }
}

// Utility function to log analytics events
export const logEvent = (eventName: string, eventParams?: Record<string, string | number | boolean>) => {
    if (analytics) {
        try {
            // Firebase v12: use firebaseLogEvent function, not analytics.logEvent
            firebaseLogEvent(analytics, eventName, eventParams);
            return true;

        } catch (error) {
            console.error('❌ Firebase Analytics failed:', error);

            // Fallback to gtag if available
            if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', eventName, eventParams);
                return true;
            }

            return false;
        }
    } else {
        // Fallback to gtag if available
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', eventName, eventParams);
            return true;
        }

        return false;
    }
};

// Utility function to log page views
export const logPageView = (pageTitle: string, pageLocation: string) => {
    return logEvent('page_view', {
        page_title: pageTitle,
        page_location: pageLocation
    });
};

// Utility function to log custom events
export const logCustomEvent = (eventName: string, parameters?: Record<string, string | number | boolean>) => {
    return logEvent(eventName, parameters);
};
