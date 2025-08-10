import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

// Firebase configuration from environment variables
// Make sure to create a .env.local file with your actual Firebase values
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate that required environment variables are present
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Missing required Firebase environment variables. Please check your .env.local file.');
}

// Initialize Firebase (check if already initialized to avoid errors in development)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics for Firebase v12+
let analytics: Analytics | null = null;

// Function to get analytics instance
export const getAnalyticsInstance = () => {
    return analytics;
};

if (typeof window !== 'undefined') {
    // For Firebase v12+, we need to check support and initialize properly
    const initializeAnalytics = async () => {
        try {
            const supported = await isSupported();
            if (supported && firebaseConfig.measurementId) {
                analytics = getAnalytics(app);
                console.log('✅ Firebase Analytics initialized successfully');
                console.log('📊 Measurement ID:', firebaseConfig.measurementId);
            } else {
                console.warn('⚠️ Analytics not supported or no measurement ID');
            }
        } catch (error) {
            console.warn('⚠️ Analytics initialization failed:', error);
        }
    };

    // Initialize analytics
    initializeAnalytics();
}

export { analytics };

export default app;
