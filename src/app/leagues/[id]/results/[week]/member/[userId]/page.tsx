'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { picksAPI, MemberPicksV2, leaguesAPI, f1racesAPI } from '@/lib/api';
import PageTitle from '@/components/PageTitle';
import Avatar from '@/components/Avatar';

interface Member {
  id: number;
  name: string;
  avatar?: string;
  role?: string;
}

export default function MemberPicksPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [memberPicks, setMemberPicks] = useState<MemberPicksV2 | null>(null);
  const [leagueMembers, setLeagueMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<'race' | 'sprint' | null>(null);
  const [eventTypeInitialized, setEventTypeInitialized] = useState(false);
  const [currentRace, setCurrentRace] = useState<any>(null);

  const leagueId = params.id as string;
  const weekNumber = params.week as string;
  const userId = params.userId as string;

  // Handle eventType URL parameter
  useEffect(() => {
    const eventTypeParam = searchParams.get('eventType');
    if (eventTypeParam === 'sprint' || eventTypeParam === 'race') {
      setSelectedEventType(eventTypeParam);
      setEventTypeInitialized(true);
    } else if (eventTypeParam === 'null' || eventTypeParam === null) {
      // Handle null eventType - don't change selectedEventType if it's already set
      setEventTypeInitialized(true);
    } else {
      // No eventType in URL, will be set by the race data useEffect
      setEventTypeInitialized(true);
    }
  }, [searchParams, selectedEventType]);

  // Set default event type based on whether the race has a sprint
  useEffect(() => {
    if (currentRace?.hasSprint && !searchParams.get('eventType')) {
      setSelectedEventType('sprint');
    } else if (currentRace && !searchParams.get('eventType')) {
      setSelectedEventType('race');
    }
  }, [currentRace, searchParams]);

  // Update URL when selectedEventType changes (but avoid infinite loops)
  useEffect(() => {
    // Don't update URL if selectedEventType is null or invalid
    if (!selectedEventType) {
      return;
    }

    // Use a timeout to debounce the URL updates
    const timeoutId = setTimeout(() => {
      const currentUrl = new URL(window.location.href);
      const currentEventType = currentUrl.searchParams.get('eventType') || 'race';

      // Only update URL if the eventType has actually changed
      if (currentEventType !== selectedEventType) {
        const url = new URL(window.location.href);
        url.searchParams.set('eventType', selectedEventType);
        window.history.replaceState({}, '', url.toString());
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [selectedEventType]);

  const loadMemberPicks = useCallback(async () => {
    if (!selectedEventType) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await picksAPI.getMemberPicksV2(
        parseInt(leagueId),
        parseInt(weekNumber),
        parseInt(userId),
        selectedEventType
      );

      if (response.data.success) {
        setMemberPicks(response.data.data);
      } else {
        setError('Failed to load member picks');
      }
    } catch (error) {
      console.error('Error loading member picks:', error);
      setError('Failed to load member picks');
    } finally {
      setLoading(false);
    }
  }, [leagueId, weekNumber, userId, selectedEventType]);

  const loadLeagueMembers = useCallback(async () => {
    if (!selectedEventType) {
      return;
    }

    try {
      // Get members from race results to maintain the same order as shown on results page
      const response = await picksAPI.getRaceResultsV2(parseInt(leagueId), parseInt(weekNumber), selectedEventType);
      if (response.data.success) {
        // Convert results to member format and maintain the results ordering
        const membersFromResults = response.data.data.results.map((result: { userId: number; userName: string; userAvatar?: string }) => ({
          id: result.userId,
          name: result.userName,
          avatar: result.userAvatar
        }));
        setLeagueMembers(membersFromResults);
      }
    } catch (error) {
      console.error('Error loading race results for member navigation:', error);
      // Fallback to league members if race results fail
      try {
        const fallbackResponse = await leaguesAPI.getLeagueMembers(parseInt(leagueId));
        if (fallbackResponse.data.success) {
          setLeagueMembers(fallbackResponse.data.data);
        }
      } catch (fallbackError) {
        console.error('Error loading league members fallback:', fallbackError);
      }
    }
  }, [leagueId, weekNumber, selectedEventType]);

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

  const navigateToMember = (newUserId: number, memberIndex?: number) => {
    const url = `/leagues/${leagueId}/results/${weekNumber}/member/${newUserId}`;
    const params = new URLSearchParams();

    if (memberIndex !== undefined) {
      params.set('memberIndex', memberIndex.toString());
    }

    // Preserve the current event type, but handle null values
    const eventTypeToUse = selectedEventType || 'race';
    params.set('eventType', eventTypeToUse);

    const finalUrl = `${url}?${params.toString()}`;
    // Use replace instead of push to avoid building up navigation stack
    router.replace(finalUrl);
  };

  const getCurrentMemberIndex = () => {
    // Handle duplicate userIds by finding ALL matches and using URL params to determine which one
    const urlParams = new URLSearchParams(window.location.search);
    const memberIndex = urlParams.get('memberIndex');

    if (memberIndex !== null) {
      const index = parseInt(memberIndex);

      return index >= 0 && index < leagueMembers.length ? index : 0;
    }

    // For backward compatibility, find by userId but handle duplicates
    const targetUserId = parseInt(userId);
    const allMatchingIndices = leagueMembers
      .map((member, index) => member.id === targetUserId ? index : -1)
      .filter(index => index !== -1);



    // Return the first match, or 0 if no match found
    return allMatchingIndices.length > 0 ? allMatchingIndices[0] : 0;
  };

  const canNavigatePrevious = () => {
    return getCurrentMemberIndex() > 0;
  };

  const canNavigateNext = () => {
    return getCurrentMemberIndex() < leagueMembers.length - 1;
  };

  const navigateToPrevious = () => {
    const currentIndex = getCurrentMemberIndex();
    if (currentIndex > 0) {
      const previousMember = leagueMembers[currentIndex - 1];
      navigateToMember(previousMember.id, currentIndex - 1);
    }
  };

  const navigateToNext = () => {
    const currentIndex = getCurrentMemberIndex();
    if (currentIndex < leagueMembers.length - 1) {
      const nextMember = leagueMembers[currentIndex + 1];
      navigateToMember(nextMember.id, currentIndex + 1);
    }
  };

  // Load race data on mount
  useEffect(() => {
    loadCurrentRace();
  }, [leagueId, weekNumber]);

  // Load member data only when eventType is determined
  useEffect(() => {
    if (eventTypeInitialized && selectedEventType) {
      loadMemberPicks();
      loadLeagueMembers();
    }
  }, [selectedEventType, eventTypeInitialized, loadMemberPicks, loadLeagueMembers]);

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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Member Picks</h2>
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

  if (!memberPicks) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Member Picks Found</h2>
          <p className="text-gray-600 mb-4">No picks available for this member.</p>
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
          title="Member Picks"
          subtitle={`Week ${memberPicks.weekNumber} • ${memberPicks.totalPicks} positions`}
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

        {/* Member Context with Navigation */}
        <div className="mb-6">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center">
            <div className="flex items-center space-x-6">
              {/* Previous Member Button */}
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

              {/* Current Member Badge */}
              <div className="flex items-center">
                <Avatar
                  src={memberPicks.userAvatar}
                  alt={`${memberPicks.userName}'s avatar`}
                  size="md"
                  className="shadow-sm"
                />
                <span className="ml-4 text-base text-gray-600 font-medium">
                  Viewing picks by {memberPicks.userName}
                </span>
              </div>

              {/* Next Member Button */}
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
              {/* Previous Member Button */}
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

              {/* Current Member Badge and Label */}
              <div className="flex flex-col items-center">
                <Avatar
                  src={memberPicks.userAvatar}
                  alt={`${memberPicks.userName}'s avatar`}
                  size="sm"
                  className="shadow-sm"
                />
                <span className="mt-2 text-sm text-gray-600 text-center font-medium">
                  Viewing picks by {memberPicks.userName}
                </span>
              </div>

              {/* Next Member Button */}
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

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white shadow-lg rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Picks</p>
                <p className="text-lg font-bold text-gray-900">{memberPicks.totalPicks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Correct Picks</p>
                <p className="text-lg font-bold text-gray-900">{memberPicks.correctPicks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Accuracy</p>
                <p className="text-lg font-bold text-gray-900">{memberPicks.accuracy}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Points</p>
                <p className="text-lg font-bold text-gray-900">{memberPicks.totalPoints}</p>
              </div>
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

        {/* Member's Picks Section */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              All Picks for Week {memberPicks.weekNumber}
            </h3>
            <p className="text-sm text-gray-600">
              {memberPicks.correctPicks} correct • {memberPicks.totalPoints} total points
            </p>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:block p-6">
            {memberPicks.picks.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Picks Made</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {memberPicks.userName} hasn&apos;t made any picks for Week {memberPicks.weekNumber} yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {memberPicks.picks.map((pick) => (
                  <div
                    key={pick.position}
                    className={`p-4 border-2 rounded-lg ${pick.isCorrect === null
                      ? 'border-gray-300 bg-gray-50'
                      : pick.isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        {getPositionLabel(pick.position)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${pick.isCorrect === null
                        ? 'bg-gray-100 text-gray-800'
                        : pick.isCorrect
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {pick.points !== null ? `${pick.points} pts` : 'Not Scored'}
                      </span>
                    </div>

                    <div className="mb-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {pick.driverName}
                      </p>
                      <p className="text-xs text-gray-500">{pick.driverTeam}</p>
                      {pick.actualFinishPosition && (
                        <p className="text-xs text-gray-400 mt-1">
                          Actually finished: P{pick.actualFinishPosition}
                        </p>
                      )}
                      {pick.isCorrect === null && !pick.actualFinishPosition && (
                        <p className="text-xs text-gray-400 mt-1">
                          Race not scored yet
                        </p>
                      )}
                    </div>

                    {pick.actualDriverId && pick.actualDriverId !== pick.driverId && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500">Actual:</p>
                        <p className="text-xs font-medium text-gray-700">
                          {pick.actualDriverName} ({pick.actualDriverTeam})
                        </p>
                      </div>
                    )}

                    {pick.isCorrect && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <p className="text-xs text-green-600 font-medium">✓ Correct!</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            {memberPicks.picks.length === 0 ? (
              <div className="text-center py-12 px-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Picks Made</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {memberPicks.userName} hasn&apos;t made any picks for Week {memberPicks.weekNumber} yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {memberPicks.picks.map((pick) => (
                  <div
                    key={pick.position}
                    className={`p-4 border-2 rounded-lg shadow-sm ${pick.isCorrect === null
                      ? 'border-gray-300 bg-white'
                      : pick.isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-500">
                        {getPositionLabel(pick.position)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${pick.isCorrect === null
                        ? 'bg-gray-100 text-gray-800'
                        : pick.isCorrect
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {pick.points !== null ? `${pick.points} pts` : 'Not Scored'}
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="text-base font-semibold text-gray-900">
                        {pick.driverName}
                      </p>
                      <p className="text-sm text-gray-500">{pick.driverTeam}</p>
                      {pick.actualFinishPosition && (
                        <p className="text-xs text-gray-400 mt-1">
                          Actually finished: P{pick.actualFinishPosition}
                        </p>
                      )}
                      {pick.isCorrect === null && !pick.actualFinishPosition && (
                        <p className="text-xs text-gray-400 mt-1">
                          Race not scored yet
                        </p>
                      )}
                    </div>

                    {pick.actualDriverId && pick.actualDriverId !== pick.driverId && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">Actual:</p>
                        <p className="text-sm font-medium text-gray-700">
                          {pick.actualDriverName} ({pick.actualDriverTeam})
                        </p>
                      </div>
                    )}

                    {pick.isCorrect && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-sm text-green-600 font-medium">✓ Correct!</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
