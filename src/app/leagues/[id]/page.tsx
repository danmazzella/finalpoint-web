'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { leaguesAPI, activityAPI, League, f1racesAPI } from '@/lib/api';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

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
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{league.name}</h1>
              <p className="text-gray-600">Season {league.seasonYear}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/leagues"
                className="text-gray-600 hover:text-gray-700 font-medium"
              >
                All Leagues
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions and League Stats - Left Side */}
          <div className="lg:col-span-1">
            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href={`/picks?league=${league.id}`}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                >
                  Make Picks
                </Link>
                {!isMember && (
                  <button
                    onClick={joinLeague}
                    disabled={joining}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {joining ? 'Joining...' : 'Join League'}
                  </button>
                )}
                <Link
                  href={`/leagues/${leagueId}/standings`}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Standings
                </Link>

                <Link
                  href={`/leagues/${leagueId}/results/${currentRace?.weekNumber || 1}`}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {loadingCurrentRace ? 'Loading...' : 'View Results'}
                </Link>
                {league?.userRole && (
                  <button
                    onClick={openSettings}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    League Settings
                  </button>
                )}
              </div>
            </div>

            {/* League Stats */}
            <div className="bg-white shadow rounded-lg p-6 mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">League Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Picks</span>
                  <span className="text-sm font-medium text-gray-900">{stats?.totalPicks || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Correct Picks</span>
                  <span className="text-sm font-medium text-gray-900">{stats?.correctPicks || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Accuracy</span>
                  <span className="text-sm font-medium text-gray-900">{stats?.overallAccuracy || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Average Points</span>
                  <span className="text-sm font-medium text-gray-900">{stats?.averagePoints || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* League Info and Recent Activity - Right Side */}
          <div className="lg:col-span-2">
            {/* League Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">League Information</h2>
                {league.joinCode && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/joinleague/${league.joinCode}`;
                        navigator.clipboard.writeText(shareUrl);
                        showToast('Invite link copied! Share it with friends to join your league.', 'success');
                      }}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      Invite Friends
                    </button>
                    <button
                      onClick={() => {
                        if (league.joinCode) {
                          navigator.clipboard.writeText(league.joinCode);
                          showToast('Join code copied to clipboard!', 'success');
                        }
                      }}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Code
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">League Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{league.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Season</dt>
                  <dd className="mt-1 text-sm text-gray-900">{league.seasonYear}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Members</dt>
                  <dd className="mt-1 text-sm text-gray-900">{league.memberCount || 1} member{league.memberCount !== 1 ? 's' : ''}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Your Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isMember
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {isMember ? 'Member' : 'Not a Member'}
                    </span>
                  </dd>
                </div>
                {league.joinCode && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Join Code</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className="font-mono tracking-widest bg-gray-100 px-2 py-1 rounded">
                        {league.joinCode}
                      </span>
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg p-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                <Link
                  href={`/leagues/${leagueId}/activity`}
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                >
                  View All Activity →
                </Link>
              </div>
              {activityLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading activity...</p>
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-500 mb-2">Found {recentActivity.length} activities</div>
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activity.activityType === 'pick_created' ? 'bg-green-100' :
                          activity.activityType === 'pick_changed' ? 'bg-blue-100' :
                            activity.activityType === 'user_joined' ? 'bg-purple-100' :
                              activity.activityType === 'user_left' ? 'bg-red-100' :
                                activity.activityType === 'league_name_changed' ? 'bg-indigo-100' :
                                  activity.activityType === 'race_result_processed' ? 'bg-yellow-100' :
                                    'bg-pink-100'
                          }`}>
                          <svg className={`h-4 w-4 ${activity.activityType === 'pick_created' ? 'text-green-600' :
                            activity.activityType === 'pick_changed' ? 'text-blue-600' :
                              activity.activityType === 'user_joined' ? 'text-purple-600' :
                                activity.activityType === 'user_left' ? 'text-red-600' :
                                  activity.activityType === 'league_name_changed' ? 'text-indigo-600' :
                                    activity.activityType === 'race_result_processed' ? 'text-yellow-600' :
                                      'text-pink-600'
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {activity.activityType === 'pick_created' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : activity.activityType === 'pick_changed' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            ) : activity.activityType === 'user_joined' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            ) : activity.activityType === 'user_left' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            ) : activity.activityType === 'league_name_changed' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            ) : activity.activityType === 'race_result_processed' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.activityType === 'user_joined' ? (
                            `${activity.userName} joined the league`
                          ) : activity.activityType === 'user_left' ? (
                            `${activity.userName} left the league`
                          ) : activity.activityType === 'league_name_changed' ? (
                            `${activity.userName} changed the league name`
                          ) : activity.activityType === 'race_result_processed' ? (
                            `Race results processed for Week ${activity.weekNumber}`
                          ) : (
                            `${activity.userName || 'System'} ${activity.activityType === 'pick_created' ? 'made a pick' : 'changed their pick'} for Week ${activity.weekNumber}`
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.activityType === 'pick_created' ? (
                            `Picked ${activity.driverName} (${activity.driverTeam}) for P${activity.position}`
                          ) : activity.activityType === 'pick_changed' ? (
                            `Changed P${activity.position} from ${activity.previousDriverName} (${activity.previousDriverTeam}) to ${activity.driverName} (${activity.driverTeam})`
                          ) : activity.activityType === 'race_result_processed' ? (
                            `${activity.raceName ? `${activity.raceName} - ` : ''}${activity.driverName} (${activity.driverTeam}) finished in P${activity.position}`
                          ) : activity.activityType === 'user_joined' ? (
                            `Welcome to the league!`
                          ) : activity.activityType === 'user_left' ? (
                            `Goodbye!`
                          ) : activity.activityType === 'league_name_changed' ? (
                            `Changed from "${activity.previousDriverName}" to "${activity.driverName}"`
                          ) : (
                            `Picked ${activity.driverName} (${activity.driverTeam}) for P${activity.position}`
                          )}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-sm text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                  <p className="mt-1 text-sm text-gray-500">Activity will appear here as members make picks.</p>
                </div>
              )}
            </div>




          </div>
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