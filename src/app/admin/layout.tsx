'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check if user is admin
        if (user && user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        if (!user) {
            const encodedRedirect = encodeURIComponent(pathname);
            router.push(`/login?redirect=${encodedRedirect}`);
            return;
        }
    }, [user, router, pathname]);

    // Don't render anything if user is not admin or not logged in
    if (!user || user.role !== 'admin') {
        return null;
    }

    const tabs = [
        { name: 'Overview', href: '/admin', current: pathname === '/admin' },
        { name: 'Users', href: '/admin/users', current: pathname === '/admin/users' },
        { name: 'Leagues', href: '/admin/leagues', current: pathname === '/admin/leagues' },
        { name: 'User Picks', href: '/admin/user-picks', current: pathname === '/admin/user-picks' },
        { name: 'Missing Picks', href: '/admin/users-without-picks', current: pathname === '/admin/users-without-picks' },
        { name: 'App Versions', href: '/admin/app-versions', current: pathname === '/admin/app-versions' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="mt-2 text-gray-600">Manage users, leagues, and platform statistics</p>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${tab.current
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Page Content */}
                {children}
            </div>
        </div>
    );
}
