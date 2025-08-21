'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Logo from '@/components/Logo';
import PasswordStrengthIndicator, { validatePasswordComplexity } from '@/components/PasswordStrengthIndicator';

function ResetPasswordForm() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validationError, setValidationError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resetError, setResetError] = useState('');
    const [isExpired, setIsExpired] = useState(false);
    const [showRequestNew, setShowRequestNew] = useState(false);
    const [requestEmail, setRequestEmail] = useState('');
    const [requestError, setRequestError] = useState('');

    const { resetPassword, forgotPassword, isLoading } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setResetError('Invalid reset link. Please request a new password reset.');
        }
    }, [token]);

    const handleRequestNewLink = async (e: React.FormEvent) => {
        e.preventDefault();

        setRequestError('');


        if (!requestEmail) {
            setRequestError('Please enter your email address');
            return;
        }

        try {
            const result = await forgotPassword(requestEmail);

            if (result?.success) {
                // Show toast notification
                showToast('If there is an account associated with that email, you will receive a new password reset link shortly.', 'success');

                // Reset form and hide request section
                setRequestEmail('');
                setShowRequestNew(false);
                setRequestError('');

            } else {
                setRequestError(result?.error || 'Failed to send new reset link. Please try again.');
            }
        } catch (error) {
            console.error('Request new link error:', error);
            setRequestError('Failed to send new reset link. Please try again.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Clear any previous errors
        setValidationError('');
        setResetError('');

        if (!newPassword || !confirmPassword) {
            setValidationError('Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            setValidationError('Passwords do not match');
            return;
        }

        // Use the same password complexity validation as signup
        const passwordValidation = validatePasswordComplexity(newPassword);
        if (!passwordValidation.isValid) {
            setValidationError(`Password requirements not met: ${passwordValidation.errors[0]}`);
            return;
        }

        if (!token) {
            setResetError('Invalid reset token. Please request a new password reset.');
            return;
        }

        try {
            const result = await resetPassword(token, newPassword);

            if (result?.success) {
                setSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                const errorMessage = result?.error || 'Failed to reset password. Please try again.';

                // Check if the error indicates an expired token
                if (errorMessage.toLowerCase().includes('expired') || errorMessage.toLowerCase().includes('invalid')) {
                    setIsExpired(true);
                    setResetError('This password reset link has expired. Please request a new one below.');
                } else {
                    setResetError(errorMessage);
                }
            }
        } catch (error) {
            console.error('Unexpected error in handleSubmit:', error);
            setResetError('An unexpected error occurred. Please try again.');
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <Logo className="w-32 h-32" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">FinalPoint</h1>
                        <h2 className="text-xl text-gray-600">F1 Prediction Game</h2>
                    </div>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg
                                    className="h-6 w-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Password Reset Successful!</h3>
                            <p className="text-gray-600 mb-6">
                                Your password has been successfully reset. You will be redirected to the login page in a few seconds.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Go to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <Logo className="w-32 h-32" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">FinalPoint</h1>
                    <h2 className="text-xl text-gray-600">Reset Your Password</h2>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {!token || (resetError && !isExpired) ? (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg
                                    className="h-6 w-6 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Reset Link</h3>
                            <p className="text-gray-600 mb-6">
                                {resetError || 'This password reset link is invalid. Please request a new password reset.'}
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowRequestNew(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Request New Reset Link
                                </button>
                                <div>
                                    <Link
                                        href="/login"
                                        className="text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : isExpired ? (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                                <svg
                                    className="h-6 w-6 text-yellow-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Link Expired</h3>
                            <p className="text-gray-600 mb-6">
                                This password reset link has expired. Password reset links are valid for 4 hours for security reasons. Please request a new one below.
                            </p>

                            {!showRequestNew ? (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setShowRequestNew(true)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Request New Reset Link
                                    </button>
                                    <div>
                                        <Link
                                            href="/login"
                                            className="text-sm text-gray-500 hover:text-gray-700"
                                        >
                                            Back to Login
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-sm mx-auto">
                                    <form onSubmit={handleRequestNewLink} className="space-y-4">
                                        <div>
                                            <label htmlFor="requestEmail" className="block text-sm font-medium text-gray-700 text-left">
                                                Email address
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    id="requestEmail"
                                                    name="requestEmail"
                                                    type="email"
                                                    autoComplete="email"
                                                    required
                                                    value={requestEmail}
                                                    onChange={(e) => setRequestEmail(e.target.value)}
                                                    placeholder="Enter your email address"
                                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                                />
                                            </div>
                                        </div>

                                        {requestError && (
                                            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm font-medium">
                                                {requestError}
                                            </div>
                                        )}



                                        <div className="flex space-x-3">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                            >
                                                {isLoading ? 'Sending...' : 'Send New Link'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowRequestNew(false);
                                                    setRequestEmail('');
                                                    setRequestError('');

                                                }}
                                                className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>

                                    <div className="mt-4">
                                        <Link
                                            href="/login"
                                            className="text-sm text-gray-500 hover:text-gray-700"
                                        >
                                            Back to Login
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                        New Password
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="newPassword"
                                            name="newPassword"
                                            type="password"
                                            autoComplete="new-password"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter your new password"
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                        />
                                        <PasswordStrengthIndicator password={newPassword} />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Confirm Password
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            autoComplete="new-password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm your new password"
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                        />
                                    </div>
                                </div>

                                {(resetError || validationError) && !isExpired && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm text-center font-medium">
                                        {resetError || validationError}
                                    </div>
                                )}

                                {isExpired && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-yellow-800">
                                                    Reset Link Expired
                                                </h3>
                                                <div className="mt-2 text-sm text-yellow-700">
                                                    <p>This password reset link has expired. Please request a new one.</p>
                                                </div>
                                                <div className="mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowRequestNew(true)}
                                                        className="text-sm bg-yellow-50 text-yellow-800 hover:bg-yellow-100 font-medium py-2 px-3 border border-yellow-200 rounded-md"
                                                    >
                                                        Request New Link
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}



                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Resetting Password...' : 'Reset Password'}
                                    </button>
                                </div>

                                <div className="mt-4 text-center">
                                    <Link
                                        href="/login"
                                        className="text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        Back to login
                                    </Link>
                                </div>
                            </form>

                            {/* Request New Link Form (shown when password reset form is visible and user clicks request new link) */}
                            {showRequestNew && (
                                <div className="mt-6 border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Request New Reset Link</h3>
                                    <form onSubmit={handleRequestNewLink} className="space-y-4">
                                        <div>
                                            <label htmlFor="requestEmailForm" className="block text-sm font-medium text-gray-700">
                                                Email address
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    id="requestEmailForm"
                                                    name="requestEmailForm"
                                                    type="email"
                                                    autoComplete="email"
                                                    required
                                                    value={requestEmail}
                                                    onChange={(e) => setRequestEmail(e.target.value)}
                                                    placeholder="Enter your email address"
                                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                                />
                                            </div>
                                        </div>

                                        {requestError && (
                                            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm font-medium">
                                                {requestError}
                                            </div>
                                        )}



                                        <div className="flex space-x-3">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                            >
                                                {isLoading ? 'Sending...' : 'Send New Link'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowRequestNew(false);
                                                    setRequestEmail('');
                                                    setRequestError('');

                                                }}
                                                className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <Logo className="w-32 h-32" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">FinalPoint</h1>
                        <h2 className="text-xl text-gray-600">Reset Your Password</h2>
                    </div>
                </div>
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
