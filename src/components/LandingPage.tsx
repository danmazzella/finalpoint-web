'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const { user } = useAuth();
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <main className="max-w-7xl mx-auto px-4 py-2 sm:px-6 sm:py-4 lg:px-8">
                {/* Hero Section */}
                <div className="text-center py-8">
                    <div className="mb-6">
                        <h1 className="text-5xl font-bold text-gray-900 mb-4">
                            Welcome to <span className="text-blue-600">FinalPoint</span>
                        </h1>
                        <p className="text-2xl text-gray-600 mb-6 max-w-3xl mx-auto">
                            The ultimate F1 prediction game where you compete with friends to predict race outcomes
                        </p>
                        <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
                            Make picks for driver positions, compete in leagues, and see how your predictions stack up against the competition.
                            {!user && " No signup required to explore!"}
                        </p>
                    </div>

                    {/* Primary CTA Buttons */}
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center items-center mb-8">
                        {!user ? (
                            <>
                                <button
                                    onClick={() => router.push('/signup')}
                                    className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-w-[180px]"
                                >
                                    Get Started Free
                                </button>
                                <button
                                    onClick={() => router.push('/login')}
                                    className="inline-flex items-center justify-center px-10 py-4 border-2 border-gray-300 text-lg font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 min-w-[180px]"
                                >
                                    Sign In
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-w-[180px]"
                            >
                                Go to Dashboard
                            </button>
                        )}
                    </div>
                </div>

                {/* Features Section */}
                <div className="py-8 border-t border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">What Makes FinalPoint Special?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Scoring System</h3>
                            <p className="text-gray-600">Earn points based on how close your predictions are to actual race results</p>
                        </div>

                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Private & Public Leagues</h3>
                            <p className="text-gray-600">Create your own league or join existing ones to compete with friends and strangers</p>
                        </div>

                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Engaging Stats</h3>
                            <p className="text-gray-600">View both personal and platform stats with more coming</p>
                        </div>
                    </div>
                </div>

                {/* Quick Explore Section */}
                <div className="py-8 border-t border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Explore FinalPoint</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="group p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-200 text-left relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-blue-500 group-hover:border-t-blue-600 transition-colors duration-200"></div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-200">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-200">Dashboard</h3>
                            <p className="text-sm text-gray-600 mb-3">See platform statistics and explore public leagues</p>
                            <div className="flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors duration-200">
                                <span>Go to Dashboard</span>
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>

                        <button
                            onClick={() => router.push('/leagues')}
                            className="group p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-green-400 hover:shadow-xl transition-all duration-200 text-left relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-green-500 group-hover:border-t-green-600 transition-colors duration-200"></div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors duration-200">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors duration-200">Browse Leagues</h3>
                            <p className="text-sm text-gray-600 mb-3">Discover public leagues and see what&apos;s available</p>
                            <div className="flex items-center text-green-600 font-medium text-sm group-hover:text-green-700 transition-colors duration-200">
                                <span>Browse Leagues</span>
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>

                        <button
                            onClick={() => router.push('/picks')}
                            className="group p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-orange-400 hover:shadow-xl transition-all duration-200 text-left relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-orange-500 group-hover:border-t-orange-600 transition-colors duration-200"></div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors duration-200">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-700 transition-colors duration-200">View Picks</h3>
                            <p className="text-sm text-gray-600 mb-3">See how predictions work and explore the picks interface</p>
                            <div className="flex items-center text-orange-600 font-medium text-sm group-hover:text-orange-700 transition-colors duration-200">
                                <span>View Picks</span>
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>

                        <button
                            onClick={() => router.push('/scoring')}
                            className="group p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-400 hover:shadow-xl transition-all duration-200 text-left relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-purple-500 group-hover:border-t-purple-600 transition-colors duration-200"></div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors duration-200">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors duration-200">Scoring System</h3>
                            <p className="text-sm text-gray-600 mb-3">Learn how points are calculated and strategies</p>
                            <div className="flex items-center text-purple-600 font-medium text-sm group-hover:text-purple-700 transition-colors duration-200">
                                <span>Learn Scoring</span>
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile App Download Section */}
                <div className="py-8 border-t border-gray-200 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Download FinalPoint Mobile</h2>
                    <p className="text-lg text-gray-600 mb-6">Make predictions on the go!</p>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center items-center">
                        <a
                            href="https://apps.apple.com/us/app/finalpoint/id6749827283"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-w-[200px]"
                        >
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                            Download iOS
                        </a>
                        <a
                            href="https://play.google.com/store/apps/details?id=com.finalpoint.mobile&hl=en_US"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-w-[200px]"
                        >
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 -960 960 960">
                                <path d="M40-240q9-107 65.5-197T256-580l-74-128q-6-9-3-19t13-15q8-5 18-2t16 12l74 128q86-36 180-36t180 36l74-128q6-9 16-12t18 2q10 5 13 15t-3 19l-74 128q94 53 150.5 143T920-240H40Zm240-110q21 0 35.5-14.5T330-400q0-21-14.5-35.5T280-450q-21 0-35.5 14.5T230-400q0 21 14.5 35.5T280-350Zm400 0q21 0 35.5-14.5T730-400q0-21-14.5-35.5T680-450q-21 0-35.5 14.5T630-400q0 21 14.5 35.5T680-350Z" />
                            </svg>
                            Download Android
                        </a>
                    </div>
                </div>

                {/* Why FinalPoint Section */}
                <div className="py-6 border-t border-gray-200">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Why &apos;FinalPoint&apos;?</h2>
                        <p className="text-gray-700 text-lg">
                            In Formula 1, P10 is the last position that earns points - the <strong>final point</strong> available in a race.
                            Just like in F1 where every point matters, your predictions can make the difference between
                            victory and defeat in this prediction game.
                        </p>
                    </div>
                </div>

                {/* Bottom CTA Section */}
                <div className="py-6 border-t border-gray-200 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Predicting?</h2>
                    <p className="text-lg text-gray-600 mb-6">Join thousands of F1 fans making predictions and competing in leagues</p>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center items-center">
                        {!user ? (
                            <button
                                onClick={() => router.push('/signup')}
                                className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-w-[200px]"
                            >
                                Create Free Account
                            </button>
                        ) : (
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-w-[200px]"
                            >
                                Go to Dashboard
                            </button>
                        )}
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="inline-flex items-center justify-center px-10 py-4 border-2 border-gray-300 text-lg font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 min-w-[200px]"
                        >
                            Explore More
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
