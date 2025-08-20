'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/LandingPage';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Check if user has been navigating within the app recently
      const hasNavigatedInternally = sessionStorage.getItem('finalpoint-internal-navigation');
      const isInternalNavigation = hasNavigatedInternally === 'true';

      // Only redirect to dashboard if they haven't been navigating internally
      if (!isInternalNavigation) {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show a comprehensive welcome page for logged-out users
  if (!user) {
    return <LandingPage />;
  }

  // Show landing page for logged-in users who have navigated internally
  return <LandingPage />;
}
