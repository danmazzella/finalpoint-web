'use client';

import { analytics } from './firebase';
import { logEvent as firebaseLogEvent } from 'firebase/analytics';

// Utility function to log analytics events
export const logEvent = (eventName: string, eventParams?: Record<string, any>) => {
    if (analytics) {
        try {
            firebaseLogEvent(analytics, eventName, eventParams);
            console.log('✅ Analytics event logged:', eventName, eventParams);
            return true;
        } catch (error) {
            console.error('❌ Failed to log analytics event:', error);
            return false;
        }
    } else {
        console.warn('⚠️ Analytics not available');
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
