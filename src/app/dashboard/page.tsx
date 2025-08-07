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
  leaguesJoined: number;
  racesPicked: number;
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
    accuracy: 0,
    leaguesJoined: 0,
    racesPicked: 0
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

  const performanceData = [
    { name: 'Correct Picks', value: globalStats.correctPicks, color: '#10B981' },
    { name: 'Incorrect Picks', value: globalStats.totalPicks - globalStats.correctPicks, color: '#EF4444' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <PageTitle
          title="Dashboard"
          subtitle="Welcome to your F1 prediction game"
        />

        {/* Your Leagues Section */}
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6 mb-8 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Your Leagues</h2>
          {leagues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leagues.map((league) => (
                <Link
                  key={league.id}
                  href={`/leagues/${league.id}`}
                  className="block bg-gradient-to-br from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100 border border-slate-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-800">{league.name}</h3>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                      {league.memberCount} members
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Season {league.seasonYear}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Season {league.seasonYear}</span>
                    <span className="bg-slate-100 px-2 py-1 rounded">Join Code: {league.joinCode}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">No leagues yet</h3>
              <p className="text-slate-600 mb-4">Join or create a league to get started!</p>
              <div className="space-x-3">
                <Link
                  href="/leagues"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Join League
                </Link>
                <Link
                  href="/leagues"
                  className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Create League
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Stats Section */}
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6 mb-8 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Your Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Points</p>
                  <p className="text-2xl font-bold text-slate-800">{userStats.totalPoints}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600">Accuracy</p>
                  <p className="text-2xl font-bold text-slate-800">{userStats.accuracy}%</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-600">Leagues Joined</p>
                  <p className="text-2xl font-bold text-slate-800">{userStats.leaguesJoined}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-600">Races Picked</p>
                  <p className="text-2xl font-bold text-slate-800">{userStats.racesPicked}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Stats Section */}
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6 mb-8 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Global Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <p className="text-2xl font-bold text-slate-800">{globalStats.totalUsers}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-600">Total Leagues</p>
                <p className="text-2xl font-bold text-slate-800">{globalStats.totalLeagues}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-600">Total Picks</p>
                <p className="text-2xl font-bold text-slate-800">{globalStats.totalPicks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6 mb-8 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Performance Overview</h2>
          <div className="h-64 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom spacing for mobile to account for fixed bottom navigation */}
        <div className="md:hidden h-16"></div>
      </main>
    </div>
  );
} 