'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { leaguesAPI, League, chatAPI } from '@/lib/api';
import Link from 'next/link';
import PageTitle from '@/components/PageTitle';
import { useSearchParams } from 'next/navigation';

export default function LeaguesPage() {
  const { user, isLoading: authLoading } = useAuth();
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

  useEffect(() => {
    // Only load data if auth is not loading
    if (!authLoading) {
      loadLeagues();
    }
  }, [authLoading, user]);

  const loadLeagues = async () => {
    try {
      setLoading(true);

      if (user) {
        // Authenticated user - get their leagues and public leagues they can join
        const [myLeaguesResponse, publicLeaguesResponse, unreadCountsResponse] = await Promise.all([
          leaguesAPI.getLeagues(),
          leaguesAPI.getPublicLeagues(),
          chatAPI.getAllUnreadCounts()
        ]);

        if (myLeaguesResponse.data.success) {
          setMyLeagues(myLeaguesResponse.data.data);
        }

        if (publicLeaguesResponse.data.success) {
          setPublicLeagues(publicLeaguesResponse.data.data);
        }

        if (unreadCountsResponse.data.success) {
          const counts: { [leagueId: number]: number } = {};
          unreadCountsResponse.data.unreadCounts.forEach((item: { leagueId: number; unreadCount: number }) => {
            counts[item.leagueId] = item.unreadCount;
          });
          setUnreadCounts(counts);
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

  const hasPickForPosition = (league: League, position: number): boolean => {
    if (!league.positionStatus || !league.positionStatus.positions) {
      return false;
    }
    const positionStatus = league.positionStatus.positions.find(p => p.position === position);
    return positionStatus ? positionStatus.hasPick : false;
  };

  const getPositionBadgeClass = (league: League, position: number): string => {
    const hasPick = hasPickForPosition(league, position);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 mb-20">
        <PageTitle
          title="Leagues"
          subtitle="Manage your F1 prediction game"
        >
          <div className="flex items-center space-x-3">
            {user ? (
              <Link
                href={`/join?redirect=${encodeURIComponent(redirectTo)}`}
                className="text-gray-600 hover:text-gray-700 font-medium"
              >
                Join League
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-700 font-medium"
              >
                Login to Join
              </Link>
            )}
            {user ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create League
              </button>
            ) : (
              <Link
                href="/signup"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign Up to Create
              </Link>
            )}
          </div>
        </PageTitle>

        {/* My Leagues Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Leagues</h2>
            {user && (
              <div className="text-sm text-gray-500">
                {myLeagues.length} league{myLeagues.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {!user ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Log in to see your leagues</h3>
              <p className="mt-1 text-sm text-gray-500">Sign up or log in to create and manage your own leagues.</p>
              <div className="mt-6">
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
          ) : myLeagues.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven&apos;t joined any leagues yet.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Your First League
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myLeagues.map((league) => (
                <div
                  key={league.id}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-900">{league.name}</h3>
                        {user && unreadCounts[league.id] > 0 && (
                          <div className="relative">
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                            </svg>
                            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-4 text-xs font-bold text-white bg-blue-500 rounded-full">
                              {unreadCounts[league.id]}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${league.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {league.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {league.memberCount} member{league.memberCount !== 1 ? 's' : ''} • {league.userRole}
                    </p>

                    {/* Required Positions with Status */}
                    {league.requiredPositions && league.requiredPositions.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-500">Positions:</span>
                        </div>
                        <div className="flex space-x-1">
                          {league.requiredPositions.map((position, index) => (
                            <span
                              key={position}
                              className={getPositionBadgeClass(league, position)}
                            >
                              P{position}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <Link
                        href={`/leagues/${league.id}`}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        View League
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Public Leagues Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Public Leagues</h2>
            <div className="text-sm text-gray-500">
              {user ? 'Browse and join public leagues' : 'Browse and preview public leagues'}
            </div>
          </div>

          {publicLeagues.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No public leagues available to join.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {publicLeagues.map((league) => (
                <div
                  key={league.id}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-900">{league.name}</h3>
                        {unreadCounts[league.id] > 0 && (
                          <div className="relative">
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                            </svg>
                            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-4 text-xs font-bold text-white bg-blue-500 rounded-full">
                              {unreadCounts[league.id]}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Public
                      </span>
                    </div>

                    {/* Limited League Info for Public Leagues */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Members:</span>
                        <span className="font-medium text-gray-900">{league.memberCount}</span>
                      </div>

                      {/* Required Positions */}
                      {league.requiredPositions && league.requiredPositions.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Positions:</span>
                          <div className="flex space-x-1">
                            {league.requiredPositions.map((position, index) => (
                              <span
                                key={position}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white text-gray-700 border border-gray-300"
                              >
                                P{position}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Activity Level Indicator (vague) */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Activity Level:</span>
                        <span className={`font-medium ${(league.lastTwoRaceWeeksActivity || 0) > 15 ? 'text-green-600' :
                          (league.lastTwoRaceWeeksActivity || 0) > 8 ? 'text-yellow-600' : 'text-gray-500'
                          }`}>
                          {(league.lastTwoRaceWeeksActivity || 0) > 15 ? 'Very Active' :
                            (league.lastTwoRaceWeeksActivity || 0) > 8 ? 'Active' : 'Quiet'}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4">
                      {user ? (
                        <button
                          onClick={() => {
                            // Handle joining the league
                            window.location.href = `/joinleague/${league.joinCode}`;
                          }}
                          className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                        >
                          Join League
                        </button>
                      ) : (
                        <Link
                          href={`/leagues/${league.id}`}
                          className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                        >
                          Preview League
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Spacer for bottom navigation bar */}
      <div className="h-20 md:hidden"></div>

      {/* Create League Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 sm:w-[480px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New League</h3>
              <form onSubmit={createLeague}>
                <div className="mb-4">
                  <label htmlFor="leagueName" className="block text-sm font-medium text-gray-700">
                    League Name
                  </label>
                  <input
                    type="text"
                    id="leagueName"
                    value={newLeagueName}
                    onChange={(e) => setNewLeagueName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-900"
                    placeholder="Enter league name"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    League Visibility
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        checked={!isPublic}
                        onChange={() => setIsPublic(false)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Private</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        checked={isPublic}
                        onChange={() => setIsPublic(true)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Public</span>
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {isPublic
                      ? 'Anyone can discover and join your league'
                      : 'Only people with the join code can join your league'
                    }
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Positions
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((position) => (
                      <button
                        key={position}
                        type="button"
                        onClick={() => handlePositionToggle(position)}
                        className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${selectedPositions.includes(position)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        P{position}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Select 1-2 positions that league members must predict
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newLeagueName.trim() || selectedPositions.length === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creating...' : 'Create League'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 