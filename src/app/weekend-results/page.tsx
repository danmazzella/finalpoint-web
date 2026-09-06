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
    position: number;
    driverId: number;
    driverName: string;
    driverTeam: string;
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

    return (
        <div className="mx-auto max-w-3xl px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Weekend Results</h1>
            <p className="mt-1 text-sm text-gray-600">
                Practice, qualifying, sprint and Grand Prix finishing order for each race weekend.
            </p>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Race weekend</label>
                <select
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
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
                    <div className="py-12 text-center text-sm text-gray-500">Loading results…</div>
                ) : availableTabs.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500">
                        No results yet for {selectedRace?.raceName ?? 'this weekend'}.
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
                            {availableTabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                                        activeTab === tab
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {SESSION_LABEL[tab]}
                                </button>
                            ))}
                        </div>

                        <table className="mt-4 w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                    <th className="w-12 py-2">Pos</th>
                                    <th className="py-2">Driver</th>
                                    <th className="py-2">Team</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rows.map((row) => (
                                    <tr key={`${row.position}-${row.driverId}`}>
                                        <td className="py-2 font-semibold text-gray-900">P{row.position}</td>
                                        <td className="py-2 text-gray-900">{row.driverName}</td>
                                        <td className="py-2 text-gray-500">{row.driverTeam}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </div>
    );
}
