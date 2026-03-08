'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChatFeature } from '@/contexts/FeatureFlagContext';
import { leaguesAPI, League, chatAPI, seasonsAPI } from '@/lib/api';
import Link from 'next/link';
import PageTitle from '@/components/PageTitle';
import { useSearchParams } from 'next/navigation';

export default function LeaguesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { isChatFeatureEnabled } = useChatFeature();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [publicLeagues, setPublicLeagues] = useState<League[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<{ [leagueId: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLeagueName, setNewLeagueName] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);
  const [seasons, setSeasons] = useState<{ year: number; displayLabel: string }[]>([]);
  const [seasonFilter, setSeasonFilter] = useState<number | null>(null);

  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const [seasonsRes, currentRes] = await Promise.all([
          seasonsAPI.getSeasons(),
          seasonsAPI.getCurrentSeason()
        ]);
        if (seasonsRes.data?.success && Array.isArray(seasonsRes.data.data)) {
          const list = seasonsRes.data.data as { year: number; displayLabel: string }[];
          setSeasons(list);
          const currentYear = currentRes.data?.success && currentRes.data?.data?.year != null
            ? currentRes.data.data.year
            : list.length > 0 ? list[0].year : null;
          if (currentYear != null) {
            setSeasonFilter((prev) => (prev === null ? currentYear : prev));
          }
        }
      } catch {
        // leave seasonFilter null so we show all leagues
      }
    };
    loadSeasons();
  }, []);

  useEffect(() => {
    // Only load data if auth is not loading
    if (!authLoading) {
      loadLeagues();
    }
  }, [authLoading, user, isChatFeatureEnabled]);

  const loadLeagues = async () => {
    try {
      setLoading(true);

      if (user) {
        // Authenticated user - get their leagues and public leagues they can join
        const promises = [
          leaguesAPI.getLeagues(),
          leaguesAPI.getPublicLeagues()
        ];

        // Only load chat data if chat feature is enabled
        if (isChatFeatureEnabled) {
          promises.push(chatAPI.getAllUnreadCounts());
        }

        const responses = await Promise.all(promises);
        const [myLeaguesResponse, publicLeaguesResponse, unreadCountsResponse] = responses;

        if (myLeaguesResponse.data.success) {
          setMyLeagues(myLeaguesResponse.data.data);
        }

        if (publicLeaguesResponse.data.success) {
          setPublicLeagues(publicLeaguesResponse.data.data);
        }

        // Only process chat data if chat feature is enabled and response exists
        if (isChatFeatureEnabled && unreadCountsResponse?.data?.success) {
          const counts: { [leagueId: number]: number } = {};
          unreadCountsResponse.data.unreadCounts.forEach((item: { leagueId: number; unreadCount: number }) => {
            counts[item.leagueId] = item.unreadCount;
          });
          setUnreadCounts(counts);
        } else if (!isChatFeatureEnabled) {
          // Clear unread counts if chat feature is disabled
          setUnreadCounts({});
        }
      } else {
        // Unauthenticated user - get only public leagues
        const response = await leaguesAPI.getLeagues();
        if (response.data.success) {
          setMyLeagues([]); // No personal leagues for unauthenticated users
          setPublicLeagues(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error loading leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPickForPosition = (league: League, position: number, eventType: 'race' | 'sprint' = 'race'): boolean => {
    if (!league.positionStatus) {
      return false;
    }

    if (eventType === 'race' && league.positionStatus.race) {
      const positionStatus = league.positionStatus.race.positions.find(p => p.position === position);
      return positionStatus ? positionStatus.hasPick : false;
    } else if (eventType === 'sprint' && league.positionStatus.sprint) {
      const positionStatus = league.positionStatus.sprint.positions.find(p => p.position === position);
      return positionStatus ? positionStatus.hasPick : false;
    }

    return false;
  };

  const getPositionBadgeClass = (league: League, position: number, eventType: 'race' | 'sprint' = 'race'): string => {
    const hasPick = hasPickForPosition(league, position, eventType);
    return hasPick
      ? 'inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-300'
      : 'inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-300';
  };

  const createLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeagueName.trim() || selectedPositions.length === 0) return;

    try {
      setCreating(true);
      const response = await leaguesAPI.createLeague(newLeagueName.trim(), selectedPositions, isPublic);
      if (response.data.success) {
        setShowCreateModal(false);
        setNewLeagueName('');
        setSelectedPositions([]);
        setIsPublic(false);
        loadLeagues();
      }
    } catch (error) {
      console.error('Error creating league:', error);
    } finally {
      setCreating(false);
    }
  };

  const handlePositionToggle = (position: number) => {
    setSelectedPositions(prev => {
      if (prev.includes(position)) {
        return prev.filter(p => p !== position);
      } else if (prev.length < 2) {
        return [...prev, position];
      }
      return prev;
    });
  };

  const resetModal = () => {
    setShowCreateModal(false);
    setNewLeagueName('');
    setSelectedPositions([]);
    setIsPublic(false);
  };

  if (authLoading || loading) {
    return (
      <div className="page-bg min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 mb-20">
        <PageTitle
          title="Leagues"
          subtitle="Manage your F1 prediction game"
        >
          <div className="flex flex-wrap items-center gap-3">
            {seasons.length > 0 && seasonFilter != null && (
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Season:</span>
                <select
                  value={seasonFilter}
                  onChange={(e) => setSeasonFilter(Number(e.target.value))}
                  className="input-field py-1.5 text-sm"
                >
                  {seasons.map((s) => (
                    <option key={s.year} value={s.year}>{s.displayLabel || s.year}</option>
                  ))}
                </select>
              </label>
            )}
            {user ? (
              <Link href={`/join?redirect=${encodeURIComponent(redirectTo)}`} className="btn-ghost text-sm py-1.5 px-3">
                Join League
              </Link>
            ) : (
              <Link href="/login" className="btn-ghost text-sm py-1.5 px-3">
                Login to Join
              </Link>
            )}
            {user ? (
              <button onClick={() => setShowCreateModal(true)} className="btn-primary text-sm py-1.5 px-4">
                Create League
              </button>
            ) : (
              <Link href="/signup" className="btn-primary text-sm py-1.5 px-4">
                Sign Up to Create
              </Link>
            )}
          </div>
        </PageTitle>

        {/* My Leagues Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Leagues</h2>
            {user && (
              <span className="text-sm text-gray-500">
                {(seasonFilter != null ? myLeagues.filter((l) => l.seasonYear === seasonFilter) : myLeagues).length} league{(seasonFilter != null ? myLeagues.filter((l) => l.seasonYear === seasonFilter) : myLeagues).length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {!user ? (
            <div className="glass-card px-6 py-10 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Log in to see your leagues</h3>
              <p className="text-sm text-gray-500 mb-6">Sign up or log in to create and manage your own leagues.</p>
              <div className="flex gap-3 justify-center">
                <Link href="/login" className="btn-ghost text-sm py-2 px-5">Log In</Link>
                <Link href="/signup" className="btn-primary text-sm py-2 px-5">Sign Up</Link>
              </div>
            </div>
          ) : (() => {
              const filteredMy = seasonFilter != null ? myLeagues.filter((l) => l.seasonYear === seasonFilter) : myLeagues;
              return filteredMy.length === 0 ? (
            <div className="glass-card px-6 py-10 text-center">
              <p className="text-gray-500 mb-4">
                {seasonFilter != null ? `No leagues for ${seasonFilter}. Try another season.` : "You haven't joined any leagues yet."}
              </p>
              {seasonFilter == null && (
                <button onClick={() => setShowCreateModal(true)} className="btn-primary text-sm py-2 px-5">
                  Create Your First League
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
              {filteredMy.map((league) => (
                <div key={league.id} className="glass-card card-hover overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                        <h3 className="text-base font-semibold text-gray-900 truncate">{league.name}</h3>
                        {user && isChatFeatureEnabled && unreadCounts[league.id] > 0 && (
                          <div className="relative flex-shrink-0">
                            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                            </svg>
                            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-blue-500 rounded-full">
                              {unreadCounts[league.id]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="badge-gray">{league.seasonYear}</span>
                        <span className={league.isPublic ? 'badge-green' : 'badge-gray'}>{league.isPublic ? 'Public' : 'Private'}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      {league.memberCount} member{league.memberCount !== 1 ? 's' : ''} · {league.userRole}
                    </p>

                    {/* Required Positions with Status */}
                    {league.requiredPositions && league.requiredPositions.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {league.positionStatus?.hasSprint === true && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Sprint</p>
                            <div className="flex gap-1 flex-wrap">
                              {league.requiredPositions.sort((a, b) => a - b).map((position) => (
                                <span key={`sprint-${position}`} className={getPositionBadgeClass(league, position, 'sprint')}>
                                  P{position}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Race</p>
                          <div className="flex gap-1 flex-wrap">
                            {league.requiredPositions.sort((a, b) => a - b).map((position) => (
                              <span key={`race-${position}`} className={getPositionBadgeClass(league, position, 'race')}>
                                P{position}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <Link href={`/leagues/${league.id}`} className="btn-secondary text-sm py-1.5 px-3 w-full text-center block">
                      View League
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          );
          })()}
        </div>

        {/* Public Leagues Section */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Public Leagues</h2>
            <span className="text-sm text-gray-500">
              {user ? 'Browse and join public leagues' : 'Browse and preview public leagues'}
            </span>
          </div>

          {(() => {
            const filteredPublic = seasonFilter != null ? publicLeagues.filter((l) => l.seasonYear === seasonFilter) : publicLeagues;
            return filteredPublic.length === 0 ? (
            <div className="glass-card px-6 py-10 text-center">
              <p className="text-gray-500">
                {seasonFilter != null ? `No public leagues for ${seasonFilter}.` : 'No public leagues available to join.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
              {filteredPublic.map((league) => (
                <div key={league.id} className="glass-card card-hover overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                        <h3 className="text-base font-semibold text-gray-900 truncate">{league.name}</h3>
                        {isChatFeatureEnabled && unreadCounts[league.id] > 0 && (
                          <div className="relative flex-shrink-0">
                            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                            </svg>
                            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-blue-500 rounded-full">
                              {unreadCounts[league.id]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="badge-gray">{league.seasonYear}</span>
                        <span className="badge-green">Public</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 mb-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Members</span>
                        <span className="font-semibold text-gray-900">{league.memberCount}</span>
                      </div>

                      {league.requiredPositions && league.requiredPositions.length > 0 && (
                        <div className="space-y-1">
                          {league.positionStatus?.hasSprint === true && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Sprint</span>
                              <div className="flex gap-1">
                                {league.requiredPositions.sort((a, b) => a - b).map((position) => (
                                  <span key={`sprint-${position}`} className="badge-gray">P{position}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Race</span>
                            <div className="flex gap-1">
                              {league.requiredPositions.sort((a, b) => a - b).map((position) => (
                                <span key={`race-${position}`} className="badge-gray">P{position}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Activity</span>
                        <span className={`font-semibold ${(league.lastTwoRaceWeeksActivity || 0) > 15 ? 'text-green-600' :
                          (league.lastTwoRaceWeeksActivity || 0) > 8 ? 'text-yellow-600' : 'text-gray-400'
                          }`}>
                          {(league.lastTwoRaceWeeksActivity || 0) > 15 ? 'Very Active' :
                            (league.lastTwoRaceWeeksActivity || 0) > 8 ? 'Active' : 'Quiet'}
                        </span>
                      </div>
                    </div>

                    {user ? (
                      league.seasonEnded ? (
                        <div className="btn-ghost text-sm py-1.5 px-3 w-full text-center opacity-50 cursor-not-allowed">
                          Season ended
                        </div>
                      ) : (
                        <button
                          onClick={() => { window.location.href = `/joinleague/${league.joinCode}`; }}
                          className="btn-primary text-sm py-1.5 px-3 w-full text-center"
                          style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
                        >
                          Join League
                        </button>
                      )
                    ) : (
                      <Link href={`/leagues/${league.id}`} className="btn-ghost text-sm py-1.5 px-3 w-full text-center block">
                        Preview League
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
          })()}
        </div>
      </main>

      {/* Spacer for bottom navigation bar */}
      <div className="h-20 md:hidden"></div>

      {/* Create League Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-16 px-4">
          <div className="glass-card w-full max-w-[480px] p-6 animate-fade-in-up">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Create New League</h3>
            <form onSubmit={createLeague} className="space-y-5">
              <div>
                <label htmlFor="leagueName" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  League Name
                </label>
                <input
                  type="text"
                  id="leagueName"
                  value={newLeagueName}
                  onChange={(e) => setNewLeagueName(e.target.value)}
                  className="input-field"
                  placeholder="Enter league name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Visibility
                </label>
                <div className="flex gap-3">
                  {[{ value: false, label: 'Private' }, { value: true, label: 'Public' }].map(({ value, label }) => (
                    <label key={label} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${isPublic === value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="visibility"
                        checked={isPublic === value}
                        onChange={() => setIsPublic(value)}
                        className="sr-only"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-gray-400">
                  {isPublic ? 'Anyone can discover and join your league' : 'Only people with the join code can join'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Required Positions
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((position) => (
                    <button
                      key={position}
                      type="button"
                      onClick={() => handlePositionToggle(position)}
                      className={`py-2 text-xs font-semibold rounded-lg border-2 transition-all ${selectedPositions.includes(position)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                        }`}
                    >
                      P{position}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-gray-400">
                  Select 1-2 positions that league members must predict
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={resetModal} className="btn-ghost flex-1 py-2.5 text-sm">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newLeagueName.trim() || selectedPositions.length === 0}
                  className="btn-primary flex-1 py-2.5 text-sm"
                >
                  {creating ? 'Creating…' : 'Create League'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 