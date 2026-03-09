'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { leaguesAPI, authAPI, League, chatAPI, seasonsAPI } from '@/lib/api';
import Link from 'next/link';
import PageTitle from '@/components/PageTitle';
import { ComprehensiveNotificationPrompt } from '@/components/ComprehensiveNotificationPrompt';

interface UserStats {
  totalPicks: number;
  correctPicks: number;
  totalPoints: number;
  averagePoints: number;
  accuracy: number;
  avgDistance: number;
  perfectPicksRate: number;
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
    accuracy: 0,
    avgDistance: 0,
    perfectPicksRate: 0
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
  const [unreadCounts, setUnreadCounts] = useState<{ [leagueId: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<{ year: number; displayLabel: string; isEnded: boolean }[]>([]);
  const [leagueSeasonFilter, setLeagueSeasonFilter] = useState<number | 'all'>(() => 'all');
  const [userStatsSeason, setUserStatsSeason] = useState<number | 'all'>(() => 'all');
  const [globalStatsSeason, setGlobalStatsSeason] = useState<number | 'all'>(() => 'all');

  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const res = await seasonsAPI.getSeasons();
        if (res.data?.success && Array.isArray(res.data.data)) {
          setSeasons(res.data.data);
          if (res.data.data.length > 0) {
            const latest = Math.max(...res.data.data.map((s: { year: number }) => s.year));
            setUserStatsSeason(latest);
            setGlobalStatsSeason(latest);
          }
        }
      } catch {
        // ignore
      }
    };
    loadSeasons();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const userSeason = userStatsSeason === 'all' ? undefined : userStatsSeason;
        const globalSeason = globalStatsSeason === 'all' ? undefined : globalStatsSeason;

