'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { leaguesAPI, authAPI, League } from '@/lib/api';
import Link from 'next/link';
import PageTitle from '@/components/PageTitle';
import { logPageView } from '@/lib/analytics';
import { ComprehensiveNotificationPrompt } from '@/components/ComprehensiveNotificationPrompt';

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
  lifetimeAccuracy: number;
  lifetimeAvgDistance: number;
  weekAccuracy: number;
  weekAvgDistance: number;
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
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
    averageDistanceFromTarget: 0,
    lifetimeAccuracy: 0,
    lifetimeAvgDistance: 0,
    weekAccuracy: 0,
    weekAvgDistance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only load data if auth is not loading
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, user]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (user) {
        // Authenticated user - load user-specific data and global stats
        const [leaguesResponse, statsResponse, globalStatsResponse] = await Promise.all([
          leaguesAPI.getLeagues(),
          authAPI.getUserStats(),
          authAPI.getGlobalStats() // Now works for both authenticated and unauthenticated users
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
      } else {
        // Unauthenticated user - load public data
        const [leaguesResponse, globalStatsResponse] = await Promise.all([
          leaguesAPI.getLeagues(), // Now returns public leagues for unauthenticated users
          authAPI.getGlobalStats() // Now returns basic stats for unauthenticated users
        ]);

        if (leaguesResponse.data.success) {
          setLeagues(leaguesResponse.data.data);
        }

        if (globalStatsResponse.data.success) {
          setGlobalStats(globalStatsResponse.data.data);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // For logged-out users, ensure we have default values even if there's an error
      if (!user) {
        setGlobalStats({
          totalUsers: 0,
          totalLeagues: 0,
          totalPicks: 0,
          correctPicks: 0,
          accuracy: 0,
          averagePoints: 0,
          averageDistanceFromTarget: 0,
          lifetimeAccuracy: 0,
          lifetimeAvgDistance: 0,
          weekAccuracy: 0,
          weekAvgDistance: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner only while auth is loading or while loading user data
  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <PageTitle
          title="Dashboard"
          subtitle={user ? "Welcome to your F1 prediction game" : "Welcome to F1 prediction game - Explore without signing up"}
        />

        {/* Notification Prompt - Only show for logged-in users */}
        {user && (
          <ComprehensiveNotificationPrompt
            currentPage="dashboard"
            leagues={leagues}
          />
        )}

        {/* Quick Actions */}
        <div className="mb-6">
          <Link
            href="/scoring"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            How Scoring Works
          </Link>
        </div>

        {/* Your Leagues Section */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Your Leagues</h3>
              {user ? (
                <Link
                  href="/leagues"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Manage Leagues
                </Link>
              ) : (
                <Link
                  href="/leagues"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  View Public Leagues
                </Link>
              )}
            </div>
          </div>

          {!user ? (
            <div className="px-6 py-8 text-center">
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
          ) : leagues.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leagues</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating or joining a league.</p>
              <div className="mt-6">
                <div className="flex space-x-2 justify-center">
                  <Link
                    href="/join"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Join League
                  </Link>
                  <Link
                    href="/leagues"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create League
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leagues.map((league) => (
                <div key={league.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{league.name}</h4>
                      <p className="text-sm text-gray-500">Join Code: {league.joinCode}</p>
                    </div>
                    <Link
                      href={`/leagues/${league.id}`}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
                    >
                      View League
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Stats Section */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Your Statistics</h2>
          {!user ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Log in to see your personal statistics</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">N/A</div>
                  <div className="text-sm text-gray-500">Total Picks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">N/A</div>
                  <div className="text-sm text-gray-500">Correct Picks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">N/A</div>
                  <div className="text-sm text-gray-500">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">N/A</div>
                  <div className="text-sm text-gray-500">Accuracy</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{userStats.totalPicks}</div>
                <div className="text-sm text-gray-500">Total Picks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{userStats.correctPicks}</div>
                <div className="text-sm text-gray-500">Correct Picks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{userStats.totalPoints}</div>
                <div className="text-sm text-gray-500">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{userStats.accuracy}%</div>
                <div className="text-sm text-gray-500">Accuracy</div>
              </div>
            </div>
          )}
        </div>

        {/* Global Stats Section */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Platform Statistics</h2>


          <>
            {/* Lifetime Stats */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-4">Lifetime Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{globalStats.lifetimeAccuracy || 0}%</div>
                  <div className="text-sm text-gray-500">Global Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{globalStats.lifetimeAvgDistance || 0}</div>
                  <div className="text-sm text-gray-500">Avg Distance from Correct</div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Past Week Stats */}
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-4">Past Week Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{globalStats.weekAccuracy || 0}%</div>
                  <div className="text-sm text-gray-500">Global Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{globalStats.weekAvgDistance || 0}</div>
                  <div className="text-sm text-gray-500">Avg Distance from Correct</div>
                </div>
              </div>
            </div>
          </>
        </div>

        {/* Bottom spacing for mobile to account for fixed bottom navigation */}
        <div className="md:hidden h-8"></div>

      </main>
    </div>
  );
} 