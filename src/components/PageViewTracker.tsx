'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { logPageView } from '@/lib/analytics';
import { analytics } from '@/lib/firebase';

export default function PageViewTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [analyticsReady, setAnalyticsReady] = useState(false);

    // Wait for analytics to be ready
    useEffect(() => {
        const checkAnalytics = () => {
            if (analytics) {
                setAnalyticsReady(true);
                console.log('✅ Analytics ready, tracking enabled');
            } else {
                // Check again in 100ms
                setTimeout(checkAnalytics, 100);
            }
        };
        
        checkAnalytics();
    }, []);

    useEffect(() => {
        if (!analyticsReady) {
            console.log('⏳ Waiting for analytics to be ready...');
            return;
        }

        // Get the full URL including search params
        const fullPath = searchParams.toString()
            ? `${pathname}?${searchParams.toString()}`
            : pathname;

        // Get page title from pathname or use a default
        const getPageTitle = (path: string) => {
            // Remove leading slash and split by segments
            const segments = path.replace(/^\//, '').split('/');

            if (segments.length === 0 || segments[0] === '') return 'Home';

            // Convert path segments to readable titles
            const titleMap: Record<string, string> = {
                'dashboard': 'Dashboard',
                'leagues': 'Leagues',
                'admin': 'Admin',
                'profile': 'Profile',
                'login': 'Login',
                'signup': 'Sign Up',
                'join': 'Join League',
                'picks': 'Make Picks',
                'scoring': 'Scoring Rules',
                'info': 'Information',
                'privacy': 'Privacy Policy',
                'terms': 'Terms of Service',
                'reset-password': 'Reset Password'
            };

            // Get the first meaningful segment
            const firstSegment = segments[0];
            return titleMap[firstSegment] || firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
        };

        const pageTitle = getPageTitle(pathname);

        // Log the page view
        console.log(`📊 Tracking page view: ${pageTitle} (${fullPath})`);
        const success = logPageView(pageTitle, fullPath);
        
        if (success) {
            console.log('✅ Page view tracked successfully');
        } else {
            console.log('❌ Failed to track page view');
        }

    }, [pathname, searchParams, analyticsReady]);

    // This component doesn't render anything
    return null;
}
