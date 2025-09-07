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
    const { user } = useAuth();
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
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [driversResponse, leaguesResponse, currentRaceResponse] = await Promise.all([
                driversAPI.getDrivers(),
                leaguesAPI.getLeagues(),
                f1racesAPI.getCurrentRace()
            ]);

            if (driversResponse.data.success) {
                setDrivers(driversResponse.data.data);
            }

            if (leaguesResponse.data.success) {
                setLeagues(leaguesResponse.data.data);
            }

            if (currentRaceResponse.data.success) {
                setCurrentRace(currentRaceResponse.data.data);
                setCurrentWeek(currentRaceResponse.data.data.weekNumber);
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Show limited view for logged-out users
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <h2 className="mt-2 text-lg font-medium text-gray-900">Picks Page Preview</h2>
                            <p className="mt-1 text-sm text-gray-500 mb-6">This is what the picks page looks like. Log in to make your own picks!</p>
                            <div className="flex space-x-2 justify-center">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Current Race Information - Show for logged-out users */}
                    {currentRace && (
                        <div className="bg-white shadow rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Current Race</h2>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-blue-900">{currentRace.raceName}</h3>
                                        <p className="text-sm text-blue-700">{currentRace.circuitName}, {currentRace.country}</p>
                                        <p className="text-sm text-blue-600">Week {currentRace.weekNumber} • {new Date(currentRace.raceDate).toLocaleDateString()}</p>
                                        {currentRace.qualifyingDate && (
                                            <p className="text-sm text-blue-600">Qualifying: {new Date(currentRace.qualifyingDate).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {currentRace.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sample League Selection Preview */}
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">League Selection</h2>
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">Log in to see your leagues and make picks</p>
                            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">League Selection</h3>
                                <p className="mt-1 text-sm text-gray-500">Choose from your leagues to make position predictions</p>
                            </div>
                        </div>
                    </div>

                    {/* Sample Position Selection Preview */}
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Position Selection Preview</h2>
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">See how position predictions work</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 3, 10].map((position) => (
                                    <div key={position} className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-gray-400 mb-2">P{position}</div>
                                        <div className="text-sm text-gray-500">Position {position}</div>
                                        <div className="mt-2 text-xs text-gray-400">Select driver</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* League Selection */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Select League</h2>
                        {selectedLeague && (
                            <Link
                                href={`/leagues/${selectedLeague}`}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to League
                            </Link>
                        )}
                    </div>
                    <select
                        value={selectedLeague}
                        onChange={(e) => handleLeagueChange(e.target.value)}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                        <option value="" className="text-gray-500">Choose a league</option>
                        {leagues.map((league) => (
                            <option key={league.id} value={league.id} className="text-gray-900">
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
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Current Race</h2>

                        {/* Pick Locking Status Banner */}
                        {currentRace.picksLocked && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            Picks are Locked
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>{currentRace.lockMessage}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pick Locking Countdown */}
                        {!currentRace.picksLocked && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">
                                            Pick Locking Status
                                        </h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <p>
                                                {currentRace.lockTime ? (
                                                    (() => {
                                                        const timeRemaining = formatTimeRemainingLocal(currentRace.lockTime);
                                                        if (timeRemaining === 'Locked') {
                                                            return (
                                                                <>
                                                                    Picks are now locked for {currentRace.raceName}
                                                                    <br />
                                                                    <span className="text-xs text-yellow-600">
                                                                        Lock time: {new Date(currentRace.lockTime).toLocaleString()}
                                                                    </span>
                                                                </>
                                                            );
                                                        } else {
                                                            return (
                                                                <>
                                                                    Picks will lock in {timeRemaining} for {currentRace.raceName}
                                                                    <br />
                                                                    <span className="text-xs text-yellow-600">
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
                            </div>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-blue-900">{currentRace.raceName}</h3>
                                    <p className="text-sm text-blue-700">{currentRace.circuitName}, {currentRace.country}</p>
                                    <p className="text-sm text-blue-600">Week {currentRace.weekNumber} • {new Date(currentRace.raceDate).toLocaleDateString()}</p>
                                    {currentRace.qualifyingDate && (
                                        <p className="text-sm text-blue-600">Qualifying: {new Date(currentRace.qualifyingDate).toLocaleDateString()}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {currentRace.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedLeague ? (
                    <div className="bg-white shadow rounded-lg p-6 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Select a league</h3>
                        <p className="mt-1 text-sm text-gray-500">Choose a league to make your position predictions.</p>
                    </div>
                ) : (
                    <>
                        {/* Sprint Race Picks Section */}
                        {currentRace?.hasSprint && (
                            <div className="bg-white shadow rounded-lg p-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-medium text-gray-900">
                                        Sprint Race Picks
                                        <span className="text-sm font-normal text-gray-500 ml-2">
                                            (Week {currentWeek} - {currentRace?.raceName})
                                        </span>
                                    </h2>
                                    {currentRace?.picksLocked && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Picks Locked
                                        </span>
                                    )}
                                </div>

                                {/* Position Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {requiredPositions.map((position) => {
                                        const pickedDriverId = sprintPicks.get(position);
                                        const pickedDriver = drivers.find(d => d.id === pickedDriverId);
                                        const isLocked = currentRace?.picksLocked;

                                        return (
                                            <div
                                                key={position}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${pickedDriver
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => {
                                                    if (!isLocked) {
                                                        setModalPosition(position);
                                                        setModalEventType('sprint');
                                                        setShowDriverModal(true);
                                                    }
                                                }}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-medium text-gray-900">{getPositionLabel(position)}</h3>
                                                    {pickedDriver && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                unselectPick(position, 'sprint');
                                                            }}
                                                            className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                                                            title="Remove pick"
                                                        >
                                                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                                {pickedDriver ? (
                                                    <div className="text-sm">
                                                        <p className="font-medium text-gray-900">{pickedDriver.name}</p>
                                                        <p className="text-gray-500">{pickedDriver.team}</p>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm">
                                                        <p className="text-gray-500">Click to select driver</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Sprint Progress Status */}
                                {sprintPicks.size > 0 && (
                                    <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-green-800">
                                                    {sprintPicks.size} of {requiredPositions.length} sprint positions selected
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Main Race Picks Section */}
                        <div className="bg-white shadow rounded-lg p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium text-gray-900">
                                    Grand Prix Picks
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                        (Week {currentWeek} - {currentRace?.raceName})
                                    </span>
                                </h2>
                                {currentRace?.picksLocked && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Picks Locked
                                    </span>
                                )}
                            </div>

                            {/* Position Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {requiredPositions.map((position) => {
                                    const pickedDriverId = userPicks.get(position);
                                    const pickedDriver = drivers.find(d => d.id === pickedDriverId);
                                    const isLocked = currentRace?.picksLocked;

                                    return (
                                        <div
                                            key={position}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${pickedDriver
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                                } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            onClick={() => {
                                                if (!isLocked) {
                                                    setModalPosition(position);
                                                    setModalEventType('race');
                                                    setShowDriverModal(true);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-medium text-gray-900">{getPositionLabel(position)}</h3>
                                                {pickedDriver && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            unselectPick(position, 'race');
                                                        }}
                                                        className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                                                        title="Remove pick"
                                                    >
                                                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                            {pickedDriver ? (
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-900">{pickedDriver.name}</p>
                                                    <p className="text-gray-500">{pickedDriver.team}</p>
                                                </div>
                                            ) : (
                                                <div className="text-sm">
                                                    <p className="text-gray-500">Click to select driver</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Race Progress Status */}
                            {userPicks.size > 0 && (
                                <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-green-800">
                                                {userPicks.size} of {requiredPositions.length} main race positions selected
                                            </p>
                                        </div>
                                    </div>
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
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading picks...</p>
                    </div>
                </div>
            </div>
        }>
            <PicksV2Form />
        </Suspense>
    );
}
