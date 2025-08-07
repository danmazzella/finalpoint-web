'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const navigationItems = [
        { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
        { name: 'Leagues', href: '/leagues', icon: '🏆' },
        { name: 'Picks', href: '/picks', icon: '📅' },
        { name: 'Profile', href: '/profile', icon: '👤' },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    const handleLogout = () => {
        logout();
    };

    // Hide navigation on standings, results, and activity pages
    const shouldHideNavigation = pathname.includes('/standings') || pathname.includes('/results') || pathname.includes('/activity');

    if (shouldHideNavigation) {
        return null;
    }

    return (
        <>
            {/* Desktop Navigation */}
            <div className="hidden md:block bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-8">
                            <Link href="/dashboard" className="flex items-center space-x-2 text-slate-700 hover:text-indigo-600 transition-colors">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="text-lg font-semibold">FinalPoint</span>
                            </Link>

                            <nav className="flex space-x-6">
                                {navigationItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === item.href
                                                ? 'bg-indigo-100 text-indigo-700'
                                                : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        {item.icon}
                                        <span>{item.name}</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link
                                href="/profile"
                                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>Profile</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Top Bar */}
            <div className="md:hidden bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm">
                <div className="flex items-center justify-between px-4 py-2">
                    <Link href="/dashboard" className="flex items-center space-x-2 text-slate-700">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-lg font-semibold">FinalPoint</span>
                    </Link>

                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-md text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-lg">
                    <div className="px-4 py-2 space-y-1">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${pathname === item.href
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
                                    }`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        ))}
                        <Link
                            href="/profile"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Profile</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-slate-200 md:hidden z-50 shadow-lg">
                <div className="flex justify-around">
                    {navigationItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center py-2 px-3 text-xs font-medium transition-colors ${pathname === item.href
                                    ? 'text-indigo-600'
                                    : 'text-slate-600 hover:text-indigo-600'
                                }`}
                        >
                            {item.icon}
                            <span className="mt-1">{item.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}
