'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import Footer from './Footer';

interface ConditionalLayoutProps {
    children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
    const pathname = usePathname();
    const isScoringPage = pathname === '/scoring';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
            {!isScoringPage && <Navigation />}
            <main className="flex-1">
                {children}
            </main>
            {!isScoringPage && <Footer />}
        </div>
    );
}
