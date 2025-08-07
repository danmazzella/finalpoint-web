'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { leaguesAPI, authAPI, League } from '@/lib/api';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PageTitle from '@/components/PageTitle';

interface UserStats {
  totalPicks: number;
  correctPicks: number;
  totalPoints: number;
  averagePoints: number;
  accuracy: number;
}

interface GlobalStats {
  totalUsers: number;
  totalLeagues: number;
  totalPicks: number;
  correctPicks: number;
  accuracy: number;
  averagePoints: number;
  averageDistanceFromTarget: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalPicks: 0,
    correctPicks: 0,
    totalPoints: 0,
    averagePoints: 0,
    accuracy: 0
  });
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalUsers: 0,
    totalLeagues: 0,
    totalPicks: 0,
    correctPicks: 0,
    accuracy: 0,
    averagePoints: 0,
    averageDistanceFromTarget: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    try {
      setLoading(true);
      const [leaguesResponse, statsResponse, globalStatsResponse] = await Promise.all([
        leaguesAPI.getLeagues(),
        authAPI.getUserStats(),
        authAPI.getGlobalStats()
      ]);

      if (leaguesResponse.data.success) {
        setLeagues(leaguesResponse.data.data);
      }

      if (statsResponse.data.success) {
        setUserStats(statsResponse.data.data);
      }

      if (globalStatsResponse.data.success) {
        setGlobalStats(globalStatsResponse.data.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData = [
    { name: 'Correct Picks', value: globalStats.correctPicks, color: '#10B981' },
    { name: 'Incorrect Picks', value: globalStats.totalPicks - globalStats.correctPicks, color: '#EF4444' }
  ];

  const COLORS = ['#10B981', '#EF4444'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <PageTitle
          title="Dashboard"
          subtitle="Welcome to your F1 prediction game"
        />

        {/* Your Leagues Section */}
        <div className="bg-white shadow-lg overflow-hidden sm:rounded-md mb-8">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Your Leagues</h3>
              <Link
                href="/leagues"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 shadow-sm"
              >
                Manage Leagues
              </Link>
            </div>
          </div>

          {leagues.length === 0 ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leagues</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating or joining a league.</p>
              <div className="mt-6">
                <div className="flex space-x-2">
                  <Link
                    href="/join"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Join League
                  </Link>
                  <Link
                    href="/leagues"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                  >
                    Create League
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {leagues.map((league) => (
                <li key={league.id}>
                  <Link href={`/leagues/${league.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                              <span className="text-pink-600 font-medium">{league.name.charAt(0)}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{league.name}</div>
                            <div className="text-sm text-gray-500">
                              Season {league.seasonYear} • {league.memberCount || 1} member{league.memberCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* User Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow-lg rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Picks Made</dt>
                    <dd className="text-lg font-medium text-gray-900">{userStats.totalPicks}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Accuracy</dt>
                    <dd className="text-lg font-medium text-gray-900">{userStats.accuracy}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Stats Section */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Platform Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{globalStats.totalUsers}</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{globalStats.totalLeagues}</div>
              <div className="text-sm text-gray-500">Active Leagues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{globalStats.totalPicks}</div>
              <div className="text-sm text-gray-500">Total Picks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{globalStats.accuracy}%</div>
              <div className="text-sm text-gray-500">Global Accuracy</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pick Accuracy Chart */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Pick Accuracy</h3>
              <div className="h-64 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Additional Stats */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm">
                  <span className="text-sm font-medium text-gray-700">Average Points per Pick</span>
                  <span className="text-lg font-bold text-gray-900">{globalStats.averagePoints}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm">
                  <span className="text-sm font-medium text-gray-700">Average Distance from Target</span>
                  <span className="text-lg font-bold text-gray-900">{globalStats.averageDistanceFromTarget} positions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom spacing for mobile to account for fixed bottom navigation */}
        <div className="md:hidden h-16"></div>

      </main>
    </div>
  );
} 