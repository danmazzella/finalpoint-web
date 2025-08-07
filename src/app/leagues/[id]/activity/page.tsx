'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { activityAPI } from '@/lib/api';

interface Activity {
    id: number;
    leagueId: number;
    userId: number | null;
    userName: string | null;
    activityType: string;
    weekNumber: number | null;
    driverId: number | null;
    driverName: string | null;
    driverTeam: string | null;
    previousDriverId: number | null;
    previousDriverName: string | null;
    previousDriverTeam: string | null;
    position: number | null;
    raceName: string | null;
    createdAt: string;
}

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
            const response = await fetch(`/api/leagues/${leagueId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setLeagueName(data.data.name);
                }
            }
        } catch (error) {
            console.error('Error loading league name:', error);
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
            case 'user_joined':
                return (
                    <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                );
            case 'race_result_processed':
                return (
                    <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                );
            default:
                return (
                    <svg className="h-4 w-4 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            case 'user_joined':
                return 'bg-purple-100';
            case 'race_result_processed':
                return 'bg-yellow-100';
            default:
                return 'bg-pink-100';
        }
    };

    const getActivityMessage = (activity: Activity) => {
        switch (activity.activityType) {
            case 'user_joined':
                return `${activity.userName} joined the league`;
            case 'race_result_processed':
                return `Race results processed for Week ${activity.weekNumber}`;
            case 'pick_created':
                return `${activity.userName || 'System'} made a pick for Week ${activity.weekNumber}`;
            case 'pick_changed':
                return `${activity.userName || 'System'} changed their pick for Week ${activity.weekNumber}`;
            default:
                return `${activity.userName || 'System'} made a pick for Week ${activity.weekNumber}`;
        }
    };

    const getActivityDetails = (activity: Activity) => {
        switch (activity.activityType) {
            case 'pick_created':
                return `Picked ${activity.driverName} (${activity.driverTeam}) for P${activity.position}`;
            case 'pick_changed':
                return `Changed P${activity.position} from ${activity.previousDriverName} (${activity.previousDriverTeam}) to ${activity.driverName} (${activity.driverTeam})`;
            case 'race_result_processed':
                return `${activity.raceName ? `${activity.raceName} - ` : ''}${activity.driverName} (${activity.driverTeam}) finished in P${activity.position}`;
            case 'user_joined':
                return 'Welcome to the league!';
            default:
                return `Picked ${activity.driverName} (${activity.driverTeam}) for P${activity.position}`;
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Error</h1>
                        <p className="text-gray-600 mt-2">{error}</p>
                        <Link
                            href={`/leagues/${leagueId}`}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                        >
                            Back to League
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
                            <h1 className="text-3xl font-bold text-gray-900">
                                {leagueName ? `${leagueName} Activity` : 'League Activity'}
                            </h1>
                            <p className="text-gray-600">All league activity and history</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href={`/leagues/${leagueId}`}
                                className="text-pink-600 hover:text-pink-700 font-medium"
                            >
                                ← Back to League
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">All Activity</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Complete history of all league activity
                        </p>
                    </div>

                    <div className="p-6">
                        {loading && activities.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                                <p className="mt-2 text-sm text-gray-500">Loading activities...</p>
                            </div>
                        ) : activities.length > 0 ? (
                            <div className="space-y-4">
                                {activities.map((activity, index) => (
                                    <div key={activity.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex-shrink-0">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getActivityIconBg(activity.activityType)}`}>
                                                {getActivityIcon(activity.activityType)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">
                                                {getActivityMessage(activity)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {getActivityDetails(activity)}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0 text-sm text-gray-500">
                                            {new Date(activity.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {hasMore && (
                                    <div className="text-center pt-4">
                                        <button
                                            onClick={loadMore}
                                            disabled={loading}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>
        </div>
    );
}
