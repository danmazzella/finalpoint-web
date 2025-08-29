'use client';

import { useState, useEffect } from 'react';
import { adminAPI, PicksByPositionDetailed } from '@/lib/api';
import Link from 'next/link';

export default function PicksByPositionPage() {
    const [overview, setOverview] = useState<PicksByPositionDetailed[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedWeek, setSelectedWeek] = useState<number>(1);
    const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
    const [showPickCounts, setShowPickCounts] = useState(true);

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
            console.error('Error loading available weeks:', error);
        }
    };

    const loadOverview = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await adminAPI.getPicksByPositionDetailed(selectedWeek);

            if (response.data.success) {
                setOverview(response.data.data);
            } else {
                setError('Failed to load picks overview');
            }
        } catch (error) {
            console.error('Error loading picks overview:', error);
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
                    <h1 className="text-2xl font-bold text-gray-900">Popular Picks by Position</h1>
                    <p className="text-gray-600 mt-1">View all picks for each position across all leagues</p>
                </div>
                <Link
                    href="/admin"
                    className="mt-4 sm:mt-0 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Back to Admin
                </Link>
            </div>

            {/* Controls */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    {/* Week Selector */}
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

                    {/* Toggle for Pick Counts */}
                    <div className="flex items-center space-x-3">
                        <label htmlFor="show-counts" className="text-sm font-medium text-gray-700">
                            Show Pick Counts:
                        </label>
                        <button
                            onClick={() => setShowPickCounts(!showPickCounts)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${showPickCounts ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showPickCounts ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                        <span className="text-sm text-gray-500">
                            {showPickCounts ? 'On' : 'Off'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Overview Content */}
            {overview.length === 0 ? (
                <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                    <p className="text-gray-500">No picks found for Week {selectedWeek}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {overview.map((pos) => (
                        <div key={pos.position} className="bg-white shadow-lg rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${getPositionColor(pos.position)}`}>
                                        {pos.position}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            {getPositionLabel(pos.position)}
                                            {showPickCounts && ` - ${pos.totalPicks} total picks`}
                                        </h2>
                                    </div>
                                </div>
                                {showPickCounts && (
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">Total Percentage</div>
                                        <div className="text-lg font-bold text-green-600">100%</div>
                                        <div className="text-xs text-gray-400">Adjusted for rounding</div>
                                    </div>
                                )}
                            </div>

                            {pos.drivers.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No picks made yet for this position</p>
                            ) : (
                                <div className="space-y-3">
                                    {pos.drivers.map((driver, index) => (
                                        <div key={driver.driverId} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    {/* Rank indicator */}
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                                                    </div>

                                                    {/* Driver info */}
                                                    <div>
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            {driver.driverName}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">{driver.driverTeam}</p>
                                                    </div>
                                                </div>

                                                {/* Pick stats */}
                                                <div className="text-right">
                                                    {showPickCounts && (
                                                        <div className="text-lg font-semibold text-blue-600 mb-1">
                                                            {driver.pickCount} {driver.pickCount === 1 ? 'pick' : 'picks'}
                                                        </div>
                                                    )}
                                                    <div className="text-2xl font-bold text-green-600">
                                                        {driver.percentage}%
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        of total picks
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="mt-3">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${driver.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
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
