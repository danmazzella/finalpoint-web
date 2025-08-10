'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { logPageView } from '@/lib/analytics';
import { analytics, getAnalyticsInstance } from '@/lib/firebase';

export default function PageViewTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [analyticsReady, setAnalyticsReady] = useState(false);

    useEffect(() => {
        const checkAnalytics = () => {
            const currentAnalytics = analytics || getAnalyticsInstance();
            if (currentAnalytics) {
                setAnalyticsReady(true);
            } else {
                setTimeout(checkAnalytics, 100);
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
