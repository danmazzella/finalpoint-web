'use client';

import { useState, useEffect } from 'react';
import { adminAPI, getAvatarUrl } from '@/lib/api';
import logger from '@/utils/logger';

interface League {
    id: number;
    name: string;
    ownerId: number;
    ownerName: string;
    ownerEmail: string;
    seasonYear: number;
    joinCode: string;
    memberCount: number;
    requiredPositions: number[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface LeagueMember {
    id: number;
    name: string;
    avatar: string | null;
    role: string;
    joinedAt: string;
    allTimePicks: number;
    thisWeekPicks: number;
    thisMonthPicks: number;
    correctPicks: number;
    totalPoints: number;
}

export default function AdminLeaguesPage() {
    const [leagues, setLeagues] = useState<League[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
    const [leagueMembers, setLeagueMembers] = useState<LeagueMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);

    useEffect(() => {
        loadLeagues();
    }, []);

    const loadLeagues = async () => {
        try {
            setLoading(true);

            const leaguesResponse = await adminAPI.getAllLeagues();

            if (leaguesResponse.status === 200) {
                const leaguesData = leaguesResponse.data;
                setLeagues(leaguesData.data);
            } else {
                logger.forceError('Leagues response error:', leaguesResponse.data);
            }
        } catch (error) {
            logger.forceError('Error loading leagues:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadLeagueMembers = async (leagueId: number) => {
        try {
            setMembersLoading(true);
            const response = await adminAPI.getLeagueMembers(leagueId);

            if (response.status === 200) {
                setLeagueMembers(response.data.data);
            } else {
                logger.forceError('Failed to load league members:', response.data);
            }
        } catch (error) {
            logger.forceError('Error loading league members:', error);
        } finally {
            setMembersLoading(false);
        }
    };

    const handleLeagueClick = async (league: League) => {
        setSelectedLeague(league);
        setShowMembersModal(true);
        await loadLeagueMembers(league.id);
    };

    const closeMembersModal = () => {
        setShowMembersModal(false);
        setSelectedLeague(null);
        setLeagueMembers([]);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">League Management</h2>
                <p className="text-sm text-gray-500 mt-1">View and manage all leagues on the platform. Click on a league to see member details.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                League
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Owner
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Members
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Positions
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {leagues.map((league) => (
                            <tr
                                key={league.id}
                                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                onClick={() => handleLeagueClick(league)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{league.name}</div>
                                        <div className="text-sm text-gray-500">Code: {league.joinCode}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{league.ownerName}</div>
                                        <div className="text-sm text-gray-500">{league.ownerEmail}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {league.memberCount} members
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {league.requiredPositions && league.requiredPositions.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {[...league.requiredPositions].sort((a, b) => a - b).map((position) => (
                                                <span
                                                    key={position}
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                                >
                                                    P{position}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">No positions set</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${league.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {league.isActive ? 'Active' : 'Archived'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(league.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* League Members Modal */}
            {showMembersModal && selectedLeague && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {selectedLeague.name} - Member Details
                                    </h3>
                                    <div className="mt-1 text-sm text-gray-500">
                                        {selectedLeague.requiredPositions && selectedLeague.requiredPositions.length > 0 ? (
                                            <span>
                                                Required Positions: {' '}
                                                {[...selectedLeague.requiredPositions].sort((a, b) => a - b).map((position, index) => (
                                                    <span key={position}>
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                            P{position}
                                                        </span>
                                                        {index < selectedLeague.requiredPositions.length - 1 && ' '}
                                                    </span>
                                                ))}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic">No positions set</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={closeMembersModal}
                                    className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                                >
                                    ×
                                </button>
                            </div>

                            {membersLoading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Member
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    All Time Picks
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    This Week
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    This Month
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Correct Picks
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total Points
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {leagueMembers.map((member) => (
                                                <tr key={member.id}>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-8 w-8">
                                                                {member.avatar && getAvatarUrl(member.avatar) ? (
                                                                    <img
                                                                        className="h-8 w-8 rounded-full"
                                                                        src={getAvatarUrl(member.avatar)!}
                                                                        alt={member.name}
                                                                    />
                                                                ) : (
                                                                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                                                        <span className="text-xs font-medium text-gray-700">
                                                                            {member.name.charAt(0).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                                                <div className="text-sm text-gray-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${member.role === 'Owner'
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {member.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                                        {member.allTimePicks}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                                        {member.thisWeekPicks}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                                        {member.thisMonthPicks}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                                        {member.correctPicks}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium">
                                                        {member.totalPoints}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
