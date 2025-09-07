'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminAPI, driversAPI, f1racesAPI } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import logger from '@/utils/logger';

interface Driver {
    id: number;
    name: string;
    team: string;
}

interface Race {
    id: number;
    raceName: string;
    weekNumber: number;
    raceDate: string;
    circuitName: string;
    country: string;
    hasResults?: boolean;
    hasSprint?: boolean;
}

interface RaceResult {
    driverId: number;
    finishingPosition: number;
}

export default function RaceResultsEntryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [allRaces, setAllRaces] = useState<Race[]>([]);
    const [selectedWeek, setSelectedWeek] = useState<number>(1);
    const [selectedRace, setSelectedRace] = useState<Race | null>(null);
    const [results, setResults] = useState<RaceResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{ [key: number]: string }>({});
    const [isRescoring, setIsRescoring] = useState(false);
    const [leagues, setLeagues] = useState<Array<{ id: number; name: string; isActive: number }>>([]);
    const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
    const [rescoringMode, setRescoringMode] = useState<'all' | 'specific'>('all');
    const [originalResults, setOriginalResults] = useState<RaceResult[]>([]);
    const [logActivity, setLogActivity] = useState<boolean>(true);
    const [selectedEventType, setSelectedEventType] = useState<'race' | 'sprint'>('race');
    const [sprintResults, setSprintResults] = useState<RaceResult[]>([]);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (allRaces.length > 0) {
            // Handle URL parameter for week number first
            const weekParam = searchParams.get('week');
            let weekToSet = selectedWeek;

            if (weekParam) {
                const weekNumber = parseInt(weekParam, 10);
                if (!isNaN(weekNumber) && weekNumber > 0) {
                    // Check if the week exists in the races data
                    const raceExists = allRaces.find(r => r.weekNumber === weekNumber);
                    if (raceExists) {
                        weekToSet = weekNumber;
                    }
                }
            }

            // Set the week (either from URL or current selection)
            setSelectedWeek(weekToSet);

            // Find and set the race
            const race = allRaces.find(r => r.weekNumber === weekToSet);
            setSelectedRace(race || null);

            // Set default event type based on whether the race has a sprint
            if (race?.hasSprint) {
                setSelectedEventType('sprint');
            } else {
                setSelectedEventType('race');
            }
        }
    }, [allRaces, searchParams]);

    useEffect(() => {
        // Initialize results array with 20 positions
        const initialResults: RaceResult[] = Array.from({ length: 20 }, (_, i) => ({
            driverId: 0,
            finishingPosition: i + 1
        }));
        setResults(initialResults);
    }, []);

    useEffect(() => {
        // Initialize sprint results array with 20 positions when switching to sprint
        if (selectedEventType === 'sprint') {
            const initialSprintResults: RaceResult[] = Array.from({ length: 20 }, (_, i) => ({
                driverId: 0,
                finishingPosition: i + 1
            }));
            setSprintResults(initialSprintResults);
        }
    }, [selectedEventType]);

    const loadInitialData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [driversResponse, allRacesResponse, leaguesResponse] = await Promise.all([
                driversAPI.getAllDriversAdmin(),
                adminAPI.getRacesWithResultStatus(),
                adminAPI.getAllLeagues()
            ]);

            if (driversResponse.status === 200) {
                setDrivers(driversResponse.data.data || []);
            }

            if (allRacesResponse.status === 200) {
                setAllRaces(allRacesResponse.data.data || []);

                // Only set the selected week to the first available race if no URL parameter exists
                if (allRacesResponse.data.data?.length > 0 && !searchParams.get('week')) {
                    const firstRace = allRacesResponse.data.data.sort((a: Race, b: Race) => a.weekNumber - b.weekNumber)[0];
                    setSelectedWeek(firstRace.weekNumber);
                }
            }

            if (leaguesResponse.status === 200) {
                setLeagues(leaguesResponse.data.data || []);
            }
        } catch (error) {
            logger.forceError('Error loading initial data:', error);
            setError('Failed to load drivers and races data');
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    const loadExistingResults = async (weekNumber: number) => {
        try {
            setLoading(true);
            const response = await adminAPI.getExistingRaceResults(weekNumber);

            if (response.status === 200 && response.data.data) {
                const existingResults = response.data.data;
                const newResults = Array.from({ length: 20 }, (_, i) => {
                    const existing = existingResults.find((r: RaceResult) => r.finishingPosition === i + 1);
                    return {
                        driverId: existing?.driverId || 0,
                        finishingPosition: i + 1
                    };
                });
                setResults(newResults);
                setOriginalResults([...newResults]); // Store the original results
            }
        } catch (error) {
            logger.forceError('Error loading existing results:', error);
            setError('Failed to load existing race results');
        } finally {
            setLoading(false);
        }
    };

    const handleWeekChange = async (weekNumber: number) => {
        setSelectedWeek(weekNumber);

        // Update URL with week parameter
        const url = new URL(window.location.href);
        url.searchParams.set('week', weekNumber.toString());
        window.history.replaceState({}, '', url.toString());

        const race = allRaces.find(r => r.weekNumber === weekNumber);
        setIsRescoring(race?.hasResults || false);

        if (race?.hasResults) {
            await loadExistingResults(weekNumber);
        } else {
            // Reset to empty form for new results
            setResults(Array.from({ length: 20 }, (_, i) => ({
                driverId: 0,
                finishingPosition: i + 1
            })));
        }
    };

    const handleRescoringModeChange = (mode: 'all' | 'specific') => {
        setRescoringMode(mode);

        // If switching to specific league mode and we have original results, reset to original
        if (mode === 'specific' && originalResults.length > 0) {
            setResults([...originalResults]);
        }
    };

    const handleDriverChange = (position: number, driverId: number) => {
        const currentResults = selectedEventType === 'race' ? results : sprintResults;
        const setCurrentResults = selectedEventType === 'race' ? setResults : setSprintResults;

        const newResults = [...currentResults];
        newResults[position - 1] = { ...newResults[position - 1], driverId };
        setCurrentResults(newResults);

        // Clear validation errors when user makes a change
        setError(null);
        setValidationErrors(prev => ({ ...prev, [position]: '' }));

        // Check for duplicate drivers in real-time
        if (driverId > 0) {
            const duplicatePositions = newResults
                .map((result, index) => ({ ...result, index }))
                .filter(result => result.driverId === driverId && result.index !== position - 1);

            if (duplicatePositions.length > 0) {
                setValidationErrors(prev => ({
                    ...prev,
                    [position]: `Driver already selected in P${duplicatePositions[0].finishingPosition}`
                }));
            }
        }
    };

    const validateResults = (resultsToValidate: RaceResult[] = results): boolean => {
        // Check if all positions have drivers selected
        const hasAllDrivers = resultsToValidate.every(result => result.driverId > 0);
        if (!hasAllDrivers) {
            setError('All 20 positions must have drivers selected');
            return false;
        }

        // Check for duplicate drivers
        const driverIds = resultsToValidate.map(result => result.driverId);
        const uniqueDriverIds = new Set(driverIds);
        if (uniqueDriverIds.size !== 20) {
            setError('Each driver can only finish in one position');
            return false;
        }

        // Check for validation errors
        const hasValidationErrors = Object.values(validationErrors).some(error => error.length > 0);
        if (hasValidationErrors) {
            setError('Please fix validation errors before submitting');
            return false;
        }

        return true;
    };

    // Check if form is ready to submit
    const isFormValid = (): boolean => {
        const hasAllDrivers = results.every(result => result.driverId > 0);
        const hasValidationErrors = Object.values(validationErrors).some(error => error.length > 0);
        return hasAllDrivers && !hasValidationErrors;
    };

    // Get drivers that are already selected in other positions
    const getSelectedDrivers = (excludePosition: number): number[] => {
        const currentResults = selectedEventType === 'race' ? results : sprintResults;
        return currentResults
            .filter((_, index) => index !== excludePosition - 1) // Exclude current position
            .map(result => result.driverId)
            .filter(id => id > 0); // Only include selected drivers
    };

    // Check if a driver is available for selection in a specific position
    const isDriverAvailable = (driverId: number, position: number): boolean => {
        if (driverId === 0) return true; // "Select Driver" option is always available
        const selectedDrivers = getSelectedDrivers(position);
        return !selectedDrivers.includes(driverId);
    };

    const handleSubmit = async () => {
        const currentResults = selectedEventType === 'race' ? results : sprintResults;

        if (!validateResults(currentResults)) {
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            setSuccess(null);

            let response;
            if (isRescoring) {
                // For specific league rescoring, we don't need to send results since we're not changing them
                const resultsToSend = rescoringMode === 'specific' ? [] : currentResults;
                if (selectedEventType === 'race') {
                    response = await adminAPI.rescoreRaceResults(
                        selectedWeek,
                        resultsToSend,
                        rescoringMode === 'specific' && selectedLeagueId ? selectedLeagueId : undefined,
                        logActivity
                    );
                } else {
                    response = await adminAPI.rescoreSprintResults(
                        selectedWeek,
                        resultsToSend,
                        rescoringMode === 'specific' && selectedLeagueId ? selectedLeagueId : undefined,
                        logActivity
                    );
                }
            } else {
                if (selectedEventType === 'race') {
                    response = await adminAPI.enterRaceResults(selectedWeek, currentResults);
                } else {
                    response = await adminAPI.enterSprintResults(selectedWeek, currentResults);
                }
            }

            if (response.status === 200) {
                const action = isRescoring ? 'rescored' : 'entered';
                const eventType = selectedEventType === 'race' ? 'race' : 'sprint';
                const leaguesAffected = isRescoring ? response.data.data.leaguesRescored : response.data.data.leaguesScored;
                setSuccess(`Successfully ${action} ${eventType} results for ${selectedRace?.raceName} (Week ${selectedWeek}) and ${isRescoring ? 'rescored' : 'scored'} ${leaguesAffected} leagues!`);

                // Reset form after successful submission
                setTimeout(() => {
                    const resetResults = Array.from({ length: 20 }, (_, i) => ({
                        driverId: 0,
                        finishingPosition: i + 1
                    }));
                    if (selectedEventType === 'race') {
                        setResults(resetResults);
                    } else {
                        setSprintResults(resetResults);
                    }
                    setSuccess(null);
                }, 5000);
            }
        } catch (error: unknown) {
            logger.forceError(`Error ${isRescoring ? 'rescoring' : 'entering'} ${selectedEventType} results:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const getDriverName = (driverId: number): string => {
        const driver = drivers.find(d => d.id === driverId);
        return driver ? driver.name : 'Select Driver';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Race Results Entry</h1>
                        <p className="text-gray-600 mt-1">Enter race results after a race weekend to score all leagues</p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Back to Admin
                    </button>
                </div>
            </div>

            {/* Race Selection */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Select Race</h2>

                {allRaces.length === 0 ? (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">All Races Completed!</h3>
                                <p className="text-sm text-green-700 mt-1">
                                    All races in the 2025 season have already had their results entered. No further action is needed.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="week-select" className="block text-sm font-medium text-gray-700 mb-2">
                                Race Week
                            </label>
                            <select
                                id="week-select"
                                value={selectedWeek}
                                onChange={(e) => handleWeekChange(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            >
                                {allRaces
                                    .sort((a, b) => a.weekNumber - b.weekNumber)
                                    .map((race) => (
                                        <option key={race.weekNumber} value={race.weekNumber}>
                                            Week {race.weekNumber}: {race.raceName}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        {selectedRace && (
                            <div className="bg-gray-50 p-4 rounded-md">
                                <h3 className="font-medium text-gray-900">{selectedRace.raceName}</h3>
                                <p className="text-sm text-gray-600">
                                    {new Date(selectedRace.raceDate).toLocaleDateString()} • {selectedRace.circuitName}, {selectedRace.country}
                                </p>
                                {selectedRace.hasSprint && (
                                    <div className="mt-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Event Type
                                        </label>
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
                                )}
                                {isRescoring && (
                                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                        <p className="text-sm text-blue-800 font-medium">
                                            ⚠️ This race already has results entered. You are rescoring the race and updating league scores.
                                        </p>

                                        {/* Rescoring Mode Selection */}
                                        <div className="mt-3">
                                            <label className="block text-sm font-medium text-blue-900 mb-2">
                                                Rescoring Mode:
                                            </label>
                                            <div className="space-y-2">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="rescoringMode"
                                                        value="all"
                                                        checked={rescoringMode === 'all'}
                                                        onChange={(e) => handleRescoringModeChange(e.target.value as 'all' | 'specific')}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-sm text-blue-800">Rescore all active leagues</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="rescoringMode"
                                                        value="specific"
                                                        checked={rescoringMode === 'specific'}
                                                        onChange={(e) => handleRescoringModeChange(e.target.value as 'all' | 'specific')}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-sm text-blue-800">Rescore specific league only</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* League Selection */}
                                        {rescoringMode === 'specific' && (
                                            <div className="mt-3">
                                                <label htmlFor="league-select" className="block text-sm font-medium text-blue-900 mb-2">
                                                    Select League:
                                                </label>
                                                <select
                                                    id="league-select"
                                                    value={selectedLeagueId || ''}
                                                    onChange={(e) => setSelectedLeagueId(e.target.value ? Number(e.target.value) : null)}
                                                    className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="">Select a league...</option>
                                                    {leagues
                                                        .filter(league => league.isActive !== 0)
                                                        .map((league) => (
                                                            <option key={league.id} value={league.id}>
                                                                {league.name}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Activity Logging Toggle */}
                                        <div className="mt-3">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={logActivity}
                                                    onChange={(e) => setLogActivity(e.target.checked)}
                                                    className="mr-2"
                                                />
                                                <span className="text-sm text-blue-800">Log activity events (uncheck for bulk updates)</span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Race Results Entry - Only show if there are races available */}
            {allRaces.length > 0 && (
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {isRescoring && rescoringMode === 'specific' ? `Current ${selectedEventType === 'race' ? 'Race' : 'Sprint'} Results (Read-only)` : `Enter ${selectedEventType === 'race' ? 'Race' : 'Sprint'} Finishing Positions`}
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                        {isRescoring && rescoringMode === 'specific'
                            ? 'Current race results are displayed below. Only the selected league will be rescored.'
                            : 'Select the driver who finished in each position. All 20 positions must be filled.'
                        }
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(selectedEventType === 'race' ? results : sprintResults).map((result, index) => (
                            <div key={result.finishingPosition} className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    P{result.finishingPosition}
                                </label>
                                <select
                                    value={result.driverId}
                                    onChange={(e) => handleDriverChange(result.finishingPosition, Number(e.target.value))}
                                    disabled={isRescoring && rescoringMode === 'specific'}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${isRescoring && rescoringMode === 'specific' ? 'bg-gray-100 cursor-not-allowed' : ''
                                        }`}
                                >
                                    <option value={0}>Select Driver</option>
                                    {drivers
                                        .sort((a, b) => a.name.localeCompare(b.name))
                                        .map((driver) => {
                                            const isAvailable = isDriverAvailable(driver.id, result.finishingPosition);
                                            const isSelected = result.driverId === driver.id;
                                            return (
                                                <option
                                                    key={driver.id}
                                                    value={driver.id}
                                                    disabled={!isAvailable && !isSelected}
                                                    className={!isAvailable && !isSelected ? 'text-gray-400' : ''}
                                                >
                                                    {driver.name} ({driver.team})
                                                    {!isAvailable && !isSelected ? ' - Already Selected' : ''}
                                                </option>
                                            );
                                        })}
                                </select>
                                {result.driverId > 0 && (
                                    <div className="text-xs text-green-600 font-medium">
                                        ✓ {getDriverName(result.driverId)}
                                    </div>
                                )}
                                {validationErrors[result.finishingPosition] && (
                                    <div className="text-xs text-red-600 font-medium">
                                        {validationErrors[result.finishingPosition]}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Selected Drivers Summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
                        <h3 className="text-sm font-medium text-blue-900 mb-2">Selected Drivers Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 text-xs">
                            {(selectedEventType === 'race' ? results : sprintResults).map((result) => (
                                <div key={result.finishingPosition} className="flex items-center space-x-1">
                                    <span className="font-medium text-blue-700">P{result.finishingPosition}:</span>
                                    <span className="text-blue-600">
                                        {result.driverId > 0 ? getDriverName(result.driverId) : 'Not selected'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Error and Success Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-800">{success}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Button - Only show if there are races available */}
            {allRaces.length > 0 && (
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Submit Results</h3>
                            <p className="text-sm text-gray-600">
                                {isRescoring
                                    ? rescoringMode === 'specific' && selectedLeagueId
                                        ? `This will rescore the race results and update the selected league for Week ${selectedWeek}`
                                        : `This will rescore the race results and update all active leagues for Week ${selectedWeek}`
                                    : `This will enter the race results and automatically score all active leagues for Week ${selectedWeek}`
                                }
                            </p>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !isFormValid() || (isRescoring && rescoringMode === 'specific' && !selectedLeagueId)}
                            className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Processing...' :
                                isRescoring ?
                                    (rescoringMode === 'specific' ? 'Rescore Specific League' : 'Rescore Results & Update Leagues')
                                    : 'Enter Results & Score Leagues'
                            }
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
