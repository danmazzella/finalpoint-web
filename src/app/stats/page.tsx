'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageTitle from '@/components/PageTitle';
import { statsAPI, seasonsAPI } from '@/lib/api';

interface DriverPositionStats {
    driverId: number;
    driverName: string;
    driverTeam: string;
    timesInPosition: number;
    totalRaces: number;
    percentageInPosition: number;
}


function StatsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedPosition, setSelectedPosition] = useState<number>(1);
    const [driverStats, setDriverStats] = useState<DriverPositionStats[]>([]);
    const [loading, setLoading] = useState(false);
    const [seasons, setSeasons] = useState<{ year: number; displayLabel: string }[]>([]);
    const [seasonFilter, setSeasonFilter] = useState<number | 'all'>('all');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await seasonsAPI.getSeasons();
                if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
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

    useEffect(() => {
        const positionParam = searchParams.get('position');
        if (positionParam) {
            const position = parseInt(positionParam, 10);
            if (position >= 1 && position <= 20) {
                setSelectedPosition(position);
            }
        }
    }, [searchParams]);

    const handleBack = () => {
        router.back();
    };

    useEffect(() => {
        loadDriverStats(selectedPosition);
    }, [selectedPosition, seasonFilter]);

    const loadDriverStats = async (position: number) => {
        try {
            setLoading(true);
            const response = await statsAPI.getDriverPositionStats(position, seasonFilter === 'all' ? undefined : seasonFilter);

            if (response.status === 200) {
                setDriverStats(response.data.data.drivers);
            } else {
                console.error('Error loading driver stats:', response.data);
            }
        } catch (error) {
            console.error('Error loading driver stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePositionChange = (position: number) => {
        setSelectedPosition(position);
        // Update URL with new position parameter (replace instead of push to avoid history buildup)
        const params = new URLSearchParams(searchParams.toString());
        params.set('position', position.toString());
        router.replace(`?${params.toString()}`);
    };

    return (
        <div className="page-bg min-h-screen">
            <main className="max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                <PageTitle
                    title="F1 Statistics"
                    subtitle="Driver finishing positions and performance data"
                >
                    <button onClick={handleBack} className="btn-ghost text-xs px-3 py-1.5 sm:text-sm sm:px-4 sm:py-2">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                </PageTitle>

                {/* Position Selector */}
                <div className="glass-card p-5 mb-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <h2 className="text-sm font-semibold text-gray-900">Driver Finishing Positions</h2>
                        {seasons.length > 0 && (
                            <select
                                value={seasonFilter}
                                onChange={(e) => setSeasonFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                className="input-field text-sm py-1.5"
                            >
                                <option value="all">All-Time</option>
                                {seasons.map((s) => (
                                    <option key={s.year} value={s.year}>{s.displayLabel || s.year}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mb-4">
                        Select a position to see how many times each driver has finished there.
                    </p>
                    <div className="grid grid-cols-5 sm:flex sm:flex-wrap gap-1.5">
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((position) => (
                            <button
                                key={position}
                                onClick={() => handlePositionChange(position)}
                                className={`px-2 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors border ${
                                    selectedPosition === position
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                                }`}
                            >
                                P{position}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Drivers finishing P{selectedPosition}
                        </h3>
                        {loading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                        )}
                    </div>

                    {driverStats.length > 0 ? (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {['Driver', 'Team', `Times in P${selectedPosition}`, 'Total Races', 'Rate'].map(h => (
                                                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {driverStats.map((driver) => (
                                            <tr key={driver.driverId} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 whitespace-nowrap">
                                                    {driver.driverName}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                                                    {driver.driverTeam}
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    <span className={`badge ${driver.timesInPosition > 0 ? 'badge-green' : 'badge-gray'}`}>
                                                        {driver.timesInPosition}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                                                    {driver.totalRaces}
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    <span className={`badge ${driver.percentageInPosition > 0 ? 'badge-blue' : 'badge-gray'}`}>
                                                        {driver.percentageInPosition || 0}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="sm:hidden divide-y divide-gray-200">
                                {driverStats.map((driver) => (
                                    <div key={driver.driverId} className="px-5 py-3.5 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{driver.driverName}</p>
                                            <p className="text-xs text-gray-500 truncate">{driver.driverTeam}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className={`badge ${driver.timesInPosition > 0 ? 'badge-green' : 'badge-gray'}`}>
                                                {driver.timesInPosition}/{driver.totalRaces}
                                            </span>
                                            <span className={`badge ${driver.percentageInPosition > 0 ? 'badge-blue' : 'badge-gray'}`}>
                                                {driver.percentageInPosition || 0}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-sm text-gray-500">{loading ? 'Loading...' : 'No data available for this position.'}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function StatsPage() {
    return (
        <Suspense fallback={
            <div className="page-bg min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
            </div>
        }>
            <StatsPageContent />
        </Suspense>
    );
}
