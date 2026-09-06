'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { f1racesAPI } from '@/lib/api';

interface RaceRow {
    weekNumber: number;
    raceName: string;
    raceDate: string;
    hasSprint?: boolean;
}

interface SessionEntry {
    position: number | null; // null = entered the session but set no timed lap
    driverId: number;
    driverName: string;
    driverTeam: string;
    bestLapMs: number | null;
    gapToLeaderMs: number | null;
    lapsCompleted: number | null;
}

type SessionType =
    | 'fp1'
    | 'fp2'
    | 'fp3'
    | 'sprint_qualifying'
    | 'sprint'
    | 'qualifying'
    | 'race';

// Display order + labels. Sessions with no results are hidden.
const SESSION_ORDER: SessionType[] = [
    'fp1',
    'fp2',
    'fp3',
    'sprint_qualifying',
    'sprint',
    'qualifying',
    'race',
];

const SESSION_LABEL: Record<SessionType, string> = {
    fp1: 'Practice 1',
    fp2: 'Practice 2',
    fp3: 'Practice 3',
    sprint_qualifying: 'Sprint Qualifying',
    sprint: 'Sprint',
    qualifying: 'Qualifying',
    race: 'Grand Prix',
};

// 71163 -> "1:11.163"
const fmtLap = (ms: number | null): string | null => {
    if (ms == null) return null;
    const s = ms / 1000;
    const m = Math.floor(s / 60);
    const rem = (s % 60).toFixed(3);
    return m > 0 ? `${m}:${rem.padStart(6, '0')}` : rem;
};

// 102 -> "+0.102" ; big gaps -> "+1:02.345" ; leader -> null
const fmtGap = (ms: number | null): string | null => {
    if (ms == null || ms === 0) return null;
    if (ms >= 60000) return `+${fmtLap(ms)}`;
    return `+${(ms / 1000).toFixed(3)}`;
};

