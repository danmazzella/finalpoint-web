'use client';

import { useState, useEffect, Suspense } from 'react';
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

interface CurrentRace {
    weekNumber: number;
    raceName: string;
    raceDate: string;
    status: string;
    circuitName: string;
    country: string;
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
    const [existingPicks, setExistingPicks] = useState<UserPickV2[]>([]);
    const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

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

    const loadExistingPicks = async () => {
        if (!selectedLeague || !currentRace) {
            setUserPicks(new Map());
            setExistingPicks([]);
            return;
        }

        try {
            const response = await picksAPI.getUserPicksV2(parseInt(selectedLeague));
            if (response.data.success) {
                const picks = response.data.data;
                const currentWeekPicks = picks.filter((pick: UserPickV2) => pick.weekNumber === currentRace.weekNumber);

                const picksMap = new Map<number, number>();
                currentWeekPicks.forEach((pick: UserPickV2) => {
                    picksMap.set(pick.position, pick.driverId);
                });

                setUserPicks(picksMap);
                setExistingPicks(currentWeekPicks);
            } else {
                setUserPicks(new Map());
                setExistingPicks([]);
            }
        } catch (error) {
            console.error('Error loading existing picks:', error);
            setUserPicks(new Map());
            setExistingPicks([]);
        }
    };

    // Load league positions and existing picks when league changes
    useEffect(() => {
        if (selectedLeague) {
            loadLeaguePositions(selectedLeague);
            if (currentRace) {
                loadExistingPicks();
            }
        }
    }, [selectedLeague, currentRace]);

    const makePick = async (position: number, driverId: number) => {
        if (!selectedLeague) {
            showToast('Please select a league first', 'error');
            return;
        }

        try {
            setSubmitting(true);

            // Update local state immediately for better UX
            const newPicks = new Map(userPicks);
            newPicks.set(position, driverId);
            setUserPicks(newPicks);

            // Prepare picks array for API - send ALL current picks
            const picks: PickV2[] = Array.from(newPicks.entries()).map(([pos, driverId]) => ({
                position: parseInt(pos.toString()), // Ensure position is a number
                driverId: parseInt(driverId.toString()) // Ensure driverId is a number
            }));

            console.log('=== PICK SUBMISSION DEBUG ===');
            console.log('Selected League:', selectedLeague);
            console.log('Current Week:', currentWeek);
            console.log('Position being picked:', position);
            console.log('Driver ID:', driverId);
            console.log('All picks to send:', picks);
            console.log('User picks map:', userPicks);
            console.log('=============================');

            const response = await picksAPI.makePickV2(parseInt(selectedLeague), currentWeek, picks);
            console.log('API Response:', response);

            if (response.data.success) {
                showToast('Pick submitted successfully!', 'success');
                // Reload existing picks to get updated data
                await loadExistingPicks();
            }
        } catch (error: unknown) {
            console.error('=== PICK SUBMISSION ERROR ===');
            console.error('Error object:', error);
            console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
            console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

            // Log Axios error details if available
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { status?: number; data?: unknown; headers?: unknown } };
                console.error('Axios response status:', axiosError.response?.status);
                console.error('Axios response data:', axiosError.response?.data);
                console.error('Axios response headers:', axiosError.response?.headers);
            }

            console.error('=============================');

