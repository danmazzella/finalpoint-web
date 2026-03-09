'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useChatFeature, usePositionChanges, useMultiPositionPicks } from '@/contexts/FeatureFlagContext';
import { leaguesAPI, activityAPI, League, f1racesAPI, chatAPI, picksAPI } from '@/lib/api';
import { copyToClipboardWithFeedback } from '@/utils/clipboardUtils';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import PageTitle from '@/components/PageTitle';
import { ComprehensiveNotificationPrompt } from '@/components/ComprehensiveNotificationPrompt';
import { Activity } from '@/lib/api';

interface CurrentRace {
  id: number;
  name: string;
  date: string;
  circuit: string;
  country: string;
  weekNumber: number;
  isLocked: boolean;
}

interface LeagueMember {
  id: number;
  name: string;
  avatar: string | null;
  isAdmin: boolean;
  totalPoints: number;
  currentRank: number;
}

interface UserPick {
  id: number;
  driverId: number;
  driverName: string;
  driverTeam: string;
  position: number;
  weekNumber: number;
  isLocked: boolean;
}

export default function LeagueDetailPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isChatFeatureEnabled } = useChatFeature();
  const { isPositionChangesEnabled } = usePositionChanges();
  const { isMultiPositionPicksEnabled } = useMultiPositionPicks();
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;



  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
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
  const [unreadCount, setUnreadCount] = useState(0);

  // Position changes state
  const [editingPositions, setEditingPositions] = useState<number[]>([]);
  const [updatingPositions, setUpdatingPositions] = useState(false);
  const [showPositionChangeConfirm, setShowPositionChangeConfirm] = useState(false);
  const [positionChangeConflict, setPositionChangeConflict] = useState<any>(null);

  useEffect(() => {
    // Load league data for both authenticated and unauthenticated users
    loadLeague();
    loadCurrentRace();
    loadLeagueStats(parseInt(leagueId)); // League stats are public data

    // Only load user-specific data if authenticated
    if (user) {
      loadRecentActivity(parseInt(leagueId));

      // Only load chat data if chat feature is enabled
      if (isChatFeatureEnabled) {
        loadUnreadCount(parseInt(leagueId));
      } else {
        setUnreadCount(0); // Clear unread count if chat is disabled
      }
    }
  }, [user, leagueId, isChatFeatureEnabled]);

  const loadLeague = async () => {
    try {
      setLoading(true);
      const response = await leaguesAPI.getLeague(parseInt(leagueId));
      if (response.data.success) {
        setLeague(response.data.data);
        // Only set member status if user is authenticated
        if (user) {
          setIsMember(response.data.data.isMember);
        } else {
          setIsMember(false); // Unauthenticated users are not members
        }
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

  const loadUnreadCount = async (leagueId: number) => {
    try {
      const response = await chatAPI.getUnreadCount(leagueId);
      if (response.data.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error: any) {
      console.error('Error loading unread count:', error);
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
      } else {
        setCurrentRace(null);
      }
    } catch (error) {
      setCurrentRace(null);
      // 404 is expected when there are no upcoming races (e.g. off-season)
      if (error && typeof error === 'object' && 'response' in error && (error as { response?: { status?: number } }).response?.status !== 404) {
        console.error('Error loading current race:', error);
      }
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

  const updateLeagueVisibility = async (isPublic: boolean) => {
    if (!league) return;

    try {
      setUpdating(true);
      const response = await leaguesAPI.updateLeague(league.id, league.name, isPublic);
      if (response.data.success) {
        showToast('League visibility updated successfully!', 'success');
        setLeague({ ...league, isPublic });
        setShowSettings(false);
        setEditingName('');
        // Refresh recent activity to show the visibility change
        loadRecentActivity(parseInt(leagueId));
      }
    } catch (error: any) {
      console.error('Error updating league visibility:', error);
      showToast(error.response?.data?.message || 'Failed to update league visibility. Please try again.', 'error');
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
        setEditingPositions(league.requiredPositions || []);
      }
      setShowSettings(true);
    }
  };

  const updateLeaguePositions = async (forceChange = false) => {
    if (!league || !editingPositions.length) return;

    try {
      setUpdatingPositions(true);
      const response = await picksAPI.updateLeaguePositions(league.id, editingPositions);

      if (response.data.success) {
        showToast('League positions updated successfully!', 'success');
        setLeague({ ...league, requiredPositions: editingPositions });
        setShowSettings(false);
        setEditingPositions([]);
        setShowPositionChangeConfirm(false);
        setPositionChangeConflict(null);
        // Refresh recent activity to show the position change
        loadRecentActivity(parseInt(leagueId));
      }
    } catch (error: any) {
      console.error('Error updating league positions:', error);

      // Check if it's a conflict error
      if (error.response?.data?.conflict) {
        setPositionChangeConflict(error.response.data);
        setShowPositionChangeConfirm(true);
      } else {
        showToast(error.response?.data?.message || 'Failed to update league positions. Please try again.', 'error');
      }
    } finally {
      setUpdatingPositions(false);
    }
  };

  const handlePositionToggle = (position: number) => {
    const maxPositions = isMultiPositionPicksEnabled ? 10 : 2;
    setEditingPositions(prev => {
      if (prev.includes(position)) {
        return prev.filter(p => p !== position);
      } else if (prev.length < maxPositions) {
        return [...prev, position].sort((a, b) => a - b);
      }
      return prev;
    });
  };

  if (loading) {
    return (
      <div className="page-bg min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!league) {
    return (
      <div className="page-bg min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md mx-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">League not found</h1>
          <p className="text-gray-500 mb-5">The league you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/leagues" className="btn-primary text-sm py-2 px-5">
            Back to Leagues
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-2 sm:px-6 sm:py-6 lg:px-8">
        <PageTitle
          title={league.name}
          subtitle={`Season ${league.seasonYear}`}
        >
          {isChatFeatureEnabled && unreadCount > 0 && (
            <div className="relative">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
              </svg>
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-4 text-xs font-bold text-white bg-blue-500 rounded-full">
                {unreadCount}
              </span>
            </div>
          )}
        </PageTitle>

        {/* Notification Prompt */}
        <ComprehensiveNotificationPrompt
          currentPage="league"
          leagues={[league]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Quick Actions and League Stats - Left Side */}
          <div className="lg:col-span-1">
            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h2>
              <div className="space-y-2.5">
                {user ? (
                  <>
                    <Link href={`/picks?league=${league.id}`} className="btn-primary w-full text-sm py-2.5">
                      Make Picks
                    </Link>
                    {isMember && isChatFeatureEnabled && (
                      <Link href={`/chat/${league.id}`} className="btn-secondary w-full text-sm py-2.5">
                        💬 League Chat
                      </Link>
                    )}
                    {!isMember && (
                      <button
                        onClick={joinLeague}
                        disabled={joining}
                        className="btn-primary w-full text-sm py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {joining ? 'Joining...' : 'Join League'}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-500 mb-3">Log in to make picks and join this league</p>
                    <div className="space-y-2">
                      <Link href="/login" className="btn-primary w-full text-sm py-2.5">Log In</Link>
                      <Link href="/signup" className="btn-ghost w-full text-sm py-2.5">Sign Up</Link>
                    </div>
                  </div>
                )}

                <Link href={`/leagues/${leagueId}/standings`} className="btn-ghost w-full text-sm py-2.5">
                  View Standings
                </Link>

                <Link
                  href={`/leagues/${leagueId}/results/${currentRace?.weekNumber || 1}`}
                  className="btn-ghost w-full text-sm py-2.5"
                >
                  {loadingCurrentRace ? 'Loading...' : 'View Results'}
                </Link>

                {user && league?.userRole && (
                  <button onClick={openSettings} className="btn-ghost w-full text-sm py-2.5">
                    League Settings
                  </button>
                )}
              </div>
            </div>

            {/* League Stats */}
            <div className="glass-card p-6 mt-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">League Stats</h2>
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
                  <span className="text-sm text-gray-500">Avg Distance</span>
                  <span className="text-sm font-medium text-gray-900">{stats?.avgDistance || 0} positions</span>
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
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">League Information</h2>
                {league.joinCode && (
                  <div className="flex space-x-2">
                    <button
                      onClick={async () => {
                        const shareUrl = `${window.location.origin}/joinleague/${league.joinCode}`;
                        await copyToClipboardWithFeedback(
                          shareUrl,
                          showToast,
                          'Invite link copied! Share it with friends to join your league.',
                          'Failed to copy invite link. Please try again.'
                        );
                      }}
                      className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      Invite Friends
                    </button>
                    <button
                      onClick={async () => {
                        if (league.joinCode) {
                          await copyToClipboardWithFeedback(
                            league.joinCode,
                            showToast,
                            'Join code copied to clipboard!',
                            'Failed to copy join code. Please try again.'
                          );
                        }
                      }}
                      className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    <span className="badge badge-green">Active</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Your Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user ? (
                      <span className={`badge ${league?.userRole === 'Owner'
                        ? 'badge-gray' // will override with inline style
                        : league?.userRole === 'Member'
                          ? 'badge-green'
                          : 'badge-gray'
                        }`} style={league?.userRole === 'Owner' ? { background: 'rgba(147,51,234,0.1)', color: '#7c3aed', border: '1px solid rgba(147,51,234,0.2)' } : undefined}>
                        {league?.userRole || 'Not a Member'}
                      </span>
                    ) : (
                      <span className="badge badge-blue">
                        Guest Viewer
                      </span>
                    )}
                  </dd>
                </div>
                {league.joinCode && user && (
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
            {user ? (
              <div className="glass-card p-6 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Activity</h2>
                  <Link
                    href={`/leagues/${leagueId}/activity`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All →
                  </Link>
                </div>
                {activityLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading activity...</p>
                  </div>
                ) : recentActivity && recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => {
                      // Debug logging to see what we're receiving
                      return (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <div className="flex-shrink-0">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activity.activityType === 'pick_created' ? 'bg-green-100' :
                              activity.activityType === 'pick_changed' ? 'bg-blue-100' :
                                activity.activityType === 'pick_removed' ? 'bg-red-100' :
                                  activity.activityType === 'member_joined' || activity.activityType === 'user_joined' ? 'bg-purple-100' :
                                    activity.activityType === 'member_left' ? 'bg-red-100' :
                                      activity.activityType === 'league_name_changed' ? 'bg-indigo-100' :
                                        activity.activityType === 'league_visibility_changed' ? 'bg-blue-100' :
                                          activity.activityType === 'league_created' ? 'bg-yellow-100' :
                                            activity.activityType === 'race_result_processed' ? 'bg-orange-100' :
                                              // Admin activity types
                                              activity.activityType.startsWith('admin_') ? 'bg-amber-100' :
                                                'bg-gray-100'
                              }`}>
                              <svg className={`h-4 w-4 ${activity.activityType === 'pick_created' ? 'text-green-600' :
                                activity.activityType === 'pick_changed' ? 'text-blue-600' :
                                  activity.activityType === 'pick_removed' ? 'text-red-600' :
                                    activity.activityType === 'member_joined' || activity.activityType === 'user_joined' ? 'text-purple-600' :
                                      activity.activityType === 'member_left' ? 'text-red-600' :
                                        activity.activityType === 'league_name_changed' ? 'text-indigo-600' :
                                          activity.activityType === 'league_visibility_changed' ? 'text-blue-600' :
                                            activity.activityType === 'league_created' ? 'text-yellow-600' :
                                              activity.activityType === 'race_result_processed' ? 'text-orange-600' :
                                                // Admin activity types
                                                activity.activityType.startsWith('admin_') ? 'text-amber-600' :
                                                  'text-gray-600'
                                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {activity.activityType === 'pick_created' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                ) : activity.activityType === 'pick_changed' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                ) : activity.activityType === 'pick_removed' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                ) : activity.activityType === 'member_joined' || activity.activityType === 'user_joined' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                ) : activity.activityType === 'member_left' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                ) : activity.activityType === 'league_created' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                ) : activity.activityType === 'league_name_changed' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                ) : activity.activityType === 'league_visibility_changed' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                ) : activity.activityType === 'race_result_processed' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                                ) : activity.activityType.startsWith('admin_') ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.primaryMessage || (() => {
                                // Fallback to old field logic for backwards compatibility
                                switch (activity.activityType) {
                                  case 'pick_created':
                                    return `${activity.userName} created a pick`;
                                  case 'pick_changed':
                                    return `${activity.userName} changed a pick`;
                                  case 'pick_removed':
                                    return `${activity.userName} removed a pick`;
                                  case 'member_joined':
                                  case 'user_joined':
                                    return `${activity.userName} joined the league`;
                                  case 'member_left':
                                    return `${activity.userName} left the league`;
                                  case 'league_name_changed':
                                    return `${activity.userName} changed the league name`;
                                  case 'league_visibility_changed':
                                    return `${activity.userName} changed league visibility`;
                                  case 'league_created':
                                    return `${activity.userName} created the league`;
                                  case 'race_result_processed':
                                    return `Race results processed for Week ${activity.weekNumber || 'Unknown'}`;
                                  case 'picks_locked':
                                    return 'Picks locked';
                                  default:
                                    return `${activity.userName || 'System'} ${activity.activityType.replace(/_/g, ' ')}`;
                                }
                              })()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {activity.secondaryMessage || (() => {
                                // Fallback to old field logic for backwards compatibility
                                switch (activity.activityType) {
                                  case 'pick_created':
                                    return `Picked ${activity.driverName || 'Unknown'} (${activity.driverTeam || 'Unknown'}) for P${activity.position || '?'} • Week ${activity.weekNumber || 'Unknown'}`;
                                  case 'pick_changed':
                                    return `Position P${activity.position || '?'} • Week ${activity.weekNumber || 'Unknown'}`;
                                  case 'pick_removed':
                                    return `Removed ${activity.driverName || 'Unknown'} (${activity.driverTeam || 'Unknown'}) from P${activity.position || '?'} • Week ${activity.weekNumber || 'Unknown'}`;
                                  case 'member_joined':
                                  case 'user_joined':
                                    return 'Welcome to the league!';
                                  case 'member_left':
                                    return 'Goodbye!';
                                  case 'league_name_changed':
                                    return `Changed from "${activity.previousDriverName || 'Unknown'}" to "${activity.driverName || 'Unknown'}"`;
                                  case 'league_visibility_changed':
                                    return `Changed league visibility from "${activity.previousDriverName || 'Unknown'}"`;
                                  case 'league_created':
                                    return 'League created successfully';
                                  case 'race_result_processed':
                                    return `${activity.raceName ? `${activity.raceName} - ` : ''}${activity.driverName || 'Unknown'} (${activity.driverTeam || 'Unknown'}) finished in P${activity.position || '?'}`;
                                  case 'picks_locked':
                                    return `Picks locked for ${activity.raceName || 'this race'} • Week ${activity.weekNumber || 'Unknown'}`;
                                  default:
                                    return `Picked ${activity.driverName || 'Unknown'} (${activity.driverTeam || 'Unknown'}) for P${activity.position || '?'}`;
                                }
                              })()}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-sm text-gray-500">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
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
            ) : (
              <div className="glass-card p-6 mt-4">
                <div className="text-center py-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">League Activity</h2>
                  <p className="text-gray-500 mb-4">Log in to see recent activity and member interactions</p>
                  <div className="space-y-2">
                    <Link href="/login" className="btn-primary text-sm py-2 px-5">
                      Log In
                    </Link>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* League Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm overflow-y-auto flex items-start justify-center pt-16 px-4 z-50">
          <div className="glass-card w-full max-w-md p-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-5">League Settings</h3>

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
                      className="input-field"
                      placeholder="Enter league name"
                    />
                    <button
                      onClick={updateLeagueName}
                      disabled={updating || !editingName.trim()}
                      className="btn-primary mt-2 w-full text-sm py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? 'Updating...' : 'Update Name'}
                    </button>
                  </div>

                  {/* League Visibility Toggle - Owner Only */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      League Visibility
                    </label>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="visibility"
                          checked={!league?.isPublic}
                          onChange={() => updateLeagueVisibility(false)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Private</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="visibility"
                          checked={league?.isPublic}
                          onChange={() => updateLeagueVisibility(true)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Public</span>
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {league?.isPublic
                        ? 'Public leagues can be discovered and joined by any user on the platform.'
                        : 'Private leagues can only be joined using the join code.'
                      }
                    </p>
                  </div>

                  {/* League Position Requirements - Owner Only */}
                  {isPositionChangesEnabled && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Position Requirements
                      </label>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 mb-3">
                          {isMultiPositionPicksEnabled
                            ? 'Select the positions that league members must predict for each race.'
                            : 'Select 1-2 positions that league members must predict for each race.'}
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((position) => {
                            const isSelected = editingPositions.includes(position);
                            const atLimit = !isMultiPositionPicksEnabled && editingPositions.length >= 2 && !isSelected;
                            return (
                              <label
                                key={position}
                                className={`flex items-center justify-center p-2 border rounded-md transition-colors ${isSelected
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : atLimit
                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handlePositionToggle(position)}
                                  disabled={atLimit}
                                  className="sr-only"
                                />
                                <span className="text-sm font-medium">P{position}</span>
                              </label>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Current: P{league?.requiredPositions?.join(', P') || 'None selected'}
                        </p>
                        <button
                          onClick={() => updateLeaguePositions()}
                          disabled={updatingPositions || editingPositions.length === 0 ||
                            JSON.stringify(editingPositions.sort()) === JSON.stringify((league?.requiredPositions || []).sort())}
                          className="btn-primary mt-2 w-full text-sm py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingPositions ? 'Updating...' : 'Update Positions'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Delete League - Owner Only */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Danger Zone</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Once you delete a league, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="btn-danger w-full text-sm py-2.5"
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
                      className="btn-primary w-full text-sm py-2.5"
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
                  className="btn-ghost w-full text-sm py-2.5"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <div className="glass-card w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete League</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to delete &quot;{league?.name}&quot;? This cannot be undone and will permanently delete all picks, standings, and activity.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-ghost flex-1 text-sm py-2.5">
                Cancel
              </button>
              <button
                onClick={deleteLeague}
                disabled={deleting}
                className="btn-danger flex-1 text-sm py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete League'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <div className="glass-card w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Leave League</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to leave &quot;{league?.name}&quot;? You can rejoin later if you have the join code.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowLeaveConfirm(false)} className="btn-ghost flex-1 text-sm py-2.5">
                Cancel
              </button>
              <button
                onClick={leaveLeague}
                disabled={leaving}
                className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {leaving ? 'Leaving...' : 'Leave League'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Position Change Conflict Confirmation Modal */}
      {showPositionChangeConfirm && positionChangeConflict && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <div className="glass-card w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Position Change Conflict</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Changing positions will affect {positionChangeConflict.affectedUsers?.length || 0} users&apos; existing picks.
            </p>
            {positionChangeConflict.affectedUsers && positionChangeConflict.affectedUsers.length > 0 && (
              <div className="mb-4 bg-gray-50/60 rounded-xl p-3 max-h-32 overflow-y-auto">
                <ul className="text-sm text-gray-600 space-y-1">
                  {positionChangeConflict.affectedUsers.map((user: any, index: number) => (
                    <li key={index}>• {user.name}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowPositionChangeConfirm(false); setPositionChangeConflict(null); }}
                className="btn-ghost flex-1 text-sm py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={() => updateLeaguePositions()}
                disabled={updatingPositions}
                className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingPositions ? 'Updating...' : 'Force Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 