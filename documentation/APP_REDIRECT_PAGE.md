# App Redirect Page

## Overview

The app redirect page (`/app`) automatically detects the user's platform and redirects them to the appropriate destination:

- **iOS users**: Redirected to the App Store
- **Android users**: Redirected to the Play Store  
- **Desktop users**: Redirected to the login page

## URL

```
https://finalpoint.app/app
```

## How It Works

1. **Platform Detection**: Uses user agent detection to identify the device platform
2. **Automatic Redirect**: Immediately redirects users based on their platform
3. **Fallback Button**: Shows a manual redirect button after 3 seconds if automatic redirect fails
4. **Loading State**: Displays a spinner and platform detection status

## Technical Implementation

### Platform Detection Utility

Located at `src/utils/platformDetection.ts`, this utility provides:

- `detectPlatform()`: Returns platform information (iOS, Android, Desktop)
- `getAppStoreLink()`: Returns the appropriate app store URL
- `redirectBasedOnPlatform()`: Handles the redirect logic

### App Store Links

- **iOS**: `https://apps.apple.com/us/app/finalpoint/id6749827283`
- **Android**: `https://play.google.com/store/apps/details?id=com.finalpoint.mobile&hl=en_US`

## Mobile App Integration

### MobileAppDownload Component

A reusable component (`src/components/MobileAppDownload.tsx`) that automatically detects the user's platform and displays appropriate download buttons. Available in three variants:

- **`default`**: Full-width card with app icon and download button
- **`compact`**: Inline text with download link
- **`banner`**: Prominent banner with gradient background

### Integration Points

The mobile app download component has been integrated throughout the webapp:

1. **Footer** (`src/components/Footer.tsx`): Compact variant below the logo
2. **Info Page** (`/info`): Banner variant below the main CTA buttons
3. **Scoring Page** (`/scoring`): Default variant at the bottom of the content
4. **Info Page Footer**: Direct app store links in the footer grid

### Usage

```typescript
import MobileAppDownload from '@/components/MobileAppDownload';

// Default variant
<MobileAppDownload />

// Compact variant for footers
<MobileAppDownload variant="compact" />

// Banner variant for prominent placement
<MobileAppDownload variant="banner" />
```

## Usage

### For Users

Users can simply visit `/app` and they'll be automatically redirected to the appropriate destination.

### For Marketing

This page can be used in:

- QR codes for mobile users
- Social media links
- Email campaigns
- Physical marketing materials

### For Development

The platform detection utility can be imported and used in other components:

```typescript
import { detectPlatform, getAppStoreLink } from '@/utils/platformDetection';

const platform = detectPlatform();
const appStoreLink = getAppStoreLink();
```

## Customization

### Updating App Store Links

1. **iOS**: Update the App Store ID in `platformDetection.ts`
2. **Android**: The package name is already correct (`com.finalpoint.mobile`)

### Styling

The page uses Tailwind CSS classes and can be customized in `src/app/app/page.tsx`.

### Redirect Timing

Adjust the redirect delay by modifying the `setTimeout` value in the `useEffect` hook.

## Testing

### Local Development

1. Visit `http://localhost:3000/app`
2. Use browser dev tools to simulate different user agents
3. Test the fallback button functionality

### Platform Simulation

- **iOS**: Use Safari or Chrome with iOS user agent
- **Android**: Use Chrome with Android user agent
- **Desktop**: Use any desktop browser

## Security Considerations

- User agent detection is not 100% reliable but sufficient for this use case
- The page doesn't collect or store any user data
- All redirects are external to app stores or internal to the app

## Future Enhancements

- Add analytics tracking for redirect success/failure rates
- Implement deep linking for users who already have the app installed
- Add A/B testing for different redirect strategies
- Include app store ratings and reviews information
- Expand mobile app integration to more pages
- Add push notification prompts for mobile users
