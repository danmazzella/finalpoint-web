'use client';

import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 py-8">
            <div className="container mx-auto px-4">
                {/* Logo and Brand */}
                <div className="flex items-center justify-center mb-4">
                    <Logo size="sm" />
                    <span className="text-lg font-bold text-gray-900 ml-3">FinalPoint</span>
                </div>

                {/* Copyright */}
                <div className="text-center">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} FinalPoint. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
