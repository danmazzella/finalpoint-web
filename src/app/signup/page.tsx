'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const success = await signup(email, password, name);
    if (success) {
      router.push(redirectTo);
    } else {
      setError('Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2">Create Account</h1>
          <h2 className="text-xl text-slate-600 dark:text-slate-400">Join the F1 Prediction Game</h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm py-8 px-4 shadow-sm border border-slate-200/50 dark:border-slate-700/50 sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your display name"
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-pink-500 dark:focus:border-pink-400 sm:text-sm text-slate-900 dark:text-slate-100 bg-white/50 dark:bg-slate-700/50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-pink-500 dark:focus:border-pink-400 sm:text-sm text-slate-900 dark:text-slate-100 bg-white/50 dark:bg-slate-700/50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-pink-500 dark:focus:border-pink-400 sm:text-sm text-slate-900 dark:text-slate-100 bg-white/50 dark:bg-slate-700/50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                  placeholder="Confirm your password"
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-pink-500 dark:focus:border-pink-400 sm:text-sm text-slate-900 dark:text-slate-100 bg-white/50 dark:bg-slate-700/50"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 dark:focus:ring-offset-slate-800 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/70 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-pink-600 dark:text-pink-400 bg-white/50 dark:bg-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 dark:focus:ring-offset-slate-800 transition-colors"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2">Create Account</h1>
            <h2 className="text-xl text-slate-600 dark:text-slate-400">Join the F1 Prediction Game</h2>
          </div>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm py-8 px-4 shadow-sm border border-slate-200/50 dark:border-slate-700/50 sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
} 