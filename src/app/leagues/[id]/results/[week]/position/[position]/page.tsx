'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { picksAPI, PositionResultV2 } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import PageTitle from '@/components/PageTitle';
import BackToLeagueButton from '@/components/BackToLeagueButton';

export default function PositionResultsPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();

    const [results, setResults] = useState<PositionResultV2 | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const leagueId = params.id as string;
    const weekNumber = params.week as string;
    const position = params.position as string;

    useEffect(() => {
        loadResults();
    }, [leagueId, weekNumber, position]);

    const loadResults = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await picksAPI.getResultsByPositionV2(
                parseInt(leagueId),
                parseInt(weekNumber),
                parseInt(position)
            );

            if (response.data.success) {
                setResults(response.data.data);
            } else {
                setError('Failed to load results');
            }
        } catch (error) {
            console.error('Error loading position results:', error);
            setError('Failed to load results');
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Results</h2>
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

    if (!results) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No Results Found</h2>
                    <p className="text-gray-600 mb-4">No results available for this position.</p>
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
                    title={`${getPositionLabel(results.position)} Results`}
                    subtitle={`Week ${results.weekNumber} • ${results.totalParticipants} participants`}
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

                {/* Actual Result Banner */}
                {results.actualResult && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-green-900">Actual Result</h2>
                                <p className="text-sm text-green-700">
                                    {results.actualResult.driverName} ({results.actualResult.driverTeam})
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {results.correctPicks} correct picks
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actual Result Section */}
                {results.actualResult && (
                    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Actual Race Result</h2>
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-green-600 font-medium text-lg">🏆</span>
                            </div>
                            <div>
                                <p className="text-lg font-medium text-gray-900">{results.actualResult.driverName}</p>
                                <p className="text-sm text-gray-500">{results.actualResult.driverTeam}</p>
                                <p className="text-xs text-gray-400">Finished in P{results.position}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Table */}
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            All Picks for {getPositionLabel(results.position)}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {results.totalParticipants} participants • {results.correctPicks} correct predictions
                        </p>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rank
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Member
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pick
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actual Finish
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Result
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Points
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.picks.map((pick, index) => (
                                    <tr key={pick.userId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {pick.userName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {pick.driverName} ({pick.driverTeam})
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {pick.actualFinishPosition ? `P${pick.actualFinishPosition}` : (pick.isCorrect === null ? 'Not Scored' : 'DNF')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pick.isCorrect === null
                                                ? 'bg-gray-100 text-gray-800'
                                                : pick.isCorrect
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {pick.isCorrect === null
                                                    ? 'Not Scored'
                                                    : pick.isCorrect
                                                        ? '✓ Correct'
                                                        : '✗ Wrong'
                                                }
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {pick.points !== null ? pick.points : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden">
                        <div className="space-y-4 p-4">
                            {results.picks.map((pick, index) => (
                                <div key={pick.userId} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center flex-1">
                                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-4 flex-shrink-0">
                                                <span className="font-bold text-sm text-gray-700">
                                                    #{index + 1}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-base font-semibold text-gray-900 truncate">{pick.userName}</div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {pick.driverName} ({pick.driverTeam})
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="text-center">
                                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Actual Finish</div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {pick.actualFinishPosition ? `P${pick.actualFinishPosition}` : (pick.isCorrect === null ? 'Not Scored' : 'DNF')}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Result</div>
                                            <div className={`text-sm font-medium ${pick.isCorrect === null
                                                ? 'text-gray-600'
                                                : pick.isCorrect
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                                }`}>
                                                {pick.isCorrect === null
                                                    ? 'Not Scored'
                                                    : pick.isCorrect
                                                        ? '✓ Correct'
                                                        : '✗ Wrong'
                                                }
                                            </div>
                                        </div>
                                        <div className="text-center col-span-2">
                                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Points</div>
                                            <div className="text-lg font-bold text-gray-900">
                                                {pick.points !== null ? pick.points : '-'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Participants</p>
                                <p className="text-2xl font-semibold text-gray-900">{results.totalParticipants}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Correct Picks</p>
                                <p className="text-2xl font-semibold text-gray-900">{results.correctPicks}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Success Rate</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {results.totalParticipants > 0
                                        ? Math.round((results.correctPicks / results.totalParticipants) * 100)
                                        : 0}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
