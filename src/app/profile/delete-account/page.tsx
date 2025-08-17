'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CONTACT_EMAIL } from '@/lib/environment';

export default function DeleteAccountPage() {
    const { user, deleteAccount } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Delete Account Form State
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!deletePassword) {
            setError('Please enter your password to confirm account deletion');
            return;
        }

        if (deleteConfirmation !== 'DELETE') {
            setError('Please type "DELETE" to confirm account deletion');
            return;
        }

        if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        setIsLoading(true);

        try {
            const success = await deleteAccount(deletePassword);
            if (success) {
                showToast('Account successfully deleted. You will be redirected to the homepage.', 'success');
                // Redirect to homepage after a short delay
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                setError('Failed to delete account. Please check your password and try again.');
            }
        } catch (error: unknown) {
            console.error('Delete account error:', error);
            setError('An error occurred while deleting your account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/profile"
                            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                        >
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Profile
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Delete Account</h1>
                        <p className="mt-2 text-gray-600">
                            Permanently delete your FinalPoint account and all associated data.
                        </p>
                    </div>

                    {/* Success/Error Messages */}
                    {success && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                            {success}
                        </div>
                    )}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Warning Section */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Warning: This action cannot be undone
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Your personal information will be permanently removed</li>
                                        <li>You will lose access to all your leagues and predictions</li>
                                        <li>Your account cannot be recovered after deletion</li>
                                        <li>Any outstanding league activity will be preserved but anonymized</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Info */}
                    <div className="bg-white shadow rounded-lg mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Account to be deleted</h2>
                        </div>
                        <div className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-700">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-sm text-gray-500">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delete Form */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Confirm Account Deletion</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Please enter your password and type "DELETE" to confirm this action.
                            </p>
                        </div>
                        <form onSubmit={handleDeleteAccount} className="px-6 py-6">
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        Enter your password
                                    </label>
                                    <input
                                        type="password"
                                        id="deletePassword"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500"
                                        placeholder="Your current password"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="deleteConfirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                        Type "DELETE" to confirm
                                    </label>
                                    <input
                                        type="text"
                                        id="deleteConfirmation"
                                        value={deleteConfirmation}
                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500"
                                        placeholder="Type DELETE"
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        This must exactly match "DELETE" (case-sensitive)
                                    </p>
                                </div>

                                <div className="flex justify-between pt-6 border-t border-gray-200">
                                    <Link
                                        href="/profile"
                                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !deletePassword || deleteConfirmation !== 'DELETE'}
                                        className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading ? 'Deleting Account...' : 'Delete My Account'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Additional Help */}
                    <div className="mt-8 bg-gray-50 rounded-lg p-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Need help instead?</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            If you're having issues with your account, consider contacting support before deleting your account.
                        </p>
                        <a
                            href={`mailto:${CONTACT_EMAIL}?subject=FinalPoint%20Account%20Help`}
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                        >
                            Contact Support
                            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
