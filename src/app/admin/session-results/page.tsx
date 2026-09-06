'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminAPI, f1racesAPI, seasonsAPI } from '@/lib/api';

interface RaceRow {
    weekNumber: number;
    raceName: string;
    hasSprint?: boolean;
}

type SessionType = 'fp1' | 'fp2' | 'fp3' | 'sprint_qualifying' | 'qualifying';

const SESSION_OPTIONS: { value: SessionType; label: string; sprintOnly?: boolean }[] = [
    { value: 'fp1', label: 'Practice 1' },
    { value: 'fp2', label: 'Practice 2' },
    { value: 'fp3', label: 'Practice 3' },
    { value: 'sprint_qualifying', label: 'Sprint Qualifying', sprintOnly: true },
    { value: 'qualifying', label: 'Qualifying' },
];

interface DiffEntry {
    position: number | null;
    driverId: number;
    driverName: string;
    driverTeam: string;
}

interface DiffPayload {
    raceName: string;
    sessionName: string | null;
    feedResults: DiffEntry[];
    currentResults: DiffEntry[];
    unmatched: string[];
    mappingError: string | null;
    applied?: number;
}

export default function AdminSessionResultsPage() {
    const [seasons, setSeasons] = useState<{ year: number; displayLabel: string }[]>([]);
    const [season, setSeason] = useState<number | null>(null);
    const [races, setRaces] = useState<RaceRow[]>([]);
    const [week, setWeek] = useState<number | null>(null);
    const [sessionType, setSessionType] = useState<SessionType>('qualifying');

    const [preview, setPreview] = useState<DiffPayload | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await seasonsAPI.getSeasons();
                if (res?.data?.success && Array.isArray(res.data.data) && res.data.data.length) {
                    setSeasons(res.data.data);
                    setSeason((prev) => prev ?? res.data.data[0].year);
                } else {
                    setSeason(new Date().getFullYear());
                }
            } catch {
                setSeason(new Date().getFullYear());
            }
        })();
    }, []);

    useEffect(() => {
        if (season == null) return;
        (async () => {
            try {
                const res = await f1racesAPI.getAllRaces(season);
                if (res?.data?.success) {
                    const list = (res.data.data as RaceRow[]).sort((a, b) => a.weekNumber - b.weekNumber);
                    setRaces(list);
                    setWeek((prev) => prev ?? list[0]?.weekNumber ?? null);
                }
            } catch {
                setRaces([]);
            }
        })();
    }, [season]);

    const selectedRace = useMemo(
        () => races.find((r) => r.weekNumber === week) ?? null,
        [races, week],
    );

    const sessionOptions = useMemo(
        () => SESSION_OPTIONS.filter((o) => !o.sprintOnly || selectedRace?.hasSprint),
        [selectedRace],
    );

    // Keep the picked session valid when the weekend changes.
    useEffect(() => {
        if (!sessionOptions.some((o) => o.value === sessionType)) {
            setSessionType('qualifying');
        }
    }, [sessionOptions, sessionType]);

    const run = useCallback(
        async (mode: 'diff' | 'apply') => {
            if (season == null || week == null) return;
            setBusy(true);
            setError(null);
            setSuccess(null);
            try {
                const res = await adminAPI.importSessionResults(week, sessionType, mode, season);
                const data = res.data?.data as DiffPayload | undefined;
                if (data) setPreview(data);
                if (mode === 'apply' && res.data?.success) {
                    setSuccess(res.data.message || 'Imported.');
                }
            } catch (e) {
                const err = e as { response?: { data?: { message?: string; data?: DiffPayload } } };
                if (err.response?.data?.data) setPreview(err.response.data.data);
                setError(err.response?.data?.message || 'Request failed.');
            } finally {
                setBusy(false);
            }
        },
        [season, week, sessionType],
    );

    const canImport = preview && !preview.mappingError && preview.feedResults.length > 0;

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Session Results Import</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Pull practice, sprint qualifying and qualifying finishing order from OpenF1.
                    Informational only. This never scores leagues.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                    <select
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                        value={season ?? ''}
                        onChange={(e) => {
                            setSeason(parseInt(e.target.value));
                            setWeek(null);
                            setPreview(null);
                        }}
                    >
                        {(seasons.length ? seasons.map((s) => s.year) : season != null ? [season] : []).map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Race weekend</label>
                    <select
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                        value={week ?? ''}
                        onChange={(e) => {
                            setWeek(parseInt(e.target.value));
                            setPreview(null);
                        }}
                    >
                        {races.map((r) => (
                            <option key={r.weekNumber} value={r.weekNumber}>
                                Week {r.weekNumber}: {r.raceName}{r.hasSprint ? ' (sprint)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                    <select
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                        value={sessionType}
                        onChange={(e) => {
                            setSessionType(e.target.value as SessionType);
                            setPreview(null);
                        }}
                    >
                        {sessionOptions.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => run('diff')}
                    disabled={busy || week == null}
                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                    {busy ? 'Working…' : 'Preview from OpenF1'}
                </button>
                <button
                    onClick={() => run('apply')}
                    disabled={busy || !canImport}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
                >
                    Import
                </button>
            </div>

            {error && <div className="rounded-lg bg-red-100 p-3 text-sm text-red-800">{error}</div>}
            {success && <div className="rounded-lg bg-green-100 p-3 text-sm text-green-800">{success}</div>}

            {preview && (
                <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                        {preview.raceName}
                        {preview.sessionName ? ` · ${preview.sessionName}` : ''}
                    </div>

                    {preview.mappingError && (
                        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                            {preview.mappingError}
                            {preview.unmatched.length > 0 && (
                                <ul className="mt-1 list-disc pl-5">
                                    {preview.unmatched.map((u) => <li key={u}>{u}</li>)}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <SessionColumn title={`OpenF1 (${preview.feedResults.length})`} rows={preview.feedResults} />
                        <SessionColumn title={`Currently stored (${preview.currentResults.length})`} rows={preview.currentResults} />
                    </div>
                </div>
            )}
        </div>
    );
}

function SessionColumn({ title, rows }: { title: string; rows: DiffEntry[] }) {
    return (
        <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">{title}</h3>
            {rows.length === 0 ? (
                <p className="text-sm text-gray-500">None.</p>
            ) : (
                <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100">
                        {rows.map((r) => (
                            <tr key={`${r.position}-${r.driverId}`}>
                                <td className="w-10 py-1.5 font-semibold text-gray-900">{r.position == null ? 'NT' : `P${r.position}`}</td>
                                <td className="py-1.5 text-gray-900">{r.driverName}</td>
                                <td className="py-1.5 text-gray-500">{r.driverTeam}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
