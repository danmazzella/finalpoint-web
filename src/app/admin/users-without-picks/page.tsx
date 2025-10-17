'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';

interface UserWithoutPicks {
    userId: number;
    userName: string;
    userEmail: string;
    userAvatar: string | null;
    leagues: Array<{
        leagueId: number;
        leagueName: string;
        leagueMemberCount: number;
        requiredPositions: string[];
        missingEventType: 'race' | 'sprint' | 'both' | 'unknown';
    }>;
}

function UsersWithoutPicksPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [weekNumber, setWeekNumber] = useState<number>(1);
    const [usersWithoutPicks, setUsersWithoutPicks] = useState<UserWithoutPicks[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize week number from query params
    useEffect(() => {
        const weekParam = searchParams.get('week');
        if (weekParam) {
            const week = parseInt(weekParam, 10);
            if (week >= 1 && week <= 24) {
                setWeekNumber(week);
            }
        }
    }, [searchParams]);

    const loadUsersWithoutPicks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await adminAPI.getUsersWithoutPicks(weekNumber);

            if (response.status === 200) {
                setUsersWithoutPicks(response.data.data);
            } else {
                setError('Failed to load users without picks');
            }
        } catch (error) {
            console.error('Error loading users without picks:', error);
            setError('Error loading users without picks');
        } finally {
            setLoading(false);
        }
    }, [weekNumber]);

    useEffect(() => {
        loadUsersWithoutPicks();
    }, [loadUsersWithoutPicks]);

    const formatRequiredPositions = (positions: string[]) => {
        return positions.map(pos => `P${pos}`).join(', ');
    };

    const getTotalMissingPicks = () => {
        return usersWithoutPicks.reduce((total, user) => total + user.leagues.length, 0);
    };

    const getUniqueUsers = () => {
        return usersWithoutPicks.length;
    };

    const handleWeekChange = (newWeek: number) => {
        setWeekNumber(newWeek);
        // Update URL with new week parameter (replace instead of push to avoid history buildup)
        const params = new URLSearchParams(searchParams.toString());
        params.set('week', newWeek.toString());
        router.replace(`?${params.toString()}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Users Without Picks</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Users who haven&apos;t made their picks for the selected week
                        </p>
                    </div>

                    {/* Week Selector */}
                    <div className="mt-4 sm:mt-0">
                        <label htmlFor="week-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Select Week
                        </label>
                        <select
                            id="week-select"
                            value={weekNumber}
                            onChange={(e) => handleWeekChange(parseInt(e.target.value))}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            {Array.from({ length: 24 }, (_, i) => i + 1).map((week) => (
                                <option key={week} value={week}>
                                    Week {week}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-blue-900">Total Users</p>
                                <p className="text-2xl font-bold text-blue-600">{getUniqueUsers()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-orange-900">Missing Picks</p>
                                <p className="text-2xl font-bold text-orange-600">{getTotalMissingPicks()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Users List */}
            {usersWithoutPicks.length === 0 && !loading && !error ? (
                <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">All users have made their picks!</h3>
                    <p className="mt-1 text-sm text-gray-500">No users are missing picks for Week {weekNumber}.</p>
                </div>
            ) : (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">
                            Users Missing Picks for Week {weekNumber}
                        </h2>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {usersWithoutPicks.map((user) => (
                            <div key={user.userId} className="p-6">
                                <div className="flex items-start space-x-4">
                                    {/* User Avatar */}
                                    <div className="flex-shrink-0">
                                        {user.userAvatar ? (
                                            <img
                                                className="h-12 w-12 rounded-full object-cover"
                                                src={user.userAvatar}
                                                alt={user.userName}
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-lg font-medium text-gray-600">
                                                    {user.userName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-lg font-medium text-gray-900 truncate">
                                                {user.userName}
                                            </h3>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {user.leagues.length} league{user.leagues.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">{user.userEmail}</p>

                                        {/* Leagues List */}
                                        <div className="mt-3 space-y-2">
                                            {user.leagues.map((league, index) => (
                                                <div key={`${user.userId}-${league.leagueId}-${league.missingEventType}-${index}`} className="bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-900">
                                                                {league.leagueName}
                                                            </h4>
                                                            <p className="text-xs text-gray-500">
                                                                {league.leagueMemberCount} member{league.leagueMemberCount !== 1 ? 's' : ''} •
                                                                Required: {formatRequiredPositions(league.requiredPositions)}
                                                            </p>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${league.missingEventType === 'both'
                                                                ? 'bg-red-100 text-red-800'
                                                                : league.missingEventType === 'race'
                                                                    ? 'bg-orange-100 text-orange-800'
                                                                    : league.missingEventType === 'sprint'
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {league.missingEventType === 'both'
                                                                    ? 'Missing Both'
                                                                    : league.missingEventType === 'race'
                                                                        ? 'Missing Race'
                                                                        : league.missingEventType === 'sprint'
                                                                            ? 'Missing Sprint'
                                                                            : 'Missing Picks'
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function UsersWithoutPicksPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        }>
            <UsersWithoutPicksPageContent />
        </Suspense>
    );
}
