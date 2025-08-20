'use client';

import Link from 'next/link';
import Logo from './Logo';
import { CONTACT_EMAIL } from '@/lib/environment';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 py-8 mb-16 sm:mb-0">
            <div className="container mx-auto px-4">
                {/* Logo and Brand */}
                <div className="flex items-center justify-center mb-4">
                    <Logo size="sm" />
                    <span className="text-lg font-bold text-gray-900 ml-3">FinalPoint</span>
                </div>

                {/* Social and App Store Links */}
                <div className="flex justify-center mb-4 space-x-6">
                    {/* Reddit */}
                    <a
                        href="https://www.reddit.com/r/FinalPoint/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                        aria-label="Visit FinalPoint on Reddit"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                        </svg>
                    </a>

                    {/* App Store */}
                    <a
                        href="https://apps.apple.com/us/app/finalpoint/id6749827283"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-blue-500 transition-colors duration-200"
                        aria-label="Download FinalPoint on the App Store"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                        </svg>
                    </a>

                    {/* Google Play */}
                    <a
                        href="https://play.google.com/store/apps/details?id=com.finalpoint.mobile&hl=en_US"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-green-500 transition-colors duration-200"
                        aria-label="Download FinalPoint on Google Play"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 -960 960 960">
                            <path d="M40-240q9-107 65.5-197T256-580l-74-128q-6-9-3-19t13-15q8-5 18-2t16 12l74 128q86-36 180-36t180 36l74-128q6-9 16-12t18 2q10 5 13 15t-3 19l-74 128q94 53 150.5 143T920-240H40Zm240-110q21 0 35.5-14.5T330-400q0-21-14.5-35.5T280-450q-21 0-35.5 14.5T230-400q0 21 14.5 35.5T280-350Zm400 0q21 0 35.5-14.5T730-400q0-21-14.5-35.5T680-450q-21 0-35.5 14.5T630-400q0 21 14.5 35.5T680-350Z" />
                        </svg>
                    </a>

                    {/* Support/Contact */}
                    <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="text-gray-500 hover:text-indigo-500 transition-colors duration-200"
                        aria-label="Contact FinalPoint Support"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                    </a>
                </div>

                {/* Copyright */}
                <div className="text-center">
                    <p className="text-gray-500 text-sm">
                        {new Date().getFullYear()} FinalPoint.
                    </p>
                </div>
            </div>
        </footer>
    );
}
