'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { leaguesAPI } from '@/lib/api';
import Link from 'next/link';

export default function JoinLeaguePage() {
    const { user } = useAuth();
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleJoinLeague = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode.trim()) {
            setError('Please enter a join code');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const response = await leaguesAPI.joinByCode(joinCode.trim().toUpperCase());

            if (response.data.success) {
                setSuccess(`Successfully joined ${response.data.data.leagueName}!`);
                setJoinCode('');
                // Redirect to the league page after a short delay
                setTimeout(() => {
                    window.location.href = `/leagues/${response.data.data.leagueId}`;
                }, 2000);
            }
        } catch (error: unknown) {
            console.error('Error joining league:', error);
            const errorMessage = error && typeof error === 'object' && 'response' in error &&
                error.response && typeof error.response === 'object' && 'data' in error.response &&
                error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
                ? String(error.response.data.message)
                : 'Failed to join league. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Join League</h1>
                            <p className="text-gray-600">Enter a join code to join a league</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/dashboard"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">
                    {/* Join Form */}
                    <div className="bg-white shadow-lg rounded-xl p-8">
                        <h2 className="text-xl font-medium text-gray-900 mb-6">Enter Join Code</h2>

                        <form onSubmit={handleJoinLeague} className="space-y-6">
                            <div>
                                <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700 mb-3">
                                    Join Code
                                </label>
                                <input
                                    type="text"
                                    id="joinCode"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    placeholder="Enter 8-character code"
                                    maxLength={8}
                                    className="block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-center text-lg font-mono tracking-widest"
                                    disabled={loading}
                                />
                                <p className="mt-2 text-sm text-gray-500">
                                    Enter the 8-character join code provided by the league owner
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-800">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-green-800">{success}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !joinCode.trim()}
                                className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-lg text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Joining...
                                    </>
                                ) : (
                                    'Join League'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Help Section */}
                    <div className="mt-8 bg-white shadow-lg rounded-xl p-8">
                        <h3 className="text-xl font-medium text-gray-900 mb-6">How to Join a League</h3>
                        <div className="space-y-4 text-sm text-gray-600">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 text-sm font-bold">1</span>
                                </div>
                                <p>Ask the league owner for the 8-character join code</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 text-sm font-bold">2</span>
                                </div>
                                <p>Enter the code in the field above</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 text-sm font-bold">3</span>
                                </div>
                                <p>Click &quot;Join League&quot; to become a member</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 text-sm font-bold">4</span>
                                </div>
                                <p>You&apos;ll be redirected to the league page</p>
                            </div>
                        </div>
                    </div>

                    {/* Alternative Actions */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500 mb-4">Don&apos;t have a join code?</p>
                        <div className="space-y-3">
                            <Link
                                href="/leagues"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 shadow-sm"
                            >
                                Create Your Own League
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 