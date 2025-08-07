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
    const isPublicPage = isScoringPage || isInfoPage;
    const shouldHideNavigation = isPublicPage;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
            {!shouldHideNavigation && <Navigation />}
            <main className="flex-1">
                {isPublicPage ? children : <ProtectedRoute>{children}</ProtectedRoute>}
            </main>
            {!shouldHideNavigation && <Footer />}
        </div>
    );
}
