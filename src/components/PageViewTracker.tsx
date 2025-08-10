'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { logPageView } from '@/lib/analytics';

export default function PageViewTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
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
        logPageView(pageTitle, fullPath);

    }, [pathname, searchParams]);

    // This component doesn't render anything
    return null;
}
