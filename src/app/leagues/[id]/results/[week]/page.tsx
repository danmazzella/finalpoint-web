'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { picksAPI, f1racesAPI, leaguesAPI, RaceResultV2 } from '@/lib/api';
import Link from 'next/link';
import BackToLeagueButton from '@/components/BackToLeagueButton';
import PageTitle from '@/components/PageTitle';
import Avatar from '@/components/Avatar';

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

    const getCurrentRace = () => {
        return races.find(race => race.weekNumber === selectedWeek);
    };

    const getCurrentRaceIndex = () => {
        return races.findIndex(race => race.weekNumber === selectedWeek);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
                            <p className="text-blue-600 font-semibold text-lg">
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
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
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
            <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                <PageTitle
                    title="Race Results"
                    subtitle={
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                            <span className="text-blue-600 font-semibold">
                                {league?.name || 'Loading...'}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-gray-600">
                                {currentRace ? currentRace.raceName : `Week ${selectedWeek}`} Results
                            </span>
                        </div>
                    }
                >
                    <BackToLeagueButton leagueId={leagueId} className="text-xs px-3 py-1.5 sm:text-sm sm:px-4 sm:py-2" />
                </PageTitle>

                {/* Week Navigation */}
                <div className="bg-white shadow rounded-lg p-4 mb-6">
                    {/* Mobile Week Navigation */}
                    <div className="md:hidden">
                        <div className="flex items-center justify-between mb-3">
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
                                Prev
                            </button>
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

                        <div className="relative">
                            <button
                                onClick={() => setShowWeekSelector(!showWeekSelector)}
                                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <div className="flex items-center">
                                    <span className="text-lg font-bold text-blue-600 mr-2">Week {selectedWeek}</span>
                                    <span className="text-gray-600 truncate">{currentRace?.raceName}</span>
                                </div>
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
                                            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${race.weekNumber === selectedWeek ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="font-medium">Week {race.weekNumber}</span>
                                                    <span className="text-gray-500 ml-2">- {race.raceName}</span>
                                                </div>
                                                {race.weekNumber === selectedWeek && (
                                                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Week {selectedWeek} of {races.length}</span>
                                <span>{Math.round((selectedWeek / races.length) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(selectedWeek / races.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Week Navigation */}
                    <div className="hidden md:flex items-center justify-between">
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
                                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <span className="flex items-center">
                                        <span className="text-lg font-bold text-blue-600 mr-2">Week {selectedWeek}</span>
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
                                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${race.weekNumber === selectedWeek ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="font-medium">Week {race.weekNumber}</span>
                                                        <span className="text-gray-500 ml-2">- {race.raceName}</span>
                                                    </div>
                                                    {race.weekNumber === selectedWeek && (
                                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
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
                </div>

                {/* Multiple Position Notice */}
                {requiredPositions.length > 1 && hasScoredResults && (
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                View Results by Position
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {requiredPositions.map((position) => (
                                <Link
                                    key={position}
                                    href={`/leagues/${leagueId}/results/${selectedWeek}/position/${position}`}
                                    className="group relative bg-white border-2 border-blue-300 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer shadow-sm"
                                >
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-700 mb-2">
                                            P{position}
                                        </div>
                                        <div className="mt-2 text-xs text-blue-600 flex items-center justify-center">
                                            <span>View Results</span>
                                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Multiple Position Notice for Unscored Events */}
                {requiredPositions.length > 1 && !hasScoredResults && results.length > 0 && (
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                View Picks by Position
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {requiredPositions.map((position) => (
                                <Link
                                    key={position}
                                    href={`/leagues/${leagueId}/results/${selectedWeek}/unscored-position/${position}`}
                                    className="group relative bg-white border-2 border-gray-300 rounded-lg p-4 hover:bg-gray-50 hover:border-gray-500 hover:shadow-md transition-all duration-200 cursor-pointer shadow-sm"
                                >
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-700 mb-1">
                                            P{position}
                                        </div>

                                        <div className="mt-2 text-xs text-gray-600 flex items-center justify-center">
                                            <span>View Picks</span>
                                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
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

                {/* Summary Stats */}
                <div className="bg-white shadow rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>

                    {/* Mobile Summary Stats */}
                    <div className="md:hidden">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{totalParticipants}</div>
                                <div className="text-xs text-gray-500">Participants</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{totalCorrect}</div>
                                <div className="text-xs text-gray-500">Correct Picks</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
                                <div className="text-xs text-gray-500">Total Points</div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Summary Stats */}
                    <div className="hidden md:grid grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">{totalParticipants}</div>
                            <div className="text-sm text-gray-500">Participants</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">{totalCorrect}</div>
                            <div className="text-sm text-gray-500">Correct Picks</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{totalPoints}</div>
                            <div className="text-sm text-gray-500">Total Points</div>
                        </div>
                    </div>
                </div>

                {/* Results Table */}
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">
                            {hasScoredResults ? 'All Results' : 'All Picks'}
                        </h2>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
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
                                    <tr key={`${result.userId}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="relative mr-3">
                                                    <Avatar
                                                        src={result.userAvatar}
                                                        alt={`${result.userName}'s avatar`}
                                                        size="md"
                                                    />
                                                    {hasScoredResults && (
                                                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm ${index === 0 ? 'bg-yellow-500 text-white' :
                                                            index === 1 ? 'bg-gray-400 text-white' :
                                                                index === 2 ? 'bg-orange-600 text-white' :
                                                                    'bg-blue-600 text-white'
                                                            }`}>
                                                            {index + 1}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">{result.userName}</div>
                                            </div>
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
                                                href={`/leagues/${leagueId}/results/${selectedWeek}/member/${result.userId}?memberIndex=${index}`}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                                            >
                                                View All Picks
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden">
                        <div className="space-y-4 p-4">
                            {results.map((result, index) => (
                                <div key={`${result.userId}-${index}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center flex-1">
                                            <div className="relative mr-4">
                                                <Avatar
                                                    src={result.userAvatar}
                                                    alt={`${result.userName}'s avatar`}
                                                    size="md"
                                                />
                                                {hasScoredResults && (
                                                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm ${index === 0 ? 'bg-yellow-500 text-white' :
                                                        index === 1 ? 'bg-gray-400 text-white' :
                                                            index === 2 ? 'bg-orange-600 text-white' :
                                                                'bg-blue-600 text-white'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-base font-semibold text-gray-900 truncate mb-1">{result.userName}</div>
                                                <div className="text-sm">
                                                    {result.hasMadeAllPicks ? (
                                                        <span className="inline-flex items-center text-green-600 font-medium">
                                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            All {requiredPositions.length} picks made
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-orange-600 font-medium">
                                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            {result.picks.filter(p => p.driverId !== null).length} of {requiredPositions.length} picks made
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {hasScoredResults && (
                                        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="text-center">
                                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Correct Picks</div>
                                                <div className="text-xl font-bold text-green-600">{result.totalCorrect}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Points</div>
                                                <div className="text-xl font-bold text-blue-600">{result.totalPoints}</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end">
                                        <Link
                                            href={`/leagues/${leagueId}/results/${selectedWeek}/member/${result.userId}?memberIndex=${index}`}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                                        >
                                            View All Picks
                                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 