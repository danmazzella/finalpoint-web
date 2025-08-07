'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { picksAPI, MemberPicksV2 } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import PageTitle from '@/components/PageTitle';
import BackToLeagueButton from '@/components/BackToLeagueButton';

export default function MemberPicksPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();

    const [memberPicks, setMemberPicks] = useState<MemberPicksV2 | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const leagueId = params.id as string;
    const weekNumber = params.week as string;
    const userId = params.userId as string;

    useEffect(() => {
        loadMemberPicks();
    }, [leagueId, weekNumber, userId]);

    const loadMemberPicks = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await picksAPI.getMemberPicksV2(
                parseInt(leagueId),
                parseInt(weekNumber),
                parseInt(userId)
            );

            if (response.data.success) {
                setMemberPicks(response.data.data);
            } else {
                setError('Failed to load member picks');
            }
        } catch (error) {
            console.error('Error loading member picks:', error);
            setError('Failed to load member picks');
        } finally {
            setLoading(false);
        }
    };

    const getPositionLabel = (position: number) => {
        const labels: { [key: number]: string } = {
            1: 'P1 (Winner)',
            2: 'P2 (Second)',
            3: 'P3 (Third)',
            4: 'P4',
            5: 'P5',
            6: 'P6',
            7: 'P7',
            8: 'P8',
            9: 'P9',
            10: 'P10',
            11: 'P11',
            12: 'P12',
            13: 'P13',
            14: 'P14',
            15: 'P15',
            16: 'P16',
            17: 'P17',
            18: 'P18',
            19: 'P19',
            20: 'P20'
        };
        return labels[position] || `P${position}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Member Picks</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Link
                        href={`/leagues/${leagueId}/results/${weekNumber}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Back to Results
                    </Link>
                </div>
            </div>
        );
    }

    if (!memberPicks) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No Member Picks Found</h2>
                    <p className="text-gray-600 mb-4">No picks available for this member.</p>
                    <Link
                        href={`/leagues/${leagueId}/results/${weekNumber}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Back to Results
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                <PageTitle
                    title={`${memberPicks.userName}'s Picks`}
                    subtitle={`Week ${memberPicks.weekNumber} • ${memberPicks.totalPicks} positions`}
                >
                    <Link
                        href={`/leagues/${leagueId}/results/${weekNumber}`}
                        className="inline-flex items-center text-xs px-3 py-1.5 sm:text-sm sm:px-4 sm:py-2 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Results
                    </Link>
                </PageTitle>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="bg-white shadow-lg rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Picks</p>
                                <p className="text-lg font-bold text-gray-900">{memberPicks.totalPicks}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-lg rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Correct Picks</p>
                                <p className="text-lg font-bold text-gray-900">{memberPicks.correctPicks}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-lg rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Accuracy</p>
                                <p className="text-lg font-bold text-gray-900">{memberPicks.accuracy}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-lg rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Points</p>
                                <p className="text-lg font-bold text-gray-900">{memberPicks.totalPoints}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actual Race Results Section */}
                <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Actual Race Results</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {memberPicks.picks.map((pick) => (
                            <div key={pick.position} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-500">
                                        {getPositionLabel(pick.position)}
                                    </span>
                                </div>
                                {pick.actualDriverName ? (
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {pick.actualDriverName}
                                        </p>
                                        <p className="text-xs text-gray-500">{pick.actualDriverTeam}</p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">No result available</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Member's Picks Section */}
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            All Picks for Week {memberPicks.weekNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {memberPicks.correctPicks} correct • {memberPicks.totalPoints} total points
                        </p>
                    </div>

                    {/* Desktop Grid */}
                    <div className="hidden md:block p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {memberPicks.picks.map((pick) => (
                                <div
                                    key={pick.position}
                                    className={`p-4 border-2 rounded-lg ${pick.isCorrect === null
                                        ? 'border-gray-300 bg-gray-50'
                                        : pick.isCorrect
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-red-500 bg-red-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-500">
                                            {getPositionLabel(pick.position)}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${pick.isCorrect === null
                                            ? 'bg-gray-100 text-gray-800'
                                            : pick.isCorrect
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {pick.points !== null ? `${pick.points} pts` : 'Not Scored'}
                                        </span>
                                    </div>

                                    <div className="mb-2">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {pick.driverName}
                                        </p>
                                        <p className="text-xs text-gray-500">{pick.driverTeam}</p>
                                        {pick.actualFinishPosition && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Actually finished: P{pick.actualFinishPosition}
                                            </p>
                                        )}
                                        {pick.isCorrect === null && !pick.actualFinishPosition && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Race not scored yet
                                            </p>
                                        )}
                                    </div>

                                    {pick.actualDriverId && pick.actualDriverId !== pick.driverId && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                            <p className="text-xs text-gray-500">Actual:</p>
                                            <p className="text-xs font-medium text-gray-700">
                                                {pick.actualDriverName} ({pick.actualDriverTeam})
                                            </p>
                                        </div>
                                    )}

                                    {pick.isCorrect && (
                                        <div className="mt-2 pt-2 border-t border-green-200">
                                            <p className="text-xs text-green-600 font-medium">✓ Correct!</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden">
                        <div className="space-y-4 p-4">
                            {memberPicks.picks.map((pick) => (
                                <div
                                    key={pick.position}
                                    className={`p-4 border-2 rounded-lg shadow-sm ${pick.isCorrect === null
                                        ? 'border-gray-300 bg-white'
                                        : pick.isCorrect
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-red-500 bg-red-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-gray-500">
                                            {getPositionLabel(pick.position)}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${pick.isCorrect === null
                                            ? 'bg-gray-100 text-gray-800'
                                            : pick.isCorrect
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {pick.points !== null ? `${pick.points} pts` : 'Not Scored'}
                                        </span>
                                    </div>

                                    <div className="mb-3">
                                        <p className="text-base font-semibold text-gray-900">
                                            {pick.driverName}
                                        </p>
                                        <p className="text-sm text-gray-500">{pick.driverTeam}</p>
                                        {pick.actualFinishPosition && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Actually finished: P{pick.actualFinishPosition}
                                            </p>
                                        )}
                                        {pick.isCorrect === null && !pick.actualFinishPosition && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Race not scored yet
                                            </p>
                                        )}
                                    </div>

                                    {pick.actualDriverId && pick.actualDriverId !== pick.driverId && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <p className="text-xs text-gray-500">Actual:</p>
                                            <p className="text-sm font-medium text-gray-700">
                                                {pick.actualDriverName} ({pick.actualDriverTeam})
                                            </p>
                                        </div>
                                    )}

                                    {pick.isCorrect && (
                                        <div className="mt-3 pt-3 border-t border-green-200">
                                            <p className="text-sm text-green-600 font-medium">✓ Correct!</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
