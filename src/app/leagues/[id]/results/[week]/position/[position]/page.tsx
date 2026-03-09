'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { picksAPI, PositionResultV2, f1racesAPI } from '@/lib/api';
import PageTitle from '@/components/PageTitle';
import Avatar from '@/components/Avatar';

export default function PositionResultsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [results, setResults] = useState<PositionResultV2 | null>(null);
    const [availablePositions, setAvailablePositions] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEventType, setSelectedEventType] = useState<'race' | 'sprint' | null>(null);
    const [eventTypeInitialized, setEventTypeInitialized] = useState(false);
    const [currentRace, setCurrentRace] = useState<any>(null);

    const leagueId = params.id as string;
    const weekNumber = params.week as string;
    const position = params.position as string;

    useEffect(() => {
        const eventTypeParam = searchParams.get('eventType');
        if (eventTypeParam === 'sprint' || eventTypeParam === 'race') {
            setSelectedEventType(eventTypeParam);
            setEventTypeInitialized(true);
        } else if (eventTypeParam === 'null' || eventTypeParam === null) {
            if (selectedEventType) setEventTypeInitialized(true);
        } else {
            setEventTypeInitialized(true);
        }
    }, [searchParams, selectedEventType]);

    useEffect(() => {
        if (currentRace?.hasSprint && !searchParams.get('eventType')) {
            setSelectedEventType('sprint');
        } else if (currentRace && !searchParams.get('eventType')) {
            setSelectedEventType('race');
        }
    }, [currentRace, searchParams]);

    useEffect(() => {
        if (selectedEventType) {
            const url = new URL(window.location.href);
            url.searchParams.set('eventType', selectedEventType);
            window.history.replaceState({}, '', url.toString());
        }
    }, [selectedEventType]);

    useEffect(() => {
        loadAvailablePositions();
        loadCurrentRace();
    }, [leagueId, weekNumber, position]);

    useEffect(() => {
        if (eventTypeInitialized && selectedEventType) loadResults();
    }, [selectedEventType, eventTypeInitialized]);

    const loadResults = async () => {
        if (!selectedEventType) return;
        try {
            setLoading(true);
            setError(null);
            const response = await picksAPI.getResultsByPositionV2(
                parseInt(leagueId), parseInt(weekNumber), parseInt(position), selectedEventType
            );
            if (response.data.success) setResults(response.data.data);
            else setError('Failed to load results');
        } catch {
            setError('Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    const loadAvailablePositions = async () => {
        try {
            const response = await picksAPI.getLeaguePositionsForWeek(parseInt(leagueId), parseInt(weekNumber));
            if (response.data.success) {
                setAvailablePositions((response.data.data.positions || []).sort((a: number, b: number) => a - b));
            }
        } catch { /* ignore */ }
    };

    const loadCurrentRace = async () => {
        try {
            const response = await f1racesAPI.getAllRaces();
            if (response.data.success) {
                setCurrentRace(response.data.data.find((race: any) => race.weekNumber === parseInt(weekNumber)));
            }
        } catch { /* ignore */ }
    };

    const getCurrentPositionIndex = () => availablePositions.findIndex(pos => pos === parseInt(position));
    const canPrev = () => getCurrentPositionIndex() > 0;
    const canNext = () => getCurrentPositionIndex() < availablePositions.length - 1;

    const navigateToPosition = (newPosition: number) => {
        const et = searchParams.get('eventType') || selectedEventType;
        router.replace(`/leagues/${leagueId}/results/${weekNumber}/position/${newPosition}${et ? `?eventType=${et}` : ''}`);
    };

    const navigateToPrevious = () => {
        const i = getCurrentPositionIndex();
        if (i > 0) navigateToPosition(availablePositions[i - 1]);
    };

    const navigateToNext = () => {
        const i = getCurrentPositionIndex();
        if (i < availablePositions.length - 1) navigateToPosition(availablePositions[i + 1]);
    };

    if (loading) {
        return (
            <div className="page-bg min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    if (error || !results) {
        return (
            <div className="page-bg min-h-screen flex items-center justify-center">
                <div className="glass-card p-8 text-center max-w-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">{error ? 'Error Loading Results' : 'No Results Found'}</h2>
                    <p className="text-sm text-gray-500 mb-5">{error || 'No results available for this position.'}</p>
                    <Link href={`/leagues/${leagueId}/results/${weekNumber}`} className="btn-primary text-sm py-2 px-4">
                        Back to Results
                    </Link>
                </div>
            </div>
        );
    }

    const successRate = results.totalParticipants > 0
        ? Math.round((results.correctPicks / results.totalParticipants) * 100)
        : 0;

    return (
        <div className="page-bg min-h-screen">
            <main className="max-w-3xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                <PageTitle
                    title={`P${results.position} Picks`}
                    subtitle={`Week ${results.weekNumber} · ${selectedEventType === 'sprint' ? 'Sprint' : 'Race'} · ${results.totalParticipants} participants`}
                >
                    <Link
                        href={`/leagues/${leagueId}/results/${weekNumber}`}
                        className="btn-ghost text-xs px-3 py-1.5 sm:text-sm sm:px-4 sm:py-2"
                    >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </Link>
                </PageTitle>

                {/* Position navigation */}
                <div className="glass-card p-4 mb-5 flex items-center gap-3">
                    <button
                        onClick={navigateToPrevious}
                        disabled={!canPrev()}
                        className={`btn-ghost text-sm py-1.5 px-3 flex items-center ${!canPrev() ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Prev
                    </button>
                    <div className="flex-1 flex items-center justify-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">
                            P{results.position}
                        </span>
                        <span className="text-sm font-medium text-gray-700">Position {results.position}</span>
                    </div>
                    <button
                        onClick={navigateToNext}
                        disabled={!canNext()}
                        className={`btn-ghost text-sm py-1.5 px-3 flex items-center ${!canNext() ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                        Next
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Actual result banner */}
                {results.actualResult && (
                    <div className="flex items-center gap-4 px-5 py-4 mb-5 rounded-2xl bg-green-50 border border-green-200">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-0.5">Actual P{results.position}</p>
                            <p className="text-sm font-bold text-green-900">{results.actualResult.driverName}</p>
                            <p className="text-xs text-green-700">{results.actualResult.driverTeam}</p>
                        </div>
                        <span className="badge badge-green flex-shrink-0">{results.correctPicks} correct</span>
                    </div>
                )}

                {/* Sprint toggle */}
                {currentRace?.hasSprint && (
                    <div className="glass-card p-3 mb-5 flex justify-center">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            {(['sprint', 'race'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedEventType(type)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        selectedEventType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {type === 'sprint' ? 'Sprint Results' : 'Race Results'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                        { label: 'Participants', value: results.totalParticipants, color: 'text-gray-900' },
                        { label: 'Correct', value: results.correctPicks, color: 'text-green-600' },
                        { label: 'Success Rate', value: `${successRate}%`, color: 'text-blue-600' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="glass-card p-3 text-center">
                            <div className={`text-xl font-bold ${color}`}>{value}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Picks list */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            All Picks — {selectedEventType === 'sprint' ? 'Sprint' : 'Race'}
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {results.picks.map((pick, index) => {
                            const scored = pick.isCorrect !== null;
                            const correct = pick.isCorrect === true;
                            const wrong = pick.isCorrect === false;

                            return (
                                <div key={pick.userId} className="flex items-center gap-4 px-5 py-4">
                                    {/* Avatar + rank badge */}
                                    <div className="relative flex-shrink-0">
                                        <Avatar src={pick.userAvatar} alt={pick.userName} size="sm" />
                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white ${
                                            index === 0 ? 'bg-yellow-500 text-white' :
                                            index === 1 ? 'bg-gray-400 text-white' :
                                            index === 2 ? 'bg-orange-600 text-white' :
                                            'bg-blue-600 text-white'
                                        }`}>
                                            {index + 1}
                                        </div>
                                    </div>

                                    {/* Name + pick */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{pick.userName}</p>
                                            {scored && (
                                                <span className={`text-xs ${correct ? 'text-green-600' : 'text-red-500'}`}>
                                                    {correct ? '✓' : '✗'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">
                                            {pick.driverName ? `${pick.driverName} · ${pick.driverTeam}` : 'No pick'}
                                        </p>
                                        {pick.actualFinishPosition && !correct && (
                                            <p className="text-xs text-gray-400 mt-0.5">Finished P{pick.actualFinishPosition}</p>
                                        )}
                                    </div>

                                    {/* Points */}
                                    <div className="flex-shrink-0 text-right">
                                        <p className={`text-lg font-bold ${correct ? 'text-green-600' : wrong ? 'text-red-500' : 'text-gray-900'}`}>
                                            {pick.points !== null ? pick.points : '—'}
                                        </p>
                                        <p className="text-xs text-gray-400">pts</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
