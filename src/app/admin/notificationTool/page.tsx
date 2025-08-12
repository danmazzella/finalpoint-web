'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import NotificationTester from '@/components/admin/NotificationTester';
import Link from 'next/link';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export default function NotificationToolPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await adminAPI.getAllUsers();

            if (response.status === 200) {
                setUsers(response.data.data);
            } else {
                setError('Failed to load users');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            setError('Error loading users');
        } finally {
            setLoading(false);
        }
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
                <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Users</h3>
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={loadUsers}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb Navigation */}
            <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    <li className="inline-flex items-center">
                        <Link
                            href="/admin"
                            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                        >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                            Admin Dashboard
                        </Link>
                    </li>
                    <li>
                        <div className="flex items-center">
                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Notification Testing Tool</span>
                        </div>
                    </li>
                </ol>
            </nav>

            {/* Page Header */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Notification Testing Tool</h1>
                        <p className="text-gray-600 mt-2">
                            Test push notifications and emails for specific users. This tool helps verify notification delivery and debug issues.
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">
                            <div>Total Users: <span className="font-semibold text-gray-900">{users.length}</span></div>
                            <div>Last Updated: <span className="font-semibold text-gray-900">{new Date().toLocaleTimeString()}</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Tester */}
            <NotificationTester />

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-3">How to Use</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                    <div>
                        <h4 className="font-medium mb-2">Testing Push Notifications:</h4>
                        <ul className="space-y-1 list-disc list-inside">
                            <li>Select a user with mobile devices</li>
                            <li>Choose &ldquo;push&rdquo; or &ldquo;both&rdquo; notification type</li>
                            <li>Add a custom message if desired</li>
                            <li>Click &ldquo;Send Test Notification&rdquo;</li>
                            <li>Check the user&apos;s device for the notification</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Testing Email Notifications:</h4>
                        <ul className="space-y-1 list-disc list-inside">
                            <li>Select any user</li>
                            <li>Choose &ldquo;email&rdquo; or &ldquo;both&rdquo; notification type</li>
                            <li>Add a custom message if desired</li>
                            <li>Click &ldquo;Send Test Notification&rdquo;</li>
                            <li>Check the user&apos;s email inbox</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded-md">
                    <p className="text-blue-900 text-sm">
                        <strong>Tip:</strong> Use the &ldquo;View History&rdquo; button to see all notifications sent to a user and check for any delivery issues.
                    </p>
                </div>
            </div>
        </div>
    );
}
