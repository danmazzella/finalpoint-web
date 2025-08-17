'use client';

import { useEffect, useState } from 'react';
import { detectPlatform, getAppStoreLink } from '@/utils/platformDetection';

interface MobileAppDownloadProps {
    variant?: 'default' | 'compact' | 'banner';
    className?: string;
}

export default function MobileAppDownload({ variant = 'default', className = '' }: MobileAppDownloadProps) {
    const [platform, setPlatform] = useState<string>('detecting...');
    const [appStoreLink, setAppStoreLink] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const platformInfo = detectPlatform();
            const link = getAppStoreLink();

            setPlatform(platformInfo.platform);
            setAppStoreLink(link);
        } catch (err) {
            console.error('MobileAppDownload: Error detecting platform:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    }, []);

    const handleDownload = () => {
        if (appStoreLink) {
            window.open(appStoreLink, '_blank');
        }
    };

    const getPlatformText = () => {
        switch (platform) {
            case 'ios':
                return 'Download on the App Store';
            case 'android':
                return 'Get it on Google Play';
            default:
                return 'Download Mobile App';
        }
    };

    const getStoreIcon = () => {
        switch (platform) {
            case 'ios':
                return (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                );
            case 'android':
                return (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4486.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4486.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592c.0801-.1387-.0352-.2947-.1836-.2947-.0606 0-.1113.0347-.1387.0835l-2.0223 3.5036c-.652-.3716-1.406-.5908-2.207-.5908-.8118 0-1.5738.2256-2.2297.6094L9.8429 5.9284c-.0274-.0488-.0781-.0835-.1387-.0835-.1484 0-.2637.156-.1836.2947l1.9973 3.4592C8.6889 11.1867 7.5 13.6582 7.5 16.3478v.856c0 .5511.4486.9993.9993.9993h15.0013c.5511 0 .9993-.4482.9993-.9993v-.856c0-2.6896-1.1889-5.1611-3.5234-7.0264" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                );
        }
    };

    // Debug: Always show something

    // Fallback: If we're still detecting or have an error, show a basic version
    if (platform === 'detecting...' || error) {
        return (
            <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
                <div className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-2">FinalPoint Mobile App</h3>
                    <p className="text-sm text-gray-600 mb-3">Download the app for the best experience</p>
                    <div className="flex justify-center space-x-4">
                        <a
                            href="https://apps.apple.com/us/app/finalpoint/id6749827283"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            App Store
                        </a>
                        <a
                            href="https://play.google.com/store/apps/details?id=com.finalpoint.mobile&hl=en_US"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                            Google Play
                        </a>
                    </div>
                    {error && <div className="mt-2 text-xs text-red-500">Platform detection error: {error}</div>}
                </div>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className={`flex items-center space-x-2 ${className}`}>
                <span className="text-sm text-gray-600">Get the mobile app:</span>
                {appStoreLink ? (
                    <button
                        onClick={handleDownload}
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        {getStoreIcon()}
                        <span>{getPlatformText()}</span>
                    </button>
                ) : (
                    <span className="text-sm text-gray-500">Loading...</span>
                )}
                {error && <span className="text-xs text-red-500">Error: {error}</span>}
            </div>
        );
    }

    if (variant === 'banner') {
        return (
            <div className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg ${className}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                            {getStoreIcon()}
                        </div>
                        <div>
                            <h3 className="font-semibold">Download FinalPoint Mobile</h3>
                            <p className="text-sm text-blue-100">Make predictions on the go!</p>
                        </div>
                    </div>
                    {appStoreLink ? (
                        <button
                            onClick={handleDownload}
                            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                        >
                            {getPlatformText()}
                        </button>
                    ) : (
                        <span className="text-white text-sm">Loading...</span>
                    )}
                </div>
                {error && <div className="mt-2 text-xs text-red-200">Error: {error}</div>}
            </div>
        );
    }

    // Default variant
    return (
        <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white">
                        {getStoreIcon()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">FinalPoint Mobile App</h3>
                        <p className="text-sm text-gray-600">Download the app for the best experience</p>
                    </div>
                </div>
                {appStoreLink ? (
                    <button
                        onClick={handleDownload}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        {getPlatformText()}
                    </button>
                ) : (
                    <span className="text-gray-500 text-sm">Loading...</span>
                )}
            </div>
            {error && <div className="mt-2 text-xs text-red-500">Error: {error}</div>}
        </div>
    );
}
