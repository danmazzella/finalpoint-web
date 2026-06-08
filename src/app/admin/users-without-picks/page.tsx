'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { adminAPI, f1racesAPI, seasonsAPI } from '@/lib/api';

interface UserWithoutPicks {
    userId: number;
    userName: string;
    userEmail: string;
    userAvatar: string | null;
    leagues: Array<{
        leagueId: number;
        leagueName: string;
        leagueMemberCount: number;
        requiredPositions: string[];
        missingEventType: 'race' | 'sprint' | 'both' | 'unknown';
    }>;
}

function LeagueFilter({
    allLeagues,
    selectedLeagueIds,
    onChange,
}: {
    allLeagues: { id: number; name: string }[];
    selectedLeagueIds: Set<number>;
    onChange: (ids: Set<number>) => void;
}) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const filtered = query.trim()
        ? allLeagues.filter(l => l.name.toLowerCase().includes(query.toLowerCase()))
        : allLeagues;

    const allSelected = selectedLeagueIds.size === 0;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggle = (id: number) => {
        const next = new Set(selectedLeagueIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        onChange(next);
    };

    const clearAll = () => onChange(new Set());

    const label = allSelected
        ? 'All leagues'
        : `${selectedLeagueIds.size} league${selectedLeagueIds.size !== 1 ? 's' : ''} selected`;

    return (
        <div ref={containerRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by League</label>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full sm:w-72 flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <span className={allSelected ? 'text-gray-400' : 'text-gray-900'}>{label}</span>
                <svg className={`ml-2 h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-20 mt-1 w-full sm:w-72 bg-white border border-gray-200 rounded-md shadow-lg">
                    {/* Search input */}
                    <div className="p-2 border-b border-gray-100">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search leagues..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Clear selection */}
                    {!allSelected && (
                        <div className="px-3 py-1.5 border-b border-gray-100">
                            <button
                                type="button"
                                onClick={clearAll}
                                className="text-xs text-blue-600 hover:text-blue-800"
                            >
                                Clear selection (show all)
                            </button>
                        </div>
                    )}

                    {/* League list */}
                    <ul className="max-h-60 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-gray-500">No leagues found</li>
                        ) : (
                            filtered.map(league => (
                                <li key={league.id}>
                                    <label className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedLeagueIds.has(league.id)}
                                            onChange={() => toggle(league.id)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-800">{league.name}</span>
                                    </label>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

function UsersWithoutPicksPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [weekNumber, setWeekNumber] = useState<number>(1);
    const [usersWithoutPicks, setUsersWithoutPicks] = useState<UserWithoutPicks[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [races, setRaces] = useState<any[]>([]);
    const [allLeagues, setAllLeagues] = useState<{ id: number; name: string }[]>([]);
    const [selectedLeagueIds, setSelectedLeagueIds] = useState<Set<number>>(new Set());
    const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
    const [seasons, setSeasons] = useState<{ year: number; displayLabel: string }[]>([]);

    useEffect(() => {
        f1racesAPI.getAllRaces(selectedSeason ?? undefined).then(res => {
            if (res.data?.success) setRaces(res.data.data);
        }).catch(() => {});

        seasonsAPI.getSeasons().then(res => {
            if (res.data?.success && res.data.data.length > 0) {
                setSeasons(res.data.data);
                setSelectedSeason(prev => prev ?? res.data.data[0].year);
            }
        }).catch(() => {});
    }, [selectedSeason]);

    useEffect(() => {
        if (selectedSeason == null) return;
        adminAPI.getAllLeagues().then(res => {
            if (res.data?.success) {
                const leagues = (res.data.data as any[])
                    .filter(l => l.seasonYear === selectedSeason)
                    .map(l => ({ id: l.id, name: l.name }))
                    .sort((a: any, b: any) => a.name.localeCompare(b.name));
                setAllLeagues(leagues);
            }
        }).catch(() => {});
    }, [selectedSeason]);

    // Initialize week number from query params
    useEffect(() => {
        const weekParam = searchParams.get('week');
        if (weekParam) {
            const week = parseInt(weekParam, 10);
            if (week >= 1 && week <= 24) {
                setWeekNumber(week);
            }
        }
    }, [searchParams]);

    const loadUsersWithoutPicks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await adminAPI.getUsersWithoutPicks(weekNumber, selectedSeason);

            if (response.status === 200) {
                setUsersWithoutPicks(response.data.data);
            } else {
                setError('Failed to load users without picks');
            }
        } catch (error) {
            console.error('Error loading users without picks:', error);
            setError('Error loading users without picks');
        } finally {
            setLoading(false);
        }
    }, [weekNumber, selectedSeason]);

    useEffect(() => {
        loadUsersWithoutPicks();
    }, [loadUsersWithoutPicks]);

    // Filter users based on selected leagues
    const filteredUsers = selectedLeagueIds.size === 0
        ? usersWithoutPicks
        : usersWithoutPicks
            .map(user => ({
                ...user,
                leagues: user.leagues.filter(l => selectedLeagueIds.has(l.leagueId)),
            }))
            .filter(user => user.leagues.length > 0);

    const getTotalMissingPicks = () =>
        filteredUsers.reduce((total, user) => total + user.leagues.length, 0);

    const formatRequiredPositions = (positions: string[]) =>
        positions.map(pos => `P${pos}`).join(', ');

    const handleWeekChange = (newWeek: number) => {
        setWeekNumber(newWeek);
        const params = new URLSearchParams(searchParams.toString());
        params.set('week', newWeek.toString());
        router.replace(`?${params.toString()}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Users Without Picks</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Users who haven&apos;t made their picks for the selected week
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
                        {/* Season Selector */}
                        {seasons.length > 0 && (
                            <div>
                                <label htmlFor="season-select" className="block text-sm font-medium text-gray-700 mb-2">
                                    Season
                                </label>
                                <select
                                    id="season-select"
                                    value={selectedSeason ?? ''}
                                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    {seasons.map(s => (
                                        <option key={s.year} value={s.year}>{s.displayLabel || s.year}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {/* Week Selector */}
                        <div>
                            <label htmlFor="week-select" className="block text-sm font-medium text-gray-700 mb-2">
                                Select Week
                            </label>
                            <select
                                id="week-select"
                                value={weekNumber}
                                onChange={(e) => handleWeekChange(parseInt(e.target.value))}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                {Array.from({ length: 24 }, (_, i) => i + 1).map((week) => {
                                    const race = races.find(r => r.weekNumber === week);
                                    return (
                                        <option key={week} value={week}>
                                            Week {week}{race?.raceName ? ` - ${race.raceName}` : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* League Filter */}
                        <LeagueFilter
                            allLeagues={allLeagues}
                            selectedLeagueIds={selectedLeagueIds}
                            onChange={setSelectedLeagueIds}
                        />
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-blue-900">Total Users</p>
                                <p className="text-2xl font-bold text-blue-600">{filteredUsers.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-orange-900">Missing Picks</p>
                                <p className="text-2xl font-bold text-orange-600">{getTotalMissingPicks()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Users List */}
            {filteredUsers.length === 0 && !loading && !error ? (
                <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        {selectedLeagueIds.size > 0 ? 'No missing picks for selected leagues' : 'All users have made their picks!'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">No users are missing picks for Week {weekNumber}.</p>
                </div>
            ) : (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">
                            Users Missing Picks for Week {weekNumber}
                            {selectedLeagueIds.size > 0 && (
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                    ({selectedLeagueIds.size} league{selectedLeagueIds.size !== 1 ? 's' : ''} filtered)
                                </span>
                            )}
                        </h2>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                            <div key={user.userId} className="p-6">
                                <div className="flex items-start space-x-4">
                                    {/* User Avatar */}
                                    <div className="flex-shrink-0">
                                        {user.userAvatar ? (
                                            <img
                                                className="h-12 w-12 rounded-full object-cover"
                                                src={user.userAvatar}
                                                alt={user.userName}
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-lg font-medium text-gray-600">
                                                    {user.userName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-lg font-medium text-gray-900 truncate">
                                                {user.userName}
                                            </h3>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {user.leagues.length} league{user.leagues.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">{user.userEmail}</p>

                                        {/* Leagues List */}
                                        <div className="mt-3 space-y-2">
                                            {user.leagues.map((league, index) => (
                                                <div key={`${user.userId}-${league.leagueId}-${league.missingEventType}-${index}`} className="bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-900">
                                                                {league.leagueName}
                                                            </h4>
                                                            <p className="text-xs text-gray-500">
                                                                {league.leagueMemberCount} member{league.leagueMemberCount !== 1 ? 's' : ''} •
                                                                Required: {formatRequiredPositions(league.requiredPositions)}
                                                            </p>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${league.missingEventType === 'both'
                                                                ? 'bg-red-100 text-red-800'
                                                                : league.missingEventType === 'race'
                                                                    ? 'bg-orange-100 text-orange-800'
                                                                    : league.missingEventType === 'sprint'
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {league.missingEventType === 'both'
                                                                    ? 'Missing Both'
                                                                    : league.missingEventType === 'race'
                                                                        ? 'Missing Race'
                                                                        : league.missingEventType === 'sprint'
                                                                            ? 'Missing Sprint'
                                                                            : 'Missing Picks'
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function UsersWithoutPicksPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        }>
            <UsersWithoutPicksPageContent />
        </Suspense>
    );
}
