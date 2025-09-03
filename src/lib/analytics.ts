'use client';

// Firebase Analytics integration (restored)

import { logEvent as firebaseLogEvent, setUserProperties as firebaseSetUserProperties, setUserId as firebaseSetUserId } from 'firebase/analytics';
import { analytics } from './firebase';

export const logEvent = (eventName: string, eventParams?: Record<string, string | number | boolean>) => {
    if (typeof window !== 'undefined' && analytics) {
        try {
            firebaseLogEvent(analytics, eventName, eventParams);
            return true;
        } catch (firebaseError) {
            console.error('Firebase Analytics failed:', firebaseError);
            return false;
        }
    }

    return false;
};

export const setUserProperties = (properties: Record<string, any>) => {
    if (typeof window !== 'undefined' && analytics) {
        try {
            firebaseSetUserProperties(analytics, properties);
            return true;
        } catch (firebaseError) {
            console.error('Firebase Analytics failed:', firebaseError);
            return false;
        }
    }

    return false;
};

export const setUserId = (userId: string) => {
    if (typeof window !== 'undefined' && analytics) {
        try {
            firebaseSetUserId(analytics, userId);
            return true;
        } catch (firebaseError) {
            console.error('Firebase Analytics failed:', firebaseError);
            return false;
        }
    }

    return false;
};

export const logPageView = (pageTitle: string, pageLocation: string) => {
    return logEvent('page_view', {
        page_title: pageTitle,
        page_location: pageLocation
    });
};

export const logCustomEvent = (eventName: string, parameters?: Record<string, string | number | boolean>) => {
    return logEvent(eventName, parameters);
};
