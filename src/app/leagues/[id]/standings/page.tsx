'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { leaguesAPI } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface DetailedStanding {
    id: number;
    name: string;
    isOwner: number;
    totalPicks: number;
    correctPicks: number;
    totalPoints: number;
    averagePoints: number;
    accuracy: number;
    racesParticipated: number;
    averageDistanceFromCorrect: number;
    perfectPicks: number;
    averagePointsPerRace: number;
}

interface League {
    id: number;
    name: string;
    seasonYear: number;
    memberCount: number;
    isMember: boolean;
    userRole: string;
}

export default function StandingsPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const leagueId = params.id as string;

    const [league, setLeague] = useState<League | null>(null);
    const [standings, setStandings] = useState<DetailedStanding[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'points' | 'accuracy' | 'distance' | 'races' | 'name'>('points');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        loadData();
    }, [leagueId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [leagueResponse, standingsResponse] = await Promise.all([
                leaguesAPI.getLeague(parseInt(leagueId)),
                leaguesAPI.getDetailedLeagueStandings(parseInt(leagueId))
            ]);

            if (leagueResponse.data.success) {
                setLeague(leagueResponse.data.data);
            }

            if (standingsResponse.data.success) {
                setStandings(standingsResponse.data.data);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            showToast('Failed to load standings data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (newSortBy: typeof sortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('desc');
        }
    };

    const sortedStandings = [...standings].sort((a, b) => {
        let aValue: number | string;
        let bValue: number | string;

        switch (sortBy) {
            case 'points':
                aValue = a.totalPoints;
                bValue = b.totalPoints;
                break;
            case 'accuracy':
                aValue = a.accuracy;
                bValue = b.accuracy;
                break;
            case 'distance':
                aValue = a.averageDistanceFromCorrect;
                bValue = b.averageDistanceFromCorrect;
                break;
            case 'races':
                aValue = a.racesParticipated;
                bValue = b.racesParticipated;
                break;
            case 'name':
                aValue = a.name;
                bValue = b.name;
                break;
            default:
                aValue = a.totalPoints;
                bValue = b.totalPoints;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortOrder === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        return sortOrder === 'asc'
            ? (aValue as number) - (bValue as number)
            : (bValue as number) - (aValue as number);
    });

    const getPositionColor = (index: number) => {
        if (index === 0) return 'bg-yellow-100 text-yellow-800';
        if (index === 1) return 'bg-gray-100 text-gray-800';
        if (index === 2) return 'bg-orange-100 text-orange-800';
        return 'bg-gray-50 text-gray-600';
    };

    const getAccuracyColor = (accuracy: number) => {
        if (accuracy >= 80) return 'text-green-600';
        if (accuracy >= 60) return 'text-yellow-600';
        if (accuracy >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    const getDistanceColor = (distance: number) => {
        if (distance <= 2) return 'text-green-600';
        if (distance <= 4) return 'text-yellow-600';
        if (distance <= 6) return 'text-orange-600';
        return 'text-red-600';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading standings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{league?.name} - Standings</h1>
                            <p className="text-gray-600">
                                {standings.length} member{standings.length !== 1 ? 's' : ''} • Season {league?.seasonYear}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href={`/leagues/${leagueId}`}
                                className="text-pink-600 hover:text-pink-700 font-medium"
                            >
                                ← Back to League
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Points</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {standings.reduce((sum, s) => sum + s.totalPoints, 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Perfect Picks</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {standings.reduce((sum, s) => sum + s.perfectPicks, 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Avg Accuracy</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {standings.length > 0
                                        ? Math.round(standings.reduce((sum, s) => sum + s.accuracy, 0) / standings.length)
                                        : 0}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Active Members</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {standings.filter(s => s.racesParticipated > 0).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Standings Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Member Standings</h2>
                    </div>

                    {standings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rank
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center">
                                                Member
                                                {sortBy === 'name' && (
                                                    <svg className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('points')}
                                        >
                                            <div className="flex items-center">
                                                Points
                                                {sortBy === 'points' && (
                                                    <svg className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('accuracy')}
                                        >
                                            <div className="flex items-center">
                                                Accuracy
                                                {sortBy === 'accuracy' && (
                                                    <svg className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('distance')}
                                        >
                                            <div className="flex items-center">
                                                Avg Distance
                                                {sortBy === 'distance' && (
                                                    <svg className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('races')}
                                        >
                                            <div className="flex items-center">
                                                Races
                                                {sortBy === 'races' && (
                                                    <svg className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stats
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedStandings.map((member, index) => (
                                        <tr key={member.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${getPositionColor(index)}`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                                                        <span className="text-pink-600 font-medium text-sm">
                                                            {member.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                                            {member.isOwner && (
                                                                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                                                    </svg>
                                                                    Owner
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {member.totalPicks} picks • {member.correctPicks} correct
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{member.totalPoints}</div>
                                                <div className="text-sm text-gray-500">{member.averagePointsPerRace} avg/race</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm font-medium ${getAccuracyColor(member.accuracy)}`}>
                                                    {member.accuracy}%
                                                </div>
                                                <div className="text-sm text-gray-500">{member.perfectPicks} perfect</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm font-medium ${getDistanceColor(member.averageDistanceFromCorrect)}`}>
                                                    {member.averageDistanceFromCorrect || 0} positions
                                                </div>
                                                <div className="text-sm text-gray-500">from target</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {member.racesParticipated}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex flex-col space-y-1">
                                                    <div>Avg: {member.averagePoints} pts</div>
                                                    <div>Perfect: {member.perfectPicks}</div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No standings available</h3>
                            <p className="mt-1 text-sm text-gray-500">Standings will appear here once picks are made.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
