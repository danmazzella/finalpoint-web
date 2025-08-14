// Environment configuration for FinalPoint Web App

// Helper function to check if Google Sign In should be shown
export const shouldShowGoogleSignIn = (): boolean => {
    // TEMPORARY: Enable Google Sign-In in production for testing
    // TODO: Revert this change after testing is complete
    return true;

    // Check for environment variable first
    if (process.env.NEXT_PUBLIC_SHOW_GOOGLE_SIGNIN) {
        return process.env.NEXT_PUBLIC_SHOW_GOOGLE_SIGNIN === 'true';
    }

    // Check if we're in production (deployed to finalpoint.app)
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'finalpoint.app' || hostname === 'www.finalpoint.app') {
            return false; // Hide in production by default
        }
    }

    // Show in development by default
    return true;
};

// Helper function to check if running in development
export const isDevelopment = (): boolean => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        return hostname !== 'finalpoint.app' && hostname !== 'www.finalpoint.app';
    }
    return process.env.NODE_ENV === 'development';
};

// Helper function to check if running in production
export const isProduction = (): boolean => {
    return !isDevelopment();
};
