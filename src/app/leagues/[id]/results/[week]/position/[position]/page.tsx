'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { picksAPI, PositionResultV2, f1racesAPI } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import PageTitle from '@/components/PageTitle';
import BackToLeagueButton from '@/components/BackToLeagueButton';
import Avatar from '@/components/Avatar';

export default function PositionResultsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();

    const [results, setResults] = useState<PositionResultV2 | null>(null);
    const [availablePositions, setAvailablePositions] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEventType, setSelectedEventType] = useState<'race' | 'sprint'>('race');
    const [currentRace, setCurrentRace] = useState<any>(null);

    const leagueId = params.id as string;
    const weekNumber = params.week as string;
    const position = params.position as string;

    // Handle eventType URL parameter
    useEffect(() => {
        const eventTypeParam = searchParams.get('eventType');
        if (eventTypeParam === 'sprint' || eventTypeParam === 'race') {
            setSelectedEventType(eventTypeParam);
        }
    }, [searchParams]);

    // Set default event type based on whether the race has a sprint
    useEffect(() => {
        if (currentRace?.hasSprint && !searchParams.get('eventType')) {
            setSelectedEventType('sprint');
        }
    }, [currentRace, searchParams]);

    // Update URL when selectedEventType changes
    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('eventType', selectedEventType);
        window.history.replaceState({}, '', url.toString());
    }, [selectedEventType]);

    useEffect(() => {
        loadResults();
        loadAvailablePositions();
        loadCurrentRace();
    }, [leagueId, weekNumber, position, selectedEventType]);

    const loadResults = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await picksAPI.getResultsByPositionV2(
                parseInt(leagueId),
                parseInt(weekNumber),
                parseInt(position),
                selectedEventType
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

    const loadAvailablePositions = async () => {
        try {
            const response = await picksAPI.getLeaguePositionsForWeek(parseInt(leagueId), parseInt(weekNumber));
            if (response.data.success) {
                // Sort positions in ascending order (P1, P2, P3, etc.)
                const sortedPositions = (response.data.data.positions || []).sort((a: number, b: number) => a - b);
                setAvailablePositions(sortedPositions);
            }
        } catch (error) {
            console.error('Error loading available positions:', error);
        }
    };

    const loadCurrentRace = async () => {
        try {
            console.log('DEBUG: Loading race data for week', weekNumber);
            const response = await f1racesAPI.getAllRaces();
            console.log('DEBUG: getAllRaces response:', response.data);
            if (response.data.success) {
                const currentRaceData = response.data.data.find((race: any) => race.weekNumber === parseInt(weekNumber));
                console.log('DEBUG: Found race data:', currentRaceData);
                setCurrentRace(currentRaceData);
            }
        } catch (error) {
            console.error('Error loading current race:', error);
        }
    };

    const navigateToPosition = (newPosition: number) => {
        // Use replace instead of push to avoid building up navigation stack
        router.replace(`/leagues/${leagueId}/results/${weekNumber}/position/${newPosition}`);
    };

    const getCurrentPositionIndex = () => {
        return availablePositions.findIndex(pos => pos === parseInt(position));
    };

    const canNavigatePrevious = () => {
        return getCurrentPositionIndex() > 0;
    };

    const canNavigateNext = () => {
        return getCurrentPositionIndex() < availablePositions.length - 1;
    };

    const navigateToPrevious = () => {
        const currentIndex = getCurrentPositionIndex();
        if (currentIndex > 0) {
            navigateToPosition(availablePositions[currentIndex - 1]);
        }
    };

    const navigateToNext = () => {
        const currentIndex = getCurrentPositionIndex();
        if (currentIndex < availablePositions.length - 1) {
            navigateToPosition(availablePositions[currentIndex + 1]);
        }
    };

    const getPositionLabel = (position: number) => {
        const labels: { [key: number]: string } = {
            1: 'P1',
            2: 'P2',
            3: 'P3',
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
            <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                <PageTitle
                    title="Picks By Position"
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

                {/* Position Context with Navigation */}
                <div className="mb-6">
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center justify-center">
                        <div className="flex items-center space-x-6">
                            {/* Previous Position Button */}
                            <button
                                onClick={navigateToPrevious}
                                disabled={!canNavigatePrevious()}
                                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${canNavigatePrevious()
                                    ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                                    : 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                                    }`}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Prev
                            </button>

                            {/* Current Position Badge */}
                            <div className="flex items-center">
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-lg font-bold bg-blue-600 text-white shadow-sm">
                                    {getPositionLabel(results.position)}
                                </span>
                                <span className="ml-4 text-base text-gray-600 font-medium">
                                    Viewing picks for {getPositionLabel(results.position)}
                                </span>
                            </div>

                            {/* Next Position Button */}
                            <button
                                onClick={navigateToNext}
                                disabled={!canNavigateNext()}
                                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${canNavigateNext()
                                    ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                                    : 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                                    }`}
                            >
                                Next
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden">
                        <div className="flex items-center justify-between px-4">
                            {/* Previous Position Button */}
                            <button
                                onClick={navigateToPrevious}
                                disabled={!canNavigatePrevious()}
                                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors min-w-[70px] ${canNavigatePrevious()
                                    ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                                    : 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                                    }`}
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Prev
                            </button>

                            {/* Current Position Badge and Label */}
                            <div className="flex flex-col items-center">
                                <span className="inline-flex items-center px-3 py-2 rounded-full text-base font-bold bg-blue-600 text-white shadow-sm">
                                    {getPositionLabel(results.position)}
                                </span>
                                <span className="mt-2 text-sm text-gray-600 text-center font-medium">
                                    Viewing picks for {getPositionLabel(results.position)}
                                </span>
                            </div>

                            {/* Next Position Button */}
                            <button
                                onClick={navigateToNext}
                                disabled={!canNavigateNext()}
                                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors min-w-[70px] ${canNavigateNext()
                                    ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                                    : 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                                    }`}
                            >
                                Next
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

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

                {/* Event Type Selector */}
                {console.log('DEBUG: currentRace =', currentRace, 'hasSprint =', currentRace?.hasSprint)}
                {currentRace?.hasSprint && (
                    <div className="bg-white shadow rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-center">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setSelectedEventType('sprint')}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${selectedEventType === 'sprint'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Sprint Results
                                </button>
                                <button
                                    onClick={() => setSelectedEventType('race')}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${selectedEventType === 'race'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Race Results
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Cards */}
                <div className="space-y-6">
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            All Picks for {getPositionLabel(results.position)}
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            {results.totalParticipants} participants • {results.correctPicks} correct predictions
                        </p>

                        <div className="space-y-4">
                            {results.picks.map((pick, index) => (
                                <div key={pick.userId} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center flex-1">
                                            {/* Avatar with Position Overlay */}
                                            <div className="relative mr-4">
                                                <Avatar
                                                    src={pick.userAvatar}
                                                    alt={`${pick.userName}'s avatar`}
                                                    size="md"
                                                />
                                                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm ${index === 0 ? 'bg-yellow-500 text-white' :
                                                    index === 1 ? 'bg-gray-400 text-white' :
                                                        index === 2 ? 'bg-orange-600 text-white' :
                                                            'bg-blue-600 text-white'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center mb-1">
                                                    <h4 className="text-lg font-semibold text-gray-900">{pick.userName}</h4>
                                                    {/* Status Icon */}
                                                    {results.actualResult && (
                                                        <span className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium ${pick.isCorrect === null
                                                            ? 'bg-gray-100 text-gray-600'
                                                            : pick.isCorrect
                                                                ? 'bg-green-100 text-green-600'
                                                                : 'bg-red-100 text-red-600'
                                                            }`}>
                                                            {pick.isCorrect === null
                                                                ? '?'
                                                                : pick.isCorrect
                                                                    ? '✓'
                                                                    : 'x'
                                                            }
                                                        </span>
                                                    )}
                                                </div>


                                                {/* Driver Pick Information */}
                                                <div className="text-xs text-gray-600 mb-2">
                                                    <span className="font-medium">Picked:</span> {pick.driverName} ({pick.driverTeam})
                                                </div>
                                            </div>
                                        </div>

                                        {/* Points Display */}
                                        <div className="text-right">
                                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">POINTS</div>
                                            <div className="text-3xl font-bold text-gray-900">
                                                {pick.points !== null ? pick.points : '-'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Stats */}
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div>
                                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">CORRECT PICKS</div>
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {pick.isCorrect ? '1' : '0'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">ACTUAL FINISH</div>
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {pick.actualFinishPosition ? `P${pick.actualFinishPosition}` : 'DNF'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Result Status - Now shown as icon next to username */}
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
