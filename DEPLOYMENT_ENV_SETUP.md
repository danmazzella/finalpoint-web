# Push Notification Environment Setup

## Issue Identified
The debug page shows that `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `NEXT_PUBLIC_API_URL` are missing in production. This is preventing push notifications from working.

## Solution

### 1. Create Environment Files

Create the following files in your production environment:

**`.env.local`** (for local development):
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.finalpoint.app/api

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BFs6Whd0ShkaO1rp6QZ3Y31KwxXDDrrkfRxtkoM_s9J2oWbJNe6zMY-vNPrnVOTrQ5XsS3bw5MUAIJKIEzU2rPY
```

**`.env.production`** (for production builds):
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.finalpoint.app/api

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BFs6Whd0ShkaO1rp6QZ3Y31KwxXDDrrkfRxtkoM_s9J2oWbJNe6zMY-vNPrnVOTrQ5XsS3bw5MUAIJKIEzU2rPY
```

### 2. Get Your VAPID Public Key

Run this command on your server to get the VAPID public key:
```bash
cd finalpoint
node -e "console.log('VAPID Public Key:', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)"
```

### 3. Update Your Deployment

If you're using Vercel, add these environment variables in your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - `NEXT_PUBLIC_API_URL` = `https://api.finalpoint.app`
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` = (your actual VAPID public key)

### 4. Rebuild and Deploy

After setting the environment variables:
```bash
cd finalpoint-app/finalpoint-web
npm run build
npm run start
```

### 5. Verify the Fix

1. Visit `https://finalpoint.app/debug-push`
2. Check that "VAPID Public Key" shows "Set" instead of "Missing"
3. Try the "Test Push Registration" button

## Expected Result

After fixing the environment variables, the debug page should show:
- ✅ VAPID Public Key: Set
- ✅ API URL: Set
- Service Worker registrations should work properly

## Troubleshooting

If you still see issues:

1. **Check the browser console** for any errors
2. **Verify the service worker** is accessible at `https://finalpoint.app/sw.js`
3. **Test the API connection** using the debug page
4. **Check browser permissions** for notifications

## Next Steps

1. Set the environment variables in your production environment
2. Rebuild and redeploy the web app
3. Test the push notifications again
4. Visit the debug page to confirm everything is working
