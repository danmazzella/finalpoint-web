/**
 * Platform detection utilities for FinalPoint Web App
 */

export interface PlatformInfo {
    isIOS: boolean;
    isAndroid: boolean;
    isMobile: boolean;
    isDesktop: boolean;
    platform: 'ios' | 'android' | 'desktop' | 'unknown';
}

/**
 * Detects the user's platform based on user agent
 */
export function detectPlatform(): PlatformInfo {
    if (typeof window === 'undefined') {
        return {
            isIOS: false,
            isAndroid: false,
            isMobile: false,
            isDesktop: true,
            platform: 'desktop'
        };
    }

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    // iOS detection (iPad, iPhone, iPod)
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;

    // Android detection
    const isAndroid = /android/i.test(userAgent);

    // Mobile detection
    const isMobile = isIOS || isAndroid;

    // Desktop detection
    const isDesktop = !isMobile;

    // Determine platform
    let platform: PlatformInfo['platform'] = 'unknown';
    if (isIOS) platform = 'ios';
    else if (isAndroid) platform = 'android';
    else if (isDesktop) platform = 'desktop';

    return {
        isIOS,
        isAndroid,
        isMobile,
        isDesktop,
        platform
    };
}

/**
 * Gets the appropriate app store link based on platform
 */
export function getAppStoreLink(): string | null {
    const platform = detectPlatform();

    if (platform.isIOS) {
        // Note: Replace with actual App Store ID when app is published
        return 'https://apps.apple.com/us/app/finalpoint/id6749827283';
    }

    if (platform.isAndroid) {
        // Using the package name from app.json: com.finalpoint.mobile
        return 'https://play.google.com/store/apps/details?id=com.finalpoint.mobile&hl=en_US';
    }

    return null;
}

/**
 * Redirects user to appropriate destination based on platform
 */
export function redirectBasedOnPlatform(): void {
    const appStoreLink = getAppStoreLink();

    if (appStoreLink) {
        // Mobile platform - redirect to app store
        window.location.href = appStoreLink;
    } else {
        // Desktop platform - redirect to login (this will be handled by the component)
        // Return false to indicate no redirect was made
        return;
    }
}

