'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { leaguesAPI, League } from '@/lib/api';
import Link from 'next/link';
import PageTitle from '@/components/PageTitle';

export default function LeaguesPage() {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLeagueName, setNewLeagueName] = useState('');
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
    if (!newLeagueName.trim()) return;

    try {
      setCreating(true);
      const response = await leaguesAPI.createLeague(newLeagueName.trim());
      if (response.data.success) {
        setShowCreateModal(false);
        setNewLeagueName('');
        loadLeagues();
      }
    } catch (error) {
      console.error('Error creating league:', error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <PageTitle
          title="Leagues"
          subtitle="Join or create a league to start predicting F1 races"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/join"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Join League
            </Link>
            <Link
              href="/leagues"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:from-slate-200 hover:to-slate-300 transition-all duration-200 shadow-sm border border-slate-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create League
            </Link>
          </div>
        </PageTitle>

        {/* Your Leagues Section */}
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6 mb-8 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Your Leagues</h2>
          {leagues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leagues.map((league) => (
                <Link
                  key={league.id}
                  href={`/leagues/${league.id}`}
                  className="block bg-gradient-to-br from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100 border border-slate-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">{league.name}</h3>
                    <span className="text-xs bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-2 py-1 rounded-full border border-indigo-200">
                      {league.memberCount} members
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Season {league.seasonYear}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="bg-slate-100 px-2 py-1 rounded">Join Code: {league.joinCode}</span>
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">No leagues yet</h3>
              <p className="text-slate-600 mb-4">Join or create a league to get started!</p>
              <div className="space-x-3">
                <Link
                  href="/join"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm"
                >
                  Join League
                </Link>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:from-slate-200 hover:to-slate-300 transition-all duration-200 shadow-sm border border-slate-300"
                >
                  Create League
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create League Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
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
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500 text-gray-900"
                    placeholder="Enter league name"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:opacity-50"
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