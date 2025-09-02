# Firestore Setup Guide for Chat System

## Issue: 400 Bad Request Error

The `400 Bad Request` error you're seeing is because Firestore needs to be properly configured. Here's how to fix it:

## Step 1: Enable Firestore in Firebase Console

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `finalpoint-d228b`
3. **Navigate to Firestore Database** in the left sidebar
4. **Click "Create database"** if it doesn't exist yet
5. **Choose "Start in test mode"** for now (we'll secure it later)
6. **Select a location** (choose the closest to your users)

## Step 2: Deploy Security Rules

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project**:
   ```bash
   cd finalpoint-web
   firebase init firestore
   ```

4. **Deploy the security rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Step 3: Alternative - Manual Setup in Console

If you prefer to set up manually in the Firebase Console:

1. **Go to Firestore Database > Rules**
2. **Replace the default rules** with the content from `firestore.rules`
3. **Click "Publish"**

## Step 4: Test the Setup

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Try accessing the chat** again
3. **Check the browser console** for any remaining errors

## Step 5: Create Test Data (Optional)

To test the chat system, you can create some test data in Firestore:

### Create a test league member:
```javascript
// In Firebase Console > Firestore Database > Data
// Create a document in collection "league_members"
// Document ID: "test_user_123" (replace with actual user ID)
// Fields:
{
  "userId": "test_user_123",
  "leagueId": "123",
  "joinedAt": "2025-01-02T13:57:02.000Z",
  "active": true
}
```

### Create a test chat user:
```javascript
// Create a document in collection "chat_users"
// Document ID: "test_user_123" (replace with actual user ID)
// Fields:
{
  "id": "test_user_123",
  "name": "Test User",
  "email": "test@example.com",
  "isOnline": true,
  "lastSeen": "2025-01-02T13:57:02.000Z",
  "leagues": ["123"]
}
```

## Troubleshooting

### Still getting 400 errors?

1. **Check Firestore is enabled**: Make sure Firestore Database is created in Firebase Console
2. **Check security rules**: Ensure rules are deployed and not too restrictive
3. **Check authentication**: Make sure user is properly authenticated
4. **Check network**: Ensure you can reach Firebase servers

### Common Issues:

1. **"Missing or insufficient permissions"**: Security rules are too restrictive
2. **"Document not found"**: Collection doesn't exist yet
3. **"Invalid argument"**: Data format doesn't match expected schema

### Debug Mode:

Add this to your Firebase config to see more detailed error messages:
```javascript
// In your firebase.ts file, add:
import { connectFirestoreEmulator } from 'firebase/firestore';

if (process.env.NODE_ENV === 'development') {
  // Enable debug mode
  console.log('Firebase config:', firebaseConfig);
}
```

## Security Rules Explanation

The provided security rules ensure:

- **Users can only read/write messages** from leagues they're members of
- **Users can only access their own profile** in chat_users
- **League membership is verified** before allowing chat access
- **Admins have additional permissions** for management

## Next Steps

Once Firestore is working:

1. **Test the chat functionality** with multiple users
2. **Add push notifications** for new messages
3. **Implement file sharing** for images
4. **Add message reactions** and typing indicators

## Support

If you're still having issues:

1. Check the Firebase Console for error logs
2. Check browser console for detailed error messages
3. Verify your Firebase project settings
4. Ensure your API keys are correct in `.env.local`
