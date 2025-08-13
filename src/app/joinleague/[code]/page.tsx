'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { leaguesAPI } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function JoinLeaguePage() {
    const { user, isLoading } = useAuth();
    const params = useParams();
    const joinCode = params.code as string;

    const [league, setLeague] = useState<{
        id: number;
        name: string;
        seasonYear: number;
        joinCode: string;
        memberCount: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [checkingMembership, setCheckingMembership] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isAlreadyMember, setIsAlreadyMember] = useState(false);

    useEffect(() => {
        if (joinCode) {
            loadLeague();
        }
    }, [joinCode, user, isLoading]);

    // Check if user is already a member when they're logged in
    useEffect(() => {
        if (user && league && !loading) {
            // Check if user is already a member of this league
            checkIfAlreadyMember();
        }
    }, [user, league, loading]);

    const checkIfAlreadyMember = async () => {
        if (!user || !league) return;

        try {
            setCheckingMembership(true);
            // Check if user is already a member by trying to get their picks for this league
            // This is a simple way to check membership without adding a new API endpoint
            const response = await leaguesAPI.getLeagueMembers(league.id);
            if (response.data.success) {
                const members = response.data.data;
                const isMember = members.some((member: { id: number }) => member.id === user.id);
                setIsAlreadyMember(isMember);
            }
        } catch (error) {
            // If we can't get members, assume user is not a member
            setIsAlreadyMember(false);
        } finally {
            setCheckingMembership(false);
        }
    };

    const loadLeague = async () => {
        try {
            setLoading(true);
            const response = await leaguesAPI.getLeagueByCode(joinCode);
            if (response.data.success) {
                setLeague(response.data.data);
            }
        } catch (error: unknown) {
            console.error('Error loading league:', error);
            console.error('Error details:', error && typeof error === 'object' && 'response' in error ? (error as { response?: { data?: unknown } }).response?.data : 'No response data');
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
        } catch (error: unknown) {
            console.error('Error joining league:', error);

            // Extract specific error message from backend response
            let errorMessage = 'Failed to join league. Please try again.';

            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as { response?: { data?: { errors?: Array<{ message: string }>, message?: string } } };

                if (apiError.response?.data?.errors && apiError.response.data.errors.length > 0) {
                    // Backend uses ErrorClass format with errors array
                    const backendError = apiError.response.data.errors[0];
                    errorMessage = backendError.message;
                } else if (apiError.response?.data?.message) {
                    // Fallback to direct message if available
                    errorMessage = apiError.response.data.message;
                }
            }

            setError(errorMessage);
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading league information...</p>
                </div>
            </div>
        );
    }

    if (error && !league) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">League Not Found</h1>
                        <p className="text-gray-600 mt-2">The league you&apos;re looking for doesn&apos;t exist or the join code is invalid.</p>
                        <Link
                            href="/join"
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Join a Different League
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Join League</h1>
                            <p className="text-gray-600">You&apos;ve been invited to join a league</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <Link
                                        href="/signup"
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Sign Up
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        Login
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* League Information */}
                    <div className="bg-white shadow-lg rounded-xl p-8 mb-8">
                        <div className="text-center mb-8">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6">
                                <span className="text-white font-bold text-2xl">{league?.name?.charAt(0).toUpperCase()}</span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">{league?.name}</h2>
                            <p className="text-lg text-gray-600">Season {league?.seasonYear}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                            <div className="text-center bg-gray-50 rounded-lg p-4">
                                <dt className="text-sm font-medium text-gray-500 mb-2">Join Code</dt>
                                <dd className="text-xl font-mono text-gray-900 tracking-widest bg-white px-3 py-2 rounded border">{league?.joinCode}</dd>
                            </div>
                            <div className="text-center bg-gray-50 rounded-lg p-4">
                                <dt className="text-sm font-medium text-gray-500 mb-2">Members</dt>
                                <dd className="text-2xl font-bold text-gray-900">{league?.memberCount ?? 0}</dd>
                            </div>
                            <div className="text-center bg-gray-50 rounded-lg p-4">
                                <dt className="text-sm font-medium text-gray-500 mb-2">Status</dt>
                                <dd className="text-lg font-medium text-green-600">Active</dd>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-blue-800 mb-2">About This League</h3>
                                    <p className="text-blue-700">
                                        This is an F1 prediction game where members make weekly predictions on which driver will finish in specific positions.
                                        Compete with friends and family to see who can predict the most accurate race outcomes!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
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
                            <div className="text-center space-y-4">
                                <p className="text-lg text-gray-700">Ready to join this exciting league?</p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Link
                                        href={`/signup?redirect=/joinleague/${joinCode}`}
                                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                                    >
                                        Sign Up & Join
                                    </Link>
                                    <Link
                                        href={`/login?redirect=/joinleague/${joinCode}`}
                                        className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                                    >
                                        Login & Join
                                    </Link>
                                </div>
                                <p className="text-sm text-gray-500 mt-4">
                                    Already have an account? <Link href={`/login?redirect=/joinleague/${joinCode}`} className="text-blue-600 hover:text-blue-700 font-medium">Login here</Link>
                                </p>
                            </div>
                        ) : (
                            <div className="text-center space-y-4">
                                {checkingMembership ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="text-gray-600">Checking membership...</span>
                                    </div>
                                ) : isAlreadyMember ? (
                                    <>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-blue-800 font-medium">You&apos;re already a member of this league!</span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/leagues/${league?.id}`}
                                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                                        >
                                            Go to League
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-lg text-gray-700">Ready to join the league!</p>
                                        <button
                                            onClick={handleJoinLeague}
                                            disabled={joining}
                                            className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {joining ? (
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
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white shadow-lg rounded-xl p-8">
                        <h3 className="text-xl font-medium text-gray-900 mb-6">How It Works</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 text-sm font-bold">1</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Make Predictions</h4>
                                        <p className="text-sm text-gray-600">Each week, predict which F1 driver will finish in specific positions</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 text-sm font-bold">2</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Earn Points</h4>
                                        <p className="text-sm text-gray-600">Score points for correct predictions and climb the leaderboard</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 text-sm font-bold">3</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Compete</h4>
                                        <p className="text-sm text-gray-600">Challenge friends and family in your private league</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 text-sm font-bold">4</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Track Progress</h4>
                                        <p className="text-sm text-gray-600">View standings and monitor your performance throughout the season</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <Link href="/scoring" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                                Learn more about the scoring system
                                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
