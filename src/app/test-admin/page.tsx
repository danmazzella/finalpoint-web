'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TestAdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleReloadUser = () => {
    // Clear localStorage and redirect to login
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Test Page</h1>
        
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Current User Info</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Access Test</h2>
          <div className="space-y-4">
            <div>
              <strong>User Role:</strong> {user.role || 'undefined'}
            </div>
            <div>
              <strong>Is Admin:</strong> {user.role === 'admin' ? '✅ Yes' : '❌ No'}
            </div>
            <div>
              <strong>Can Access Admin:</strong> {user.role === 'admin' ? '✅ Yes' : '❌ No'}
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
          <div className="space-y-4">
            <button
              onClick={() => router.push('/admin')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Try Admin Page
            </button>
            <button
              onClick={handleReloadUser}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md ml-4"
            >
              Reload User (Clear localStorage)
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md ml-4"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}