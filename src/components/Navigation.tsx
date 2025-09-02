'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Logo from './Logo';

export default function Navigation() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { user } = useAuth();
    const { resolvedTheme } = useTheme();

    const navigationItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
            )
        },
        {
            name: 'Leagues',
            href: '/leagues',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            )
        },
        {
            name: 'Picks',
            href: '/picks',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            name: 'Profile',
            href: '/profile',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
    ];

    // Add admin link for admin users
    const adminNavigationItem = {
        name: 'Admin',
        href: '/admin',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        )
    };

    // Filter navigation items based on authentication status
    const filteredNavigationItems = user
        ? (user.role === 'admin' ? [...navigationItems, adminNavigationItem] : navigationItems)
        : navigationItems.filter(item => item.name !== 'Profile'); // Hide Profile for unauthenticated users

    const allNavigationItems = filteredNavigationItems;

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    // Mark that user has navigated internally
    useEffect(() => {
        if (user && pathname !== '/') {
            sessionStorage.setItem('finalpoint-internal-navigation', 'true');
        }
    }, [pathname, user]);

    // Hide navigation on standings, results, activity, login, signup, privacy, terms, and reset-password pages
    const shouldHideNavigation = pathname.includes('/standings') ||
        pathname.includes('/results') ||
        pathname.includes('/activity') ||
        pathname === '/login' ||
        pathname === '/signup' ||
        pathname === '/privacy' ||
        pathname === '/terms' ||
        pathname === '/reset-password';

    if (shouldHideNavigation) {
        return null;
    }

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:block bg-card shadow border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center space-x-3">
                                <Logo size="md" />
                                <span className="text-xl font-bold text-card-foreground">FinalPoint</span>
                            </Link>
                        </div>

                        {/* Desktop Navigation Links */}
                        <div className="flex items-center space-x-8">
                            {allNavigationItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.href)
                                        ? 'text-primary bg-primary/10'
                                        : 'text-card-foreground hover:text-primary hover:bg-primary/10'
                                        }`}
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                </Link>
                            ))}

                            {/* Desktop Login/Signup Section - Only show for unauthenticated users */}
                            {!user && (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href="/login"
                                        className="text-sm font-medium text-card-foreground hover:text-primary transition-colors"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation */}
            <nav className="md:hidden">
                {/* Top Bar */}
                <div className="bg-card shadow border-b border-border">
                    <div className="px-4 py-2">
                        <div className="flex items-center justify-between">
                            {/* Logo */}
                            <Link href="/" className="flex items-center space-x-2">
                                <Logo size="sm" />
                                <span className="text-lg font-bold text-card-foreground">FinalPoint</span>
                            </Link>

                            {/* Right side with hamburger */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="px-4 pb-4 border-t border-border">
                            <div className="space-y-2">
                                {allNavigationItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.href)
                                            ? 'text-primary bg-primary/10'
                                            : 'text-card-foreground hover:text-primary hover:bg-primary/10'
                                            }`}
                                    >
                                        {item.icon}
                                        <span>{item.name}</span>
                                    </Link>
                                ))}

                                <div className="pt-2 border-t border-border">
                                    {!user && (
                                        <div className="space-y-2">
                                            <Link
                                                href="/login"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center space-x-3 px-3 py-2 w-full text-left text-sm font-medium text-card-foreground hover:text-primary hover:bg-primary/10 rounded-md"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                </svg>
                                                <span>Log In</span>
                                            </Link>
                                            <Link
                                                href="/signup"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center space-x-3 px-3 py-2 w-full text-left text-sm font-medium text-primary hover:text-primary/90 hover:bg-primary/10 rounded-md"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                </svg>
                                                <span>Sign Up</span>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50">
                    <div className="flex justify-around py-2">
                        {allNavigationItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 ${isActive(item.href)
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <div className="mb-1">{item.icon}</div>
                                <span className="text-xs font-medium truncate">{item.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>
        </>
    );
}
