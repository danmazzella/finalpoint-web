'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

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

      console.log('Loading admin data...');

      const statsResponse = await adminAPI.getDashboardStats();

      console.log('API Response:', {
        stats: { status: statsResponse.status, ok: statsResponse.status === 200 },
      });

      if (statsResponse.status === 200) {
        const statsData = statsResponse.data;
        console.log('Stats data:', statsData);
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