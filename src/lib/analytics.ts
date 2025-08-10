'use client';

import { logEvent as firebaseLogEvent } from 'firebase/analytics';
import { analytics, getAnalyticsInstance } from './firebase';

// Check if gtag is available (Google Tag Manager)
declare global {
    interface Window {
        gtag: (command: string, eventName: string, eventParams?: Record<string, string | number | boolean>) => void;
    }
}

// Utility function to log analytics events
export const logEvent = (eventName: string, eventParams?: Record<string, string | number | boolean>) => {
    const currentAnalytics = analytics || getAnalyticsInstance();
    
    if (currentAnalytics) {
        try {
            console.log(`📊 Logging Firebase event: ${eventName}`, eventParams);
            // Firebase v12: use firebaseLogEvent function, not analytics.logEvent
            firebaseLogEvent(currentAnalytics, eventName, eventParams);
            return true;

        } catch (error) {
            console.error('❌ Firebase Analytics failed:', error);

            // Fallback to gtag if available
            if (typeof window !== 'undefined' && window.gtag) {
                console.log(`📊 Falling back to gtag: ${eventName}`, eventParams);
                window.gtag('event', eventName, eventParams);
                return true;
            }

            return false;
        }
    } else {
        console.log('⚠️ No analytics available, trying gtag fallback');
        // Fallback to gtag if available
        if (typeof window !== 'undefined' && window.gtag) {
            console.log(`📊 Using gtag fallback: ${eventName}`, eventParams);
            window.gtag('event', eventName, eventParams);
            return true;
        }

        return false;
    }
};

// Utility function to log page views
export const logPageView = (pageTitle: string, pageLocation: string) => {
    console.log(`📊 logPageView called with: ${pageTitle} at ${pageLocation}`);
    return logEvent('page_view', {
        page_title: pageTitle,
        page_location: pageLocation
    });
};

// Utility function to log custom events
export const logCustomEvent = (eventName: string, parameters?: Record<string, string | number | boolean>) => {
    return logEvent(eventName, parameters);
};
