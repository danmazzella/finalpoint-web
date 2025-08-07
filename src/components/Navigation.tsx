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
            <nav className="hidden md:block bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/dashboard" className="flex items-center space-x-2">
                                <span className="text-2xl">🏎️</span>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">FinalPoint</h1>
                                    <p className="text-xs text-gray-600">F1 Prediction Game</p>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation Links */}
                        <div className="flex items-center space-x-8">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.href)
                                        ? 'text-pink-600 bg-pink-50'
                                        : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
                                        }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation */}
            <nav className="md:hidden">
                {/* Top Bar */}
                <div className="bg-white shadow">
                    <div className="px-4 py-2">
                        <div className="flex items-center justify-between">
                            {/* Logo */}
                            <Link href="/dashboard" className="flex items-center space-x-2">
                                <span className="text-xl">🏎️</span>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900">FinalPoint</h1>
                                </div>
                            </Link>

                            {/* Hamburger Menu */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="px-4 pb-4 border-t border-gray-200">
                            <div className="space-y-2">
                                {navigationItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.href)
                                            ? 'text-pink-600 bg-pink-50'
                                            : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
                                            }`}
                                    >
                                        <span className="text-lg">{item.icon}</span>
                                        <span>{item.name}</span>
                                    </Link>
                                ))}
                                <div className="pt-2 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="flex items-center space-x-3 px-3 py-2 w-full text-left text-sm font-medium text-gray-700 hover:text-gray-800 hover:bg-gray-50 rounded-md"
                                    >
                                        <span className="text-lg">🚪</span>
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
                    <div className="flex justify-around">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 ${isActive(item.href)
                                    ? 'text-pink-600'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                <span className="text-xl mb-1">{item.icon}</span>
                                <span className="text-xs font-medium truncate">{item.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>
        </>
    );
}
