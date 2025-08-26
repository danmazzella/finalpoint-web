// Apple Sign-In Configuration
export const appleConfig = {
    // Client ID for Apple Sign-In
    // This should be your app's bundle identifier (e.g., com.finalpoint.app)
    clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || 'com.finalpoint.app',

    // Redirect URI for Apple Sign-In
    // This should match what you configure in Apple Developer Console
    redirectURI: typeof window !== 'undefined' ? window.location.origin : '',

    // Scope for Apple Sign-In
    // 'email name' - requests both email and full name
    // 'email' - requests only email
    // 'name' - requests only full name
    scope: 'email name',

    // State parameter for security
    state: 'origin:web',

    // Use popup mode for better UX
    usePopup: true,

    // Apple Sign-In button styling
    buttonStyle: {
        type: 'sign-in', // 'sign-in' | 'continue' | 'sign-up'
        theme: 'light', // 'light' | 'dark'
        size: 'large', // 'large' | 'medium' | 'small'
        cornerRadius: 6,
    }
};

// Helper function to check if Apple Sign-In is available
export const isAppleSignInAvailable = (): boolean => {
    // Apple Sign-In is available on all modern browsers
    // but works best on Safari and iOS devices
    if (typeof window === 'undefined') return false;

    // Check if we're on iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    // Apple Sign-In works best on iOS Safari, but is available on other platforms too
    return true;
};

// Helper function to get the best Apple Sign-In experience
export const getAppleSignInExperience = () => {
    if (typeof window === 'undefined') return 'web';

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (isIOS && isSafari) {
        return 'native'; // Best experience on iOS Safari
    } else if (isSafari) {
        return 'safari'; // Good experience on desktop Safari
    } else {
        return 'web'; // Standard web experience
    }
};
