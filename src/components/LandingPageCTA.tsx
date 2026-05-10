'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface LandingPageCTAProps {
  variant: 'hero' | 'bottom';
}

export default function LandingPageCTA({ variant }: LandingPageCTAProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const hasNavigatedInternally = sessionStorage.getItem('finalpoint-internal-navigation');
      if (hasNavigatedInternally !== 'true') {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (variant === 'hero') {
    return (
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center items-center mb-8">
        {user ? (
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-w-[180px]"
          >
            Go to Dashboard
          </button>
        ) : (
          <>
            <button
              onClick={() => router.push('/signup')}
              className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-w-[180px]"
            >
              Get Started Free
            </button>
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center justify-center px-10 py-4 border-2 border-gray-300 text-lg font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 min-w-[180px]"
            >
              Sign In
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center items-center">
      <button
        onClick={() => router.push(user ? '/dashboard' : '/signup')}
        className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-w-[200px]"
      >
        {user ? 'Go to Dashboard' : 'Create Free Account'}
      </button>
      <button
        onClick={() => router.push('/dashboard')}
        className="inline-flex items-center justify-center px-10 py-4 border-2 border-gray-300 text-lg font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 min-w-[200px]"
      >
        Explore More
      </button>
    </div>
  );
}
