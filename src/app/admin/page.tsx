'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import PageTitle from '@/components/PageTitle';
import { adminAPI, User } from '@/lib/api';

interface AdminStats {
  users: {
    totalUsers: number;
    adminUsers: number;
    regularUsers: number;
  };
  leagues: {
    totalLeagues: number;
    activeLeagues: number;
    archivedLeagues: number;
    averageMembersPerLeague: number;
  };
  picks: {
    totalPicks: number;
    scoredPicks: number;
    lockedPicks: number;
    totalPoints: number;
    averagePoints: number;
    correctPicks: number;
    accuracy: number;
  };
}

interface AdminUser {
  id: number;
  email: string;
  name: string;
  avatar: string | null;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

interface League {
  id: number;
  name: string;
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  seasonYear: number;
  joinCode: string;
  memberCount: number;
  requiredPositions: number[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'leagues'>('overview');

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    loadAdminData();
  }, [user, router]);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      console.log('Loading admin data...');

      const [statsResponse, usersResponse, leaguesResponse] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAllUsers(),
        adminAPI.getAllLeagues(),
      ]);

      console.log('API Responses:', {
        stats: { status: statsResponse.status, ok: statsResponse.status === 200 },
        users: { status: usersResponse.status, ok: usersResponse.status === 200 },
        leagues: { status: leaguesResponse.status, ok: leaguesResponse.status === 200 },
      });

      if (statsResponse.status === 200) {
        const statsData = statsResponse.data;
        console.log('Stats data:', statsData);
        setStats(statsData.data);
      } else {
        console.error('Stats response error:', statsResponse.data);
      }

      if (usersResponse.status === 200) {
        const usersData = usersResponse.data;
        console.log('Users data:', usersData);
        setUsers(usersData.data);
      } else {
        console.error('Users response error:', usersResponse.data);
      }

      if (leaguesResponse.status === 200) {
        const leaguesData = leaguesResponse.data;
        console.log('Leagues data:', leaguesData);
        setLeagues(leaguesData.data);
      } else {
        console.error('Leagues response error:', leaguesResponse.data);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: number, newRole: 'user' | 'admin') => {
    try {
      const response = await adminAPI.updateUserRole(userId, newRole);

      if (response.status === 200) {
        // Reload users to reflect the change
        loadAdminData();
      } else {
        console.error('Failed to update user role:', response.data);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <PageTitle
          title="Admin Dashboard"
          subtitle="Manage users, leagues, and platform statistics"
        />

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('leagues')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'leagues'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Leagues ({leagues.length})
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Platform Statistics */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Platform Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.users.totalUsers || 0}</div>
                  <div className="text-sm text-gray-500">Total Users</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {stats.users.adminUsers || 0} admin, {stats.users.regularUsers || 0} regular
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.leagues.totalLeagues || 0}</div>
                  <div className="text-sm text-gray-500">Total Leagues</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {stats.leagues.activeLeagues || 0} active, {stats.leagues.archivedLeagues || 0} archived
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.picks.totalPicks || 0}</div>
                  <div className="text-sm text-gray-500">Total Picks</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {stats.picks.scoredPicks || 0} scored, {stats.picks.lockedPicks || 0} locked
                  </div>
                </div>
              </div>
            </div>

            {/* Pick Statistics */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Pick Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.picks.correctPicks || 0}</div>
                  <div className="text-sm text-gray-500">Correct Picks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.picks.totalPoints || 0}</div>
                  <div className="text-sm text-gray-500">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.picks.averagePoints ? stats.picks.averagePoints.toFixed(1) : '0.0'}
                  </div>
                  <div className="text-sm text-gray-500">Average Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.picks.accuracy || 0}%</div>
                  <div className="text-sm text-gray-500">Accuracy</div>
                </div>
              </div>
            </div>

            {/* League Statistics */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">League Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {stats.leagues.averageMembersPerLeague ? stats.leagues.averageMembersPerLeague.toFixed(1) : '0.0'}
                  </div>
                  <div className="text-sm text-gray-500">Average Members per League</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">{stats.leagues.activeLeagues || 0}</div>
                  <div className="text-sm text-gray-500">Active Leagues</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">User Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.avatar ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={`/uploads/avatars/${user.avatar}`}
                                alt={user.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {user.role === 'admin' ? (
                          <button
                            onClick={() => updateUserRole(user.id, 'user')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserRole(user.id, 'admin')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Make Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Leagues Tab */}
        {activeTab === 'leagues' && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">League Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      League
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Members
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leagues.map((league) => (
                    <tr key={league.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{league.name}</div>
                          <div className="text-sm text-gray-500">Code: {league.joinCode}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{league.ownerName}</div>
                          <div className="text-sm text-gray-500">{league.ownerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {league.memberCount} members
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${league.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {league.isActive ? 'Active' : 'Archived'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(league.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bottom spacing for mobile to account for fixed bottom navigation */}
        <div className="md:hidden h-16"></div>
      </main>
    </div>
  );
}