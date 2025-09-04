'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageTitle from '@/components/PageTitle';
import { statsAPI } from '@/lib/api';

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

    // Initialize position from query params
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
    }, [selectedPosition]);

    const loadDriverStats = async (position: number) => {
        try {
            setLoading(true);
            const response = await statsAPI.getDriverPositionStats(position);

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
        // Update URL with new position parameter
        const params = new URLSearchParams(searchParams.toString());
        params.set('position', position.toString());
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                <PageTitle
                    title="F1 Statistics"
                    subtitle="Driver finishing positions and performance data"
                >
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center text-xs px-3 py-1.5 sm:text-sm sm:px-4 sm:py-2 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                </PageTitle>
                {/* Position Selector */}
                <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-3 sm:mb-4">Driver Finishing Positions</h2>
                    <p className="text-sm text-gray-600 mb-4 sm:mb-6">
                        Select a position to see how many times each driver has finished in that position this season.
                    </p>

                    <div className="grid grid-cols-5 sm:flex sm:flex-wrap gap-1 sm:gap-2">
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((position) => (
                            <button
                                key={position}
                                onClick={() => handlePositionChange(position)}
                                className={`px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${selectedPosition === position
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                P{position}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results */}
                <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2 sm:mb-0">
                            Drivers who finished in P{selectedPosition}
                        </h3>
                        {loading && (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                <span className="ml-2 text-sm text-gray-500">Loading...</span>
                            </div>
                        )}
                    </div>

                    {driverStats.length > 0 ? (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Driver
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Team
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Times in P{selectedPosition}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total Races
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Percentage
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {driverStats.map((driver) => (
                                            <tr key={driver.driverId}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {driver.driverName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {driver.driverTeam}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${driver.timesInPosition > 0
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {driver.timesInPosition}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {driver.totalRaces}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${driver.percentageInPosition > 0
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {driver.percentageInPosition || 0}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="sm:hidden space-y-3">
                                {driverStats.map((driver) => (
                                    <div key={driver.driverId} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900">{driver.driverName}</h4>
                                                <p className="text-xs text-gray-500">{driver.driverTeam}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${driver.timesInPosition > 0
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {driver.timesInPosition}/{driver.totalRaces}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500">Success Rate</span>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${driver.percentageInPosition > 0
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {driver.percentageInPosition || 0}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No data available for this position.</p>
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
            <div className="min-h-screen bg-gray-50">
                <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                    </div>
                </main>
            </div>
        }>
            <StatsPageContent />
        </Suspense>
    );
}
