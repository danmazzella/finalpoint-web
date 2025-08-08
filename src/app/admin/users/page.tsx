'use client';

import { useState, useEffect } from 'react';
import { adminAPI, getAvatarUrl } from '@/lib/api';

interface AdminUser {
    id: number;
    email: string;
    name: string;
    avatar: string | null;
    role: 'user' | 'admin';
    createdAt: string;
    updatedAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);

            console.log('Loading users...');

            const usersResponse = await adminAPI.getAllUsers();

            console.log('API Response:', {
                users: { status: usersResponse.status, ok: usersResponse.status === 200 },
            });

            if (usersResponse.status === 200) {
                const usersData = usersResponse.data;
                console.log('Users data:', usersData);
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
                <p className="text-sm text-gray-500 mt-1">Manage user roles and view user information</p>
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
        </div>
    );
}
