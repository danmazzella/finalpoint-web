'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { CONTACT_EMAIL } from '@/lib/environment';

export default function MarketingPage() {
    const { user, isLoading } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo and Brand */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">FP</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">FinalPoint</span>
                        </div>

                        {/* Navigation */}
                        <nav className="flex items-center space-x-4">
                            <Link
                                href="/scoring"
                                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                            >
                                How It Works
                            </Link>
                            {!isLoading && (
                                <>
                                    {user ? (
                                        <Link
                                            href="/dashboard"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                        >
                                            Go to Dashboard
                                        </Link>
                                    ) : (
                                        <div className="flex items-center space-x-3">
                                            <Link
                                                href="/login"
                                                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                href="/signup"
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                            >
                                                Sign Up
                                            </Link>
                                        </div>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                            Predict F1 Races.
                            <br />
                            <span className="text-blue-600">Compete with Friends.</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Join the ultimate F1 prediction game. Make weekly predictions on race outcomes,
                            compete in private leagues, and track your performance against friends.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {!isLoading && (
                                <>
                                    {user ? (
                                        <Link
                                            href="/dashboard"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
                                        >
                                            Go to Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href="/signup"
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
                                            >
                                                Get Started Free
                                            </Link>
                                            <Link
                                                href="/login"
                                                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg text-lg font-semibold"
                                            >
                                                Sign In
                                            </Link>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose FinalPoint?</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            The most engaging F1 prediction game with features designed for true racing fans.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Private Leagues</h3>
                            <p className="text-gray-600">
                                Create or join private leagues with friends and family. Compete in a closed environment with people you know.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Scoring</h3>
                            <p className="text-gray-600">
                                Our sophisticated scoring system rewards accuracy and strategic thinking, not just lucky guesses.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Updates</h3>
                            <p className="text-gray-600">
                                Get instant notifications about race results, standings updates, and league activities.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Screenshots Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">See FinalPoint in Action</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Take a look at how easy it is to make predictions and track your performance.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Screenshot 1 - Dashboard */}
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Overview</h3>
                                <p className="text-gray-600 mb-4">
                                    View your leagues, upcoming races, and current standings at a glance.
                                </p>
                                <img
                                    src="/screenshots_3.png"
                                    alt="Dashboard Overview"
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Screenshot 2 - Picks */}
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Make Predictions</h3>
                                <p className="text-gray-600 mb-4">
                                    Select your drivers for each position and submit your predictions before the race.
                                </p>
                                <img
                                    src="/screenshots_2.png"
                                    alt="Make Predictions"
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Screenshot 3 - Results */}
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Race Results</h3>
                                <p className="text-gray-600 mb-4">
                                    See how your predictions performed and compare with other league members.
                                </p>
                                <img
                                    src="/screenshots_1.png"
                                    alt="Race Results"
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Predicting?</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of F1 fans who are already making predictions and competing in leagues.
                    </p>
                    {!isLoading && (
                        <>
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold inline-block"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        href="/signup"
                                        className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold"
                                    >
                                        Get Started Free
                                    </Link>
                                    <Link
                                        href="/scoring"
                                        className="border border-white text-white hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-semibold"
                                    >
                                        Learn More
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">FP</span>
                                </div>
                                <span className="text-lg font-bold">FinalPoint</span>
                            </div>
                            <p className="text-gray-400">
                                The ultimate F1 prediction game for racing fans.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Product</h3>
                            <ul className="space-y-2">
                                <li><Link href="/scoring" className="text-gray-300 hover:text-white">How It Works</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Support</h3>
                            <ul className="space-y-2">
                                <li><a href={`mailto:${CONTACT_EMAIL}`} className="text-gray-300 hover:text-white">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Legal</h3>
                            <ul className="space-y-2">
                                <li><Link href="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
                                <li><Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                        <p className="text-gray-400">&copy; 2025 FinalPoint. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
