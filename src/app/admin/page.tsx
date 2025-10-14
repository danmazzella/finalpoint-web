'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import Link from 'next/link';

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
  positionBreakdown: Array<{
    position: number;
    totalPicks: number;
    scoredPicks: number;
    correctPicks: number;
    accuracy: number;
  }>;
  availableWeeks: Array<{
    weekNumber: number;
    raceName: string;
  }>;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reschedulingPicks, setReschedulingPicks] = useState(false);
  const [reschedulingReminders, setReschedulingReminders] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<'all' | 'race' | 'sprint'>('all');
  const [positionBreakdown, setPositionBreakdown] = useState<Array<{
    position: number;
    totalPicks: number;
    scoredPicks: number;
    correctPicks: number;
    accuracy: number;
  }> | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      const statsResponse = await adminAPI.getAdminDashboardStats();

      if (statsResponse.status === 200) {
        const statsData = statsResponse.data;
        setStats(statsData.data);
        setPositionBreakdown(statsData.data.positionBreakdown);
      } else {
        console.error('Stats response error:', statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPositionBreakdownByWeek = async (weekNumber: number | null, eventType: 'all' | 'race' | 'sprint' = 'all') => {
    try {
      if (eventType === 'all') {
        // For "All Races", we need to combine data from both race and sprint
        if (weekNumber) {
          // Load both race and sprint data and combine them
          const [raceResponse, sprintResponse] = await Promise.all([
            adminAPI.getPicksByPositionOverviewForEvent(weekNumber, 'race'),
            adminAPI.getPicksByPositionOverviewForEvent(weekNumber, 'sprint')
          ]);

          if (raceResponse.status === 200 && sprintResponse.status === 200) {
            const raceData = raceResponse.data.data;
            const sprintData = sprintResponse.data.data;

            // Combine the data by position
            const combinedData = new Map();

            // Add race data
            raceData.forEach((item: { position: number; totalPicks?: number; scoredPicks?: number; correctPicks?: number }) => {
              combinedData.set(item.position, {
                position: item.position,
                totalPicks: item.totalPicks || 0,
                scoredPicks: item.scoredPicks || 0,
                correctPicks: item.correctPicks || 0,
                accuracy: 0 // Will calculate below
              });
            });

            // Add sprint data
            sprintData.forEach((item: { position: number; totalPicks?: number; scoredPicks?: number; correctPicks?: number }) => {
              const existing = combinedData.get(item.position);
              if (existing) {
                existing.totalPicks += item.totalPicks || 0;
                existing.scoredPicks += item.scoredPicks || 0;
                existing.correctPicks += item.correctPicks || 0;
              } else {
                combinedData.set(item.position, {
                  position: item.position,
                  totalPicks: item.totalPicks || 0,
                  scoredPicks: item.scoredPicks || 0,
                  correctPicks: item.correctPicks || 0,
                  accuracy: 0
                });
              }
            });

            // Calculate accuracy for combined data
            const finalData = Array.from(combinedData.values()).map(item => ({
              ...item,
              accuracy: item.scoredPicks > 0 ? Math.round((item.correctPicks / item.scoredPicks) * 100) : 0
            }));

            setPositionBreakdown(finalData);
          } else {
            console.error('Error loading combined position breakdown:', raceResponse.data, sprintResponse.data);
          }
        } else {
          // For overall stats, use the regular API
          const response = await adminAPI.getPositionBreakdownByWeek(weekNumber);
          if (response.status === 200) {
            setPositionBreakdown(response.data.data);
          } else {
            console.error('Position breakdown response error:', response.data);
          }
        }
      } else {
        // For specific event types, use the event-specific API
        if (weekNumber) {
          const response = await adminAPI.getPicksByPositionOverviewForEvent(weekNumber, eventType);
          if (response.status === 200) {
            setPositionBreakdown(response.data.data);
          } else {
            console.error('Position breakdown response error:', response.data);
            setPositionBreakdown([]);
          }
        } else {
          // For overall stats with specific event type, fetch data for all weeks
          // and combine them for the selected event type
          try {
            // Get all available weeks to fetch data for each week
            const weeksResponse = await adminAPI.getAvailableRaces();
            const availableWeeks = weeksResponse.data.data || [];

            // Fetch data for all weeks for the selected event type
            const allWeekData = await Promise.all(
              availableWeeks.map(async (week: { weekNumber: number }) => {
                try {
                  const response = await adminAPI.getPicksByPositionOverviewForEvent(week.weekNumber, selectedEventType as 'race' | 'sprint');
                  return response.data.data || [];
                } catch (error) {
                  console.warn(`Failed to fetch data for week ${week.weekNumber}:`, error);
                  return [];
                }
              })
            );

            // Combine all week data
            const combinedData = allWeekData.flat();

            // Group by position and sum up the statistics
            const positionMap = new Map();
            combinedData.forEach((item: { position: number; totalPicks: number; scoredPicks: number; correctPicks: number }) => {
              const position = item.position;
              if (!positionMap.has(position)) {
                positionMap.set(position, {
                  position: position,
                  totalPicks: 0,
                  scoredPicks: 0,
                  correctPicks: 0,
                  accuracy: 0
                });
              }
              const existing = positionMap.get(position);
              existing.totalPicks += item.totalPicks || 0;
              existing.scoredPicks += item.scoredPicks || 0;
              existing.correctPicks += item.correctPicks || 0;
            });

            // Calculate accuracy for each position
            const finalData = Array.from(positionMap.values()).map(item => ({
              ...item,
              accuracy: item.scoredPicks > 0 ? Math.round((item.correctPicks / item.scoredPicks) * 100) : 0
            })).sort((a, b) => a.position - b.position);

            setPositionBreakdown(finalData);
          } catch (error) {
            console.error('Error loading overall stats for event type:', error);
            setPositionBreakdown([]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading position breakdown:', error);
    }
  };

  const handleWeekChange = (weekNumber: number | null) => {
    setSelectedWeek(weekNumber);
    loadPositionBreakdownByWeek(weekNumber, selectedEventType);
  };

  const handleEventTypeChange = (eventType: 'all' | 'race' | 'sprint') => {
    setSelectedEventType(eventType);
    loadPositionBreakdownByWeek(selectedWeek, eventType);
  };

  const handleRescheduleAllPicks = async () => {
    if (!confirm('Are you sure you want to reschedule all picks? This will clear all existing scheduled pick locking jobs and create new ones based on current race times.')) {
      return;
    }

    try {
      setReschedulingPicks(true);
      const response = await adminAPI.rescheduleAllPicks();

      if (response.status === 200) {
        alert('All picks have been rescheduled successfully!');
      } else {
        alert('Error rescheduling picks. Please check the console for details.');
      }
    } catch (error) {
      console.error('Error rescheduling picks:', error);
      alert('Error rescheduling picks. Please check the console for details.');
    } finally {
      setReschedulingPicks(false);
    }
  };

  const handleRescheduleAllReminders = async () => {
    if (!confirm('Are you sure you want to reschedule all reminders? This will clear all existing scheduled reminder jobs and create new ones based on current race times.')) {
      return;
    }

    try {
      setReschedulingReminders(true);
      const response = await adminAPI.rescheduleAllReminders();

      if (response.status === 200) {
        alert('All reminders have been rescheduled successfully!');
      } else {
        alert('Error rescheduling reminders. Please check the console for details.');
      }
    } catch (error) {
      console.error('Error rescheduling reminders:', error);
      alert('Error rescheduling reminders. Please check the console for details.');
    } finally {
      setReschedulingReminders(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
        <p className="text-gray-500">Unable to load admin statistics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Tools Navigation */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/notificationTool"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M9 11h.01M9 8h.01M15 14h.01M15 11h.01M15 8h.01M15 5h.01M12 5h.01M12 8h.01M12 11h.01M12 14h.01M12 17h.01" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Notification Testing Tool</h3>
              <p className="text-sm text-gray-500">Test push notifications and emails for users</p>
            </div>
          </Link>

          <Link
            href="/admin/race-results"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Race Results Entry</h3>
              <p className="text-sm text-gray-500">Enter race results and score all leagues</p>
            </div>
          </Link>

          <Link
            href="/admin/league-picks-overview"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 00-2 2v2h2V7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">League Picks Overview</h3>
              <p className="text-sm text-gray-500">View all picks for each position across all leagues</p>
            </div>
          </Link>

          <Link
            href="/admin/picks-by-position"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Popular Picks by Position</h3>
              <p className="text-sm text-gray-500">View picks grouped by position across all leagues</p>
            </div>
          </Link>

          <Link
            href="/admin/user-picks"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">User Picks Management</h3>
              <p className="text-sm text-gray-500">Add users to leagues and manage their picks</p>
            </div>
          </Link>

          <Link
            href="/admin/drivers"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Driver Management</h3>
              <p className="text-sm text-gray-500">Manage F1 drivers and their active status</p>
            </div>
          </Link>

          <button
            onClick={handleRescheduleAllPicks}
            disabled={reschedulingPicks}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                {reschedulingPicks ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                ) : (
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </div>
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-sm font-medium text-gray-900">
                {reschedulingPicks ? 'Rescheduling Picks...' : 'Reschedule All Picks'}
              </h3>
              <p className="text-sm text-gray-500">
                {reschedulingPicks
                  ? 'Please wait while picks are being rescheduled...'
                  : 'Clear and reschedule all pick locking jobs based on current race times'
                }
              </p>
            </div>
          </button>

          <button
            onClick={handleRescheduleAllReminders}
            disabled={reschedulingReminders}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                {reschedulingReminders ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                ) : (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 1 1 15 0v5z" />
                  </svg>
                )}
              </div>
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-sm font-medium text-gray-900">
                {reschedulingReminders ? 'Rescheduling Reminders...' : 'Reschedule All Reminders'}
              </h3>
              <p className="text-sm text-gray-500">
                {reschedulingReminders
                  ? 'Please wait while reminders are being rescheduled...'
                  : 'Clear and reschedule all reminder jobs based on current race times'
                }
              </p>
            </div>
          </button>

          <Link
            href="/admin/users-without-picks"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Missing Picks</h3>
              <p className="text-sm text-gray-500">Users who haven&apos;t made picks for specific weeks</p>
            </div>
          </Link>

          <Link
            href="/admin/app-versions"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">App Versions</h3>
              <p className="text-sm text-gray-500">Manage mobile app versions and updates</p>
            </div>
          </Link>

          {/* Add more admin tools here in the future */}
          <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-400">More Tools Coming Soon</h3>
              <p className="text-sm text-gray-400">Additional admin utilities will be added here</p>
            </div>
          </div>
        </div>
      </div>

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

      {/* Position Breakdown */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Position Breakdown</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <label htmlFor="event-type-selector" className="text-sm font-medium text-gray-700">
                Event type:
              </label>
              <select
                id="event-type-selector"
                value={selectedEventType}
                onChange={(e) => handleEventTypeChange(e.target.value as 'all' | 'race' | 'sprint')}
                className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Races</option>
                <option value="race">Grand Prix</option>
                <option value="sprint">Sprint</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <label htmlFor="week-selector" className="text-sm font-medium text-gray-700">
                Filter by week:
              </label>
              <select
                id="week-selector"
                value={selectedWeek || ''}
                onChange={(e) => handleWeekChange(e.target.value ? parseInt(e.target.value) : null)}
                className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All weeks (overall)</option>
                {stats?.availableWeeks?.map((week) => (
                  <option key={week.weekNumber} value={week.weekNumber}>
                    Week {week.weekNumber}: {week.raceName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Picks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scored Picks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correct Picks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accuracy
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {positionBreakdown && positionBreakdown.length > 0 ? (
                positionBreakdown.map((position) => (
                  <tr key={position.position}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      P{position.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {position.totalPicks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {position.scoredPicks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {position.correctPicks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${position.accuracy >= 30 ? 'bg-green-100 text-green-800' :
                        position.accuracy >= 15 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {position.accuracy}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    {selectedEventType !== 'all' && !selectedWeek ?
                      'Please select a week to view event-specific data' :
                      'No data available for the selected filters'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
  );
}