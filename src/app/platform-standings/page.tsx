'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageTitle from '@/components/PageTitle';
import { authAPI, seasonsAPI } from '@/lib/api';

interface Threshold {
  label: string;
  percentile: number;
  points: number;
}

interface UserLeague {
  leagueId: number;
  leagueName: string;
  totalPoints: number;
  platformRank: number;
  platformPercentile: number | null;
}

interface PlatformStandings {
  seasonYear: number;
  totalPlayers: number;
  thresholds: Threshold[];
  userRank: number | null;
  userPercentile: number | null;
  userTotalPoints: number | null;
  userLeagues: UserLeague[];
}

export default function PlatformStandingsPage() {
  const { user } = useAuth();
  const [standings, setStandings] = useState<PlatformStandings | null>(null);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<{ year: number; displayLabel: string }[]>([]);
  const [seasonFilter, setSeasonFilter] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await seasonsAPI.getSeasons();
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setSeasons(res.data.data);
          // Default to the latest season
          const latest = Math.max(...res.data.data.map((s: { year: number }) => s.year));
          setSeasonFilter(latest);
        }
      } catch { /* ignore */ }
    };
    load();
  }, []);

  useEffect(() => {
    if (seasonFilter == null) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await authAPI.getPlatformStandings(seasonFilter);
        if (res.data?.success) {
          setStandings(res.data.data);
        }
      } catch {
        setStandings(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [seasonFilter]);

  const maxPoints = standings?.thresholds[0]?.points ?? 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <PageTitle
          title="Platform Standings"
          subtitle="See how players rank across the platform"
        />

        {/* Season filter */}
        {seasons.length > 1 && seasonFilter != null && (
          <div className="mb-6">
            <select
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(Number(e.target.value))}
              className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {seasons.map(s => (
                <option key={s.year} value={s.year}>{s.displayLabel || s.year}</option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : !standings || standings.totalPlayers === 0 ? (
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <p className="text-gray-500">No standings data available yet.</p>
          </div>
        ) : (
          <>
            {/* User summary card */}
            {user && standings.userLeagues.length > 0 && (
              <div className="bg-blue-600 text-white rounded-lg p-5 mb-6 shadow-lg">
                <p className="text-blue-100 text-sm font-medium mb-3">Your Standing</p>
                <div className="space-y-2">
                  {standings.userLeagues.map(league => (
                    <div key={league.leagueId} className="bg-blue-700/50 rounded-lg px-3 py-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-blue-100 truncate mr-3">{league.leagueName}</span>
                        <span className="text-sm font-semibold text-white flex-shrink-0">{league.totalPoints} pts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">#{league.platformRank}</span>
                        {league.platformPercentile != null && (
                          <span className="text-blue-200 text-xs">overall · top {league.platformPercentile}%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Points thresholds */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Points Thresholds</h2>
                <p className="text-xs text-gray-500 mt-0.5">Points needed in a single league to reach each tier</p>
              </div>

              <div className="divide-y divide-gray-100">
                {standings.thresholds.map((threshold, idx) => {
                  const isFirst = idx === 0;
                  return (
                    <div key={threshold.label} className="px-5 py-4 flex items-center gap-4">
                      <div className="w-24 flex-shrink-0">
                        <span className={`text-sm font-semibold ${isFirst ? 'text-yellow-600' : 'text-gray-700'}`}>
                          {threshold.label}
                        </span>
                      </div>

                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full ${isFirst ? 'bg-yellow-400' : 'bg-blue-400'}`}
                          style={{ width: `${Math.max((threshold.points / maxPoints) * 100, 2)}%` }}
                        />
                      </div>

                      <div className="w-20 text-right flex-shrink-0">
                        <span className={`text-sm font-bold ${isFirst ? 'text-yellow-600' : 'text-gray-800'}`}>
                          {threshold.points} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
