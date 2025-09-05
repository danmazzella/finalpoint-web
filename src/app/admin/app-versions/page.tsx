'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { adminAPI } from '@/lib/api';

interface AppVersion {
    id: number;
    version: string;
    platform: 'android' | 'ios';
    android_version_code?: number;
    ios_build_number?: string;
    is_required: boolean;
    release_notes: string;
    update_url?: string;
    created_at: string;
}

export default function AppVersionsPage() {
    const { user } = useAuth();
    const { resolvedTheme } = useTheme();
    const [versions, setVersions] = useState<AppVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        version: '',
        platform: 'android' as 'android' | 'ios',
        android_version_code: '',
        ios_build_number: '',
        is_required: false,
        release_notes: '',
        update_url: '',
    });

    // Check if user is admin
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        if (isAdmin) {
            fetchVersions();
        }
    }, [isAdmin]);

    const fetchVersions = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAppVersions();
            setVersions(response.data.versions || []);
        } catch (error) {
            console.error('Error fetching versions:', error);
            alert('Failed to fetch app versions');
        } finally {
            setLoading(false);
        }
    };

    const handleAddVersion = async () => {
        try {
            const payload = {
                version: formData.version,
                platform: formData.platform,
                android_version_code: formData.platform === 'android' ? parseInt(formData.android_version_code) : undefined,
                ios_build_number: formData.platform === 'ios' ? formData.ios_build_number : undefined,
                is_required: formData.is_required,
                release_notes: formData.release_notes,
                update_url: formData.update_url || null,
            };

            await adminAPI.createAppVersion(payload);
            alert('App version added successfully');
            setShowAddForm(false);
            setFormData({
                version: '',
                platform: 'android',
                android_version_code: '',
                ios_build_number: '',
                is_required: false,
                release_notes: '',
                update_url: '',
            });
            fetchVersions();
        } catch (error) {
            console.error('Error adding version:', error);
            alert('Failed to add app version');
        }
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600">You need admin privileges to access this page.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">App Versions</h1>
                    <p className="text-gray-600">Manage mobile app versions and update requirements</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {showAddForm ? 'Cancel' : 'Add Version'}
                </button>
            </div>

            {/* Add Version Form */}
            {showAddForm && (
                <div className="bg-white rounded-lg shadow-md p-6 border">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New App Version</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Version
                            </label>
                            <input
                                type="text"
                                value={formData.version}
                                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 1.2.3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Platform
                            </label>
                            <select
                                value={formData.platform}
                                onChange={(e) => setFormData({ ...formData, platform: e.target.value as 'android' | 'ios' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="android">Android</option>
                                <option value="ios">iOS</option>
                            </select>
                        </div>

                        {formData.platform === 'android' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Android Version Code
                                </label>
                                <input
                                    type="number"
                                    value={formData.android_version_code}
                                    onChange={(e) => setFormData({ ...formData, android_version_code: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 12"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    iOS Build Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.ios_build_number}
                                    onChange={(e) => setFormData({ ...formData, ios_build_number: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 1.2.3"
                                />
                            </div>
                        )}

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_required"
                                checked={formData.is_required}
                                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_required" className="ml-2 block text-sm text-gray-700">
                                Required Update
                            </label>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Release Notes
                            </label>
                            <textarea
                                value={formData.release_notes}
                                onChange={(e) => setFormData({ ...formData, release_notes: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe what's new in this version..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Update URL (Optional)
                            </label>
                            <input
                                type="url"
                                value={formData.update_url}
                                onChange={(e) => setFormData({ ...formData, update_url: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://play.google.com/store/apps/details?id=..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddVersion}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add Version
                        </button>
                    </div>
                </div>
            )}

            {/* Versions List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Current Versions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Platform
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Version
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Build/Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Required
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Release Notes
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {versions.map((version) => (
                                <tr key={version.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${version.platform === 'android'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {version.platform === 'android' ? '🤖' : '🍎'} {version.platform.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {version.version}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {version.platform === 'android'
                                            ? version.android_version_code
                                            : version.ios_build_number
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${version.is_required
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {version.is_required ? 'Required' : 'Optional'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                        {version.release_notes}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(version.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {versions.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📱</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No app versions found</h3>
                    <p className="text-gray-500">Add your first app version to get started.</p>
                </div>
            )}
        </div>
    );
}
