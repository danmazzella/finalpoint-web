import { initializeApp, getApps, deleteApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Missing required Firebase environment variables. Please check your .env.local file.');
}

let app: FirebaseApp | null = null;

try {
    const existingApps = getApps();
    const existingApp = existingApps.find(existingApp =>
        existingApp.options.projectId === firebaseConfig.projectId
    );

    if (existingApp) {
        app = existingApp;
    } else {
        if (existingApps.length > 0) {
            existingApps.forEach(existingApp => {
                try {
                    deleteApp(existingApp);
                } catch (error) {
                    // Silent cleanup
                }
            });
        }

        try {
            const minimalConfig = {
                apiKey: firebaseConfig.apiKey,
                projectId: firebaseConfig.projectId,
                appId: firebaseConfig.appId
            };

            try {
                app = initializeApp(minimalConfig);
            } catch (minimalError) {
                app = initializeApp(firebaseConfig);
            }
        } catch (error) {
            console.error('Failed to initialize Firebase app:', error);
            throw error;
        }
    }
} catch (error) {
    console.error('Critical error during Firebase initialization:', error);
    throw error;
}

if (!app) {
    throw new Error('Failed to initialize Firebase app');
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

let analytics: Analytics | null = null;

export const getAnalyticsInstance = () => {
    return analytics;
};

if (typeof window !== 'undefined') {
    try {
        if (app && firebaseConfig.measurementId) {
            analytics = getAnalytics(app);
        }
    } catch (error) {
        console.warn('Analytics initialization failed:', error);
    }
}

export { analytics };

export default app;
