'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import Footer from './Footer';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

interface ConditionalLayoutProps {
    children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
    const pathname = usePathname();
    const { user, isLoading } = useAuth();

    const isScoringPage = pathname === '/scoring';
    const isInfoPage = pathname === '/info';
    const isLoginPage = pathname === '/login';
    const isSignupPage = pathname === '/signup';
    const isResetPasswordPage = pathname === '/reset-password';
    const isJoinLeaguePage = pathname.startsWith('/joinleague');
    const isLeagueDetailPage = pathname.startsWith('/leagues/') && pathname.split('/').length === 3;
    const isLeagueStandingsPage = pathname.startsWith('/leagues/') && pathname.includes('/standings');
    const isLeagueResultsPage = pathname.startsWith('/leagues/') && pathname.includes('/results');
    const isMarketingPage = pathname === '/marketing';
    const isPrivacyPage = pathname === '/privacy';
    const isTermsPage = pathname === '/terms';
    const isRootPage = pathname === '/';

    // Define all public pages that don't require authentication
    const isPublicPage = isScoringPage || isInfoPage || isJoinLeaguePage || isLeagueDetailPage || isLeagueStandingsPage || isLeagueResultsPage || isMarketingPage || isPrivacyPage || isTermsPage || isRootPage;
    const isAuthPage = isLoginPage || isSignupPage || isResetPasswordPage;

    // Pages with custom headers/footers (should not show shared Navigation/Footer)
    const hasCustomHeaderFooter = isInfoPage || isMarketingPage;

    // Only hide navigation on authentication pages or pages with custom headers
    const shouldHideNavigation = isAuthPage || hasCustomHeaderFooter || pathname.includes('/chat/');

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Show navigation while loading or when it should be visible */}
            {(isLoading || !shouldHideNavigation) && <Navigation />}
            <main className="flex-1 bg-gray-50">
                {/* Public pages and auth pages bypass ProtectedRoute completely */}
                {(isPublicPage || isAuthPage) ? (
                    children
                ) : (
                    <ProtectedRoute>{children}</ProtectedRoute>
                )}
            </main>
            {/* Show footer while loading or when it should be visible (but not on pages with custom footers) */}
            {(isLoading || !shouldHideNavigation) && <Footer />}
        </div>
    );
}
