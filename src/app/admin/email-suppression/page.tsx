'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

interface SuppressedEmail {
    id: number;
    userId: number;
    email: string;
    userName: string;
    userEmail: string;
    reason: string | null;
    suppressedAt: string;
    suppressedByName: string;
}

interface AllUser {
    id: number;
    email: string;
    name: string;
}

export default function EmailSuppressionPage() {
    const [suppressed, setSuppressed] = useState<SuppressedEmail[]>([]);
    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState<AllUser[]>([]);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<AllUser | null>(null);
    const [reason, setReason] = useState('');
    const [adding, setAdding] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [actionError, setActionError] = useState('');

    useEffect(() => {
        loadSuppressed();
        loadAllUsers();
    }, []);

    const loadSuppressed = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getEmailSuppressionList();
            if (res.status === 200) {
                setSuppressed(res.data.data);
            }
        } catch (err) {
            console.error('Failed to load suppression list:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadAllUsers = async () => {
        try {
            const res = await adminAPI.getAllUsers();
            if (res.status === 200) {
                setAllUsers(res.data.data);
            }
        } catch (err) {
            console.error('Failed to load users:', err);
        }
    };

    const handleAdd = async () => {
        if (!selectedUser) return;
        setActionError('');
        setAdding(true);
        try {
            const res = await adminAPI.addEmailSuppression(selectedUser.id, selectedUser.email, reason || undefined);
            if (res.status === 200) {
                setShowAddForm(false);
                setSelectedUser(null);
                setReason('');
                setSearch('');
                await loadSuppressed();
            } else {
                setActionError('Failed to add suppression');
            }
        } catch (err) {
            setActionError('Failed to add suppression');
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (userId: number) => {
        try {
            const res = await adminAPI.removeEmailSuppression(userId);
            if (res.status === 200) {
                await loadSuppressed();
            }
        } catch (err) {
            console.error('Failed to remove suppression:', err);
        }
    };

    const suppressedUserIds = new Set(suppressed.map(s => s.userId));
    const filteredUsers = search.length >= 2
        ? allUsers.filter(u =>
            !suppressedUserIds.has(u.id) &&
            (u.email.toLowerCase().includes(search.toLowerCase()) ||
                u.name.toLowerCase().includes(search.toLowerCase()))
          )
        : [];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">Email Suppression</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Emails on this list will not receive any email notifications.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(v => !v)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                    >
                        {showAddForm ? 'Cancel' : '+ Suppress Email'}
                    </button>
                </div>

                {showAddForm && (
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="max-w-lg space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Search user</label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setSelectedUser(null); }}
                                    placeholder="Name or email (min 2 chars)"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {filteredUsers.length > 0 && !selectedUser && (
                                    <ul className="mt-1 border border-gray-200 rounded-md bg-white shadow-sm max-h-48 overflow-y-auto">
                                        {filteredUsers.map(u => (
                                            <li
                                                key={u.id}
                                                onClick={() => { setSelectedUser(u); setSearch(u.email); }}
                                                className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                                            >
                                                <span className="font-medium">{u.name}</span>
                                                <span className="text-gray-500 ml-2">{u.email}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {selectedUser && (
                                    <p className="mt-1 text-sm text-green-700">
                                        Selected: <span className="font-medium">{selectedUser.name}</span> ({selectedUser.email})
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    placeholder="e.g. Too many bounces"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            {actionError && <p className="text-sm text-red-600">{actionError}</p>}
                            <button
                                onClick={handleAdd}
                                disabled={!selectedUser || adding}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                                {adding ? 'Suppressing...' : 'Suppress Email'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    {suppressed.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-500 text-sm">
                            No suppressed emails.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suppressed</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">By</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {suppressed.map(entry => (
                                    <tr key={entry.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.userName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{entry.reason || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(entry.suppressedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.suppressedByName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleRemove(entry.userId)}
                                                className="text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
