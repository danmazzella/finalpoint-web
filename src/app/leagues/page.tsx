'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { leaguesAPI, League } from '@/lib/api';
import Link from 'next/link';
import PageTitle from '@/components/PageTitle';
import { useSearchParams } from 'next/navigation';

export default function LeaguesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLeagueName, setNewLeagueName] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    try {
      setLoading(true);
      const response = await leaguesAPI.getLeagues();
      if (response.data.success) {
        setLeagues(response.data.data);
      }
    } catch (error) {
      console.error('Error loading leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const createLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeagueName.trim() || selectedPositions.length === 0) return;

    try {
      setCreating(true);
      const response = await leaguesAPI.createLeague(newLeagueName.trim(), selectedPositions);
      if (response.data.success) {
        setShowCreateModal(false);
        setNewLeagueName('');
        setSelectedPositions([]);
        loadLeagues();
      }
    } catch (error) {
      console.error('Error creating league:', error);
    } finally {
      setCreating(false);
    }
  };

  const handlePositionToggle = (position: number) => {
    setSelectedPositions(prev => {
      if (prev.includes(position)) {
        return prev.filter(p => p !== position);
      } else if (prev.length < 2) {
        return [...prev, position];
      }
      return prev;
    });
  };

  const resetModal = () => {
    setShowCreateModal(false);
    setNewLeagueName('');
    setSelectedPositions([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <PageTitle
          title="My Leagues"
          subtitle="Manage your F1 prediction game"
        >
          <div className="flex items-center space-x-3">
            <Link
              href={`/join?redirect=${encodeURIComponent(redirectTo)}`}
              className="text-gray-600 hover:text-gray-700 font-medium"
            >
              Join League
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Create League
            </button>
          </div>
        </PageTitle>

        {leagues.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leagues</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first league.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create League
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {leagues.map((league) => (
              <div key={league.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-lg">{league.name.charAt(0)}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{league.name}</h3>
                      <p className="text-sm text-gray-500">
                        Season {league.seasonYear} • {league.memberCount || 1} member{league.memberCount !== 1 ? 's' : ''}
                        {league.userRole && (
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${league.userRole === 'Owner'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {league.userRole}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex space-x-3">
                    <Link
                      href={`/leagues/${league.id}?redirect=${encodeURIComponent(redirectTo)}`}
                      className="flex-1 bg-blue-600 text-white text-center px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      View League
                    </Link>
                    <Link
                      href={`/picks?league=${league.id}&redirect=${encodeURIComponent(redirectTo)}`}
                      className="flex-1 bg-gray-100 text-gray-700 text-center px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
                    >
                      Make Picks
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create League Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 sm:w-[480px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New League</h3>
              <form onSubmit={createLeague}>
                <div className="mb-4">
                  <label htmlFor="leagueName" className="block text-sm font-medium text-gray-700">
                    League Name
                  </label>
                  <input
                    type="text"
                    id="leagueName"
                    value={newLeagueName}
                    onChange={(e) => setNewLeagueName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-900"
                    placeholder="Enter league name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Positions (Max 2)
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Choose up to 2 positions that will be scored in this league
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((position) => (
                      <button
                        key={position}
                        type="button"
                        onClick={() => handlePositionToggle(position)}
                        className={`p-2 rounded-md text-sm font-medium border transition-colors ${selectedPositions.includes(position)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                          } ${selectedPositions.length >= 2 && !selectedPositions.includes(position) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={selectedPositions.length >= 2 && !selectedPositions.includes(position)}
                      >
                        P{position}
                      </button>
                    ))}
                  </div>
                  {selectedPositions.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {selectedPositions.map(p => `P${p}`).join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create League'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 