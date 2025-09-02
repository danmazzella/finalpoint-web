'use client';

import { useState, useEffect } from 'react';
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
}

interface Driver {
    id: number;
    name: string;
    team: string;
    isActive?: boolean;
}

interface Race {
    weekNumber: number;
    name: string;
    date: string;
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
}

export default function AdminUserPicksPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [races, setRaces] = useState<Race[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
    const [selectedWeek, setSelectedWeek] = useState<number>(1);
    const [userPicks, setUserPicks] = useState<UserPick[]>([]);
    const [loading, setLoading] = useState(false);
    const [picksLoading, setPicksLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form states for adding/editing picks
    const [pickForm, setPickForm] = useState({
        position: 1,
        driverId: 0,
        weekNumber: 1
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);

            const [usersResponse, leaguesResponse, driversResponse, racesResponse] = await Promise.all([
                adminAPI.getAllUsers(),
                adminAPI.getAllLeagues(),
                driversAPI.getAllDriversAdmin(),
                f1racesAPI.getAllRaces()
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
                    setPickForm(prev => ({ ...prev, weekNumber: racesResponse.data.data[0].weekNumber }));
                }
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
            setMessage({ type: 'error', text: 'Failed to load initial data' });
        } finally {
            setLoading(false);
        }
    };

    const loadUserPicks = async () => {
        if (!selectedUser || !selectedLeague) return;

        try {
            setPicksLoading(true);
            const response = await adminAPI.getUserPicks(selectedUser.id, selectedLeague.id);

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
    };

    const handleUserSelect = (user: User | null) => {
        setSelectedUser(user);
        setUserPicks([]);
    };

    const handleLeagueSelect = (league: League | null) => {
        setSelectedLeague(league);
        setUserPicks([]);
    };

    const handleAddUserToLeague = async () => {
        if (!selectedUser || !selectedLeague) {
            setMessage({ type: 'error', text: 'Please select both a user and a league' });
            return;
        }

        try {
            const response = await adminAPI.addUserToLeague(selectedLeague.id, selectedUser.id);

            if (response.status === 200) {
                setMessage({ type: 'success', text: 'User added to league successfully' });
                // Reload leagues to update member count
                const leaguesResponse = await adminAPI.getAllLeagues();
                if (leaguesResponse.status === 200) {
                    setLeagues(leaguesResponse.data.data);
                }
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
                // Reload leagues to update member count
                const leaguesResponse = await adminAPI.getAllLeagues();
                if (leaguesResponse.status === 200) {
                    setLeagues(leaguesResponse.data.data);
                }
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Failed to remove user from league' });
            }
        } catch (error) {
            console.error('Error removing user from league:', error);
            setMessage({ type: 'error', text: 'Failed to remove user from league' });
        }
    };

    const handleCreatePick = async () => {
        if (!selectedUser || !selectedLeague) {
            setMessage({ type: 'error', text: 'Please select both a user and a league' });
            return;
        }

        if (!pickForm.driverId) {
            setMessage({ type: 'error', text: 'Please select a driver' });
            return;
        }

        try {
            const response = await adminAPI.createUserPick(
                selectedUser.id,
                selectedLeague.id,
                pickForm.weekNumber,
                pickForm.position,
                pickForm.driverId
            );

            if (response.status === 200) {
                setMessage({ type: 'success', text: 'Pick created successfully' });
                setPickForm({ position: 1, driverId: 0, weekNumber: selectedWeek });
                loadUserPicks();
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Failed to create pick' });
            }
        } catch (error) {
            console.error('Error creating pick:', error);
            setMessage({ type: 'error', text: 'Failed to create pick' });
        }
    };

    const handleUpdatePick = async (pick: UserPick, newDriverId: number) => {
        try {
            const response = await adminAPI.updateUserPick(
                pick.userId,
                pick.leagueId,
                pick.weekNumber,
                pick.position,
                newDriverId
            );

            if (response.status === 200) {
                setMessage({ type: 'success', text: 'Pick updated successfully' });
                loadUserPicks();
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Failed to update pick' });
            }
        } catch (error) {
            console.error('Error updating pick:', error);
            setMessage({ type: 'error', text: 'Failed to update pick' });
        }
    };

    const handleDeletePick = async (pick: UserPick) => {
        if (!confirm(`Are you sure you want to delete this pick for position ${pick.position}?`)) {
            return;
        }

        try {
            const response = await adminAPI.deleteUserPick(
                pick.userId,
                pick.leagueId,
                pick.weekNumber,
                pick.position
            );

            if (response.status === 200) {
                setMessage({ type: 'success', text: 'Pick deleted successfully' });
                loadUserPicks();
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Failed to delete pick' });
            }
        } catch (error) {
            console.error('Error deleting pick:', error);
            setMessage({ type: 'error', text: 'Failed to delete pick' });
        }
    };

    const getDriverById = (driverId: number) => {
        return drivers.find(d => d.id === driverId);
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
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin User Picks Management</h1>

                {message && (
                    <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Selection */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-3">Select User</h2>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            onChange={(e) => {
                                const userId = parseInt(e.target.value);
                                if (userId) {
                                    const user = users.find(u => u.id === userId);
                                    handleUserSelect(user || null);
                                } else {
                                    handleUserSelect(null);
                                }
                            }}
                            value={selectedUser?.id || ''}
                        >
                            <option value="">Choose a user...</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* League Selection */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-3">Select League</h2>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            onChange={(e) => {
                                const leagueId = parseInt(e.target.value);
                                if (leagueId) {
                                    const league = leagues.find(l => l.id === leagueId);
                                    handleLeagueSelect(league || null);
                                } else {
                                    handleLeagueSelect(null);
                                }
                            }}
                            value={selectedLeague?.id || ''}
                        >
                            <option value="">Choose a league...</option>
                            {leagues.map(league => (
                                <option key={league.id} value={league.id}>
                                    {league.name} ({league.memberCount} members)
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* League Membership Actions */}
                {selectedUser && selectedLeague && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-md font-medium text-gray-900 mb-3">League Membership Actions</h3>
                        <div className="flex space-x-4">
                            <button
                                onClick={handleAddUserToLeague}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Add User to League
                            </button>
                            <button
                                onClick={handleRemoveUserFromLeague}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Remove User from League
                            </button>
                        </div>
                    </div>
                )}

                {/* Pick Management */}
                {selectedUser && selectedLeague && (
                    <div className="mt-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Pick Management</h2>

                        {/* Create/Edit Pick Form */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <h3 className="text-md font-medium text-gray-900 mb-3">Create/Edit Pick</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Week</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        value={pickForm.weekNumber}
                                        onChange={(e) => setPickForm(prev => ({ ...prev, weekNumber: parseInt(e.target.value) }))}
                                    >
                                        {races.map(race => (
                                            <option key={race.weekNumber} value={race.weekNumber}>
                                                Week {race.weekNumber} - {race.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        value={pickForm.position}
                                        onChange={(e) => setPickForm(prev => ({ ...prev, position: parseInt(e.target.value) }))}
                                    >
                                        {selectedLeague.requiredPositions.map(pos => (
                                            <option key={pos} value={pos}>
                                                P{pos}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        value={pickForm.driverId}
                                        onChange={(e) => setPickForm(prev => ({ ...prev, driverId: parseInt(e.target.value) }))}
                                    >
                                        <option value={0}>Choose a driver...</option>
                                        {drivers.map(driver => (
                                            <option key={driver.id} value={driver.id}>
                                                {driver.name} ({driver.team})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={handleCreatePick}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Create Pick
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Load Picks Button */}
                        <div className="mb-4">
                            <button
                                onClick={loadUserPicks}
                                disabled={picksLoading}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                {picksLoading ? 'Loading...' : 'Load User Picks'}
                            </button>
                        </div>

                        {/* User Picks Display */}
                        {userPicks.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {userPicks.map((pick) => (
                                            <tr key={`${pick.weekNumber}-${pick.position}`}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    Week {pick.weekNumber}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    P{pick.position}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {pick.driverName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {pick.driverTeam}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <select
                                                            className="p-1 border border-gray-300 rounded text-xs"
                                                            onChange={(e) => handleUpdatePick(pick, parseInt(e.target.value))}
                                                            defaultValue={pick.driverId}
                                                        >
                                                            {drivers.map(driver => (
                                                                <option key={driver.id} value={driver.id}>
                                                                    {driver.name} ({driver.team})
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={() => handleDeletePick(pick)}
                                                            className="text-red-600 hover:text-red-900 text-xs"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
