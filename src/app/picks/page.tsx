'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { picksAPI, driversAPI, leaguesAPI, f1racesAPI, Driver, League } from '@/lib/api';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function PicksForm() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const leagueId = searchParams.get('league');

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>(leagueId || '');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [currentRace, setCurrentRace] = useState<any>(null);
  const [leaguePositions, setLeaguePositions] = useState<number[]>([10]);
  const [checkingPositions, setCheckingPositions] = useState(false);

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

  const checkLeaguePositions = async (leagueId: string) => {
    if (!leagueId) return;

    try {
      setCheckingPositions(true);
      const response = await picksAPI.getLeaguePositions(parseInt(leagueId));
      if (response.data.success) {
        const positions = response.data.data;
        setLeaguePositions(positions);

        // If league requires multiple positions, redirect to V2 page
        if (positions.length > 1 || (positions.length === 1 && positions[0] !== 10)) {
          router.push(`/picks-v2?league=${leagueId}`);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking league positions:', error);
      // Default to P10 if there's an error
      setLeaguePositions([10]);
    } finally {
      setCheckingPositions(false);
    }
  };

  const loadExistingPick = async () => {
    if (!selectedLeague || !currentRace) {
      setSelectedDriver(null);
      return;
    }

    try {
      const response = await picksAPI.getUserPicks(parseInt(selectedLeague));
      if (response.data.success) {
        const userPicks = response.data.data;
        const currentPick = userPicks.find((pick: any) => pick.weekNumber === currentRace.weekNumber);
        if (currentPick) {
          setSelectedDriver(currentPick.driverId);
        } else {
          setSelectedDriver(null);
        }
      } else {
        setSelectedDriver(null);
      }
    } catch (error) {
      console.error('Error loading existing pick:', error);
      setSelectedDriver(null);
    }
  };

  // Clear selected driver when league changes
  useEffect(() => {
    setSelectedDriver(null);
    if (selectedLeague) {
      checkLeaguePositions(selectedLeague);
      if (currentRace) {
        loadExistingPick();
      }
    }
  }, [selectedLeague, currentRace]);

  const makePick = async (driverId: number) => {
    if (!selectedLeague) {
      showToast('Please select a league first', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const response = await picksAPI.makePick(parseInt(selectedLeague), currentWeek, driverId);
      if (response.data.success) {
        setSelectedDriver(driverId);
        showToast('Pick submitted successfully!', 'success');
      }
    } catch (error: any) {
      console.error('Error making pick:', error);
      showToast(error.response?.data?.message || 'Failed to submit pick. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle league selection change
  const handleLeagueChange = (leagueId: string) => {
    setSelectedLeague(leagueId);
    setSelectedDriver(null); // Clear the selected driver immediately
  };

  if (loading || checkingPositions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Make Your Picks</h1>
              <p className="text-gray-600">P10 predictions for F1 races</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

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
            <p className="mt-1 text-sm text-gray-500">Choose a league to make your P10 predictions.</p>
          </div>
        ) : (
          <>
            {/* Current Pick Status */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Week {currentWeek} - P10 Prediction
                {currentRace && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({currentRace.raceName})
                  </span>
                )}
              </h2>
              <p className="text-gray-600 mb-4">
                Select which driver you think will finish in 10th place for this week's race.
                {currentRace && (
                  <span className="block text-sm text-blue-600 mt-1">
                    Race date: {new Date(currentRace.raceDate).toLocaleDateString()}
                  </span>
                )}
              </p>
              {selectedDriver && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Pick submitted for Week {currentWeek}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drivers Grid */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Select Your P10 Driver</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {drivers.map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => makePick(driver.id)}
                    disabled={submitting}
                    className={`p-4 border rounded-lg text-left transition-colors ${selectedDriver === driver.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">#{driver.driverNumber}</span>
                      <span className="text-xs text-gray-400">{driver.country}</span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{driver.name}</h3>
                    <p className="text-sm text-gray-500">{driver.team}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function PicksPage() {
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
      <PicksForm />
    </Suspense>
  );
} 