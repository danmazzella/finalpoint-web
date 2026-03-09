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

  useEffect(() => {
    const eventTypeParam = searchParams.get('eventType');
    if (eventTypeParam === 'sprint' || eventTypeParam === 'race') {
      setSelectedEventType(eventTypeParam);
      setEventTypeInitialized(true);
    } else if (eventTypeParam === 'null' || eventTypeParam === null) {
      setEventTypeInitialized(true);
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
    if (!selectedEventType) return;
    const timeoutId = setTimeout(() => {
      const currentUrl = new URL(window.location.href);
      const currentEventType = currentUrl.searchParams.get('eventType') || 'race';
      if (currentEventType !== selectedEventType) {
        const url = new URL(window.location.href);
        url.searchParams.set('eventType', selectedEventType);
        window.history.replaceState({}, '', url.toString());
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedEventType]);

  const loadMemberPicks = useCallback(async () => {
    if (!selectedEventType) return;
    try {
      setLoading(true);
      setError(null);
      const response = await picksAPI.getMemberPicksV2(
        parseInt(leagueId), parseInt(weekNumber), parseInt(userId), selectedEventType
      );
      if (response.data.success) {
        setMemberPicks(response.data.data);
      } else {
        setError('Failed to load member picks');
      }
    } catch {
      setError('Failed to load member picks');
    } finally {
      setLoading(false);
    }
  }, [leagueId, weekNumber, userId, selectedEventType]);

  const loadLeagueMembers = useCallback(async () => {
    if (!selectedEventType) return;
    try {
      const response = await picksAPI.getRaceResultsV2(parseInt(leagueId), parseInt(weekNumber), selectedEventType);
      if (response.data.success) {
        setLeagueMembers(response.data.data.results.map((result: { userId: number; userName: string; userAvatar?: string }) => ({
          id: result.userId, name: result.userName, avatar: result.userAvatar
        })));
      }
    } catch {
      try {
        const fallback = await leaguesAPI.getLeagueMembers(parseInt(leagueId));
        if (fallback.data.success) setLeagueMembers(fallback.data.data);
      } catch { /* ignore */ }
    }
  }, [leagueId, weekNumber, selectedEventType]);

  const loadCurrentRace = async () => {
    try {
      const response = await f1racesAPI.getAllRaces();
      if (response.data.success) {
        setCurrentRace(response.data.data.find((race: any) => race.weekNumber === parseInt(weekNumber)));
      }
    } catch { /* ignore */ }
  };

  const getCurrentMemberIndex = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const memberIndex = urlParams.get('memberIndex');
    if (memberIndex !== null) {
      const index = parseInt(memberIndex);
      return index >= 0 && index < leagueMembers.length ? index : 0;
    }
    const targetUserId = parseInt(userId);
    const allMatches = leagueMembers.map((m, i) => m.id === targetUserId ? i : -1).filter(i => i !== -1);
    return allMatches.length > 0 ? allMatches[0] : 0;
  };

  const navigateToMember = (newUserId: number, memberIndex?: number) => {
    const p = new URLSearchParams();
    if (memberIndex !== undefined) p.set('memberIndex', memberIndex.toString());
    p.set('eventType', selectedEventType || 'race');
    router.replace(`/leagues/${leagueId}/results/${weekNumber}/member/${newUserId}?${p.toString()}`);
  };

  const navigateToPrevious = () => {
    const i = getCurrentMemberIndex();
    if (i > 0) navigateToMember(leagueMembers[i - 1].id, i - 1);
  };

  const navigateToNext = () => {
    const i = getCurrentMemberIndex();
    if (i < leagueMembers.length - 1) navigateToMember(leagueMembers[i + 1].id, i + 1);
  };

  useEffect(() => { loadCurrentRace(); }, [leagueId, weekNumber]);

  useEffect(() => {
    if (eventTypeInitialized && selectedEventType) {
      loadMemberPicks();
      loadLeagueMembers();
    }
  }, [selectedEventType, eventTypeInitialized, loadMemberPicks, loadLeagueMembers]);

  const getPositionLabel = (position: number) => `P${position}`;

  if (loading) {
    return (
      <div className="page-bg min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !memberPicks) {
    return (
      <div className="page-bg min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{error ? 'Error Loading Picks' : 'No Picks Found'}</h2>
          <p className="text-sm text-gray-500 mb-5">{error || 'No picks available for this member.'}</p>
          <Link href={`/leagues/${leagueId}/results/${weekNumber}`} className="btn-primary text-sm py-2 px-4">
            Back to Results
          </Link>
        </div>
      </div>
    );
  }

  const canPrev = getCurrentMemberIndex() > 0;
  const canNext = getCurrentMemberIndex() < leagueMembers.length - 1;
  const isScored = memberPicks.picks.some(p => p.isCorrect !== null);

  return (
    <div className="page-bg min-h-screen">
      <main className="max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <PageTitle
          title={memberPicks.userName}
          subtitle={`Week ${memberPicks.weekNumber} · ${selectedEventType === 'sprint' ? 'Sprint' : 'Race'} · ${memberPicks.totalPicks} positions`}
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

        {/* Member navigation */}
        <div className="glass-card p-4 mb-5 flex items-center gap-3">
          <button
            onClick={navigateToPrevious}
            disabled={!canPrev}
            className={`btn-ghost text-sm py-1.5 px-3 flex items-center ${!canPrev ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>

          <div className="flex-1 flex items-center justify-center gap-3">
            <Avatar src={memberPicks.userAvatar} alt={memberPicks.userName} size="sm" className="shadow-sm" />
            <span className="text-sm font-medium text-gray-700">{memberPicks.userName}</span>
          </div>

          <button
            onClick={navigateToNext}
            disabled={!canNext}
            className={`btn-ghost text-sm py-1.5 px-3 flex items-center ${!canNext ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            Next
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Picks', value: memberPicks.totalPicks, color: 'text-gray-900' },
            { label: 'Correct', value: memberPicks.correctPicks, color: 'text-green-600' },
            { label: 'Accuracy', value: `${memberPicks.accuracy}%`, color: 'text-blue-600' },
            { label: 'Points', value: memberPicks.totalPoints, color: 'text-purple-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card p-3 text-center">
              <div className={`text-xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Event type toggle */}
        {currentRace?.hasSprint && (
          <div className="glass-card p-3 mb-5 flex justify-center">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['sprint', 'race'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedEventType(type)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                    selectedEventType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {type === 'sprint' ? 'Sprint Results' : 'Race Results'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Picks grid */}
        {memberPicks.picks.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <p className="text-gray-500 text-sm">{memberPicks.userName} hasn&apos;t made any picks for Week {memberPicks.weekNumber} yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {memberPicks.picks.map((pick) => {
              const scored = pick.isCorrect !== null;
              const correct = pick.isCorrect === true;
              const wrong = pick.isCorrect === false;
              const wrongDriver = pick.actualDriverId && pick.actualDriverId !== pick.driverId;

              return (
                <div
                  key={pick.position}
                  className={`rounded-2xl border-2 overflow-hidden ${
                    correct
                      ? 'border-green-400 bg-green-50'
                      : wrong
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 bg-white/70'
                  }`}
                >
                  {/* Card header */}
                  <div className={`flex items-center justify-between px-4 py-2.5 border-b ${
                    correct ? 'border-green-200 bg-green-100/60' : wrong ? 'border-red-200 bg-red-100/40' : 'border-gray-100 bg-gray-50'
                  }`}>
                    <span className="text-sm font-bold text-gray-700">{getPositionLabel(pick.position)}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      correct
                        ? 'bg-green-500 text-white'
                        : wrong
                          ? 'bg-red-400 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {scored ? (correct ? `✓ ${pick.points} pts` : `✗ ${pick.points} pts`) : 'Not scored'}
                    </span>
                  </div>

                  {/* Your pick */}
                  <div className="px-4 pt-3 pb-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Your Pick</p>
                    <p className={`text-sm font-bold ${correct ? 'text-green-700' : wrong ? 'text-red-700' : 'text-gray-900'}`}>
                      {pick.driverName || '—'}
                    </p>
                    <p className="text-xs text-gray-400">{pick.driverTeam || ''}</p>
                    {pick.actualFinishPosition && !correct && (
                      <p className="text-xs text-gray-400 mt-0.5">Finished P{pick.actualFinishPosition}</p>
                    )}
                  </div>

                  {/* Actual result (only when scored and wrong) */}
                  {scored && wrongDriver && (
                    <div className="mx-4 mb-3 mt-1 pt-2 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Actual P{pick.position}</p>
                      <p className="text-sm font-bold text-green-700">{pick.actualDriverName}</p>
                      <p className="text-xs text-gray-400">{pick.actualDriverTeam}</p>
                    </div>
                  )}

                  {/* No pick made */}
                  {!pick.driverName && (
                    <div className="px-4 pb-3">
                      <p className="text-xs text-gray-400 italic">No pick made</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
