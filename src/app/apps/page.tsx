'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { detectPlatform, getAppStoreLink } from '@/utils/platformDetection';

export default function AppRedirectPage() {
    const router = useRouter();
    const [platform, setPlatform] = useState<string>('detecting...');
    const [showFallback, setShowFallback] = useState(false);

    useEffect(() => {
        const handlePlatformRedirect = () => {
            const platformInfo = detectPlatform();
            const appStoreLink = getAppStoreLink();

            setPlatform(platformInfo.platform);

            if (appStoreLink) {
                // Mobile platform - redirect to app store
                window.location.href = appStoreLink;
            } else {
                // Desktop/other platforms - redirect to login page
                router.push('/login');
            }
        };

        // Small delay to ensure the page loads before redirecting
        const timer = setTimeout(handlePlatformRedirect, 100);

        // Show fallback button after 3 seconds if redirect hasn't happened
        const fallbackTimer = setTimeout(() => setShowFallback(true), 3000);

        return () => {
            clearTimeout(timer);
            clearTimeout(fallbackTimer);
        };
    }, [router]);

    const handleManualRedirect = () => {
        const appStoreLink = getAppStoreLink();
        if (appStoreLink) {
            window.location.href = appStoreLink;
        } else {
            router.push('/login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md mx-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h1 className="text-xl font-semibold text-gray-800 mb-2">Redirecting to FinalPoint</h1>
                <p className="text-gray-600 mb-2">Detected platform: {platform}</p>
                <p className="text-sm text-gray-500 mb-4">If you&apos;re not redirected automatically, please wait a moment.</p>

                {showFallback && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800 mb-3">Automatic redirect didn&apos;t work?</p>
                        <button
                            onClick={handleManualRedirect}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Click here to continue
                        </button>
                    </div>
                )}

                <div className="mt-6 space-y-2 text-xs text-gray-400">
                    <p>iOS users → App Store</p>
                    <p>Android users → Play Store</p>
                    <p>Desktop users → Login page</p>
                </div>
            </div>
        </div>
    );
}
