'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Don't redirect while loading
        if (isLoading) {
            return;
        }

        // List of public routes that don't require authentication
        const publicRoutes = ['/login', '/signup', '/privacy', '/terms', '/reset-password'];

        // Special handling for joinleague routes - they should be public
        const isJoinLeagueRoute = pathname.startsWith('/joinleague');

        // Routes that allow logged-out users with limited functionality
        const limitedAccessRoutes = ['/dashboard', '/leagues', '/picks', '/profile'];

        // Check if current route is public
        const isPublicRoute = publicRoutes.some(route => pathname === route) || isJoinLeagueRoute;

        // Check if current route allows limited access for logged-out users
        const isLimitedAccessRoute = limitedAccessRoutes.some(route => pathname === route);

        // If not authenticated and trying to access a protected route that's not in limited access
        if (!user && !isPublicRoute && !isLimitedAccessRoute) {
            // Validate redirect URL to prevent open redirects
            const isValidRedirect = pathname.startsWith('/') &&
                !pathname.startsWith('//') &&
                !pathname.includes('javascript:') &&
                !pathname.includes('data:');

            const redirectPath = isValidRedirect ? pathname : '/dashboard';
            const encodedRedirect = encodeURIComponent(redirectPath);
            router.push(`/login?redirect=${encodedRedirect}`);
        }
    }, [user, isLoading, pathname, router]);

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Check routes for rendering logic
    const publicRoutes = ['/login', '/signup', '/privacy', '/terms', '/reset-password'];
    const isJoinLeagueRoute = pathname.startsWith('/joinleague');
    const limitedAccessRoutes = ['/dashboard', '/leagues', '/picks', '/profile'];

    const isPublicRoute = publicRoutes.some(route => pathname === route) || isJoinLeagueRoute;
    const isLimitedAccessRoute = limitedAccessRoutes.some(route => pathname === route);

    // If not authenticated and on a public route, show the page
    if (!user && isPublicRoute) {
        return <>{children}</>;
    }

    // If not authenticated and on a limited access route, show the page (will handle limited functionality in the component)
    if (!user && isLimitedAccessRoute) {
        return <>{children}</>;
    }

    // If authenticated, show the page
    if (user) {
        return <>{children}</>;
    }

    // If not authenticated and not on a public or limited access route, show loading (will redirect)
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
    );
}
