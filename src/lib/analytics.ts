'use client';

import { analytics, getAnalyticsInstance } from '@/lib/firebase';
import { logEvent as firebaseLogEvent } from 'firebase/analytics';

declare global {
    interface Window {
        gtag: (command: string, eventName: string, eventParams?: Record<string, string | number | boolean>) => void;
        dataLayer: Record<string, unknown>[];
    }
}

export const logEvent = (eventName: string, eventParams?: Record<string, string | number | boolean>) => {
    const currentAnalytics = analytics || getAnalyticsInstance();

    if (currentAnalytics) {
        try {
            firebaseLogEvent(currentAnalytics, eventName, eventParams);

            if (typeof window !== 'undefined' && window.gtag) {
                try {
                    window.gtag('event', eventName, eventParams);
                } catch (gtagError) {
                    // Silent fallback
                }
            }

            return true;

        } catch (error) {
            console.error('Firebase Analytics failed:', error);

            if (typeof window !== 'undefined' && window.gtag) {
                try {
                    window.gtag('event', eventName, eventParams);
                    return true;
                } catch (gtagError) {
                    console.error('Gtag fallback also failed:', gtagError);
                }
            }

            return false;
        }
    } else {
        if (typeof window !== 'undefined' && window.gtag) {
            try {
                window.gtag('event', eventName, eventParams);
                return true;
            } catch (gtagError) {
                console.error('Gtag fallback failed:', gtagError);
            }
        }

        return false;
    }
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
