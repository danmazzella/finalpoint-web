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
            <nav className="hidden md:block glass-nav sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-14">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <Logo size="md" />
                            <span className="text-lg font-bold tracking-tight text-card-foreground group-hover:text-primary transition-colors duration-200">
                                FinalPoint
                            </span>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="flex items-center gap-0.5">
                            {allNavigationItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        isActive(item.href)
                                            ? 'text-primary bg-primary/12 shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-black/5'
                                    }`}
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                    {isActive(item.href) && (
                                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary/60" />
                                    )}
                                </Link>
                            ))}

                            {!user && (
                                <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
                                    <Link href="/login" className="btn-ghost px-4 py-1.5 text-sm">
                                        Log In
                                    </Link>
                                    <Link href="/signup" className="btn-primary px-4 py-1.5 text-sm">
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Subtle accent line */}
                <div className="h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            </nav>

            {/* Mobile Navigation */}
            <nav className="md:hidden">
                {/* Top Bar */}
                <div className="glass-nav">
                    <div className="px-4 py-2.5">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="flex items-center gap-2">
                                <Logo size="sm" />
                                <span className="text-base font-bold tracking-tight text-card-foreground">FinalPoint</span>
                            </Link>

                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                aria-label="Toggle menu"
                            >
                                {isMobileMenuOpen ? (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Dropdown Menu */}
                    {isMobileMenuOpen && (
                        <div className="px-4 pb-4 pt-2 border-t border-border animate-slide-down">
                            <div className="space-y-1">
                                {allNavigationItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                                            isActive(item.href)
                                                ? 'text-primary bg-primary/10'
                                                : 'text-card-foreground hover:text-primary hover:bg-primary/8'
                                        }`}
                                    >
                                        {item.icon}
                                        <span>{item.name}</span>
                                        {isActive(item.href) && (
                                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                        )}
                                    </Link>
                                ))}

                                {!user && (
                                    <div className="pt-3 mt-2 border-t border-border flex gap-2">
                                        <Link
                                            href="/login"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="btn-ghost flex-1 text-center text-sm py-2"
                                        >
                                            Log In
                                        </Link>
                                        <Link
                                            href="/signup"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="btn-primary flex-1 text-center text-sm py-2"
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation Bar */}
                <div className="fixed bottom-0 left-0 right-0 glass-nav border-t border-border md:hidden z-50" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="flex justify-around pb-safe">
                        {allNavigationItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex flex-col items-center pt-2 pb-3 px-3 min-w-0 flex-1 transition-colors duration-200 ${
                                        active ? 'text-primary' : 'text-muted-foreground'
                                    }`}
                                >
                                    <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${active ? 'bg-primary/12' : ''}`}>
                                        {item.icon}
                                        {active && (
                                            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
                                        )}
                                    </div>
                                    <span className={`text-xs mt-0.5 font-medium truncate transition-colors duration-200 ${active ? 'text-primary' : ''}`}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </>
    );
}