            const errorMessage = error instanceof Error ? error.message : 'Failed to submit pick. Please try again.';
            showToast(errorMessage, 'error');
            // Revert local state on error
            await loadExistingPicks();
        } finally {
            setSubmitting(false);
        }
    };

    // Handle league selection change
    const handleLeagueChange = (leagueId: string) => {
        setSelectedLeague(leagueId);
        setUserPicks(new Map());
        setExistingPicks([]);
        setSelectedPosition(null);
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

    // Check if a driver is already picked for another position
    const isDriverPickedForOtherPosition = (driverId: number, currentPosition: number) => {
        for (const [position, pickedDriverId] of userPicks.entries()) {
            if (position !== currentPosition && pickedDriverId === driverId) {
                return true;
            }
        }
        return false;
    };

    // Get the position a driver is picked for
    const getDriverPickedPosition = (driverId: number) => {
        for (const [position, pickedDriverId] of userPicks.entries()) {
            if (pickedDriverId === driverId) {
                return position;
            }
        }
        return null;
    };

    // Handle position selection
    const handlePositionClick = (position: number) => {
        setSelectedPosition(position);
    };

    // Handle driver selection for selected position
    const handleDriverClick = (driver: Driver) => {
        if (selectedPosition === null) {
            showToast('Please select a position first', 'error');
            return;
        }

        const pickedPosition = getDriverPickedPosition(driver.id);

        // Check if this driver is already picked for a different position
        if (pickedPosition && pickedPosition !== selectedPosition) {
            showToast(`${driver.name} is already picked for ${getPositionLabel(pickedPosition)}. Please select a different driver.`, 'error');
            return;
        }

        // Check if this driver is already picked for the current position
        if (pickedPosition === selectedPosition) {
            showToast(`${driver.name} is already picked for ${getPositionLabel(selectedPosition)}.`, 'error');
            return;
        }

        // Make the pick for the selected position
        makePick(selectedPosition, driver.id);
        setSelectedPosition(null);
    };

    // Remove pick for a position
    const removePick = async (position: number) => {
        if (!selectedLeague) {
            showToast('Please select a league first', 'error');
            return;
        }

        try {
            setSubmitting(true);

            console.log('=== REMOVING PICK DEBUG ===');
            console.log('Removing position:', position);
            console.log('League ID:', selectedLeague);
            console.log('Week:', currentWeek);
            console.log('===========================');

            const response = await picksAPI.removePickV2(parseInt(selectedLeague), currentWeek, position);
            console.log('Remove pick API Response:', response);

            if (response.data.success) {
                showToast('Pick removed successfully!', 'success');
                // Remove from local state
                const newPicks = new Map(userPicks);
                newPicks.delete(position);
                setUserPicks(newPicks);
            }
        } catch (error: unknown) {
            console.error('=== REMOVE PICK ERROR ===');
            console.error('Error object:', error);
            console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');

            // Log Axios error details if available
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { status?: number; data?: unknown; headers?: unknown } };
                console.error('Axios response status:', axiosError.response?.status);
                console.error('Axios response data:', axiosError.response?.data);
                console.error('Axios response headers:', axiosError.response?.headers);
            }

            console.error('===========================');

            const errorMessage = error instanceof Error ? error.message : 'Failed to remove pick. Please try again.';
            showToast(errorMessage, 'error');
        } finally {
            setSubmitting(false);
            setSelectedPosition(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* New Feature Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                                New: Multiple Position Picks
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>
                                    This league now supports picking multiple finishing positions (like P1 and P10).
                                    Click on a position to select it, then choose a driver for that position.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

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

                {/* Current Race Information */}
                {currentRace && (
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Current Race</h2>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-blue-900">{currentRace.raceName}</h3>
                                    <p className="text-sm text-blue-700">{currentRace.circuitName}, {currentRace.country}</p>
                                    <p className="text-sm text-blue-600">Week {currentRace.weekNumber} • {new Date(currentRace.raceDate).toLocaleDateString()}</p>
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
                        {/* Position Selection and Current Picks */}
                        <div className="bg-white shadow rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Week {currentWeek} - Required Positions
                                {currentRace && (
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                        ({currentRace.raceName})
                                    </span>
                                )}
                            </h2>

                            {selectedPosition && (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <p className="text-sm text-blue-800">
                                        <span className="font-medium">Selected:</span> {getPositionLabel(selectedPosition)} -
                                        Click on a driver below to assign them to this position
                                    </p>
                                </div>
                            )}

                            {/* Position Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {requiredPositions.map((position) => {
                                    const pickedDriverId = userPicks.get(position);
                                    const pickedDriver = drivers.find(d => d.id === pickedDriverId);
                                    const isSelected = selectedPosition === position;

                                    return (
                                        <div
                                            key={position}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                                                ? 'border-blue-500 bg-blue-50'
                                                : pickedDriver
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                                }`}
                                            onClick={() => handlePositionClick(position)}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-medium text-gray-900">{getPositionLabel(position)}</h3>
                                                {pickedDriver && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removePick(position);
                                                        }}
                                                        className="text-red-500 hover:text-red-700"
                                                        title="Remove pick"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                                <p className="text-sm text-gray-500">Click to select driver</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Progress Status */}
                            {userPicks.size > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-green-800">
                                                {userPicks.size} of {requiredPositions.length} positions selected
                                            </p>
                                            {userPicks.size === requiredPositions.length && (
                                                <p className="text-sm text-green-700 mt-1">
                                                    All picks submitted for Week {currentWeek}!
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Drivers Grid */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Select Drivers</h2>
                            <p className="text-sm text-gray-600 mb-4">
                                {selectedPosition
                                    ? `Click on a driver to assign them to ${getPositionLabel(selectedPosition)}`
                                    : 'Click on a position above to start selecting drivers'
                                }
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {drivers.map((driver) => {
                                    const pickedPosition = getDriverPickedPosition(driver.id);
                                    const isDisabled = submitting || (selectedPosition === null);
                                    const isAlreadyPicked = pickedPosition && pickedPosition !== selectedPosition;

                                    return (
                                        <button
                                            key={driver.id}
                                            onClick={() => handleDriverClick(driver)}
                                            disabled={isDisabled}
                                            className={`p-4 border rounded-lg text-left transition-colors ${pickedPosition
                                                ? pickedPosition === selectedPosition
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-green-500 bg-green-50'
                                                : isAlreadyPicked
                                                    ? 'border-gray-300 bg-gray-100 opacity-50'
                                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-500">#{driver.driverNumber}</span>
                                                <span className="text-xs text-gray-400">{driver.country}</span>
                                            </div>
                                            <h3 className="font-medium text-gray-900 mb-1">{driver.name}</h3>
                                            <p className="text-sm text-gray-500">{driver.team}</p>
                                            {pickedPosition && (
                                                <div className="mt-2">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {getPositionLabel(pickedPosition)}
                                                    </span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
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
