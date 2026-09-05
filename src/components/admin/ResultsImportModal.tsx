'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';

interface FeedRow {
    position: number;
    driverId: number;
    driverName: string;
    driverTeam: string;
    method?: string;
    feedName?: string;
}

interface CurrentRow {
    finishingPosition: number;
    driverId: number;
    driverName: string;
    driverTeam: string;
}

interface DiffRow {
    position: number;
    feed: { driverId: number; driverName: string; driverTeam: string } | null;
    current: { driverId: number; driverName: string; driverTeam: string } | null;
}

interface ImportPreview {
    weekNumber: number;
    seasonYear: number;
    eventType: 'race' | 'sprint';
    raceName: string;
    feedRound: string | null;
    feedRaceName: string | null;
    feedResults: FeedRow[];
    currentResults: CurrentRow[];
    differences: DiffRow[];
    unmatched: string[];
    ambiguous: string[];
    mappingError: string | null;
    state: { source: 'manual' | 'imported'; locked: boolean; notificationsPending: boolean } | null;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    weekNumber: number;
    eventType: 'race' | 'sprint';
    seasonYear: number | null;
    onApplied: () => void;
    onFillGrid: (rows: FeedRow[]) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errText = (e: any, fallback: string) =>
    e?.response?.data?.message || e?.response?.data?.error?.message || (e instanceof Error ? e.message : fallback);

export default function ResultsImportModal({
    isOpen,
    onClose,
    weekNumber,
    eventType,
    seasonYear,
    onApplied,
    onFillGrid,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [preview, setPreview] = useState<ImportPreview | null>(null);
    const [needsForce, setNeedsForce] = useState(false);

    const loadDiff = useCallback(async () => {
        setLoading(true);
        setError(null);
        setInfo(null);
        setNeedsForce(false);
        try {
            const res = await adminAPI.importRaceResults(weekNumber, eventType, 'diff', seasonYear);
            setPreview(res.data.data as ImportPreview);
        } catch (e) {
            setError(errText(e, 'Failed to load feed results'));
            setPreview(null);
        } finally {
            setLoading(false);
        }
    }, [weekNumber, eventType, seasonYear]);

    useEffect(() => {
        if (isOpen) loadDiff();
    }, [isOpen, loadDiff]);

    if (!isOpen) return null;

    const blocking = preview && (preview.unmatched.length > 0 || preview.ambiguous.length > 0);
    const diffByPos = new Map((preview?.differences || []).map((d) => [d.position, d]));

    const apply = async (force: boolean) => {
        setApplying(true);
        setError(null);
        setInfo(null);
        try {
            const res = await adminAPI.importRaceResults(weekNumber, eventType, 'apply', seasonYear, force);
            setInfo(res.data.message || 'Results applied.');
            onApplied();
        } catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const status = (e as any)?.response?.status;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const conflict = (e as any)?.response?.data?.data?.conflict;
            if (status === 409 && conflict === 'manual') {
                setNeedsForce(true);
                setError('These results were entered manually. Confirm below to overwrite them with the feed.');
            } else if (status === 409 && conflict === 'locked') {
                setError('Results are locked. Unlock them on the race-results page before importing.');
            } else {
                setError(errText(e, 'Failed to apply results'));
            }
        } finally {
            setApplying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50" onClick={onClose}>
            <div
                className="relative mx-auto my-12 w-full max-w-4xl rounded-lg bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Import {eventType} results — Week {weekNumber}
                        </h3>
                        {preview && (
                            <p className="text-sm text-gray-500">
                                {preview.raceName}
                                {preview.feedRound ? ` · feed round ${preview.feedRound}` : ''}
                                {preview.state ? ` · currently: ${preview.state.source}${preview.state.locked ? ' (locked)' : ''}` : ''}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                        ✕
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
                    {loading && <p className="text-gray-600">Loading feed…</p>}
                    {error && <div className="mb-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
                    {info && <div className="mb-3 rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">{info}</div>}

                    {preview && !loading && (
                        <>
                            {blocking && (
                                <div className="mb-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    <p className="font-medium">Cannot apply — {preview.unmatched.length + preview.ambiguous.length} driver(s) could not be mapped:</p>
                                    <ul className="mt-1 list-disc pl-5">
                                        {[...preview.unmatched, ...preview.ambiguous].map((m, i) => (
                                            <li key={i}>{m}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {!blocking && preview.mappingError && (
                                <div className="mb-3 rounded border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                                    {preview.mappingError}
                                </div>
                            )}
                            {!blocking && !preview.mappingError && preview.differences.length === 0 && (
                                <div className="mb-3 rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
                                    Feed matches the stored results exactly.
                                </div>
                            )}
                            {preview.differences.length > 0 && (
                                <p className="mb-2 text-sm font-medium text-gray-700">
                                    {preview.differences.length} position(s) differ from what is stored.
                                </p>
                            )}

                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-left text-gray-500">
                                        <th className="py-1 pr-2 font-medium">Pos</th>
                                        <th className="py-1 pr-2 font-medium">Stored (DB)</th>
                                        <th className="py-1 font-medium">Feed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.feedResults.map((row) => {
                                        const diff = diffByPos.get(row.position);
                                        const current = preview.currentResults.find((c) => c.finishingPosition === row.position);
                                        return (
                                            <tr key={row.position} className={`border-b border-gray-100 ${diff ? 'bg-amber-50' : ''}`}>
                                                <td className="py-1 pr-2 font-mono text-gray-500">P{row.position}</td>
                                                <td className="py-1 pr-2 text-gray-700">
                                                    {current ? `${current.driverName} (${current.driverTeam})` : '—'}
                                                </td>
                                                <td className="py-1 text-gray-900">
                                                    {row.driverName} <span className="text-gray-400">({row.driverTeam})</span>
                                                    {row.method === 'name+team' && (
                                                        <span className="ml-1 text-xs text-blue-500" title="matched by name + constructor">↔</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>
                    <button
                        disabled={!preview || blocking || applying || loading}
                        onClick={() => {
                            onFillGrid(preview!.feedResults);
                            onClose();
                        }}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Fill grid only
                    </button>
                    {needsForce ? (
                        <button
                            disabled={applying}
                            onClick={() => apply(true)}
                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            {applying ? 'Overwriting…' : 'Overwrite manual results'}
                        </button>
                    ) : (
                        <button
                            disabled={!preview || blocking || !!preview?.mappingError || applying || loading}
                            onClick={() => apply(false)}
                            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                            {applying ? 'Applying…' : 'Apply & Score'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
