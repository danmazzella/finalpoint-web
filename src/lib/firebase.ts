// Firebase configuration for web app
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import logger from '@/utils/logger';
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Check if Firebase config is complete
const isFirebaseConfigComplete = () => {
    return firebaseConfig.apiKey &&
        firebaseConfig.authDomain &&
        firebaseConfig.projectId &&
        firebaseConfig.storageBucket &&
        firebaseConfig.messagingSenderId &&
        firebaseConfig.appId;
};

// Initialize Firebase only if config is complete
let app: any = null;
let analytics: any = null;

if (isFirebaseConfigComplete()) {
    try {
        app = initializeApp(firebaseConfig);

        // Initialize Analytics (only in browser)
        if (typeof window !== 'undefined') {
            analytics = getAnalytics(app);
        }
    } catch (error) {
        logger.error('Firebase initialization failed:', error);
    }
} else {
    logger.warn('Firebase configuration incomplete. Please set NEXT_PUBLIC_FIREBASE_* environment variables.');
}

export { app, analytics };
export default app;
