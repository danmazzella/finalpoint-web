'use client';

import { useState, useEffect } from 'react';
import { adminAPI, LeaguePicksOverview } from '@/lib/api';
import Link from 'next/link';
import logger from '@/utils/logger';

export default function LeaguePicksOverviewPage() {
    const [overview, setOverview] = useState<LeaguePicksOverview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedWeek, setSelectedWeek] = useState<number>(1);
    const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);

    useEffect(() => {
        loadAvailableWeeks();
    }, []);

    useEffect(() => {
        if (selectedWeek) {
            loadOverview();
        }
    }, [selectedWeek]);

    const loadAvailableWeeks = async () => {
        try {
            // For now, we'll generate weeks 1-24 (typical F1 season)
            // In the future, this could come from an API endpoint
            const weeks = Array.from({ length: 24 }, (_, i) => i + 1);
            setAvailableWeeks(weeks);
            setSelectedWeek(weeks[0]);
        } catch (error) {
            logger.forceError('Error loading available weeks:', error);
        }
    };

    const loadOverview = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await adminAPI.getLeaguePicksOverview(selectedWeek);

            if (response.data.success) {
                setOverview(response.data.data);
            } else {
                setError('Failed to load picks overview');
            }
        } catch (error) {
            logger.forceError('Error loading picks overview:', error);
            setError('Failed to load picks overview');
        } finally {
            setLoading(false);
        }
    };

    const getPositionLabel = (position: number) => {
        return `P${position}`;
    };

    const getPositionColor = (position: number) => {
        const colors = [
            'bg-yellow-500', // P1 - Gold
            'bg-gray-400',   // P2 - Silver
            'bg-amber-600',  // P3 - Bronze
            'bg-blue-500',   // P4 - Blue
            'bg-green-500',  // P5 - Green
            'bg-purple-500', // P6 - Purple
            'bg-pink-500',   // P7 - Pink
            'bg-indigo-500', // P8 - Indigo
            'bg-red-500',    // P9 - Red
            'bg-orange-500', // P10 - Orange
            'bg-teal-500',   // P11 - Teal
            'bg-cyan-500',   // P12 - Cyan
            'bg-lime-500',   // P13 - Lime
            'bg-emerald-500', // P14 - Emerald
            'bg-rose-500',   // P15 - Rose
            'bg-violet-500', // P16 - Violet
            'bg-sky-500',    // P17 - Sky
            'bg-fuchsia-500', // P18 - Fuchsia
            'bg-amber-500',  // P19 - Amber
            'bg-slate-500',  // P20 - Slate
        ];
        return colors[position - 1] || 'bg-gray-500';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading data</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                    onClick={loadOverview}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">League Picks Overview</h1>
                    <p className="text-gray-600 mt-1">View all picks for each position across all leagues</p>
                </div>
                <Link
                    href="/admin"
                    className="mt-4 sm:mt-0 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Back to Admin
                </Link>
            </div>

            {/* Week Selector */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex items-center space-x-4">
                    <label htmlFor="week-select" className="text-sm font-medium text-gray-700">
                        Select Week:
                    </label>
                    <select
                        id="week-select"
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {availableWeeks.map((week) => (
                            <option key={week} value={week}>
                                Week {week}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Overview Content */}
            {overview.length === 0 ? (
                <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                    <p className="text-gray-500">No picks found for Week {selectedWeek}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {overview.map((league) => (
                        <div key={league.leagueId} className="bg-white shadow-lg rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">{league.leagueName}</h2>
                                <div className="flex space-x-2">
                                    {league.requiredPositions.map((position) => (
                                        <span
                                            key={position}
                                            className={`px-3 py-1 text-sm font-medium text-white rounded-full ${getPositionColor(position)}`}
                                        >
                                            {getPositionLabel(position)}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {league.positions.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No picks made yet for this week</p>
                            ) : (
                                <div className="space-y-4">
                                    {league.positions.map((pos) => (
                                        <div key={pos.position} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${getPositionColor(pos.position)}`}>
                                                        {pos.position}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            {getPositionLabel(pos.position)} - {pos.totalPicks} picks
                                                        </h3>
                                                    </div>
                                                </div>
                                            </div>

                                            {pos.picksSummary && (
                                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Picks Summary:</h4>
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        {pos.picksSummary.split('; ').map((pick, index) => (
                                                            <div key={index} className="flex items-center space-x-2">
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                <span>{pick}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
