'use client';

import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    {/* Logo and Brand */}
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                        <Logo size="sm" />
                        <span className="text-lg font-bold text-gray-900">FinalPoint</span>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
                        <Link 
                            href="/dashboard" 
                            className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Dashboard
                        </Link>
                        <Link 
                            href="/leagues" 
                            className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Leagues
                        </Link>
                        <Link 
                            href="/picks" 
                            className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Picks
                        </Link>
                        <Link 
                            href="/profile" 
                            className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Profile
                        </Link>
                    </div>

                    {/* Legal Links */}
                    <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 mt-4 md:mt-0">
                        <Link 
                            href="/privacy" 
                            className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                            Privacy Policy
                        </Link>
                        <Link 
                            href="/terms" 
                            className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                            Terms & Conditions
                        </Link>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} FinalPoint. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
