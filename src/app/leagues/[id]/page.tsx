'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { leaguesAPI, activityAPI, League, f1racesAPI } from '@/lib/api';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import PageTitle from '@/components/PageTitle';

interface CurrentRace {
  weekNumber: number;
  raceName: string;
  raceDate: string;
  status: string;
}

export default function LeagueDetailPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;

  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [currentRace, setCurrentRace] = useState<CurrentRace | null>(null);
  const [loadingCurrentRace, setLoadingCurrentRace] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      loadLeague();
      loadCurrentRace();
      loadRecentActivity(parseInt(leagueId));
      loadLeagueStats(parseInt(leagueId));
    }
  }, [user, leagueId]);

  const loadLeague = async () => {
    try {
      setLoading(true);
      const response = await leaguesAPI.getLeague(parseInt(leagueId));
      if (response.data.success) {
        console.log('League data:', response.data.data); // Debug log
        setLeague(response.data.data);
        setIsMember(response.data.data.isMember);
        // Load recent activity after league is loaded
        loadRecentActivity(parseInt(leagueId));
        // Load stats
        loadLeagueStats(parseInt(leagueId));
      }
    } catch (error) {
      console.error('Error loading league:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async (leagueId: number) => {
    try {
      setActivityLoading(true);

      const response = await activityAPI.getRecentActivity(leagueId, 10);

      if (response.data.success) {
        setRecentActivity(response.data.data);
      }
    } catch (error: any) {
      console.error('Error loading recent activity:', error);
    } finally {
      setActivityLoading(false);
    }
  };





  const loadLeagueStats = async (leagueId: number) => {
    try {
      const response = await leaguesAPI.getLeagueStats(leagueId);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error: any) {
      console.error('Error loading league stats:', error);
    }
  };

  const loadCurrentRace = async () => {
    try {
      setLoadingCurrentRace(true);
      const response = await f1racesAPI.getCurrentRace();
      if (response.data.success) {
        setCurrentRace(response.data.data);
      }
    } catch (error) {
      console.error('Error loading current race:', error);
    } finally {
      setLoadingCurrentRace(false);
    }
  };

  const joinLeague = async () => {
    if (!league) return;

    try {
      setJoining(true);
      const response = await leaguesAPI.joinLeague(league.id);
      if (response.data.success) {
        showToast('Successfully joined the league!', 'success');
        // Update membership status and refresh activity
        setIsMember(true);
        loadRecentActivity(parseInt(leagueId));
        loadLeagueStats(parseInt(leagueId));
      }
    } catch (error: any) {
      console.error('Error joining league:', error);
      showToast(error.response?.data?.message || 'Failed to join league. Please try again.', 'error');
    } finally {
      setJoining(false);
    }
  };

  const updateLeagueName = async () => {
    if (!league || !editingName.trim()) return;

    try {
      setUpdating(true);
      const response = await leaguesAPI.updateLeague(league.id, editingName.trim());
      if (response.data.success) {
        showToast('League name updated successfully!', 'success');
        setLeague({ ...league, name: editingName.trim() });
        setShowSettings(false);
        setEditingName('');
        // Refresh recent activity to show the name change
        loadRecentActivity(parseInt(leagueId));
      }
    } catch (error: any) {
      console.error('Error updating league:', error);
      showToast(error.response?.data?.message || 'Failed to update league name. Please try again.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const deleteLeague = async () => {
    if (!league) return;

    try {
      setDeleting(true);
      const response = await leaguesAPI.deleteLeague(league.id);
      if (response.data.success) {
        showToast('League deleted successfully!', 'success');
        // Redirect to leagues page
        router.push('/leagues');
      }
    } catch (error: any) {
      console.error('Error deleting league:', error);
      showToast(error.response?.data?.message || 'Failed to delete league. Please try again.', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const leaveLeague = async () => {
    if (!league) return;

    try {
      setLeaving(true);
      const response = await leaguesAPI.leaveLeague(league.id);
      if (response.data.success) {
        showToast('Successfully left the league!', 'success');
        // Redirect to leagues page
        router.push('/leagues');
      }
    } catch (error: any) {
      console.error('Error leaving league:', error);
      showToast(error.response?.data?.message || 'Failed to leave league. Please try again.', 'error');
    } finally {
      setLeaving(false);
      setShowLeaveConfirm(false);
    }
  };

  const openSettings = () => {
    if (league) {
      if (league.userRole === 'Owner') {
        setEditingName(league.name);
      }
      setShowSettings(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">League not found</h1>
            <p className="text-gray-600 mt-2">The league you&apos;re looking for doesn&apos;t exist.</p>
            <Link
              href="/leagues"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
            >
              Back to Leagues
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <PageTitle
          title={league?.name || 'League'}
          subtitle={`${league?.memberCount || 0} members • Season ${league?.seasonYear || '2025'}`}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/picks-v2"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Make Picks
            </Link>
            <Link
              href={`/leagues/${leagueId}/standings`}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Standings
            </Link>
          </div>
        </PageTitle>

        {/* League Information */}
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6 mb-6 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Members</p>
                  <p className="text-2xl font-bold text-slate-800">{league?.memberCount || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600">Season</p>
                  <p className="text-2xl font-bold text-slate-800">{league?.seasonYear || '2025'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-600">Join Code</p>
                  <p className="text-lg font-bold text-slate-800">{league?.joinCode || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6 mb-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href={`/leagues/${leagueId}/standings`}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md group"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">Standings</h3>
                  <p className="text-sm text-slate-600">View current rankings</p>
                </div>
              </div>
            </Link>

            <Link
              href="/picks-v2"
              className="bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md group"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-green-700 transition-colors">Make Picks</h3>
                  <p className="text-sm text-slate-600">Select your predictions</p>
                </div>
              </div>
            </Link>

            <Link
              href={`/leagues/${leagueId}/activity`}
              className="bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border border-orange-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md group"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-orange-700 transition-colors">Activity</h3>
                  <p className="text-sm text-slate-600">View league history</p>
                </div>
              </div>
            </Link>

            <Link
              href={`/leagues/${leagueId}/results`}
              className="bg-gradient-to-br from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 border border-pink-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md group"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-pink-700 transition-colors">Results</h3>
                  <p className="text-sm text-slate-600">View race results</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{activity.message}</p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">No recent activity</h3>
              <p className="text-slate-600">Activity will appear here as members make picks and races are completed.</p>
            </div>
          )}
        </div>
      </main>

      {/* League Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">League Settings</h3>

              {league?.userRole === 'Owner' ? (
                <>
                  {/* Update League Name - Owner Only */}
                  <div className="mb-6">
                    <label htmlFor="leagueName" className="block text-sm font-medium text-gray-700 mb-2">
                      League Name
                    </label>
                    <input
                      type="text"
                      id="leagueName"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-gray-900 placeholder-gray-500"
                      placeholder="Enter league name"
                    />
                    <button
                      onClick={updateLeagueName}
                      disabled={updating || !editingName.trim()}
                      className="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? 'Updating...' : 'Update Name'}
                    </button>
                  </div>

                  {/* Delete League - Owner Only */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Danger Zone</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Once you delete a league, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete League
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Leave League - Member Only */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Leave League</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      You can leave this league at any time. You can rejoin later if you have the join code.
                    </p>
                    <button
                      onClick={() => setShowLeaveConfirm(true)}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      Leave League
                    </button>
                  </div>
                </>
              )}

              {/* Close Button */}
              <div className="mt-4">
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setEditingName('');
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">Delete League</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete "{league?.name}"? This action cannot be undone and will permanently delete all league data including picks, standings, and activity.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={deleteLeague}
                  disabled={deleting}
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete League'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">Leave League</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to leave "{league?.name}"? You can rejoin later if you have the join code.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={leaveLeague}
                  disabled={leaving}
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {leaving ? 'Leaving...' : 'Leave League'}
                </button>
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 