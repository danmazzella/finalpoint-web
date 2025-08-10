'use client';

import { logEvent as firebaseLogEvent } from 'firebase/analytics';
import { analytics } from './firebase';

// Check if gtag is available (Google Tag Manager)
declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

// Utility function to log analytics events
export const logEvent = (eventName: string, eventParams?: Record<string, any>) => {
    console.log('🔍 About to log event:', eventName, eventParams);

    if (analytics) {
        try {
            console.log('📊 Analytics object:', analytics);
            console.log('🔧 Analytics object keys:', Object.keys(analytics));
            console.log('🔧 Analytics object type:', typeof analytics);
            console.log('🔧 Analytics object constructor:', analytics.constructor?.name);

            // Check if logEvent method exists
            if (typeof analytics.logEvent === 'function') {
                console.log('✅ logEvent method found on analytics object');
                analytics.logEvent(eventName, eventParams);
                console.log('✅ Firebase Analytics event logged:', eventName, eventParams);
                return true;
            } else {
                console.log('⚠️ logEvent method not found, using firebaseLogEvent');
                firebaseLogEvent(analytics, eventName, eventParams);
                console.log('✅ Firebase Analytics event logged via firebaseLogEvent:', eventName, eventParams);
                return true;
            }
        } catch (error) {
            console.error('❌ Firebase Analytics failed:', error);

            // Fallback to gtag if available
            if (typeof window !== 'undefined' && window.gtag) {
                console.log('🔄 Falling back to gtag');
                window.gtag('event', eventName, eventParams);
                console.log('✅ Gtag event logged:', eventName, eventParams);
                return true;
            }

            return false;
        }
    } else {
        console.warn('⚠️ Firebase Analytics not available');

        // Fallback to gtag if available
        if (typeof window !== 'undefined' && window.gtag) {
            console.log('🔄 Falling back to gtag');
            window.gtag('event', eventName, eventParams);
            console.log('✅ Gtag event logged:', eventName, eventParams);
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
export const logCustomEvent = (eventName: string, parameters?: Record<string, any>) => {
    return logEvent(eventName, parameters);
};
