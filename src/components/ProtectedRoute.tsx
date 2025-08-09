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

    // List of public routes that don't require authentication
    const publicRoutes = ['/login', '/signup', '/join', '/joinleague', '/privacy', '/terms', '/reset-password'];

    useEffect(() => {
        // Don't redirect while loading
        if (isLoading) return;

        // Check if current route is public
        const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

        // If not authenticated and trying to access a protected route, redirect to login with current path
        if (!user && !isPublicRoute) {
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

    // If not authenticated and on a public route, show the page
    if (!user && publicRoutes.some(route => pathname.startsWith(route))) {
        return <>{children}</>;
    }

    // If authenticated, show the page
    if (user) {
        return <>{children}</>;
    }

    // If not authenticated and not on a public route, show loading (will redirect)
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
    );
}
