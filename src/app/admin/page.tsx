'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import Link from 'next/link';

interface AdminStats {
  users: {
    totalUsers: number;
    adminUsers: number;
    regularUsers: number;
  };
  leagues: {
    totalLeagues: number;
    activeLeagues: number;
    archivedLeagues: number;
    averageMembersPerLeague: number;
  };
  picks: {
    totalPicks: number;
    scoredPicks: number;
    lockedPicks: number;
    totalPoints: number;
    averagePoints: number;
    correctPicks: number;
    accuracy: number;
  };
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      const statsResponse = await adminAPI.getAdminDashboardStats();

      if (statsResponse.status === 200) {
        const statsData = statsResponse.data;
        setStats(statsData.data);
      } else {
        console.error('Stats response error:', statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
        <p className="text-gray-500">Unable to load admin statistics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Tools Navigation */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/notificationTool"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M9 11h.01M9 8h.01M15 14h.01M15 11h.01M15 8h.01M15 5h.01M12 5h.01M12 8h.01M12 11h.01M12 14h.01M12 17h.01" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Notification Testing Tool</h3>
              <p className="text-sm text-gray-500">Test push notifications and emails for users</p>
            </div>
          </Link>

          <Link
            href="/admin/race-results"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Race Results Entry</h3>
              <p className="text-sm text-gray-500">Enter race results and score all leagues</p>
            </div>
          </Link>

          {/* Add more admin tools here in the future */}
          <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-400">More Tools Coming Soon</h3>
              <p className="text-sm text-gray-400">Additional admin utilities will be added here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Platform Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.users.totalUsers || 0}</div>
            <div className="text-sm text-gray-500">Total Users</div>
            <div className="text-xs text-gray-400 mt-1">
              {stats.users.adminUsers || 0} admin, {stats.users.regularUsers || 0} regular
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.leagues.totalLeagues || 0}</div>
            <div className="text-sm text-gray-500">Total Leagues</div>
            <div className="text-xs text-gray-400 mt-1">
              {stats.leagues.activeLeagues || 0} active, {stats.leagues.archivedLeagues || 0} archived
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.picks.totalPicks || 0}</div>
            <div className="text-sm text-gray-500">Total Picks</div>
            <div className="text-xs text-gray-400 mt-1">
              {stats.picks.scoredPicks || 0} scored, {stats.picks.lockedPicks || 0} locked
            </div>
          </div>
        </div>
      </div>

      {/* Pick Statistics */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Pick Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.picks.correctPicks || 0}</div>
            <div className="text-sm text-gray-500">Correct Picks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.picks.totalPoints || 0}</div>
            <div className="text-sm text-gray-500">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.picks.averagePoints ? stats.picks.averagePoints.toFixed(1) : '0.0'}
            </div>
            <div className="text-sm text-gray-500">Average Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.picks.accuracy || 0}%</div>
            <div className="text-sm text-gray-500">Accuracy</div>
          </div>
        </div>
      </div>

      {/* League Statistics */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">League Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.leagues.averageMembersPerLeague ? stats.leagues.averageMembersPerLeague.toFixed(1) : '0.0'}
            </div>
            <div className="text-sm text-gray-500">Average Members per League</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600">{stats.leagues.activeLeagues || 0}</div>
            <div className="text-sm text-gray-500">Active Leagues</div>
          </div>
        </div>
      </div>
    </div>
  );
}