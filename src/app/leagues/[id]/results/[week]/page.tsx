'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { picksAPI, f1racesAPI, leaguesAPI, RaceResultV2 } from '@/lib/api';
import Link from 'next/link';

interface Race {
    id: number;
    weekNumber: number;
    raceName: string;
    status: string;
}

interface League {
    id: number;
    name: string;
    description?: string;
    ownerId: number;
    joinCode: string;
    memberCount: number;
    requiredPositions?: number[];
}

export default function RaceResultsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { showToast } = useToast();

    const leagueId = params.id as string;
    const weekNumber = params.week as string;

    const [results, setResults] = useState<RaceResultV2[]>([]);
    const [loading, setLoading] = useState(true);
    const [races, setRaces] = useState<Race[]>([]);
    const [selectedWeek, setSelectedWeek] = useState(parseInt(weekNumber));
    const [showWeekSelector, setShowWeekSelector] = useState(false);
    const [league, setLeague] = useState<League | null>(null);
    const [requiredPositions, setRequiredPositions] = useState<number[]>([10]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedWeekRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (user) {
            loadLeague();
            loadRaces();
            loadRaceResults();
        }
    }, [user, leagueId, selectedWeek]);

    const loadLeague = async () => {
        try {
            const response = await leaguesAPI.getLeague(parseInt(leagueId));
            if (response.data.success) {
                setLeague(response.data.data);
            }
        } catch (error) {
            console.error('Error loading league:', error);
        }
    };

    const loadRaces = async () => {
        try {
            const response = await f1racesAPI.getAllRaces();
            if (response.data.success) {
                setRaces(response.data.data);
            }
        } catch (error) {
            console.error('Error loading races:', error);
        }
    };

    const loadRaceResults = async () => {
        try {
            setLoading(true);
            const response = await picksAPI.getRaceResultsV2(parseInt(leagueId), selectedWeek);
            if (response.data.success) {
                // The API returns an object with a 'results' property containing the array
                setResults(response.data.data.results || []);
            }
        } catch (error: unknown) {
            console.error('Error loading race results:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to load race results';
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadRequiredPositions = async () => {
        try {
            const response = await picksAPI.getLeaguePositions(parseInt(leagueId));
            if (response.data.success) {
                setRequiredPositions(response.data.data);
            }
        } catch (error) {
            console.error('Error loading required positions:', error);
        }
    };

    useEffect(() => {
        loadRequiredPositions();
    }, [leagueId]);

    const handleWeekChange = (week: number) => {
        setSelectedWeek(week);
        setShowWeekSelector(false);
        router.push(`/leagues/${leagueId}/results/${week}`);
    };

    // Auto-scroll to selected week when dropdown opens
    useEffect(() => {
        if (showWeekSelector && selectedWeekRef.current) {
            // Small delay to ensure the dropdown is fully rendered
            setTimeout(() => {
                console.log('Auto-scrolling to selected week:', selectedWeek);
                selectedWeekRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 100);
        }
    }, [showWeekSelector, selectedWeek]);

    const goToPreviousWeek = () => {
        const currentIndex = races.findIndex(race => race.weekNumber === selectedWeek);
        if (currentIndex > 0) {
            handleWeekChange(races[currentIndex - 1].weekNumber);
        }
    };

    const goToNextWeek = () => {
        const currentIndex = races.findIndex(race => race.weekNumber === selectedWeek);
        if (currentIndex < races.length - 1) {
            handleWeekChange(races[currentIndex + 1].weekNumber);
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

    const getCurrentRace = () => {
        return races.find(race => race.weekNumber === selectedWeek);
    };

    const getCurrentRaceIndex = () => {
        return races.findIndex(race => race.weekNumber === selectedWeek);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    if (!results || results.length === 0) {
        const currentRace = getCurrentRace();
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto">
                    <div className="bg-white shadow rounded-lg p-8">
                        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Race Results Available</h2>
                        <div className="mb-4">
                            <p className="text-pink-600 font-semibold text-lg">
                                {league?.name || 'Loading...'}
                            </p>
                        </div>
                        <p className="text-gray-600 mb-6">
                            {currentRace ? (
                                <>No results are available for <strong>{currentRace.raceName}</strong> (Week {selectedWeek}). The race may not have finished yet or results haven&apos;t been entered.</>
                            ) : (
                                <>No results are available for Week {selectedWeek}. The race may not have finished yet or results haven&apos;t been entered.</>
                            )}
                        </p>
                        <div className="flex space-x-3 justify-center">
                            <Link
                                href={`/leagues/${leagueId}`}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Back to League
                            </Link>
                            <button
                                onClick={() => handleWeekChange(1)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                            >
                                View Week 1
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentRace = getCurrentRace();
    const currentIndex = getCurrentRaceIndex();
    const canGoPrevious = currentIndex > 0;
    const canGoNext = currentIndex < races.length - 1;

    // Calculate summary stats
    const totalParticipants = results.length;
    const totalPoints = results.reduce((sum, result) => sum + result.totalPoints, 0);
    const totalCorrect = results.reduce((sum, result) => sum + result.totalCorrect, 0);
    const hasScoredResults = results.some(result => result.picks.some(pick => pick.actualDriverName));

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Race Results</h1>
                            <div className="flex items-center space-x-2 text-gray-600">
                                <span className="text-pink-600 font-semibold">
                                    {league?.name || 'Loading...'}
                                </span>
                                <span>•</span>
                                <span>
                                    {currentRace ? currentRace.raceName : `Week ${selectedWeek}`} Results
                                </span>
                            </div>
                        </div>
                        <Link
                            href={`/leagues/${leagueId}`}
                            className="text-pink-600 hover:text-pink-700 font-medium"
                        >
                            ← Back to League
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Week Navigation */}
                <div className="bg-white shadow rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        {/* Previous Button */}
                        <button
                            onClick={goToPreviousWeek}
                            disabled={!canGoPrevious}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${canGoPrevious
                                ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                                }`}
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous
                        </button>

                        {/* Week Selector */}
                        <div className="flex-1 mx-4">
                            <div className="relative">
                                <button
                                    onClick={() => setShowWeekSelector(!showWeekSelector)}
                                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    <span className="flex items-center">
                                        <span className="text-lg font-bold text-pink-600 mr-2">Week {selectedWeek}</span>
                                        <span className="text-gray-600">{currentRace?.raceName}</span>
                                    </span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Week Selector Dropdown */}
                                {showWeekSelector && (
                                    <div ref={dropdownRef} className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {races.map((race) => (
                                            <button
                                                key={race.weekNumber}
                                                ref={race.weekNumber === selectedWeek ? selectedWeekRef : null}
                                                onClick={() => handleWeekChange(race.weekNumber)}
                                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${race.weekNumber === selectedWeek ? 'bg-pink-50 text-pink-700' : 'text-gray-700'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="font-medium">Week {race.weekNumber}</span>
                                                        <span className="text-gray-500 ml-2">- {race.raceName}</span>
                                                    </div>
                                                    {race.weekNumber === selectedWeek && (
                                                        <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={goToNextWeek}
                            disabled={!canGoNext}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${canGoNext
                                ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                                }`}
                        >
                            Next
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Week Progress */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Week {currentIndex + 1} of {races.length}</span>
                            <span>{Math.round(((currentIndex + 1) / races.length) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-pink-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${((currentIndex + 1) / races.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Multiple Position Notice */}
                {requiredPositions.length > 1 && hasScoredResults && (
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                View Results by Position
                            </h3>
                            <p className="text-sm text-gray-600">
                                This league requires picks for multiple positions. Click on a position to see all members&apos; picks for that specific position.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {requiredPositions.map((position) => (
                                <Link
                                    key={position}
                                    href={`/leagues/${leagueId}/results/${selectedWeek}/position/${position}`}
                                    className="group relative bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 rounded-lg p-4 hover:from-pink-100 hover:to-pink-200 hover:border-pink-300 transition-all duration-200"
                                >
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-pink-600 mb-1">
                                            P{position}
                                        </div>
                                        <div className="text-xs text-pink-700 font-medium">
                                            {getPositionLabel(position).split(' ')[1] || 'Position'}
                                        </div>
                                        <div className="mt-2 text-xs text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Results →
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actual Race Results Section */}
                {hasScoredResults && (
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Actual Race Results</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {requiredPositions.map((position) => {
                                // Find the first result that has actual data for this position
                                const positionResult = results.find(result =>
                                    result.picks.some(pick =>
                                        pick.position === position && pick.actualDriverName
                                    )
                                );
                                const actualPick = positionResult?.picks.find(pick => pick.position === position);

                                return (
                                    <div key={position} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-500">
                                                {getPositionLabel(position)}
                                            </span>
                                        </div>
                                        {actualPick?.actualDriverName ? (
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {actualPick.actualDriverName}
                                                </p>
                                                <p className="text-xs text-gray-500">{actualPick.actualDriverTeam}</p>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No result available</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Summary Stats */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{totalParticipants}</p>
                            <p className="text-sm text-gray-500">Participants</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{totalCorrect}</p>
                            <p className="text-sm text-gray-500">Total Correct Picks</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{totalPoints}</p>
                            <p className="text-sm text-gray-500">Total Points</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">
                                {totalParticipants > 0 ? Math.round((totalCorrect / (totalParticipants * requiredPositions.length)) * 100) : 0}%
                            </p>
                            <p className="text-sm text-gray-500">Overall Accuracy</p>
                        </div>
                    </div>
                </div>

                {/* Not Scored Message */}
                {!hasScoredResults && results.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-blue-800">
                                    Race not scored yet
                                </p>
                                <p className="text-sm text-blue-700 mt-1">
                                    The race results haven&apos;t been entered yet. Picks will be scored once the race finishes.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">
                            {hasScoredResults ? 'All Results' : 'All Picks'}
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {hasScoredResults && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rank
                                        </th>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Picks Made
                                    </th>
                                    {hasScoredResults && (
                                        <>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Correct Picks
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Points
                                            </th>
                                        </>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.map((result, index) => (
                                    <tr key={result.userId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        {hasScoredResults && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${index === 0 ? 'bg-yellow-100' :
                                                        index === 1 ? 'bg-gray-100' :
                                                            index === 2 ? 'bg-orange-100' : 'bg-gray-100'
                                                        }`}>
                                                        <span className={`font-medium text-sm ${index === 0 ? 'text-yellow-600' :
                                                            index === 1 ? 'text-gray-600' :
                                                                index === 2 ? 'text-orange-600' : 'text-gray-600'
                                                            }`}>
                                                            {index + 1}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{result.userName}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {result.hasMadeAllPicks ? (
                                                    <span className="text-green-600 font-medium">All {requiredPositions.length} picks made</span>
                                                ) : (
                                                    <span className="text-orange-600 font-medium">
                                                        {result.picks.filter(p => p.driverId !== null).length} of {requiredPositions.length} picks made
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        {hasScoredResults && (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{result.totalCorrect}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{result.totalPoints}</div>
                                                </td>
                                            </>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/leagues/${leagueId}/results/${selectedWeek}/member/${result.userId}`}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-pink-700 bg-pink-100 hover:bg-pink-200"
                                            >
                                                View All Picks
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
} 