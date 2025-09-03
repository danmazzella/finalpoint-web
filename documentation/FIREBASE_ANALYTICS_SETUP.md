# Firebase Analytics Setup for Web App

## Overview
Firebase Analytics has been restored for the web app to provide comprehensive user behavior tracking and analytics insights.

## Environment Variables Required

Add the following environment variables to your `.env.local` file for development:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=finalpoint-d228b.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=finalpoint-d228b
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=finalpoint-d228b.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

## Production Setup

For production deployment (Vercel, etc.), add these same environment variables in your deployment platform's environment variable settings.

## Getting Firebase Config Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `finalpoint-d228b`
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on your web app or create a new web app
6. Copy the config values from the Firebase SDK snippet

## Features Restored

- **Event Tracking**: All user interactions are now tracked in Firebase Analytics
- **Page Views**: Automatic page view tracking
- **User Properties**: User-specific data tracking
- **User ID Tracking**: Link analytics to specific users
- **Custom Events**: League-specific events, button clicks, etc.

## Graceful Degradation

If Firebase environment variables are not set:
- The app will continue to work normally
- A warning will be logged to the console
- Analytics calls will be safely ignored
- No errors will be thrown

## Files Modified

- `src/lib/firebase.ts` - Firebase configuration and initialization
- `src/lib/analytics.ts` - Analytics functions using Firebase
- `package.json` - Added Firebase dependency

## Testing

1. Set up environment variables
2. Run `npm run dev`
3. Check browser console for Firebase initialization messages
4. Visit Firebase Analytics dashboard to see real-time events

## Benefits

- **Unified Analytics**: Same analytics system as mobile app
- **Rich Insights**: Detailed user behavior data
- **Real-time Tracking**: Live event monitoring
- **Custom Events**: Track league-specific user actions
- **User Journey**: Complete user flow analysis
