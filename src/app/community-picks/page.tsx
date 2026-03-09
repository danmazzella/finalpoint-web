'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PageTitle from '@/components/PageTitle';
import { communityPicksAPI, seasonsAPI } from '@/lib/api';

interface CommunityWeek {
  weekNumber: number;
  raceName: string;
  raceDate: string | null;
  isScored: boolean;
  hasSprint: boolean;
}

interface DriverPickStat {
  driverId: number;
  driverName: string;
  driverTeam: string;
  pickCount: number;
  percentage: number;
  isCorrect: boolean;
}

interface PositionStat {
  position: number;
  totalPicks: number;
  isScored: boolean;
  actualResult: { driverId: number; driverName: string; driverTeam: string } | null;
  drivers: DriverPickStat[];
}

interface CommunityStats {
  weekNumber: number;
  raceName: string;
  eventType: 'race' | 'sprint';
  isScored: boolean;
  positions: PositionStat[];
}

function CommunityPicksContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [weeks, setWeeks] = useState<CommunityWeek[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [eventType, setEventType] = useState<'race' | 'sprint'>('race');
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [weeksLoading, setWeeksLoading] = useState(true);
  const [seasons, setSeasons] = useState<{ year: number; displayLabel: string }[]>([]);
  const [seasonFilter, setSeasonFilter] = useState<number | null>(null);

  // Load seasons
  useEffect(() => {
    const load = async () => {
      try {
        const res = await seasonsAPI.getSeasons();
        if (res.data?.success && Array.isArray(res.data.data)) {
          setSeasons(res.data.data);
          const latest = Math.max(...res.data.data.map((s: { year: number }) => s.year));
          setSeasonFilter(latest);
        }
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  // Load available weeks
  useEffect(() => {
    const load = async () => {
      try {
        setWeeksLoading(true);
        const res = await communityPicksAPI.getAvailableWeeks(seasonFilter ?? undefined);
        if (res.data?.success) {
          const weekData: CommunityWeek[] = res.data.data;
          setWeeks(weekData);

          // Select week from URL param or default to most recent scored race (or first race if none scored)
          const weekParam = searchParams.get('week');
          if (weekParam) {
            const weekNum = parseInt(weekParam);
            if (weekData.some(w => w.weekNumber === weekNum)) {
              setSelectedWeek(weekNum);
              return;
            }
          }
          if (weekData.length > 0) {
            // Weeks are ordered DESC, find the most recent scored week
            const lastScored = weekData.find(w => w.isScored);
            // If no scored weeks yet, fall back to the first race (lowest week number)
            const defaultWeek = lastScored ?? weekData[weekData.length - 1];
            setSelectedWeek(defaultWeek.weekNumber);
          }
        }
      } catch {
        // ignore
      } finally {
        setWeeksLoading(false);
      }
    };
    load();
  }, [seasonFilter]);

  // Load stats when week or event type changes
  useEffect(() => {
    if (selectedWeek == null) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await communityPicksAPI.getStats(selectedWeek, eventType, seasonFilter ?? undefined);
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedWeek, eventType, seasonFilter]);

  const selectedWeekData = weeks.find(w => w.weekNumber === selectedWeek);

  const handleWeekChange = (weekNum: number) => {
    setSelectedWeek(weekNum);
    // Reset event type to race when switching weeks
    setEventType('race');
    const params = new URLSearchParams(searchParams.toString());
    params.set('week', weekNum.toString());
    router.replace(`/community-picks?${params.toString()}`);
  };

  return (
    <div className="page-bg min-h-screen">
      <main className="max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <PageTitle
          title="Community Picks"
          subtitle="See how the community picked each race week"
        />

        {/* Controls */}
        <div className="glass-card p-4 mb-5">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Season filter */}
            {seasons.length > 1 && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Season</label>
                <select
                  value={seasonFilter ?? ''}
                  onChange={(e) => setSeasonFilter(e.target.value ? Number(e.target.value) : null)}
                  className="input-field text-sm py-1.5"
                >
                  {seasons.map(s => (
                    <option key={s.year} value={s.year}>{s.displayLabel || s.year}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Week selector */}
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-gray-600">Race Week</label>
              {weeksLoading ? (
                <div className="h-9 bg-gray-100 animate-pulse rounded-lg" />
              ) : weeks.length === 0 ? (
                <p className="text-sm text-gray-500">No weeks available</p>
              ) : (
                <select
                  value={selectedWeek ?? ''}
                  onChange={(e) => handleWeekChange(Number(e.target.value))}
                  className="input-field text-sm py-1.5"
                >
                  {weeks.map(w => (
                    <option key={w.weekNumber} value={w.weekNumber}>
                      Week {w.weekNumber}{w.raceName ? ` — ${w.raceName}` : ''}{w.isScored ? ' ✓' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Event type toggle - only show if week has sprint */}
            {selectedWeekData?.hasSprint && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Event</label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setEventType('race')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      eventType === 'race' ? 'bg-blue-600 text-white' : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    Race
                  </button>
                  <button
                    onClick={() => setEventType('sprint')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      eventType === 'sprint' ? 'bg-blue-600 text-white' : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    Sprint
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : stats == null || stats.positions.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-gray-500">No pick data available for this week.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Scored badge */}
            {stats.isScored && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Results are in — correct picks are highlighted below
              </div>
            )}

            {stats.positions.map((pos) => (
              <PositionCard key={pos.position} position={pos} isScored={stats.isScored} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function PositionCard({ position, isScored }: { position: PositionStat; isScored: boolean }) {
  const ordinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const correctDriver = position.drivers.find(d => d.isCorrect);

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-white/40 flex items-center gap-3">
        <span className="text-base font-semibold text-gray-900">P{position.position}</span>
        <span className="text-sm text-gray-500">{ordinal(position.position)} place</span>
      </div>

      <div className="px-5 py-4 space-y-3">
        {position.drivers.map((driver) => (
          <div
            key={driver.driverId}
            className={`rounded-xl p-3 transition-colors ${
              driver.isCorrect ? 'bg-green-50 ring-1 ring-green-300' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                {driver.isCorrect && (
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span className={`text-sm font-medium truncate ${driver.isCorrect ? 'text-green-800' : 'text-gray-900'}`}>
                  {driver.driverName}
                </span>
                <span className="text-xs text-gray-400 truncate hidden sm:block">{driver.driverTeam}</span>
              </div>
              <span className={`text-sm font-bold flex-shrink-0 ml-2 ${driver.isCorrect ? 'text-green-700' : 'text-gray-700'}`}>
                {driver.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${driver.isCorrect ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.max(driver.percentage, 1)}%` }}
              />
            </div>
          </div>
        ))}

        {isScored && correctDriver && (
          <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
            {correctDriver.percentage}% of players picked {correctDriver.driverName} correctly for P{position.position}
          </div>
        )}
        {isScored && !correctDriver && position.actualResult && (
          <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
            Correct answer: {position.actualResult.driverName} — 0% of players got this right
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommunityPicksPage() {
  return (
    <Suspense fallback={
      <div className="page-bg min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
      </div>
    }>
      <CommunityPicksContent />
    </Suspense>
  );
}
