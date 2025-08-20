'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';

const ThemePreferencesPage: React.FC = () => {
    const { theme, resolvedTheme } = useTheme();

    return (
        <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
            <div className="min-h-screen bg-background text-foreground">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="mb-8">
                        <Link
                            href="/"
                            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-4"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Home
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Theme Preferences</h1>
                        <p className="text-muted-foreground">
                            Customize your viewing experience with our flexible theme system
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Theme Selection */}
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-card-foreground">Choose Your Theme</h2>
                            <div className="mb-6">
                                <ThemeToggle />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-secondary rounded-md">
                                    <span className="font-medium">Current Selection:</span>
                                    <span className="text-primary font-semibold capitalize">{theme}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-secondary rounded-md">
                                    <span className="font-medium">Active Theme:</span>
                                    <span className="text-primary font-semibold capitalize">{resolvedTheme}</span>
                                </div>
                            </div>
                        </div>

                        {/* Theme Information */}
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-card-foreground">Theme Options</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-secondary rounded-md">
                                    <h3 className="font-semibold text-secondary-foreground mb-2 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        Light Theme
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Clean, bright interface perfect for daytime use and well-lit environments.
                                    </p>
                                </div>

                                <div className="p-4 bg-secondary rounded-md">
                                    <h3 className="font-semibold text-secondary-foreground mb-2 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                        </svg>
                                        Dark Theme
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Easy on the eyes for low-light conditions and extended viewing sessions.
                                    </p>
                                </div>

                                <div className="p-4 bg-secondary rounded-md">
                                    <h3 className="font-semibold text-secondary-foreground mb-2 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        System Theme
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically follows your device's system preference and updates in real-time.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Features */}
                    <div className="mt-8 bg-card border border-border rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-card-foreground">Theme Features</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="text-center p-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold mb-2">Instant Switching</h3>
                                <p className="text-sm text-muted-foreground">
                                    Change themes instantly with smooth transitions
                                </p>
                            </div>

                            <div className="text-center p-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold mb-2">Persistent</h3>
                                <p className="text-sm text-muted-foreground">
                                    Your preference is saved and restored automatically
                                </p>
                            </div>

                            <div className="text-center p-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold mb-2">Smart Defaults</h3>
                                <p className="text-sm text-muted-foreground">
                                    Automatically detects your system preference
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemePreferencesPage;
