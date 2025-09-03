'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { logPageView } from '@/lib/analytics';
import { analytics } from '@/lib/firebase';

export default function PageViewTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [analyticsReady, setAnalyticsReady] = useState(false);

    useEffect(() => {
        const checkAnalytics = () => {
            try {
                if (analytics) {
                    setAnalyticsReady(true);
                } else {
                    // If analytics is not available after 5 seconds, give up
                    setTimeout(checkAnalytics, 100);
                }
            } catch (error) {
                console.warn('Analytics check failed:', error);
                setAnalyticsReady(false);
            }
        };
        checkAnalytics();
    }, []);

    useEffect(() => {
        if (!analyticsReady) {
            return;
        }

        const fullPath = searchParams.toString()
            ? `${pathname}?${searchParams.toString()}`
            : pathname;

        const getPageTitle = (path: string) => {
            if (path === '/') return 'Home';
            if (path === '/dashboard') return 'Dashboard';
            if (path === '/leagues') return 'Leagues';
            if (path === '/profile') return 'Profile';
            if (path === '/auth') return 'Authentication';
            if (path.startsWith('/leagues/')) return 'League Details';
            return 'Page';
        };

        const pageTitle = getPageTitle(pathname);
        logPageView(pageTitle, fullPath);

    }, [pathname, searchParams, analyticsReady]);

    return null;
}
