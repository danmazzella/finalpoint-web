'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
} from '@headlessui/react';
import { ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { adminAPI, driversAPI, f1racesAPI } from '@/lib/api';

interface User {
    id: number;
    name: string;
    email: string;
}

interface League {
    id: number;
    name: string;
    joinCode: string;
    memberCount: number;
    requiredPositions: number[];
    seasonYear?: number;
}

interface Driver {
    id: number;
    name: string;
    team: string;
    isActive?: boolean;
    seasonYear?: number;
}

interface Race {
    weekNumber: number;
    raceName: string;
    raceDate: string;
    hasSprint?: boolean;
}

interface UserPick {
    id: number;
    leagueId: number;
    userId: number;
    weekNumber: number;
    position: number;
    driverId: number;
    driverName: string;
    driverTeam: string;
    eventType?: 'race' | 'sprint';
}

// ---------------------------------------------------------------------------
// Generic searchable dropdown (type to filter). Options render in a portal so
// they never get clipped by table/overflow containers.
// ---------------------------------------------------------------------------
function SearchCombobox<T>({
    items,
    value,
    onChange,
    getKey,
    getLabel,
    getSearchText,
    placeholder,
    disabled,
    allowClear = true,
}: {
    items: T[];
    value: T | null;
    onChange: (item: T | null) => void;
    getKey: (item: T) => string | number;
    getLabel: (item: T) => string;
    getSearchText?: (item: T) => string;
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;
}) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        if (query.trim() === '') return items;
        const q = query.toLowerCase();
        return items.filter((it) =>
            (getSearchText ? getSearchText(it) : getLabel(it)).toLowerCase().includes(q)
        );
    }, [items, query, getSearchText, getLabel]);

    return (
        <Combobox
            value={value}
            onChange={onChange}
            onClose={() => setQuery('')}
            disabled={disabled}
        >
            <div className="relative">
                <ComboboxInput
                    className="w-full p-2 pr-14 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-400"
                    displayValue={(it: T | null) => (it ? getLabel(it) : '')}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
                    {allowClear && value && !disabled && (
                        <button
                            type="button"
                            aria-label="Clear"
                            className="p-0.5 text-gray-400 hover:text-gray-600"
                            onClick={() => {
                                setQuery('');
                                onChange(null);
                            }}
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    )}
                    <ComboboxButton className="p-0.5 text-gray-400 hover:text-gray-600">
                        <ChevronUpDownIcon className="h-5 w-5" />
                    </ComboboxButton>
                </div>

                <ComboboxOptions
                    anchor="bottom start"
                    className="z-50 mt-1 max-h-72 w-[var(--input-width)] min-w-64 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg [--anchor-gap:4px] empty:hidden"
                >
                    {filtered.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
                    ) : (
                        filtered.map((it) => (
                            <ComboboxOption
                                key={getKey(it)}
                                value={it}
                                className="cursor-pointer px-3 py-2 text-sm text-gray-900 data-[focus]:bg-blue-100 data-[selected]:font-semibold"
                            >
                                {getLabel(it)}
                            </ComboboxOption>
                        ))
                    )}
                </ComboboxOptions>
            </div>
        </Combobox>
    );
}

