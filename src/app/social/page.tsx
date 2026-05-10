'use client';

import { useState, useEffect, useRef } from 'react';
import { communityPicksAPI, authAPI, seasonsAPI, f1racesAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

import PickDistributionCard from '@/components/social/cards/PickDistributionCard';
import FinalPointCard from '@/components/social/cards/FinalPointCard';
import AccuracyRevealCard from '@/components/social/cards/AccuracyRevealCard';
import ChaosRatingCard from '@/components/social/cards/ChaosRatingCard';
import HardestPickCard from '@/components/social/cards/HardestPickCard';
import DarkHorseCard from '@/components/social/cards/DarkHorseCard';
import PlatformStandingsCard from '@/components/social/cards/PlatformStandingsCard';
import MilestoneCard from '@/components/social/cards/MilestoneCard';
import SeasonWrappedCard from '@/components/social/cards/SeasonWrappedCard';
import RaceCountdownCard from '@/components/social/cards/RaceCountdownCard';
import InviteCard from '@/components/social/cards/InviteCard';
import BrandCard from '@/components/social/cards/BrandCard';
import DriverSpotlightCard from '@/components/social/cards/DriverSpotlightCard';
import ConsensusVsRealityCard from '@/components/social/cards/ConsensusVsRealityCard';
import HowItWorksCard from '@/components/social/cards/HowItWorksCard';
import SeasonProgressCard from '@/components/social/cards/SeasonProgressCard';
import AppDownloadCard from '@/components/social/cards/AppDownloadCard';

// ─── Types ───────────────────────────────────────────────────────────────────

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

interface PlatformStandingsData {
  seasonYear: number;
  totalPlayers: number;
  thresholds: { label: string; percentile: number; accuracy: number }[];
}

interface GlobalStats {
  totalUsers: number;
  totalLeagues: number;
  totalPicks: number;
  accuracy: number;
}

interface UserStats {
  totalPicks: number;
  correctPicks: number;
  totalPoints: number;
  accuracy: number;
  perfectPicksRate?: number;
}

interface CurrentRace {
  weekNumber: number;
  raceName: string;
  raceDate: string;
  circuitName: string;
  country: string;
  qualifyingDate?: string;
  lockTime?: string;
  hasSprint?: boolean;
  timeUntilLock: { hours: number; minutes: number; seconds: number; locked: boolean } | null;
}

// ─── Card type config ─────────────────────────────────────────────────────────

type CardType =
  | 'pick-distribution'
  | 'final-point'
  | 'driver-spotlight'
  | 'accuracy-reveal'
  | 'chaos-rating'
  | 'hardest-pick'
  | 'dark-horse'
  | 'consensus-vs-reality'
  | 'platform-standings'
  | 'milestone'
  | 'season-wrapped'
  | 'season-progress'
  | 'race-countdown'
  | 'invite'
  | 'brand'
  | 'how-it-works'
  | 'app-download';

interface CardConfig {
  id: CardType;
  label: string;
  emoji: string;
  timing: string;
  needsWeek: boolean;
  needsScored: boolean;
  needsRace: boolean;
  needsGlobalStats: boolean;
  needsUserStats: boolean;
  needsStandings: boolean;
  needsAllRaces?: boolean;
}

const CARD_TYPES: CardConfig[] = [
  // ── Pre-race ──
  { id: 'pick-distribution',  label: 'Pick Distribution',   emoji: '📊', timing: 'Pre-race',  needsWeek: true,  needsScored: false, needsRace: false, needsGlobalStats: false, needsUserStats: false, needsStandings: false },
  { id: 'final-point',        label: 'Final Point',         emoji: '🏁', timing: 'Pre-race',  needsWeek: true,  needsScored: false, needsRace: false, needsGlobalStats: false, needsUserStats: false, needsStandings: false },
  { id: 'driver-spotlight',   label: 'Driver Spotlight',    emoji: '🔦', timing: 'Pre-race',  needsWeek: true,  needsScored: false, needsRace: false, needsGlobalStats: false, needsUserStats: false, needsStandings: false },
  { id: 'race-countdown',     label: 'Race Countdown',      emoji: '⏱️', timing: 'Pre-race',  needsWeek: false, needsScored: false, needsRace: true,  needsGlobalStats: false, needsUserStats: false, needsStandings: false },
  // ── Post-race ──
  { id: 'accuracy-reveal',    label: 'Accuracy Reveal',     emoji: '✅', timing: 'Post-race', needsWeek: true,  needsScored: true,  needsRace: false, needsGlobalStats: false, needsUserStats: false, needsStandings: false },
  { id: 'chaos-rating',       label: 'Chaos Rating',        emoji: '🌀', timing: 'Post-race', needsWeek: true,  needsScored: true,  needsRace: false, needsGlobalStats: false, needsUserStats: false, needsStandings: false },
  { id: 'hardest-pick',       label: 'Hardest Pick',        emoji: '🎯', timing: 'Post-race', needsWeek: true,  needsScored: true,  needsRace: false, needsGlobalStats: false, needsUserStats: false, needsStandings: false },
  { id: 'dark-horse',         label: 'Dark Horse',          emoji: '🐴', timing: 'Post-race', needsWeek: true,  needsScored: true,  needsRace: false, needsGlobalStats: false, needsUserStats: false, needsStandings: false },
  { id: 'consensus-vs-reality',label: 'Crowd vs Reality',  emoji: '🆚', timing: 'Post-race', needsWeek: true,  needsScored: true,  needsRace: false, needsGlobalStats: false, needsUserStats: false, needsStandings: false },
  // ── Season ──
  { id: 'platform-standings', label: 'Season Standings',    emoji: '🏆', timing: 'Season',    needsWeek: false, needsScored: false, needsRace: false, needsGlobalStats: false, needsUserStats: false, needsStandings: true  },
  { id: 'milestone',          label: 'Milestone',           emoji: '🎉', timing: 'Anytime',   needsWeek: false, needsScored: false, needsRace: false, needsGlobalStats: true,  needsUserStats: false, needsStandings: false },
  { id: 'season-wrapped',     label: 'Season Wrapped',      emoji: '🎁', timing: 'Season',    needsWeek: false, needsScored: false, needsRace: false, needsGlobalStats: false, needsUserStats: true,  needsStandings: false },
  { id: 'season-progress',    label: 'Season Progress',     emoji: '📅', timing: 'Season',    needsWeek: false, needsScored: false, needsRace: false, needsGlobalStats: false, needsUserStats: false, needsStandings: false, needsAllRaces: true },
  // ── Marketing ──
  { id: 'invite',             label: 'Invite Card',         emoji: '📨', timing: 'Anytime',   needsWeek: false, needsScored: false, needsRace: false, needsGlobalStats: false, needsUserStats: false, needsStandings: false },
  { id: 'brand',              label: 'About FinalPoint',    emoji: '✨', timing: 'Anytime',   needsWeek: false, needsScored: false, needsRace: false, needsGlobalStats: false, needsUserStats: false, needsStandings: false },
  { id: 'how-it-works',       label: 'How It Works',        emoji: '📋', timing: 'Anytime',   needsWeek: false, needsScored: false, needsRace: false, needsGlobalStats: false, needsUserStats: false, needsStandings: false },
  { id: 'app-download',       label: 'App Download',        emoji: '📱', timing: 'Anytime',   needsWeek: false, needsScored: false, needsRace: false, needsGlobalStats: false, needsUserStats: false, needsStandings: false },
];

const CARD_GROUPS = [
  { label: 'Pre-race',  ids: ['pick-distribution', 'final-point', 'driver-spotlight', 'race-countdown'] },
  { label: 'Post-race', ids: ['accuracy-reveal', 'chaos-rating', 'hardest-pick', 'dark-horse', 'consensus-vs-reality'] },
  { label: 'Season',    ids: ['platform-standings', 'milestone', 'season-wrapped', 'season-progress'] },
  { label: 'Marketing', ids: ['invite', 'brand', 'how-it-works', 'app-download'] },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function SocialPage() {
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);

  const [cardType, setCardType] = useState<CardType>('pick-distribution');
  const [eventType, setEventType] = useState<'race' | 'sprint'>('race');
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState<Set<number>>(new Set());

  // Week / season
  const [weeks, setWeeks] = useState<CommunityWeek[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [weeksLoading, setWeeksLoading] = useState(true);
  const [seasons, setSeasons] = useState<{ year: number; displayLabel: string }[]>([]);
  const [seasonFilter, setSeasonFilter] = useState<number | null>(null);

  // Data
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [platformStandings, setPlatformStandings] = useState<PlatformStandingsData | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [currentRace, setCurrentRace] = useState<CurrentRace | null>(null);
  const [allRaces, setAllRaces] = useState<{ weekNumber: number; raceName: string; raceDate: string; status?: string }[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Driver spotlight selector
  const [spotlightDriver, setSpotlightDriver] = useState<string>('');

  // Invite card custom inputs
  const [inviteLeagueName, setInviteLeagueName] = useState('');

  const cfg = CARD_TYPES.find(c => c.id === cardType)!;
  const selectedWeekData = weeks.find(w => w.weekNumber === selectedWeek);

  // Seasons
  useEffect(() => {
    seasonsAPI.getSeasons().then(res => {
      if (res.data?.success && Array.isArray(res.data.data)) {
        setSeasons(res.data.data);
        const latest = Math.max(...res.data.data.map((s: { year: number }) => s.year));
        setSeasonFilter(latest);
      }
    }).catch(() => {});
  }, []);

  // Weeks
  useEffect(() => {
    if (!seasonFilter) return;
    setWeeksLoading(true);
    communityPicksAPI.getAvailableWeeks(seasonFilter).then(res => {
      if (res.data?.success) {
        const data: CommunityWeek[] = res.data.data;
        setWeeks(data);
        const defaultWeek = data.find(w => w.isScored) ?? data[data.length - 1];
        if (defaultWeek) setSelectedWeek(defaultWeek.weekNumber);
      }
    }).catch(() => {}).finally(() => setWeeksLoading(false));
  }, [seasonFilter]);

  // Community stats
  useEffect(() => {
    if (!cfg.needsWeek || !selectedWeek || !seasonFilter) return;
    setDataLoading(true);
    communityPicksAPI.getStats(selectedWeek, eventType, seasonFilter).then(res => {
      if (res.data?.success) {
        const data: CommunityStats = res.data.data;
        setCommunityStats(data);
        setSelectedPositions(new Set(data.positions.map(p => p.position)));
      }
    }).catch(() => setCommunityStats(null)).finally(() => setDataLoading(false));
  }, [cfg.needsWeek, selectedWeek, eventType, seasonFilter]);

  // Platform standings
  useEffect(() => {
    if (!cfg.needsStandings || !seasonFilter) return;
    setDataLoading(true);
    authAPI.getPlatformStandings(seasonFilter).then(res => {
      if (res.data?.success) setPlatformStandings(res.data.data);
    }).catch(() => setPlatformStandings(null)).finally(() => setDataLoading(false));
  }, [cfg.needsStandings, seasonFilter]);

  // Global stats
  useEffect(() => {
    if (!cfg.needsGlobalStats || !seasonFilter) return;
    setDataLoading(true);
    authAPI.getGlobalStats(seasonFilter).then(res => {
      if (res.data?.success) setGlobalStats(res.data.data);
    }).catch(() => setGlobalStats(null)).finally(() => setDataLoading(false));
  }, [cfg.needsGlobalStats, seasonFilter]);

  // User stats
  useEffect(() => {
    if (!cfg.needsUserStats || !seasonFilter) return;
    setDataLoading(true);
    authAPI.getUserStats(seasonFilter).then(res => {
      if (res.data?.success) setUserStats(res.data.data);
    }).catch(() => setUserStats(null)).finally(() => setDataLoading(false));
  }, [cfg.needsUserStats, seasonFilter]);

  // Current race
  useEffect(() => {
    if (!cfg.needsRace) return;
    setDataLoading(true);
    f1racesAPI.getCurrentRace().then(res => {
      if (res.data?.success) setCurrentRace(res.data.data);
    }).catch(() => setCurrentRace(null)).finally(() => setDataLoading(false));
  }, [cfg.needsRace]);

  // All races (for season progress)
  useEffect(() => {
    if (!cfg.needsAllRaces || !seasonFilter) return;
    f1racesAPI.getAllRaces(seasonFilter).then(res => {
      if (res.data?.success) setAllRaces(res.data.data);
    }).catch(() => setAllRaces([]));
  }, [cfg.needsAllRaces, seasonFilter]);

  // Auto-select first driver when community stats load (for driver spotlight)
  useEffect(() => {
    if (communityStats && !spotlightDriver) {
      const first = communityStats.positions[0]?.drivers[0]?.driverName;
      if (first) setSpotlightDriver(first);
    }
  }, [communityStats]);

  const scoredWarning = cfg.needsScored && selectedWeekData && !selectedWeekData.isScored;

  // ─── Render card ───────────────────────────────────────────────────────────

  function renderCard() {
    if (dataLoading) {
      return (
        <div style={{ width: 600, height: 600, background: '#090c14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
        </div>
      );
    }

    const raceName = communityStats?.raceName ?? selectedWeekData?.raceName ?? `Week ${selectedWeek}`;
    const positions = (communityStats?.positions ?? []).filter(
      p => selectedPositions.has(p.position)
    );
    const spotlightPos = Array.from(selectedPositions).sort((a, b) => a - b)[0] ?? 10;

    switch (cardType) {
      case 'pick-distribution':
        return <PickDistributionCard raceName={raceName} eventType={eventType} positions={positions} />;

      case 'final-point':
        return <FinalPointCard raceName={raceName} eventType={eventType} positions={positions} spotlightPosition={spotlightPos} />;

      case 'race-countdown': {
        if (!currentRace) return <EmptyCard message="No upcoming race data." />;
        const t = currentRace.timeUntilLock;
        const timeUntilLockMs = !t || t.locked
          ? -1
          : (t.hours * 3600 + t.minutes * 60 + t.seconds) * 1000;
        return (
          <RaceCountdownCard
            raceName={currentRace.raceName}
            circuitName={currentRace.circuitName}
            country={currentRace.country}
            raceDate={currentRace.raceDate}
            qualifyingDate={currentRace.qualifyingDate}
            lockTime={currentRace.lockTime}
            hasSprint={currentRace.hasSprint}
            timeUntilLock={timeUntilLockMs}
          />
        );
      }

      case 'accuracy-reveal':
        return <AccuracyRevealCard raceName={raceName} eventType={eventType} positions={positions} />;

      case 'chaos-rating':
        return <ChaosRatingCard raceName={raceName} eventType={eventType} positions={positions} />;

      case 'hardest-pick':
        return <HardestPickCard raceName={raceName} eventType={eventType} positions={positions} />;

      case 'dark-horse':
        return <DarkHorseCard raceName={raceName} eventType={eventType} positions={positions} />;

      case 'platform-standings':
        if (!platformStandings) return <EmptyCard message="No standings data available." />;
        return (
          <PlatformStandingsCard
            seasonYear={platformStandings.seasonYear ?? seasonFilter ?? 2025}
            totalPlayers={platformStandings.totalPlayers}
            thresholds={platformStandings.thresholds}
          />
        );

      case 'milestone':
        if (!globalStats) return <EmptyCard message="Loading stats…" />;
        return (
          <MilestoneCard
            seasonYear={seasonFilter ?? 2025}
            totalPicks={globalStats.totalPicks ?? 0}
            totalUsers={globalStats.totalUsers ?? 0}
            totalLeagues={globalStats.totalLeagues ?? 0}
            accuracy={Math.round(globalStats.accuracy ?? 0)}
          />
        );

      case 'season-wrapped':
        if (!userStats) return <EmptyCard message={user ? 'Loading your stats…' : 'Sign in to see your season stats.'} />;
        return (
          <SeasonWrappedCard
            seasonYear={seasonFilter ?? 2025}
            userName={user?.name ?? 'You'}
            accuracy={Math.round(userStats.accuracy ?? 0)}
            totalPicks={userStats.totalPicks ?? 0}
            correctPicks={userStats.correctPicks ?? 0}
            totalPoints={userStats.totalPoints ?? 0}
            perfectPicksRate={userStats.perfectPicksRate}
          />
        );

      case 'driver-spotlight': {
        if (!communityStats) return <EmptyCard message="Select a race week to load community data." />;
        const driverName = spotlightDriver || communityStats.positions[0]?.drivers[0]?.driverName || '';
        if (!driverName) return <EmptyCard message="No driver data available." />;
        return (
          <DriverSpotlightCard
            raceName={raceName}
            eventType={eventType}
            positions={communityStats.positions.filter(p => selectedPositions.size === 0 || selectedPositions.has(p.position))}
            driverName={driverName}
          />
        );
      }

      case 'consensus-vs-reality':
        return <ConsensusVsRealityCard raceName={raceName} eventType={eventType} positions={positions} />;

      case 'season-progress': {
        const completed = allRaces.filter(r => r.status === 'completed' || r.status === 'scored').length;
        return (
          <SeasonProgressCard
            seasonYear={seasonFilter ?? 2025}
            races={allRaces}
            completedCount={completed}
          />
        );
      }

      case 'invite':
        return <InviteCard leagueName={inviteLeagueName} seasonYear={seasonFilter ?? undefined} />;

      case 'brand':
        return <BrandCard />;

      case 'how-it-works':
        return <HowItWorksCard />;

      case 'app-download':
        return <AppDownloadCard />;
    }
  }

  // ─── Fullscreen ────────────────────────────────────────────────────────────

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: '#000' }}>
        <button
          onClick={() => setFullscreen(false)}
          className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors text-xl"
        >
          ✕
        </button>
        <div ref={cardRef}>{renderCard()}</div>
        <p className="absolute bottom-6 text-slate-600 text-sm">Screenshot the card above</p>
      </div>
    );
  }

  // ─── Main UI ───────────────────────────────────────────────────────────────

  return (
    <div className="page-bg min-h-screen">
      <main className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Social Card Generator</h1>
          <p className="text-sm text-gray-500 mt-1">Build cards for Instagram. Fullscreen → screenshot → post.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Controls ─────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 lg:w-72 flex-shrink-0">

            {/* Card type grouped */}
            <div className="glass-card p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Card Type</p>
              <div className="flex flex-col gap-4">
                {CARD_GROUPS.map(group => (
                  <div key={group.label}>
                    <p className="text-xs text-gray-400 font-semibold mb-1.5 pl-1">{group.label}</p>
                    <div className="flex flex-col gap-0.5">
                      {group.ids.map(id => {
                        const ct = CARD_TYPES.find(c => c.id === id)!;
                        return (
                          <button
                            key={ct.id}
                            onClick={() => setCardType(ct.id)}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors text-sm font-medium ${
                              cardType === ct.id ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span>{ct.emoji}</span>
                            <span className="flex-1">{ct.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Week selector */}
            {cfg.needsWeek && (
              <div className="glass-card p-4 flex flex-col gap-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Race</p>
                {seasons.length > 1 && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Season</label>
                    <select value={seasonFilter ?? ''} onChange={e => setSeasonFilter(Number(e.target.value))} className="input-field text-sm py-1.5 w-full">
                      {seasons.map(s => <option key={s.year} value={s.year}>{s.displayLabel || s.year}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Race Week</label>
                  {weeksLoading ? (
                    <div className="h-9 bg-gray-100 animate-pulse rounded-lg" />
                  ) : (
                    <select value={selectedWeek ?? ''} onChange={e => setSelectedWeek(Number(e.target.value))} className="input-field text-sm py-1.5 w-full">
                      {weeks.map(w => <option key={w.weekNumber} value={w.weekNumber}>{w.raceName || `Week ${w.weekNumber}`}{w.isScored ? ' ✓' : ''}</option>)}
                    </select>
                  )}
                </div>
                {selectedWeekData?.hasSprint && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Event</label>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                      {(['race', 'sprint'] as const).map(et => (
                        <button key={et} onClick={() => setEventType(et)} className={`flex-1 py-1.5 text-sm font-medium capitalize transition-colors ${eventType === et ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                          {et}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Season selector for non-week cards */}
            {(cfg.needsStandings || cfg.needsGlobalStats || cfg.needsUserStats) && seasons.length > 0 && (
              <div className="glass-card p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Season</p>
                <select value={seasonFilter ?? ''} onChange={e => setSeasonFilter(Number(e.target.value))} className="input-field text-sm py-1.5 w-full">
                  {seasons.map(s => <option key={s.year} value={s.year}>{s.displayLabel || s.year}</option>)}
                </select>
              </div>
            )}

            {/* Position picker */}
            {cfg.needsWeek && communityStats && communityStats.positions.length > 0 && (
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Positions</p>
                  <button
                    onClick={() => setSelectedPositions(new Set(communityStats.positions.map(p => p.position)))}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    All
                  </button>
                </div>
                <p className="text-xs text-gray-400 mb-2">Tap to isolate · tap again to reset</p>
                <div className="flex flex-wrap gap-2">
                  {communityStats.positions.slice().sort((a, b) => a.position - b.position).map(pos => {
                    const active = selectedPositions.has(pos.position);
                    const allSelected = selectedPositions.size === communityStats.positions.length;
                    return (
                      <button
                        key={pos.position}
                        onClick={() => setSelectedPositions(prev => {
                          // Active + multiple selected → isolate to this one
                          if (prev.has(pos.position) && prev.size > 1) {
                            return new Set([pos.position]);
                          }
                          // Active + only one selected (already isolated) → reset to all
                          if (prev.has(pos.position) && prev.size === 1) {
                            return new Set(communityStats.positions.map(p => p.position));
                          }
                          // Inactive → add it
                          const n = new Set(prev);
                          n.add(pos.position);
                          return n;
                        })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${active && !allSelected ? 'bg-blue-600 text-white border-blue-600' : active ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-400 border-gray-200 hover:border-blue-300'}`}
                      >
                        P{pos.position}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Invite card inputs */}
            {cardType === 'invite' && (
              <div className="glass-card p-4 flex flex-col gap-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customize</p>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">League Name (optional)</label>
                  <input
                    type="text"
                    value={inviteLeagueName}
                    onChange={e => setInviteLeagueName(e.target.value)}
                    placeholder="e.g. Dan's League"
                    className="input-field text-sm py-1.5 w-full"
                  />
                </div>
              </div>
            )}

            {/* Driver spotlight selector */}
            {cardType === 'driver-spotlight' && communityStats && (
              <div className="glass-card p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Driver</p>
                <select
                  value={spotlightDriver}
                  onChange={e => setSpotlightDriver(e.target.value)}
                  className="input-field text-sm py-1.5 w-full"
                >
                  {Array.from(
                    new Map(
                      communityStats.positions.flatMap(p => p.drivers).map(d => [d.driverName, d])
                    ).values()
                  ).sort((a, b) => a.driverName.localeCompare(b.driverName)).map(d => (
                    <option key={d.driverName} value={d.driverName}>{d.driverName}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Scored warning */}
            {scoredWarning && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700 font-medium">
                ⚠️ This week hasn't been scored yet. Post-race cards need results first.
              </div>
            )}

            {/* Countdown locked warning */}
            {cardType === 'race-countdown' && currentRace && (!currentRace.timeUntilLock || currentRace.timeUntilLock.locked) && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700 font-medium">
                ⚠️ Picks are locked for {currentRace.raceName}. This card is best posted before qualifying. Update race status in the DB if this race is over.
              </div>
            )}
          </div>

          {/* ── Preview ───────────────────────────────────────────────────── */}
          <div className="flex flex-col items-center gap-4 flex-1">
            <div style={{ transform: 'scale(0.75)', transformOrigin: 'top center', marginBottom: -150 }}>
              <div ref={cardRef} style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5)', borderRadius: 2 }}>
                {renderCard()}
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setFullscreen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Fullscreen to Screenshot
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center max-w-xs">
              600×600px card. Fullscreen → screenshot on mobile or Cmd+Shift+4 on Mac.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function EmptyCard({ message }: { message: string }) {
  return (
    <div style={{ width: 600, height: 600, background: '#090c14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#64748b', fontSize: 14 }}>{message}</p>
    </div>
  );
}
