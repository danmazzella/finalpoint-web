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
    console.log('🔍 About to log event:', eventName, eventParams);
    
    if (analytics) {
        try {
            console.log('📊 Analytics object:', analytics);
            console.log('🔧 Analytics object keys:', Object.keys(analytics));
            console.log('🔧 Analytics object type:', typeof analytics);
            console.log('🔧 Analytics object constructor:', analytics.constructor?.name);
            
            // Firebase v12: use firebaseLogEvent function, not analytics.logEvent
            console.log('🔄 Using firebaseLogEvent for Firebase v12');
            firebaseLogEvent(analytics, eventName, eventParams);
            console.log('✅ Firebase Analytics event logged via firebaseLogEvent:', eventName, eventParams);
            return true;
            
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
export const logCustomEvent = (eventName: string, parameters?: Record<string, string | number | boolean>) => {
    return logEvent(eventName, parameters);
};