export default function AdminUserPicksPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [races, setRaces] = useState<Race[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
    const [selectedWeek, setSelectedWeek] = useState<number>(1);
    const [selectedEventType, setSelectedEventType] = useState<'race' | 'sprint'>('race');
    const [userPicks, setUserPicks] = useState<UserPick[]>([]);
    const [loading, setLoading] = useState(false);
    const [picksLoading, setPicksLoading] = useState(false);
    const [savingBulk, setSavingBulk] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Leagues the selected user belongs to (null = unknown / not loaded)
    const [userLeagueIds, setUserLeagueIds] = useState<Set<number> | null>(null);
    const [showAllLeagues, setShowAllLeagues] = useState(false);

    // Draft picks for the bulk editor: position -> driverId (0 = no pick)
    const [rowDrafts, setRowDrafts] = useState<Record<number, number>>({});

    useEffect(() => {
        loadInitialData();
    }, []);

    // Default the event type to whatever the selected race supports.
    useEffect(() => {
        if (races.length > 0 && selectedWeek) {
            const race = races.find((r) => r.weekNumber === selectedWeek);
            setSelectedEventType(race?.hasSprint ? 'sprint' : 'race');
        }
    }, [races, selectedWeek]);

    const loadInitialData = async () => {
        try {
            setLoading(true);

            const [usersResponse, leaguesResponse, driversResponse, racesResponse] = await Promise.all([
                adminAPI.getAllUsers(),
                adminAPI.getAllLeagues(),
                driversAPI.getAllDriversAdmin(),
                f1racesAPI.getAllRaces(new Date().getFullYear()),
            ]);

            if (usersResponse.status === 200) {
                setUsers(usersResponse.data.data);
            }

            if (leaguesResponse.status === 200) {
                setLeagues(leaguesResponse.data.data);
            }

            if (driversResponse.status === 200) {
                setDrivers(driversResponse.data.data);
            }

            if (racesResponse.status === 200) {
                setRaces(racesResponse.data.data);
                if (racesResponse.data.data.length > 0) {
                    setSelectedWeek(racesResponse.data.data[0].weekNumber);
                }
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
            setMessage({ type: 'error', text: 'Failed to load initial data' });
        } finally {
            setLoading(false);
        }
    };

    const loadUserPicks = useCallback(async () => {
        if (!selectedUser || !selectedLeague) return;

        try {
            setPicksLoading(true);
            const response = await adminAPI.getUserPicks(selectedUser.id, selectedLeague.id, selectedEventType);

            if (response.status === 200) {
                setUserPicks(response.data.data);
            } else {
                setMessage({ type: 'error', text: 'Failed to load user picks' });
            }
        } catch (error) {
            console.error('Error loading user picks:', error);
            setMessage({ type: 'error', text: 'Failed to load user picks' });
        } finally {
            setPicksLoading(false);
        }
    }, [selectedUser, selectedLeague, selectedEventType]);

    // Auto-load picks whenever the target user / league / event type changes.
    useEffect(() => {
        if (selectedUser && selectedLeague) {
            loadUserPicks();
        } else {
            setUserPicks([]);
        }
    }, [selectedUser, selectedLeague, selectedEventType, loadUserPicks]);

    // Load which leagues the selected user is a member of, to narrow the picker.
    useEffect(() => {
        if (!selectedUser) {
            setUserLeagueIds(null);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const res = await adminAPI.getUserLeagues(selectedUser.id);
                if (!cancelled && res.status === 200) {
                    const ids = (res.data.data ?? []).map((l: { id: number }) => l.id);
                    setUserLeagueIds(new Set<number>(ids));
                }
            } catch {
                if (!cancelled) setUserLeagueIds(null);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [selectedUser]);

    const selectedRace = useMemo(
        () => races.find((r) => r.weekNumber === selectedWeek),
        [races, selectedWeek]
    );
    const selectedRaceYear = selectedRace ? new Date(selectedRace.raceDate).getFullYear() : null;

    const filteredDrivers = useMemo(() => {
        const list = selectedRaceYear != null ? drivers.filter((d) => d.seasonYear === selectedRaceYear) : drivers;
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }, [drivers, selectedRaceYear]);

    const sortedUsers = useMemo(
        () => [...users].sort((a, b) => a.name.localeCompare(b.name)),
        [users]
    );

    const visibleLeagues = useMemo(() => {
        const base =
            selectedUser && userLeagueIds && !showAllLeagues
                ? leagues.filter((l) => userLeagueIds.has(l.id))
                : leagues;
        return [...base].sort((a, b) => {
            if ((b.seasonYear ?? 0) !== (a.seasonYear ?? 0)) return (b.seasonYear ?? 0) - (a.seasonYear ?? 0);
            return a.name.localeCompare(b.name);
        });
    }, [leagues, selectedUser, userLeagueIds, showAllLeagues]);

    const requiredPositions = useMemo(
        () => selectedLeague?.requiredPositions ?? [],
        [selectedLeague]
    );

    // The persisted driver for a position in the current week / event.
    const serverDriverForPos = useCallback(
        (pos: number) =>
            userPicks.find((p) => p.weekNumber === selectedWeek && p.position === pos)?.driverId ?? 0,
        [userPicks, selectedWeek]
    );

    // Seed / reset the bulk editor whenever the picks, league or week change.
    useEffect(() => {
        const map: Record<number, number> = {};
        for (const pos of requiredPositions) {
            const existing = userPicks.find((p) => p.weekNumber === selectedWeek && p.position === pos);
            map[pos] = existing ? existing.driverId : 0;
        }
        setRowDrafts(map);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userPicks, selectedLeague, selectedWeek]);

    const dirtyPositions = useMemo(
        () => requiredPositions.filter((pos) => (rowDrafts[pos] ?? 0) !== serverDriverForPos(pos)),
        [requiredPositions, rowDrafts, serverDriverForPos]
    );

    const handleAddUserToLeague = async () => {
        if (!selectedUser || !selectedLeague) {
            setMessage({ type: 'error', text: 'Please select both a user and a league' });
            return;
        }

        try {
            const response = await adminAPI.addUserToLeague(selectedLeague.id, selectedUser.id);

            if (response.status === 200) {
                setMessage({ type: 'success', text: 'User added to league successfully' });
                const leaguesResponse = await adminAPI.getAllLeagues();
                if (leaguesResponse.status === 200) {
                    setLeagues(leaguesResponse.data.data);
                }
                setUserLeagueIds((prev) => {
                    const next = new Set(prev ?? []);
                    next.add(selectedLeague.id);
                    return next;
                });
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Failed to add user to league' });
            }
        } catch (error) {
            console.error('Error adding user to league:', error);
            setMessage({ type: 'error', text: 'Failed to add user to league' });
        }
    };

    const handleRemoveUserFromLeague = async () => {
        if (!selectedUser || !selectedLeague) {
            setMessage({ type: 'error', text: 'Please select both a user and a league' });
            return;
        }

        if (!confirm(`Are you sure you want to remove ${selectedUser.name} from ${selectedLeague.name}?`)) {
            return;
        }

        try {
            const response = await adminAPI.removeUserFromLeague(selectedLeague.id, selectedUser.id);

            if (response.status === 200) {
                setMessage({ type: 'success', text: 'User removed from league successfully' });
                setUserPicks([]);
                const leaguesResponse = await adminAPI.getAllLeagues();
                if (leaguesResponse.status === 200) {
                    setLeagues(leaguesResponse.data.data);
                }
                setUserLeagueIds((prev) => {
                    if (!prev) return prev;
                    const next = new Set(prev);
                    next.delete(selectedLeague.id);
                    return next;
                });
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Failed to remove user from league' });
            }
        } catch (error) {
            console.error('Error removing user from league:', error);
            setMessage({ type: 'error', text: 'Failed to remove user from league' });
        }
    };

    // Save every changed row in one go, then refresh once.
    const handleSaveAll = async () => {
        if (!selectedUser || !selectedLeague) return;
        if (dirtyPositions.length === 0) {
            setMessage({ type: 'error', text: 'No changes to save' });
            return;
        }

        setSavingBulk(true);
        setMessage(null);

        try {
            const payload = dirtyPositions.map((pos) => ({ position: pos, driverId: rowDrafts[pos] ?? 0 }));
            const res = await adminAPI.bulkUpsertUserPicks(
                selectedUser.id,
                selectedLeague.id,
                selectedWeek,
                payload,
                selectedEventType
            );

            const summary = res.data?.summary as
                | { created: number; updated: number; deleted: number; unchanged: number; failed: number }
                | undefined;

            if (summary) {
                const changed = summary.created + summary.updated + summary.deleted;
                if (summary.failed === 0) {
                    setMessage({ type: 'success', text: `Saved ${changed} pick${changed === 1 ? '' : 's'}` });
                } else {
                    setMessage({ type: 'error', text: `Saved ${changed}, ${summary.failed} failed` });
                }
            } else {
                setMessage({ type: 'success', text: res.data?.message || 'Picks saved' });
            }

            await loadUserPicks();
        } catch (error) {
            console.error('Error saving picks:', error);
            setMessage({ type: 'error', text: 'Failed to save picks' });
        } finally {
            setSavingBulk(false);
        }
    };

    const resetDrafts = () => {
        const map: Record<number, number> = {};
        for (const pos of requiredPositions) map[pos] = serverDriverForPos(pos);
        setRowDrafts(map);
    };

    const weekHasSprint = !!selectedRace?.hasSprint;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin User Picks Management</h1>

                {message && (
                    <div
                        className={`mb-4 p-4 rounded-lg ${
                            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Target selection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-2">User</h2>
                        <SearchCombobox<User>
                            items={sortedUsers}
                            value={selectedUser}
                            onChange={(u) => {
                                setSelectedUser(u);
                                setSelectedLeague(null);
                                setUserPicks([]);
                            }}
                            getKey={(u) => u.id}
                            getLabel={(u) => `${u.name} (${u.email})`}
                            getSearchText={(u) => `${u.name} ${u.email}`}
                            placeholder="Search users by name or email…"
                        />
                    </div>

                    <div>
                        <div className="flex items-baseline justify-between mb-2">
                            <h2 className="text-lg font-medium text-gray-900">League</h2>
                            {selectedUser && userLeagueIds && (
                                <label className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={showAllLeagues}
                                        onChange={(e) => setShowAllLeagues(e.target.checked)}
                                    />
                                    Show all leagues
                                </label>
                            )}
                        </div>
                        <SearchCombobox<League>
                            items={visibleLeagues}
                            value={selectedLeague}
                            onChange={(l) => {
                                setSelectedLeague(l);
                                setUserPicks([]);
                            }}
                            getKey={(l) => l.id}
                            getLabel={(l) =>
                                `${l.name} — ${l.seasonYear ?? '?'} · ${l.memberCount} members · ${
                                    l.requiredPositions?.length ?? 0
                                } positions`
                            }
                            getSearchText={(l) => `${l.name} ${l.seasonYear ?? ''} ${l.joinCode ?? ''}`}
                            placeholder={
                                selectedUser
                                    ? 'Search this user’s leagues…'
                                    : 'Search leagues by name, year or join code…'
                            }
                        />
                        {selectedUser && userLeagueIds && !showAllLeagues && (
                            <p className="mt-1 text-xs text-gray-500">
                                Showing {visibleLeagues.length} league{visibleLeagues.length === 1 ? '' : 's'}{' '}
                                {selectedUser.name} belongs to.
                            </p>
                        )}
                    </div>
                </div>

                {selectedUser && selectedLeague && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg flex flex-wrap items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">League membership:</span>
                        <button
                            onClick={handleAddUserToLeague}
                            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Add to league
                        </button>
                        <button
                            onClick={handleRemoveUserFromLeague}
                            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Remove from league
                        </button>
                    </div>
                )}

                {/* Bulk pick editor */}
                {selectedUser && selectedLeague && (
                    <div className="mt-6">
                        <div className="flex flex-wrap items-end gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Race week</label>
                                <select
                                    className="p-2 border border-gray-300 rounded-lg text-sm min-w-64"
                                    value={selectedWeek}
                                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                                >
                                    {races.map((race) => (
                                        <option key={race.weekNumber} value={race.weekNumber}>
                                            Week {race.weekNumber} — {race.raceName}
                                            {race.hasSprint ? ' (sprint weekend)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
                                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                                    <button
                                        onClick={() => setSelectedEventType('race')}
                                        className={`px-3 py-2 text-sm ${
                                            selectedEventType === 'race'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        Grand Prix
                                    </button>
                                    <button
                                        onClick={() => weekHasSprint && setSelectedEventType('sprint')}
                                        disabled={!weekHasSprint}
                                        className={`px-3 py-2 text-sm border-l border-gray-300 ${
                                            selectedEventType === 'sprint'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                        } disabled:text-gray-300 disabled:hover:bg-white`}
                                    >
                                        Sprint
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={loadUserPicks}
                                disabled={picksLoading}
                                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                {picksLoading ? 'Loading…' : 'Reload'}
                            </button>
                        </div>

                        {!weekHasSprint && selectedEventType === 'race' && (
                            <p className="text-xs text-gray-500 mb-3">This week has no sprint race.</p>
                        )}

                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-sm font-medium text-gray-900">
                                    {selectedEventType === 'race' ? 'Grand Prix' : 'Sprint'} picks · Week {selectedWeek}
                                    {' · '}
                                    {selectedUser.name} @ {selectedLeague.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                        {dirtyPositions.length > 0
                                            ? `${dirtyPositions.length} unsaved`
                                            : 'All saved'}
                                    </span>
                                    <button
                                        onClick={resetDrafts}
                                        disabled={dirtyPositions.length === 0 || savingBulk}
                                        className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                                    >
                                        Revert
                                    </button>
                                    <button
                                        onClick={handleSaveAll}
                                        disabled={dirtyPositions.length === 0 || savingBulk}
                                        className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40"
                                    >
                                        {savingBulk ? 'Saving…' : `Save all${dirtyPositions.length ? ` (${dirtyPositions.length})` : ''}`}
                                    </button>
                                </div>
                            </div>

                            {requiredPositions.length === 0 ? (
                                <p className="px-4 py-6 text-sm text-gray-500">
                                    This league has no required positions configured.
                                </p>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {requiredPositions.map((pos) => {
                                        const draftId = rowDrafts[pos] ?? 0;
                                        const dirty = draftId !== serverDriverForPos(pos);
                                        const selectedDriver =
                                            filteredDrivers.find((d) => d.id === draftId) ?? null;
                                        return (
                                            <li
                                                key={pos}
                                                className={`flex items-center gap-3 px-4 py-2.5 ${
                                                    dirty ? 'bg-amber-50' : ''
                                                }`}
                                            >
                                                <span className="w-10 shrink-0 text-sm font-semibold text-gray-900">
                                                    P{pos}
                                                </span>
                                                <div className="flex-1 max-w-md">
                                                    <SearchCombobox<Driver>
                                                        items={filteredDrivers}
                                                        value={selectedDriver}
                                                        onChange={(d) =>
                                                            setRowDrafts((prev) => ({
                                                                ...prev,
                                                                [pos]: d ? d.id : 0,
                                                            }))
                                                        }
                                                        getKey={(d) => d.id}
                                                        getLabel={(d) => `${d.name} (${d.team})`}
                                                        getSearchText={(d) => `${d.name} ${d.team}`}
                                                        placeholder="Search driver…"
                                                    />
                                                </div>
                                                {dirty && (
                                                    <span className="text-xs font-medium text-amber-700">
                                                        unsaved
                                                    </span>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
