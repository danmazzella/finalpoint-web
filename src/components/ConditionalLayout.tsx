'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import Footer from './Footer';
import ProtectedRoute from './ProtectedRoute';

interface ConditionalLayoutProps {
    children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
    const pathname = usePathname();
    const isScoringPage = pathname === '/scoring';
    const isInfoPage = pathname === '/info';
    const isLoginPage = pathname === '/login';
    const isSignupPage = pathname === '/signup';
    const isResetPasswordPage = pathname === '/reset-password';
    const isJoinLeaguePage = pathname.startsWith('/joinleague');
    const isMarketingPage = pathname === '/marketing';
    const isPrivacyPage = pathname === '/privacy';
    const isTermsPage = pathname === '/terms';

    // Define all public pages that don't require authentication
    const isPublicPage = isScoringPage || isInfoPage || isJoinLeaguePage || isMarketingPage || isPrivacyPage || isTermsPage;
    const isAuthPage = isLoginPage || isSignupPage || isResetPasswordPage;
    const shouldHideNavigation = isPublicPage || isAuthPage;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
            {!shouldHideNavigation && <Navigation />}
            <main className="flex-1">
                {/* Public pages and auth pages bypass ProtectedRoute completely */}
                {(isPublicPage || isAuthPage) ? (
                    children
                ) : (
                    <ProtectedRoute>{children}</ProtectedRoute>
                )}
            </main>
            {!shouldHideNavigation && <Footer />}
        </div>
    );
}