export default function WeekendResultsPage() {
    const seasonYear = new Date().getFullYear();

    const [races, setRaces] = useState<RaceRow[]>([]);
    const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
    const [sessions, setSessions] = useState<Partial<Record<SessionType, SessionEntry[]>>>({});
    const [activeTab, setActiveTab] = useState<SessionType | null>(null);
    const [loadingRaces, setLoadingRaces] = useState(true);
    const [loadingResults, setLoadingResults] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const [allRacesRes, currentRes] = await Promise.allSettled([
                    f1racesAPI.getAllRaces(seasonYear),
                    f1racesAPI.getCurrentRace(),
                ]);

                let list: RaceRow[] = [];
                if (allRacesRes.status === 'fulfilled' && allRacesRes.value?.data?.success) {
                    list = allRacesRes.value.data.data as RaceRow[];
                    setRaces(list);
                }

                let defaultWeek = list[0]?.weekNumber ?? null;
                if (currentRes.status === 'fulfilled' && currentRes.value?.data?.success) {
                    defaultWeek = currentRes.value.data.data.weekNumber ?? defaultWeek;
                }
                setSelectedWeek(defaultWeek);
            } catch (e) {
                console.error('Error loading races:', e);
                setError('Could not load the race schedule.');
            } finally {
                setLoadingRaces(false);
            }
        })();
    }, [seasonYear]);

    const loadResults = useCallback(
        async (week: number) => {
            setLoadingResults(true);
            setError(null);
            try {
                const res = await f1racesAPI.getSessionResults(week, seasonYear);
                if (res?.data?.success) {
                    const next = (res.data.data.sessions ?? {}) as Partial<Record<SessionType, SessionEntry[]>>;
                    setSessions(next);
                    const firstWithData = SESSION_ORDER.find((s) => (next[s]?.length ?? 0) > 0) ?? null;
                    setActiveTab(firstWithData);
                } else {
                    setSessions({});
                    setActiveTab(null);
                }
            } catch (e) {
                console.error('Error loading session results:', e);
                setSessions({});
                setActiveTab(null);
                setError('Could not load results for this weekend.');
            } finally {
                setLoadingResults(false);
            }
        },
        [seasonYear],
    );

    useEffect(() => {
        if (selectedWeek != null) loadResults(selectedWeek);
    }, [selectedWeek, loadResults]);

    const availableTabs = useMemo(
        () => SESSION_ORDER.filter((s) => (sessions[s]?.length ?? 0) > 0),
        [sessions],
    );

    const selectedRace = races.find((r) => r.weekNumber === selectedWeek) ?? null;
    const rows = activeTab ? sessions[activeTab] ?? [] : [];
    const timedSession = activeTab != null && activeTab !== 'race' && activeTab !== 'sprint';

    return (
        <div className="page-bg min-h-screen">
            <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 mb-20">
                <h1 className="text-2xl font-bold text-gray-900">Weekend Results</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Every session&apos;s order for a race weekend — practice and qualifying with best lap and
                    gap, sprint and Grand Prix finishing order.
                </p>

                <div className="mt-4">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Race weekend</label>
                    <select
                        className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedWeek ?? ''}
                        disabled={loadingRaces}
                        onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                    >
                        {races.map((r) => (
                            <option key={r.weekNumber} value={r.weekNumber}>
                                Week {r.weekNumber} — {r.raceName}
                                {r.hasSprint ? ' (sprint)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-800">{error}</div>
                )}

                <div className="mt-6">
                    {loadingResults ? (
                        <div className="glass-card px-6 py-12 text-center text-sm text-gray-500">
                            Loading results…
                        </div>
                    ) : availableTabs.length === 0 ? (
                        <div className="glass-card px-6 py-12 text-center text-sm text-gray-500">
                            No results yet for {selectedRace?.raceName ?? 'this weekend'}.
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 flex flex-wrap gap-2">
                                {availableTabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                                            activeTab === tab
                                                ? 'bg-blue-600 font-semibold text-white shadow-sm'
                                                : 'bg-gray-100 font-medium text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        {SESSION_LABEL[tab]}
                                    </button>
                                ))}
                            </div>

                            <div className="glass-card animate-fade-in-up overflow-hidden">
                                <ul className="divide-y divide-gray-200">
                                    {rows.map((row) => {
                                        const lap = fmtLap(row.bestLapMs);
                                        const gap = fmtGap(row.gapToLeaderMs);
                                        const isLeader = row.gapToLeaderMs === 0;
                                        return (
                                            <li
                                                key={`${row.position ?? 'nt'}-${row.driverId}`}
                                                className={`flex items-center gap-3 px-4 py-3 ${
                                                    isLeader ? 'bg-blue-500/10' : ''
                                                }`}
                                            >
                                                <span className="w-8 shrink-0 text-center text-sm font-bold tabular-nums text-gray-900">
                                                    {row.position == null ? (
                                                        <span className="text-gray-400">–</span>
                                                    ) : (
                                                        row.position
                                                    )}
                                                </span>

                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-sm font-semibold text-gray-900">
                                                        {row.driverName}
                                                    </div>
                                                    <div className="truncate text-xs text-gray-500">
                                                        {row.driverTeam}
                                                        {timedSession && row.lapsCompleted != null && (
                                                            <>
                                                                {' · '}
                                                                {row.lapsCompleted} lap
                                                                {row.lapsCompleted === 1 ? '' : 's'}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {timedSession && (
                                                    <div className="shrink-0 text-right tabular-nums">
                                                        {lap == null ? (
                                                            <span className="text-xs text-gray-400">No time</span>
                                                        ) : isLeader ? (
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                {lap}
                                                            </span>
                                                        ) : (
                                                            <>
                                                                <div className="text-sm font-semibold text-gray-900">
                                                                    {gap ?? lap}
                                                                </div>
                                                                <div className="text-[11px] text-gray-500">{lap}</div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
