'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { picksAPI, PositionResultV2, f1racesAPI } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import PageTitle from '@/components/PageTitle';
import BackToLeagueButton from '@/components/BackToLeagueButton';


export default function UnscoredPositionPicksPage() {
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

  // Update URL when selectedEventType changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('eventType', selectedEventType);
    window.history.replaceState({}, '', url.toString());
  }, [selectedEventType]);

  // Set default event type based on whether the race has a sprint
  useEffect(() => {
    if (currentRace?.hasSprint && !searchParams.get('eventType')) {
      setSelectedEventType('sprint');
    }
  }, [currentRace, searchParams]);

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
        setError('Failed to load picks');
      }
    } catch (error) {
      console.error('Error loading position picks:', error);
      setError('Failed to load picks');
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
      const response = await f1racesAPI.getAllRaces();
      if (response.data.success) {
        const currentRaceData = response.data.data.find((race: any) => race.weekNumber === parseInt(weekNumber));
        setCurrentRace(currentRaceData);
      }
    } catch (error) {
      console.error('Error loading current race:', error);
    }
  };

  const navigateToPosition = (newPosition: number) => {
    // Use replace instead of push to avoid building up navigation stack
    const url = `/leagues/${leagueId}/results/${weekNumber}/unscored-position/${newPosition}`;
    const params = new URLSearchParams();
    params.set('eventType', selectedEventType);
    const finalUrl = `${url}?${params.toString()}`;
    router.replace(finalUrl);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Picks</h2>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Picks Found</h2>
          <p className="text-gray-600 mb-4">No picks available for this position.</p>
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

        {/* Race Not Scored Notice */}
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
                The race results haven&apos;t been entered yet. Below are all the picks made for {getPositionLabel(results.position)}. Once the race finishes, you&apos;ll be able to see which picks were correct.
              </p>
            </div>
          </div>
        </div>

        {/* Event Type Selector */}
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

        {/* Picks Table */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              All Picks for {getPositionLabel(results.position)}
            </h3>
            <p className="text-sm text-gray-600">
              {results.totalParticipants} participants made picks for this position
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pick
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.picks.map((pick, index) => (
                  <tr key={pick.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pick.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{pick.driverName}</div>
                        <div className="text-gray-500">({pick.driverTeam})</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Awaiting Results
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            <div className="space-y-3 p-4">
              {results.picks.map((pick, index) => (
                <div key={pick.userId} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  {/* Header with rank and user */}
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="font-bold text-sm text-blue-700">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-base font-semibold text-gray-900 truncate">{pick.userName}</span>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pending
                      </span>
                    </div>
                  </div>

                  {/* Driver info */}
                  <div className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center mr-3 flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{pick.driverName}</div>
                        <div className="text-sm text-gray-500">{pick.driverTeam}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Race Status</p>
                <p className="text-2xl font-semibold text-gray-900">Not Scored</p>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Picks Section */}
        <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Picks</h3>
          <div className="space-y-3">
            {(() => {
              // Count picks for each driver
              const driverCounts = results.picks.reduce((acc, pick) => {
                const key = `${pick.driverName} (${pick.driverTeam})`;
                acc[key] = (acc[key] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);

              // Sort by count and get top 5
              const sortedDrivers = Object.entries(driverCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5);

              return sortedDrivers.map(([driver, count], index) => (
                <div key={driver} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{driver}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">{count} pick{count !== 1 ? 's' : ''}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / results.totalParticipants) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </main>
    </div>
  );
}
