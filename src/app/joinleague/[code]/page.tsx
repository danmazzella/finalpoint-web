'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { leaguesAPI } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function JoinLeaguePage() {
    const { user } = useAuth();
    const params = useParams();
    const joinCode = params.code as string;

    const [league, setLeague] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (joinCode) {
            loadLeague();
        }
    }, [joinCode]);

    // Check if user is already a member when they're logged in
    useEffect(() => {
        if (user && league && !loading) {
            // You could add an API call here to check if user is already a member
            // For now, we'll just show the join button
        }
    }, [user, league, loading]);

    const loadLeague = async () => {
        try {
            setLoading(true);
            console.log('Loading league with join code:', joinCode);
            const response = await leaguesAPI.getLeagueByCode(joinCode);
            console.log('API response:', response.data);
            if (response.data.success) {
                setLeague(response.data.data);
            }
        } catch (error: any) {
            console.error('Error loading league:', error);
            console.error('Error details:', error.response?.data);
            setError('League not found or invalid join code');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinLeague = async () => {
        if (!user) {
            // Redirect to login if not authenticated
            window.location.href = `/login?redirect=/joinleague/${joinCode}`;
            return;
        }

        try {
            setJoining(true);
            setError('');
            setSuccess('');

            const response = await leaguesAPI.joinByCode(joinCode);

            if (response.data.success) {
                setSuccess(`Successfully joined ${response.data.data.leagueName}!`);
                // Redirect to the league page after a short delay
                setTimeout(() => {
                    window.location.href = `/leagues/${response.data.data.leagueId}`;
                }, 2000);
            }
        } catch (error: any) {
            console.error('Error joining league:', error);
            setError(error.response?.data?.message || 'Failed to join league. Please try again.');
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    if (error && !league) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">League Not Found</h1>
                        <p className="text-gray-600 mt-2">The league you're looking for doesn't exist or the join code is invalid.</p>
                        <Link
                            href="/join"
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                        >
                            Join a Different League
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Join League</h1>
                            <p className="text-gray-600">You've been invited to join a league</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="text-pink-600 hover:text-pink-700 font-medium"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="text-pink-600 hover:text-pink-700 font-medium"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    {/* League Information */}
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <div className="text-center mb-6">
                            <div className="h-16 w-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
                                <span className="text-pink-600 font-bold text-xl">{league?.name?.charAt(0).toUpperCase()}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">{league?.name}</h2>
                            <p className="text-gray-600">Season {league?.seasonYear}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div className="text-center">
                                <dt className="text-sm font-medium text-gray-500">Join Code</dt>
                                <dd className="mt-1 text-lg font-mono text-gray-900 tracking-widest">{league?.joinCode}</dd>
                            </div>
                            <div className="text-center">
                                <dt className="text-sm font-medium text-gray-500">Members</dt>
                                <dd className="mt-1 text-lg font-medium text-gray-900">{league?.memberCount || 1}</dd>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">About This League</h3>
                                    <p className="text-sm text-blue-700 mt-1">
                                        This is an F1 prediction game. Members make weekly predictions on which driver will finish in specific positions.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
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
                            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
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

                        {!user ? (
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-4">You need to be logged in to join this league</p>
                                <Link
                                    href={`/login?redirect=/joinleague/${joinCode}`}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                                >
                                    Login to Join
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-4">Ready to join the league!</p>
                                <button
                                    onClick={handleJoinLeague}
                                    disabled={joining}
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {joining ? 'Joining...' : 'Join League'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">How It Works</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                            <p>• Each week, predict which F1 driver will finish in 10th place</p>
                            <p>• Earn points for correct predictions</p>
                            <p>• Compete with other league members</p>
                            <p>• View standings and track your performance</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
