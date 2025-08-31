'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { activityAPI, leaguesAPI } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import PageTitle from '@/components/PageTitle';
import BackToLeagueButton from '@/components/BackToLeagueButton';
import Avatar from '@/components/Avatar';
import { Activity } from '@/lib/api';

export default function LeagueActivityPage() {
    const params = useParams();
    const router = useRouter();
    const leagueId = params.id as string;

    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [leagueName, setLeagueName] = useState<string>('');

    const loadActivities = async (pageNum: number = 1, append: boolean = false) => {
        try {
            setLoading(true);
            const limit = 50; // Load 50 activities per page
            const response = await activityAPI.getLeagueActivity(parseInt(leagueId), limit);

            if (response.data.success) {
                const newActivities = response.data.data;

                if (append) {
                    setActivities(prev => [...prev, ...newActivities]);
                } else {
                    setActivities(newActivities);
                }

                setHasMore(newActivities.length === limit);
                setPage(pageNum);
            }
        } catch (error: any) {
            console.error('Error loading activities:', error);
            setError('Failed to load activities');
        } finally {
            setLoading(false);
        }
    };

    const loadLeagueName = async () => {
        try {
            const response = await leaguesAPI.getLeague(parseInt(leagueId));
            if (response.data.success) {
                setLeagueName(response.data.data.name);
            } else {
                setError('Failed to load league name');
            }
        } catch (error) {
            console.error('Error loading league name:', error);
            setError('Failed to load league name');
        }
    };

    useEffect(() => {
        loadActivities();
        loadLeagueName();
    }, [leagueId]);

    const loadMore = () => {
        if (!loading && hasMore) {
            loadActivities(page + 1, true);
        }
    };

    const getActivityIcon = (activityType: string) => {
        switch (activityType) {
            case 'pick_created':
                return (
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'pick_changed':
                return (
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                );
            case 'pick_removed':
                return (
                    <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                );
            case 'member_joined':
            case 'user_joined':
                return (
                    <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                );
            case 'member_left':
                return (
                    <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                );
            case 'league_created':
                return (
                    <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                );
            case 'league_name_changed':
                return (
                    <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                );
            case 'race_result_processed':
                return (
                    <svg className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                );
            // Admin activity types
            case 'admin_user_added_to_league':
            case 'admin_user_removed_from_league':
            case 'admin_pick_created':
            case 'admin_pick_updated':
            case 'admin_pick_deleted':
            case 'admin_user_role_updated':
            case 'admin_race_results_entered':
            case 'admin_picks_rescheduled':
            case 'admin_picks_locked':
            case 'admin_picks_scored':
            case 'admin_test_notification_sent':
                return (
                    <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                );
            default:
                return (
                    <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const getActivityIconBg = (activityType: string) => {
        switch (activityType) {
            case 'pick_created':
                return 'bg-green-100';
            case 'pick_changed':
                return 'bg-blue-100';
            case 'pick_removed':
                return 'bg-red-100';
            case 'member_joined':
            case 'user_joined':
                return 'bg-purple-100';
            case 'member_left':
                return 'bg-red-100';
            case 'league_created':
                return 'bg-yellow-100';
            case 'league_name_changed':
                return 'bg-indigo-100';
            case 'race_result_processed':
                return 'bg-orange-100';
            // Admin activity types
            case 'admin_user_added_to_league':
            case 'admin_user_removed_from_league':
            case 'admin_pick_created':
            case 'admin_pick_updated':
            case 'admin_pick_deleted':
            case 'admin_user_role_updated':
            case 'admin_race_results_entered':
            case 'admin_picks_rescheduled':
            case 'admin_picks_locked':
            case 'admin_picks_scored':
            case 'admin_test_notification_sent':
                return 'bg-amber-100';
            default:
                return 'bg-gray-100';
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Activity</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Link
                        href={`/leagues/${leagueId}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Back to League
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                <PageTitle
                    title={leagueName ? `${leagueName} Activity` : 'League Activity'}
                    subtitle="All league activity and history"
                >
                    <BackToLeagueButton leagueId={leagueId} className="text-xs px-3 py-1.5 sm:text-sm sm:px-4 sm:py-2" />
                </PageTitle>

                {/* Activity List */}
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">All Activity</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Complete history of all league activity
                        </p>
                    </div>

                    <div className="p-6">
                        {loading && activities.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2 text-sm text-gray-500">Loading activities...</p>
                            </div>
                        ) : activities.length > 0 ? (
                            <div className="space-y-4">
                                {activities.map((activity, index) => (
                                    <div key={activity.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                {activity.userId && activity.userName ? (
                                                    <Avatar
                                                        src={activity.userAvatar}
                                                        alt={`${activity.userName}'s avatar`}
                                                        size="md"
                                                        className="flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getActivityIconBg(activity.activityType)}`}>
                                                        {getActivityIcon(activity.activityType)}
                                                    </div>
                                                )}
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
                                                            // Admin activities
                                                            case 'admin_user_added_to_league':
                                                                return `${activity.driverName || 'Admin added user to league'}`;
                                                            case 'admin_user_removed_from_league':
                                                                return `${activity.driverName || 'Admin removed user from league'}`;
                                                            case 'admin_pick_created':
                                                                return `${activity.driverName || 'Admin created pick for user'}`;
                                                            case 'admin_pick_updated':
                                                                return `${activity.driverName || 'Admin updated user\'s pick'}`;
                                                            case 'admin_pick_deleted':
                                                                return `${activity.driverName || 'Admin deleted user\'s pick'}`;
                                                            case 'admin_user_role_updated':
                                                                return `${activity.driverName || 'Admin updated user role'}`;
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
                                                            // Admin activities
                                                            case 'admin_user_added_to_league':
                                                                return `${activity.driverTeam || 'Welcome to the league!'}`;
                                                            case 'admin_user_removed_from_league':
                                                                return `${activity.driverTeam || 'Goodbye!'}`;
                                                            case 'admin_pick_created':
                                                                return `Picked ${activity.driverName || 'Unknown'} (${activity.driverTeam || 'Unknown'}) for P${activity.position || '?'} • Week ${activity.weekNumber || 'Unknown'}`;
                                                            case 'admin_pick_updated':
                                                                return `Changed pick from ${activity.previousDriverName || 'Unknown'} to ${activity.driverName || 'Unknown'} for P${activity.position || '?'} • Week ${activity.weekNumber || 'Unknown'}`;
                                                            case 'admin_pick_deleted':
                                                                return `Removed ${activity.driverName || 'Unknown'} (${activity.driverTeam || 'Unknown'}) from P${activity.position || '?'} • Week ${activity.weekNumber || 'Unknown'}`;
                                                            case 'admin_user_role_updated':
                                                                return `${activity.driverTeam || 'User role updated by administrator'}`;
                                                            default:
                                                                return `Picked ${activity.driverName || 'Unknown'} (${activity.driverTeam || 'Unknown'}) for P${activity.position || '?'}`;
                                                        }
                                                    })()}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {new Date(activity.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {hasMore && (
                                    <div className="text-center pt-4">
                                        <button
                                            onClick={loadMore}
                                            disabled={loading}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Loading...' : 'Load More'}
                                        </button>
                                    </div>
                                )}

                                {!hasMore && activities.length > 0 && (
                                    <div className="text-center pt-4">
                                        <p className="text-sm text-gray-500">No more activities to load</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No activity found</h3>
                                <p className="mt-1 text-sm text-gray-500">Activity will appear here as members make picks.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
