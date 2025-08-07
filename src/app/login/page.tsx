'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';

function LoginForm() {
  const [validationError, setValidationError] = useState('');
  const { login, isLoading, loginError, loginFormData, setLoginFormData, clearLoginError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const { email, password } = loginFormData;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Clear any previous errors
    clearLoginError();
    setValidationError('');

    if (!email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }

    try {
      const result = await login(email, password);

      if (result?.success) {
        router.push(redirectTo);
      }
      // Error handling is done in the AuthContext
    } catch (error) {
      console.error('Unexpected error in handleSubmit:', error);
    }
  };

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
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setLoginFormData({ email: e.target.value, password })}
                  placeholder="Enter your email address"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setLoginFormData({ email, password: e.target.value })}
                  placeholder="Enter your password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
              </div>
            </div>

            {(loginError || validationError) && (
              <div className="text-red-600 text-sm text-center">
                {loginError || validationError}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don&apos;t have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href={`/signup?redirect=${encodeURIComponent(redirectTo)}`}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create an account
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/info"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Learn more about FinalPoint
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">FinalPoint</h1>
            <h2 className="text-xl text-gray-600">F1 Prediction Game</h2>
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
      <LoginForm />
    </Suspense>
  );
} 