'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import {
    picksAPI,
    driversAPI,
    leaguesAPI,
    f1racesAPI,
    Driver,
    League,
    PickV2,
    UserPickV2
} from '@/lib/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ComprehensiveNotificationPrompt } from '@/components/ComprehensiveNotificationPrompt';
import DriverSelectionModal from '@/components/DriverSelectionModal';
import { formatTimeRemainingLocal } from '@/utils/timeUtils';

interface CurrentRace {
    weekNumber: number;
    raceName: string;
    raceDate: string;
    status: string;
    circuitName: string;
    country: string;
    picksLocked: boolean;
    lockMessage: string;
    timeUntilLock: number;
    qualifyingDate?: string;
    showCountdown?: boolean;
    lockTime?: string; // Added for new countdown logic
    hasSprint?: boolean; // Added for sprint race support
}

function PicksV2Form() {
    const { user, isLoading: authLoading } = useAuth();
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const leagueId = searchParams.get('league');

    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [selectedLeague, setSelectedLeague] = useState<string>(leagueId || '');
    const [currentWeek, setCurrentWeek] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentRace, setCurrentRace] = useState<CurrentRace | null>(null);
    const [requiredPositions, setRequiredPositions] = useState<number[]>([10]);
    const [userPicks, setUserPicks] = useState<Map<number, number>>(new Map()); // position -> driverId
    const [sprintPicks, setSprintPicks] = useState<Map<number, number>>(new Map()); // position -> driverId
    const [showDriverModal, setShowDriverModal] = useState(false);
    const [modalPosition, setModalPosition] = useState<number>(0);
    const [modalEventType, setModalEventType] = useState<'race' | 'sprint'>('race');

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            setLeagues([]);
            return;
        }
        loadData();
    }, [user, authLoading]);

    const loadData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const [driversResult, leaguesResult, currentRaceResult] = await Promise.allSettled([
                driversAPI.getDrivers(),
                leaguesAPI.getLeagues(),
                f1racesAPI.getCurrentRace()
            ]);

            if (driversResult.status === 'fulfilled' && driversResult.value?.data?.success) {
                setDrivers(driversResult.value.data.data);
            }

            if (leaguesResult.status === 'fulfilled' && leaguesResult.value?.data?.success) {
                const leagueList = leaguesResult.value.data.data;
                const all = Array.isArray(leagueList) ? leagueList : [];
                const activeSeasonOnly = all.filter((l: League) => l.seasonEnded !== true);
                setLeagues(activeSeasonOnly);
                setSelectedLeague(prev => {
                    if (!prev) return prev;
                    return activeSeasonOnly.some((l: League) => String(l.id) === prev) ? prev : '';
                });
            }

            if (currentRaceResult.status === 'fulfilled' && currentRaceResult.value?.data?.success) {
                setCurrentRace(currentRaceResult.value.data.data);
                setCurrentWeek(currentRaceResult.value.data.data.weekNumber);
            } else if (currentRaceResult.status === 'rejected') {
                console.warn('Could not load current race (e.g. 404):', currentRaceResult.reason?.message ?? currentRaceResult.reason);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadLeaguePositions = async (leagueId: string) => {
        if (!leagueId) return;

        try {
            const response = await picksAPI.getLeaguePositions(parseInt(leagueId));
            if (response.data.success) {
                setRequiredPositions(response.data.data);
            }
        } catch (error) {
            console.error('Error loading league positions:', error);
            // Default to P10 if there's an error
            setRequiredPositions([10]);
        }
    };

    const loadExistingPicks = useCallback(async () => {
        if (!selectedLeague || !currentRace) {
            setUserPicks(new Map());
            return;
        }

        try {
            const response = await picksAPI.getUserPicksForEvent(parseInt(selectedLeague), 'race');
            if (response.data.success) {
                const picks = response.data.data;
                const currentWeekPicks = picks.filter((pick: UserPickV2) => pick.weekNumber === currentRace.weekNumber);

                const picksMap = new Map<number, number>();
                currentWeekPicks.forEach((pick: UserPickV2) => {
                    picksMap.set(pick.position, pick.driverId);
                });

                setUserPicks(picksMap);
            } else {
                setUserPicks(new Map());
            }
        } catch (error) {
            console.error('Error loading existing picks:', error);
            setUserPicks(new Map());
        }
    }, [selectedLeague, currentRace]);

    const loadExistingSprintPicks = useCallback(async () => {
        if (!selectedLeague || !currentRace) {
            setSprintPicks(new Map());
            return;
        }

        try {
            console.log('Loading existing sprint picks...');
            const response = await picksAPI.getUserPicksForEvent(parseInt(selectedLeague), 'sprint');
            console.log('Sprint picks response:', response.data);

            if (response.data.success) {
                const picks = response.data.data;
                const currentWeekPicks = picks.filter((pick: UserPickV2) => pick.weekNumber === currentRace.weekNumber);
                console.log('Current week sprint picks:', currentWeekPicks);

                const picksMap = new Map<number, number>();
                currentWeekPicks.forEach((pick: UserPickV2) => {
                    picksMap.set(pick.position, pick.driverId);
                });

                console.log('Sprint picks map:', Array.from(picksMap.entries()));
                setSprintPicks(picksMap);
            } else {
                setSprintPicks(new Map());
            }
        } catch (error) {
            console.error('Error loading existing sprint picks:', error);
            setSprintPicks(new Map());
        }
    }, [selectedLeague, currentRace]);

    // Load league positions and existing picks when league changes
    useEffect(() => {
        if (selectedLeague) {
            loadLeaguePositions(selectedLeague);
            if (currentRace) {
                loadExistingPicks();
                if (currentRace.hasSprint) {
                    loadExistingSprintPicks();
                }
            }
        }
    }, [selectedLeague, currentRace, loadExistingPicks, loadExistingSprintPicks]);

    const makePick = async (position: number, driverId: number, eventType: 'race' | 'sprint' = 'race') => {
        if (!selectedLeague) {
            showToast('Please select a league first', 'error');
            return;
        }

        // Check if picks are locked
        if (currentRace?.picksLocked) {
            showToast('Picks are currently locked for this race. Picks lock 5 minutes before qualifying starts.', 'error');
            return;
        }

        try {
            setSubmitting(true);

            // Update local state immediately for better UX
            const newPicks = new Map(eventType === 'race' ? userPicks : sprintPicks);
            newPicks.set(position, driverId);

            if (eventType === 'race') {
                setUserPicks(newPicks);
            } else {
                setSprintPicks(newPicks);
            }

            // Prepare picks array for API - send ALL current picks for this event type
            const picks: PickV2[] = Array.from(newPicks.entries())
                .filter(([, driverId]) => driverId && driverId > 0) // Filter out invalid driver IDs
                .map(([pos, driverId]) => ({
                    position: parseInt(pos.toString()), // Ensure position is a number
                    driverId: parseInt(driverId.toString()) // Ensure driverId is a number
                }));

            // Use the appropriate API endpoint based on event type
            const response = eventType === 'race'
                ? await picksAPI.makePickV2(parseInt(selectedLeague), currentWeek, picks)
                : await picksAPI.makeSprintPickV2(parseInt(selectedLeague), currentWeek, picks);

            if (response.data.success) {
                showToast(`${eventType === 'race' ? 'Race' : 'Sprint'} pick submitted successfully!`, 'success');
                // Reload existing picks to get updated data
                await loadExistingPicks();
                if (eventType === 'sprint') {
                    await loadExistingSprintPicks();
                }
            }
        } catch (error: unknown) {
            console.error('Error making pick:', error);

            const errorMessage = error instanceof Error ? error.message : 'Failed to submit pick. Please try again.';
            showToast(errorMessage, 'error');
            // Revert local state on error
            await loadExistingPicks();
            if (eventType === 'sprint') {
                await loadExistingSprintPicks();
            }
        } finally {
            setSubmitting(false);
        }
    };

    const unselectPick = async (position: number, eventType: 'race' | 'sprint' = 'race') => {
        if (!selectedLeague) {
            showToast('Please select a league first', 'error');
            return;
        }

        // Check if picks are locked
        if (currentRace?.picksLocked) {
            showToast('Picks are currently locked for this race. Picks lock 5 minutes before qualifying starts.', 'error');
            return;
        }

        try {
            setSubmitting(true);

            // Update local state immediately for better UX
            const newPicks = new Map(eventType === 'race' ? userPicks : sprintPicks);
            newPicks.delete(position);

            if (eventType === 'race') {
                setUserPicks(newPicks);
            } else {
                setSprintPicks(newPicks);
            }

            // Use the appropriate delete API endpoint based on event type
            console.log(`Attempting to delete ${eventType} pick for position ${position}`);
            const response = eventType === 'race'
                ? await picksAPI.removePickV2(parseInt(selectedLeague), currentWeek, position)
                : await picksAPI.removeSprintPickV2(parseInt(selectedLeague), currentWeek, position);

            console.log(`Delete response:`, response.data);

            if (response.data.success) {
                showToast(`${eventType === 'race' ? 'Race' : 'Sprint'} pick removed successfully!`, 'success');
                // Reload existing picks to get updated data
                console.log('Reloading picks after deletion...');
                await loadExistingPicks();
                if (eventType === 'sprint') {
                    await loadExistingSprintPicks();
                }
                console.log('Picks reloaded');
            }
        } catch (error: unknown) {
            console.error('Error removing pick:', error);

            const errorMessage = error instanceof Error ? error.message : 'Failed to remove pick. Please try again.';
            showToast(errorMessage, 'error');
            // Revert local state on error
            await loadExistingPicks();
            if (eventType === 'sprint') {
                await loadExistingSprintPicks();
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Handle league selection change
    const handleLeagueChange = (leagueId: string) => {
        setSelectedLeague(leagueId);
        setUserPicks(new Map());
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


    // Get the position a driver is picked for
    const getDriverPickedPosition = (driverId: number, picksMap: Map<number, number> = userPicks) => {
        for (const [position, pickedDriverId] of picksMap.entries()) {
            if (pickedDriverId === driverId) {
                return position;
            }
        }
        return null;
    };

    // Time formatting is now handled by the imported utility function



    // Handle driver selection from modal
    const handleModalDriverSelect = (driver: Driver, eventType: 'race' | 'sprint') => {
        const currentPicks = eventType === 'race' ? userPicks : sprintPicks;
        const pickedPosition = getDriverPickedPosition(driver.id, currentPicks);

        console.log(`handleModalDriverSelect: driver=${driver.name} (${driver.id}), eventType=${eventType}, modalPosition=${modalPosition}`);
        console.log(`Current picks:`, Array.from(currentPicks.entries()));
        console.log(`Picked position: ${pickedPosition}`);

        // Check if this driver is already picked for a different position
        if (pickedPosition && pickedPosition !== modalPosition) {
            showToast(`${driver.name} is already picked for ${getPositionLabel(pickedPosition)}. Please select a different driver.`, 'error');
            return;
        }

        // Check if this driver is already picked for the current position - if so, unselect it
        if (pickedPosition === modalPosition) {
            console.log(`Unselecting driver ${driver.name} from position ${modalPosition}`);
            // Unselect the driver by removing the pick
            unselectPick(modalPosition, eventType);
            setShowDriverModal(false);
            return;
        }

        console.log(`Making new pick for driver ${driver.name} at position ${modalPosition}`);
        // Make the pick for the selected position
        makePick(modalPosition, driver.id, eventType);
        setShowDriverModal(false);
    };

    const closeDriverModal = () => {
        setShowDriverModal(false);
        setModalPosition(0);
    };


    if (loading) {
        return (
            <div className="page-bg min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    // Show limited view for logged-out users
    if (!user) {
        return (
            <div className="page-bg min-h-screen">
                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="glass-card p-6 mb-6 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Picks Page</h2>
                        <p className="text-sm text-gray-500 mb-5">Log in to make your own F1 position picks!</p>
                        <div className="flex gap-3 justify-center">
                            <Link href="/login" className="btn-ghost text-sm py-2 px-5">Log In</Link>
                            <Link href="/signup" className="btn-primary text-sm py-2 px-5">Sign Up</Link>
                        </div>
                    </div>

                    {/* Current Race Preview */}
                    {currentRace && (
                        <div className="glass-card p-5 mb-6">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Current Race</h2>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{currentRace.raceName}</h3>
                                    <p className="text-sm text-gray-500">{currentRace.circuitName}, {currentRace.country}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Week {currentRace.weekNumber} · {new Date(currentRace.raceDate).toLocaleDateString()}</p>
                                </div>
                                <span className="badge badge-blue">{currentRace.status}</span>
                            </div>
                        </div>
                    )}

                    {/* Sample Position Preview */}
                    <div className="glass-card p-5 mb-6">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Position Selection Preview</h2>
                        <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                            {[1, 3, 10].map((position) => (
                                <div key={position} className="flex items-center gap-4 px-4 py-3.5 bg-gray-50/60">
                                    <div className="flex-shrink-0 w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center font-extrabold text-sm text-gray-400 tracking-wide">
                                        P{position}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-400">No pick made yet</p>
                                        <p className="text-xs text-gray-300">Log in to select a driver</p>
                                    </div>
                                    <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="page-bg min-h-screen">
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* League Selection */}
                <div className="glass-card p-5 mb-5">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Select League</h2>
                        {selectedLeague && (
                            <Link href={`/leagues/${selectedLeague}`} className="btn-ghost text-sm py-1.5 px-3">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to League
                            </Link>
                        )}
                    </div>
                    <select
                        value={selectedLeague}
                        onChange={(e) => handleLeagueChange(e.target.value)}
                        className="input-field"
                    >
                        <option value="">Choose a league</option>
                        {leagues.map((league) => (
                            <option key={league.id} value={league.id}>
                                {league.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Notification Prompt */}
                <ComprehensiveNotificationPrompt
                    currentPage="picks"
                    leagues={leagues}
                />

                {/* Current Race Information */}
                {currentRace && (
                    <div className="glass-card p-5 mb-5">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Current Race</h2>

                        {/* Pick Locking Status Banner */}
                        {currentRace.picksLocked && (
                            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                                <svg className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-sm font-semibold text-red-800">Picks are Locked</p>
                                    <p className="text-sm text-red-700 mt-0.5">{currentRace.lockMessage}</p>
                                </div>
                            </div>
                        )}

                        {/* Pick Locking Countdown */}
                        {!currentRace.picksLocked && (
                            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                                <svg className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-sm font-semibold text-amber-800">Pick Locking Status</p>
                                    <div className="mt-0.5 text-sm text-amber-700">
                                        <p>
                                            {currentRace.lockTime ? (
                                                (() => {
                                                    const timeRemaining = formatTimeRemainingLocal(currentRace.lockTime);
                                                    if (timeRemaining === 'Locked') {
                                                        return (
                                                            <>
                                                                Picks are now locked for {currentRace.raceName}
                                                                <br />
                                                                <span className="text-xs text-amber-600">
                                                                    Lock time: {new Date(currentRace.lockTime).toLocaleString()}
                                                                </span>
                                                            </>
                                                        );
                                                    } else {
                                                        return (
                                                            <>
                                                                Picks will lock in {timeRemaining} for {currentRace.raceName}
                                                                <br />
                                                                <span className="text-xs text-amber-600">
                                                                    Lock time: {new Date(currentRace.lockTime).toLocaleString()}
                                                                </span>
                                                                </>
                                                            );
                                                        }
                                                    })()
                                                ) : (
                                                    currentRace.lockMessage
                                                )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{currentRace.raceName}</h3>
                                <p className="text-sm text-gray-500">{currentRace.circuitName}, {currentRace.country}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Week {currentRace.weekNumber} · {new Date(currentRace.raceDate).toLocaleDateString()}
                                    {currentRace.qualifyingDate && ` · Qualifying: ${new Date(currentRace.qualifyingDate).toLocaleDateString()}`}
                                </p>
                            </div>
                            <span className="badge badge-blue">{currentRace.status}</span>
                        </div>
                    </div>
                )}

                {!selectedLeague ? (
                    <div className="glass-card p-6 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">Select a league</h3>
                        <p className="text-sm text-gray-500">Choose a league to make your position predictions.</p>
                    </div>
                ) : (
                    <>
                        {/* Sprint Race Picks Section */}
                        {currentRace?.hasSprint && (
                            <div className="glass-card p-5 mb-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900">Sprint Race Picks</h2>
                                        <p className="text-xs text-gray-500">Week {currentWeek} · {currentRace?.raceName}</p>
                                    </div>
                                    {currentRace?.picksLocked && <span className="badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>Picks Locked</span>}
                                </div>

                                {/* Position Cards */}
                                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                                    {requiredPositions.map((position) => {
                                        const pickedDriverId = sprintPicks.get(position);
                                        const pickedDriver = drivers.find(d => d.id === pickedDriverId);
                                        const isLocked = currentRace?.picksLocked;

                                        return (
                                            <div
                                                key={position}
                                                className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${
                                                    pickedDriver
                                                        ? 'bg-green-50'
                                                        : isLocked
                                                        ? 'bg-gray-50 cursor-not-allowed opacity-60'
                                                        : 'hover:bg-gray-50 cursor-pointer'
                                                }`}
                                                onClick={() => {
                                                    if (!isLocked) {
                                                        setModalPosition(position);
                                                        setModalEventType('sprint');
                                                        setShowDriverModal(true);
                                                    }
                                                }}
                                            >
                                                <div className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm text-white tracking-wide ${
                                                    pickedDriver ? 'bg-green-500' : 'bg-blue-600'
                                                }`}>
                                                    P{position}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    {pickedDriver ? (
                                                        <>
                                                            <p className="font-semibold text-gray-900 truncate">{pickedDriver.name}</p>
                                                            <p className="text-sm text-gray-500 truncate">{pickedDriver.team}</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="text-sm font-medium text-gray-500">No pick made yet</p>
                                                            {!isLocked && <p className="text-xs text-gray-400">Click to select a driver</p>}
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex-shrink-0">
                                                    {pickedDriver && !isLocked ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                unselectPick(position, 'sprint');
                                                            }}
                                                            className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                                                            title="Remove pick"
                                                        >
                                                            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    ) : pickedDriver ? (
                                                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : !isLocked ? (
                                                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    ) : null}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Sprint Progress Status */}
                                {sprintPicks.size > 0 && (
                                    <div className="mt-3 flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                                        <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-sm font-medium text-green-800">
                                            {sprintPicks.size} of {requiredPositions.length} sprint positions selected
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Main Race Picks Section */}
                        <div className="glass-card p-5 mb-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">Grand Prix Picks</h2>
                                    <p className="text-xs text-gray-500">Week {currentWeek} · {currentRace?.raceName}</p>
                                </div>
                                {currentRace?.picksLocked && <span className="badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>Picks Locked</span>}
                            </div>

                            {/* Position Cards */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                                {requiredPositions.map((position) => {
                                    const pickedDriverId = userPicks.get(position);
                                    const pickedDriver = drivers.find(d => d.id === pickedDriverId);
                                    const isLocked = currentRace?.picksLocked;

                                    return (
                                        <div
                                            key={position}
                                            className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${
                                                pickedDriver
                                                    ? 'bg-green-50'
                                                    : isLocked
                                                    ? 'bg-gray-50 cursor-not-allowed opacity-60'
                                                    : 'hover:bg-gray-50 cursor-pointer'
                                            }`}
                                            onClick={() => {
                                                if (!isLocked) {
                                                    setModalPosition(position);
                                                    setModalEventType('race');
                                                    setShowDriverModal(true);
                                                }
                                            }}
                                        >
                                            <div className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm text-white tracking-wide ${
                                                pickedDriver ? 'bg-green-500' : 'bg-blue-600'
                                            }`}>
                                                P{position}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {pickedDriver ? (
                                                    <>
                                                        <p className="font-semibold text-gray-900 truncate">{pickedDriver.name}</p>
                                                        <p className="text-sm text-gray-500 truncate">{pickedDriver.team}</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-sm font-medium text-gray-500">No pick made yet</p>
                                                        {!isLocked && <p className="text-xs text-gray-400">Click to select a driver</p>}
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex-shrink-0">
                                                {pickedDriver && !isLocked ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            unselectPick(position, 'race');
                                                        }}
                                                        className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                                                        title="Remove pick"
                                                    >
                                                        <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                ) : pickedDriver ? (
                                                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                ) : !isLocked ? (
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Race Progress Status */}
                            {userPicks.size > 0 && (
                                <div className="mt-3 flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                                    <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm font-medium text-green-800">
                                        {userPicks.size} of {requiredPositions.length} main race positions selected
                                    </p>
                                </div>
                            )}
                        </div>

                    </>
                )}

                {/* Driver Selection Modal */}
                <DriverSelectionModal
                    isOpen={showDriverModal}
                    onClose={closeDriverModal}
                    position={modalPosition}
                    drivers={drivers}
                    selectedDriverId={modalPosition ? (modalEventType === 'race' ? userPicks.get(modalPosition) : sprintPicks.get(modalPosition)) : undefined}
                    onDriverSelect={handleModalDriverSelect}
                    disabled={currentRace?.picksLocked}
                    submitting={submitting}
                    userPicks={userPicks}
                    sprintPicks={sprintPicks}
                    hasSprint={currentRace?.hasSprint || false}
                    eventType={modalEventType}
                />
            </main>
        </div>
    );
}

export default function PicksV2Page() {
    return (
        <Suspense fallback={
            <div className="page-bg min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
                    <p className="text-sm text-gray-500">Loading picks…</p>
                </div>
            </div>
        }>
            <PicksV2Form />
        </Suspense>
    );
}
