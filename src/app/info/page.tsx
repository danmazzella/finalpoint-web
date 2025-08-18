'use client';

import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/LandingPage';

export default function InfoPage() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <LandingPage />;
}
