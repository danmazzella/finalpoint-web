'use client';

import { useState, useEffect } from 'react';
import { adminAPI, getAvatarUrl } from '@/lib/api';

interface AdminUser {
    id: number;
    email: string;
    name: string;
    avatar: string | null;
    role: 'user' | 'admin';
    chat_feature_enabled: boolean;
    position_changes_enabled: boolean;
    createdAt: string;
    updatedAt: string;
    leagueCount: number;
}

interface UserLeague {
    id: number;
    name: string;
    role: 'Owner' | 'Member';
    joinCode: string;
    memberCount: number;
    isActive: boolean;
    createdAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [userLeagues, setUserLeagues] = useState<UserLeague[]>([]);
    const [leaguesLoading, setLeaguesLoading] = useState(false);
    const [showLeaguesModal, setShowLeaguesModal] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);

            const usersResponse = await adminAPI.getAllUsers();

            if (usersResponse.status === 200) {
                const usersData = usersResponse.data;
                setUsers(usersData.data);
            } else {
                console.error('Users response error:', usersResponse.data);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUserLeagues = async (userId: number) => {
        try {
            setLeaguesLoading(true);
            const response = await adminAPI.getUserLeagues(userId);

            if (response.status === 200) {
                setUserLeagues(response.data.data);
            } else {
                console.error('Failed to load user leagues:', response.data);
            }
        } catch (error) {
            console.error('Error loading user leagues:', error);
        } finally {
            setLeaguesLoading(false);
        }
    };

    const handleLeagueCountClick = async (user: AdminUser) => {
        if (user.leagueCount === 0) return;

        setSelectedUser(user);
        setShowLeaguesModal(true);
        await loadUserLeagues(user.id);
    };

    const closeLeaguesModal = () => {
        setShowLeaguesModal(false);
        setSelectedUser(null);
        setUserLeagues([]);
    };

    const updateUserRole = async (userId: number, newRole: 'user' | 'admin') => {
        try {
            const response = await adminAPI.updateUserRole(userId, newRole);

            if (response.status === 200) {
                // Reload users to reflect the change
                loadUsers();
            } else {
                console.error('Failed to update user role:', response.data);
            }
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };


    const [showFeatureFlagsModal, setShowFeatureFlagsModal] = useState(false);
    const [selectedUserForFlags, setSelectedUserForFlags] = useState<AdminUser | null>(null);
    const [userFeatureFlags, setUserFeatureFlags] = useState<Record<string, any>>({});
    const [loadingFeatureFlags, setLoadingFeatureFlags] = useState(false);

    const openFeatureFlagsModal = async (user: AdminUser) => {
        try {
            setLoadingFeatureFlags(true);
            setSelectedUserForFlags(user);

            const response = await adminAPI.getUserFeatureFlags(user.id);

            if (response.status === 200) {
                setUserFeatureFlags(response.data.data.featureFlags);
                setShowFeatureFlagsModal(true);
            } else {
                console.error('Failed to load user feature flags:', response.data);
            }
        } catch (error) {
            console.error('Error loading user feature flags:', error);
        } finally {
            setLoadingFeatureFlags(false);
        }
    };

    const updateUserFeatureFlags = async (userId: number, featureFlags: Record<string, any>) => {
        try {
            const response = await adminAPI.updateUserFeatureFlags(userId, featureFlags);

            if (response.status === 200) {
                // Update the user in the local state
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.id === userId ? {
                            ...user,
                            chat_feature_enabled: featureFlags.chat_feature || false,
                            position_changes_enabled: featureFlags.league_position_changes || false
                        } : user
                    )
                );
                setShowFeatureFlagsModal(false);
                setSelectedUserForFlags(null);
            } else {
                console.error('Failed to update user feature flags:', response.data);
            }
        } catch (error) {
            console.error('Error updating user feature flags:', error);
        }
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
                <h2 className="text-lg font-medium text-gray-900">User Management</h2>
                <p className="text-sm text-gray-500 mt-1">Manage user roles and view user information. Click on league counts to see which leagues each user belongs to.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Feature Flags
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Leagues
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Joined
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {user.avatar && getAvatarUrl(user.avatar) ? (
                                                <img
                                                    className="h-10 w-10 rounded-full"
                                                    src={getAvatarUrl(user.avatar)!}
                                                    alt={user.name}
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => openFeatureFlagsModal(user)}
                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Feature Flags
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button
                                        onClick={() => handleLeagueCountClick(user)}
                                        disabled={user.leagueCount === 0}
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-150 ${user.leagueCount === 0
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer'
                                            }`}
                                    >
                                        {user.leagueCount} {user.leagueCount === 1 ? 'league' : 'leagues'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {user.role === 'admin' ? (
                                        <button
                                            onClick={() => updateUserRole(user.id, 'user')}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Remove Admin
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => updateUserRole(user.id, 'admin')}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Make Admin
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Leagues Modal */}
            {showLeaguesModal && selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {selectedUser.name} - League Memberships
                                </h3>
                                <button
                                    onClick={closeLeaguesModal}
                                    className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                                >
                                    ×
                                </button>
                            </div>

                            {leaguesLoading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    {userLeagues.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            This user is not a member of any leagues.
                                        </div>
                                    ) : (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        League
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Role
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Members
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Joined
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {userLeagues.map((league) => (
                                                    <tr key={league.id}>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{league.name}</div>
                                                                <div className="text-sm text-gray-500">Code: {league.joinCode}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${league.role === 'Owner'
                                                                ? 'bg-purple-100 text-purple-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                                }`}>
                                                                {league.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {league.memberCount} members
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${league.isActive
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {league.isActive ? 'Active' : 'Archived'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(league.createdAt).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Feature Flags Modal */}
            {showFeatureFlagsModal && selectedUserForFlags && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Feature Flags - {selectedUserForFlags.name}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowFeatureFlagsModal(false);
                                        setSelectedUserForFlags(null);
                                        setUserFeatureFlags({});
                                    }}
                                    className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                                >
                                    ×
                                </button>
                            </div>

                            {loadingFeatureFlags ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Chat Feature */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Chat Feature</label>
                                            <p className="text-xs text-gray-500">Enable league chat functionality</p>
                                        </div>
                                        <button
                                            onClick={() => setUserFeatureFlags(prev => ({
                                                ...prev,
                                                chat_feature: !prev.chat_feature
                                            }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${userFeatureFlags.chat_feature ? 'bg-indigo-600' : 'bg-gray-200'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userFeatureFlags.chat_feature ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Position Changes Feature */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Position Changes</label>
                                            <p className="text-xs text-gray-500">Allow changing league position requirements</p>
                                        </div>
                                        <button
                                            onClick={() => setUserFeatureFlags(prev => ({
                                                ...prev,
                                                league_position_changes: !prev.league_position_changes
                                            }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${userFeatureFlags.league_position_changes ? 'bg-indigo-600' : 'bg-gray-200'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userFeatureFlags.league_position_changes ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-3 pt-4">
                                        <button
                                            onClick={() => updateUserFeatureFlags(selectedUserForFlags.id, userFeatureFlags)}
                                            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowFeatureFlagsModal(false);
                                                setSelectedUserForFlags(null);
                                                setUserFeatureFlags({});
                                            }}
                                            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