        if (user) {
          const [leaguesResponse, statsResponse, globalStatsResponse, unreadCountsResponse] = await Promise.all([
            leaguesAPI.getLeagues(),
            authAPI.getUserStats(userSeason),
            authAPI.getGlobalStats(globalSeason),
            chatAPI.getAllUnreadCounts()
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

          if (unreadCountsResponse.data.success) {
            const counts: { [leagueId: number]: number } = {};
            unreadCountsResponse.data.unreadCounts.forEach((item: { leagueId: number; unreadCount: number }) => {
              counts[item.leagueId] = item.unreadCount;
            });
            setUnreadCounts(counts);
          }
        } else {
          const [leaguesResponse, globalStatsResponse] = await Promise.all([
            leaguesAPI.getLeagues(),
            authAPI.getGlobalStats(globalSeason)
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

    // Only load data if auth is not loading
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, user, userStatsSeason, globalStatsSeason]);

  // Show loading spinner only while auth is loading or while loading user data
  if (authLoading || (loading && user)) {
    return (
      <div className="page-bg min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen">
      <main className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <PageTitle
          title="Dashboard"
          subtitle={user ? "Welcome to your F1 prediction game" : "Welcome to F1 prediction game — explore without signing up"}
        />

        {/* Notification Prompt - Only show for logged-in users */}
        {user && (
          <ComprehensiveNotificationPrompt
            currentPage="dashboard"
            leagues={leagues}
          />
        )}

        {/* Quick Actions */}
        <div className="mb-6 flex flex-wrap gap-2">
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
        <div className="glass-card overflow-hidden mb-6 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
          <div className="px-5 py-4 border-b border-white/40">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-gray-900">Your Leagues</h3>
              <div className="flex items-center gap-2">
                {seasons.length > 0 && (
                  <select
                    value={leagueSeasonFilter}
                    onChange={(e) => setLeagueSeasonFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="text-xs font-medium rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All seasons</option>
                    {seasons.map((s) => (
                      <option key={s.year} value={s.year}>{s.displayLabel || s.year}</option>
                    ))}
                  </select>
                )}
                <Link href="/leagues" className="btn-primary text-xs py-1.5 px-3">
                  {user ? 'Manage' : 'Browse'}
                </Link>
              </div>
            </div>
          </div>

          {!user ? (
            <div className="px-6 py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Log in to see your leagues</h3>
              <p className="text-xs text-gray-500 mb-5">Create and manage your own prediction leagues.</p>
              <div className="flex gap-2 justify-center">
                <Link href="/login" className="btn-ghost text-sm py-2 px-4">Log In</Link>
                <Link href="/signup" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </div>
            </div>
          ) : leagues.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">No leagues yet</h3>
              <p className="text-xs text-gray-500 mb-5">Get started by creating or joining a league.</p>
              <div className="flex gap-2 justify-center">
                <Link href="/join" className="btn-ghost text-sm py-2 px-4">Join League</Link>
                <Link href="/leagues" className="btn-primary text-sm py-2 px-4">Create League</Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 stagger">
              {(leagueSeasonFilter === 'all'
                ? leagues
                : leagues.filter((l) => l.seasonYear === leagueSeasonFilter)
              ).map((league) => (
                <div key={league.id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{league.name}</h4>
                        <span className="badge badge-gray">{league.seasonYear}</span>
                        {unreadCounts[league.id] > 0 && (
                          <span className="badge badge-blue">
                            {unreadCounts[league.id]} new
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Code: {league.joinCode}</p>
                    </div>
                    <Link
                      href={`/leagues/${league.id}`}
                      className="btn-secondary text-xs py-1.5 px-3 flex-shrink-0 opacity-80 group-hover:opacity-100"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Explore Card */}
        <div className="glass-card overflow-hidden mb-6">
          <div className="px-5 py-3.5 border-b border-white/40">
            <h3 className="text-base font-semibold text-gray-900">Explore</h3>
          </div>
          <Link href="/community-picks" className="flex items-center px-5 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-200 group">
            <div className="w-8 h-8 rounded-lg bg-blue-100/70 flex items-center justify-center mr-3 flex-shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Community Picks</p>
              <p className="text-xs text-gray-500">See how everyone picked each race week</p>
            </div>
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/platform-standings" className="flex items-center px-5 py-3.5 hover:bg-gray-50 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-blue-100/70 flex items-center justify-center mr-3 flex-shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Platform Standings</p>
              <p className="text-xs text-gray-500">See how you rank against all players</p>
            </div>
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* User Stats Section */}
        <div className="glass-card p-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-medium text-gray-900">Your Statistics</h2>
            {user && seasons.length > 0 && (
              <select
                value={userStatsSeason}
                onChange={(e) => setUserStatsSeason(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="text-xs font-medium rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All-Time</option>
                {seasons.map((s) => (
                  <option key={s.year} value={s.year}>{s.displayLabel || s.year}</option>
                ))}
              </select>
            )}
          </div>
          {!user ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-4">Log in to see your personal statistics</p>
              <div className="grid grid-cols-3 gap-3">
                {['Total Picks', 'Correct Picks', 'Total Points', 'Avg Points', 'Avg Distance', 'Perfect Rate'].map((label) => (
                  <div key={label} className="stat-card text-center">
                    <div className="text-xl font-bold text-gray-300 mb-0.5">—</div>
                    <div className="text-xs text-gray-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 stagger">
              {[
                { value: userStats.totalPicks, label: 'Total Picks' },
                { value: userStats.correctPicks, label: 'Correct Picks' },
                { value: userStats.totalPoints, label: 'Total Points' },
                { value: userStats.averagePoints, label: 'Avg Points' },
                { value: userStats.avgDistance, label: 'Avg Distance' },
                { value: `${userStats.perfectPicksRate}%`, label: 'Perfect Rate' },
              ].map(({ value, label }) => (
                <div key={label} className="stat-card text-center">
                  <div className="text-xl font-bold text-gray-900 mb-0.5">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Global Stats */}
        <div className="glass-card p-5 mb-6 animate-fade-in-up" style={{ animationDelay: '180ms' }}>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <h2 className="text-base font-semibold text-gray-900">Platform Statistics</h2>
            <div className="flex items-center gap-2">
              {seasons.length > 0 && (
                <select
                  value={globalStatsSeason}
                  onChange={(e) => setGlobalStatsSeason(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="text-xs font-medium rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All-Time</option>
                  {seasons.map((s) => (
                    <option key={s.year} value={s.year}>{s.displayLabel || s.year}</option>
                  ))}
                </select>
              )}
              <Link href="/stats" className="btn-primary text-xs py-1.5 px-3">
                Driver Stats
              </Link>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Lifetime Performance</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="stat-card text-center">
                  <div className="text-xl font-bold text-blue-600 mb-0.5">{globalStats.lifetimeAccuracy || 0}%</div>
                  <div className="text-xs text-gray-500">Global Accuracy</div>
                </div>
                <div className="stat-card text-center">
                  <div className="text-xl font-bold text-blue-600 mb-0.5">{globalStats.lifetimeAvgDistance || 0}</div>
                  <div className="text-xs text-gray-500">Avg Distance</div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Past Week</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="stat-card text-center">
                  <div className="text-xl font-bold text-green-600 mb-0.5">{globalStats.weekAccuracy || 0}%</div>
                  <div className="text-xs text-gray-500">Global Accuracy</div>
                </div>
                <div className="stat-card text-center">
                  <div className="text-xl font-bold text-green-600 mb-0.5">{globalStats.weekAvgDistance || 0}</div>
                  <div className="text-xs text-gray-500">Avg Distance</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom spacing for mobile fixed nav */}
        <div className="md:hidden h-20" />
      </main>
    </div>
  );
} 