import axios from 'axios';
import logger from '@/utils/logger';

// API URL configuration
const getApiBaseUrl = () => {
  // Check for environment variable first
  if (process.env.NEXT_PUBLIC_API_URL) {
    // Ensure the URL ends with /api if it doesn't already
    const url = process.env.NEXT_PUBLIC_API_URL;
    if (!url.endsWith('/api')) {
      return url.endsWith('/') ? url + 'api' : url + '/api';
    }
    return url;
  }

  // Check if we're in production (deployed to finalpoint.app)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'finalpoint.app' || hostname === 'www.finalpoint.app') {
      return 'https://api.finalpoint.app/api';
    }
  }

  // Fallback to development URL
  return 'http://localhost:6075/api';
};

const API_BASE_URL = getApiBaseUrl();

// Create a separate API service for public endpoints (no auth required)
export const publicApiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  timeout: 10000,
});

// Request interceptor for public API service (no auth token)
publicApiService.interceptors.request.use(
  async (config) => {
    // Add cache-busting headers
    config.headers['Cache-Control'] = 'no-cache';
    config.headers['Pragma'] = 'no-cache';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to get full avatar URL
export const getAvatarUrl = (avatarPath: string, _baseUrl?: string) => {
  // Handle null, undefined, empty string, or the string "null"
  if (!avatarPath || avatarPath === 'null' || avatarPath.trim() === '') {
    return null;
  }

  // If it's already a full URL, return as is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }

  // If it starts with /uploads/avatars/, it's already a full path, just add the base URL
  if (avatarPath.startsWith('/uploads/avatars/')) {
    // For production (finalpoint.app), use the API domain for avatars
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'finalpoint.app' || hostname === 'www.finalpoint.app') {
        return `https://api.finalpoint.app${avatarPath}`;
      }
    }
    // For development, remove /api from the base URL since avatar paths don't include it
    const devBaseUrl = API_BASE_URL.replace('/api', '');
    return `${devBaseUrl}${avatarPath}`;
  }

  // For production (finalpoint.app), use the API domain for avatars
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'finalpoint.app' || hostname === 'www.finalpoint.app') {
      // Use the API domain for avatars in production
      const url = `https://api.finalpoint.app/uploads/avatars/${avatarPath}`;
      return url;
    }
  }

  // For development, remove /api from the base URL since avatar paths don't include it
  const devBaseUrl = API_BASE_URL.replace('/api', '');
  const url = `${devBaseUrl}/uploads/avatars/${avatarPath}`;
  return url;
};

export const apiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  // Add timeout for better error handling
  timeout: 10000,
});

// Request interceptor to add auth token
apiService.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Add cache-busting headers
    config.headers['Cache-Control'] = 'no-cache';
    config.headers['Pragma'] = 'no-cache';

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiService.interceptors.response.use(
  (response) => {
    // Check if the response contains a new token
    const newToken = response.headers['x-new-token'];
    if (newToken && typeof window !== 'undefined') {
      localStorage.setItem('token', newToken);
    }
    return response;
  },
  async (error) => {
    // Handle 401 errors with automatic redirect
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      // Check if we're on a route that allows logged-out access
      const currentPath = window.location.pathname;
      const limitedAccessRoutes = ['/dashboard', '/leagues', '/picks', '/profile'];
      const isLimitedAccessRoute = limitedAccessRoutes.some(route => currentPath === route);

      // Don't redirect if we're on a limited access route for logged-out users
      if (isLimitedAccessRoute) {
        logger.info('401 error on limited access route, not redirecting');
        return Promise.reject(error);
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Preserve current URL for redirect after login
      const currentPathWithSearch = window.location.pathname + window.location.search;

      // Validate redirect URL to prevent open redirects
      const isValidRedirect = currentPathWithSearch.startsWith('/') &&
        !currentPathWithSearch.startsWith('//') &&
        !currentPathWithSearch.includes('javascript:') &&
        !currentPathWithSearch.includes('data:');

      const redirectPath = isValidRedirect ? currentPathWithSearch : '/dashboard';
      const encodedRedirect = encodeURIComponent(redirectPath);
      window.location.href = `/login?redirect=${encodedRedirect}`;
    }

    // Let all other errors (including 400 login failures) pass through normally
    return Promise.reject(error);
  }
);

// API methods
// Public stats API
export const statsAPI = {
  getDriverPositionStats: (position: number) => apiService.get(`/stats/driver-positions?position=${position}`),
};

export const adminAPI = {
  getAllUsers: () => apiService.get('/admin/users'),
  getAllLeagues: () => apiService.get('/admin/leagues'),
  getLeagueMembers: (leagueId: number) => apiService.get(`/admin/leagues/${leagueId}/members`),
  getUserLeagues: (userId: number) => apiService.get(`/admin/users/${userId}/leagues`),
  updateUserRole: (userId: number, role: string) =>
    apiService.put(`/admin/users/${userId}/role`, { role }),
  getAdminDashboardStats: () => apiService.get('/admin/dashboard-stats'),
  getPositionBreakdownByWeek: (weekNumber: number | null) =>
    apiService.get(`/admin/position-breakdown${weekNumber ? `?weekNumber=${weekNumber}` : ''}`),
  getAvailableRaces: () => apiService.get('/admin/available-races'),
  getAvailableRacesForResults: () => apiService.get('/admin/available-races-for-results'),
  getRaceInfoByWeek: (weekNumber: number) => apiService.get(`/admin/race-info/${weekNumber}`),
  getAvailableLeagues: () => apiService.get('/admin/available-leagues'),
  getRacesWithResultStatus: () => apiService.get('/admin/races-with-result-status'),
  getExistingRaceResults: (weekNumber: number) => apiService.get(`/admin/existing-race-results/${weekNumber}`),
  getLeaguePicksOverview: (weekNumber: number) => apiService.get(`/admin/league-picks-overview?weekNumber=${weekNumber}`),
  getPicksByPositionOverview: (weekNumber: number) => apiService.get(`/admin/picks-by-position-overview?weekNumber=${weekNumber}`),
  getPicksByPositionDetailed: (weekNumber: number) => apiService.get(`/admin/picks-by-position-detailed?weekNumber=${weekNumber}`),
  getUsersWithoutPicks: (weekNumber: number) => apiService.get(`/admin/users-without-picks?weekNumber=${weekNumber}`),
  testNotifications: (data: { userId: number; notificationType: 'email' | 'push' | 'both'; customMessage?: string; templateId?: string; templateFields?: Record<string, string> }) => apiService.post('/admin/test-notifications', data),
  getUserNotificationHistory: (userId: number) => apiService.get(`/admin/users/${userId}/notification-history`),
  getPickLockingStatus: () => apiService.get('/admin/pick-locking-status'),
  updatePickLockingStatus: (data: { enabled: boolean; lockTime: string; unlockTime: string }) => apiService.put('/admin/pick-locking-status', data),
  enterRaceResults: (weekNumber: number, results: Array<{ driverId: number; finishingPosition: number }>) =>
    apiService.post('/admin/enter-race-results', { weekNumber, results }),
  rescoreRaceResults: (weekNumber: number, results: Array<{ driverId: number; finishingPosition: number }>, leagueId?: number, logActivity: boolean = true) =>
    apiService.post('/admin/rescore-race-results', { weekNumber, results, leagueId, logActivity }),
  rescheduleAllPicks: () => apiService.post('/admin/reschedule-all-picks'),
  rescheduleAllReminders: () => apiService.post('/admin/reschedule-all-reminders'),

  // New admin methods for managing picks and league memberships
  addUserToLeague: (leagueId: number, userId: number) =>
    apiService.post(`/admin/leagues/${leagueId}/add-user`, { userId }),
  removeUserFromLeague: (leagueId: number, userId: number) =>
    apiService.delete(`/admin/leagues/${leagueId}/remove-user/${userId}`),
  createUserPick: (userId: number, leagueId: number, weekNumber: number, position: number, driverId: number) =>
    apiService.post(`/admin/users/${userId}/picks`, { leagueId, weekNumber, position, driverId }),
  updateUserPick: (userId: number, leagueId: number, weekNumber: number, position: number, driverId: number) =>
    apiService.put(`/admin/users/${userId}/picks`, { leagueId, weekNumber, position, driverId }),
  deleteUserPick: (userId: number, leagueId: number, weekNumber: number, position: number) =>
    apiService.delete(`/admin/users/${userId}/picks`, { data: { leagueId, weekNumber, position } }),
  getUserPicks: (userId: number, leagueId: number) =>
    apiService.get(`/admin/users/${userId}/picks/${leagueId}`),

  // Feature flags management (unified)
  getUserFeatureFlags: (userId: number) =>
    apiService.get(`/admin/users/${userId}/feature-flags`),
  updateUserFeatureFlags: (userId: number, featureFlags: Record<string, any>) =>
    apiService.put(`/admin/users/${userId}/feature-flags`, { featureFlags }),

  // App versions management
  getAppVersions: () => apiService.get('/app/versions'),
  createAppVersion: (data: {
    version: string;
    platform: 'android' | 'ios';
    android_version_code?: number;
    ios_build_number?: string;
    is_required: boolean;
    release_notes: string;
    update_url?: string;
  }) => apiService.post('/app/versions', data),
};

export const authAPI = {
  signup: (data: SignupData | FormData) => {
    if (data instanceof FormData) {
      return apiService.post('/users/signup', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      return apiService.post('/users/signup', data);
    }
  },
  login: (data: LoginData) => apiService.post('/users/login', data),
  googleAuth: (idToken: string) => apiService.post('/users/google-auth', { idToken }),
  forgotPassword: (data: { email: string }) => apiService.post('/users/forgot-password', data),
  resetPassword: (data: { token: string; newPassword: string }) => apiService.post('/users/reset-password', data),
  getProfile: () => apiService.get('/users/profile'),
  getUserStats: () => apiService.get('/users/stats'),
  getGlobalStats: () => apiService.get('/users/global-stats'),
  getMonthlyStats: () => apiService.get('/users/monthly-stats'),
  updateProfile: (data: { name: string }) => apiService.put('/users/profile', data),
  updateAvatar: (data: FormData) => apiService.put('/users/avatar', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  changePassword: (data: { currentPassword: string; newPassword: string }) => apiService.put('/users/password', data),
  deleteAccount: (data: { password: string }) => apiService.delete('/users/account', { data }),
};

export const leaguesAPI = {
  getLeagues: () => apiService.get('/leagues/get'),
  getPublicLeagues: () => apiService.get('/leagues/public'), // Get only public leagues user is not a member of
  createLeague: (name: string, positions: number[] = [], isPublic: boolean = false) =>
    apiService.post('/leagues/create', { name, positions, isPublic }),
  getLeague: (leagueId: number) => apiService.get(`/leagues/get/${leagueId}`),
  joinLeague: (leagueId: number) => apiService.post(`/leagues/${leagueId}/join`),
  joinByCode: (joinCode: string) => apiService.post('/leagues/join-by-code', { joinCode }),
  getLeagueByCode: (joinCode: string) => apiService.get(`/leagues/code/${joinCode}`),
  getLeagueMembers: (leagueId: number) => apiService.get(`/leagues/${leagueId}/members`),
  getLeagueStandings: (leagueId: number) => apiService.get(`/leagues/${leagueId}/standings`),
  getDetailedLeagueStandings: (leagueId: number) => apiService.get(`/leagues/${leagueId}/standings/detailed`),
  getLeagueStats: (leagueId: number) => apiService.get(`/leagues/${leagueId}/stats`),
  updateLeague: (leagueId: number, name: string, isPublic?: boolean) => apiService.put(`/leagues/${leagueId}`, { name, isPublic }),
  deleteLeague: (leagueId: number) => apiService.delete(`/leagues/${leagueId}`),
  leaveLeague: (leagueId: number) => apiService.post(`/leagues/${leagueId}/leave`),
};

export const picksAPI = {
  // Legacy methods for backward compatibility
  makePick: (leagueId: number, weekNumber: number, driverId: number) =>
    apiService.post('/picks/make', { leagueId, weekNumber, driverId }),
  getUserPicks: (leagueId: number) => apiService.get(`/picks/user/${leagueId}`),
  getLeaguePicks: (leagueId: number, weekNumber: number) =>
    apiService.get(`/picks/league/${leagueId}/week/${weekNumber}`),
  getRaceResults: (leagueId: number, weekNumber: number) =>
    apiService.get(`/picks/results/${leagueId}/week/${weekNumber}`),

  // New V2 methods for multiple position support
  makePickV2: (leagueId: number, weekNumber: number, picks: PickV2[]) =>
    apiService.post('/picks/make-v2', { leagueId, weekNumber, picks }),
  removePickV2: (leagueId: number, weekNumber: number, position: number) =>
    apiService.post('/picks/remove-v2', { leagueId, weekNumber, position }),
  getUserPicksV2: (leagueId: number) => apiService.get(`/picks/user/${leagueId}/v2`),
  getLeaguePicksV2: (leagueId: number, weekNumber: number) =>
    apiService.get(`/picks/league/${leagueId}/week/${weekNumber}/v2`),
  getRaceResultsV2: (leagueId: number, weekNumber: number) =>
    apiService.get(`/picks/results/${leagueId}/week/${weekNumber}/v2`),

  // New V2 result views
  getResultsByPositionV2: (leagueId: number, weekNumber: number, position: number) =>
    apiService.get(`/picks/results/${leagueId}/week/${weekNumber}/position/${position}/v2`),
  getMemberPicksV2: (leagueId: number, weekNumber: number, userId: number) =>
    apiService.get(`/picks/results/${leagueId}/week/${weekNumber}/member/${userId}/v2`),

  // League position management
  getLeaguePositions: (leagueId: number) => apiService.get(`/picks/league/${leagueId}/positions`),
  updateLeaguePositions: (leagueId: number, positions: number[]) =>
    apiService.put(`/picks/league/${leagueId}/positions`, { positions }),

  // League position history
  getLeaguePositionHistory: (leagueId: number) => apiService.get(`/picks/league/${leagueId}/positions/history`),
  getLeaguePositionsForWeek: (leagueId: number, weekNumber: number) =>
    apiService.get(`/picks/league/${leagueId}/positions/week/${weekNumber}`),
};

export const driversAPI = {
  getDrivers: () => apiService.get('/drivers/get'),
  // Admin endpoints
  getAllDriversAdmin: () => apiService.get('/drivers/admin/all'),
  getDriversByStatusAdmin: (status: 'active' | 'inactive') => apiService.get(`/drivers/admin/status/${status}`),
  getDriverAdmin: (driverId: number) => apiService.get(`/drivers/admin/${driverId}`),
  createDriverAdmin: (driverData: {
    name: string;
    team: string;
    driverNumber: number;
    country: string;
    isActive: boolean;
    seasonYear: number;
  }) => apiService.post('/drivers/admin', driverData),
  updateDriverStatusAdmin: (driverId: number, isActive: boolean) =>
    apiService.put(`/drivers/admin/${driverId}/status`, { isActive }),
  updateDriverAdmin: (driverId: number, driverData: {
    name: string;
    team: string;
    driverNumber: number;
    country: string;
    isActive: boolean;
  }) => apiService.put(`/drivers/admin/${driverId}`, driverData),
};

export const f1racesAPI = {
  getCurrentRace: () => apiService.get('/f1races/current'),
  getAllRaces: (seasonYear = 2025) => apiService.get(`/f1races/all?seasonYear=${seasonYear}`),
  getRaceByWeek: (weekNumber: number, seasonYear = 2025) =>
    apiService.get(`/f1races/week/${weekNumber}?seasonYear=${seasonYear}`),
  populateSeason: () => apiService.post('/f1races/populate-season'),
};

export const activityAPI = {
  getLeagueActivity: (leagueId: number, limit = 20) =>
    apiService.get(`/activity/league/${leagueId}?limit=${limit}`),
  getRecentActivity: (leagueId: number, limit = 10) =>
    apiService.get(`/activity/league/${leagueId}/recent?limit=${limit}`),
};

export const notificationsAPI = {
  getPreferences: () => apiService.get('/notifications/preferences'),
  updatePreferences: (preferences: NotificationPreferences) =>
    apiService.put('/notifications/preferences', preferences),
  registerPushToken: (token: string, platform: 'web' | 'ios' | 'android') =>
    apiService.post('/notifications/push-token', { token, platform }),
  unregisterPushToken: (token: string) =>
    apiService.delete('/notifications/push-token', { data: { token } }),
  getHistory: (page = 1, limit = 20) =>
    apiService.get(`/notifications/history?page=${page}&limit=${limit}`),
  testEmail: () => apiService.post('/notifications/test', { type: 'email' }),
  testPush: () => apiService.post('/notifications/test', { type: 'push' }),
};

export const chatAPI = {
  validateAccess: (leagueId: number) => apiService.get(`/chat/validate/${leagueId}`),
  sendMessage: (leagueId: number, text: string, channelId?: string) =>
    apiService.post('/chat/send', { leagueId, text, channelId }),
  getMessages: (leagueId: number, channelId?: string, limit?: number) =>
    apiService.get('/chat/messages', { params: { leagueId, channelId, limit } }),
  markMessagesAsRead: (leagueId: number) => apiService.post(`/chat/mark-read/${leagueId}`),
  getUnreadCount: (leagueId: number) => apiService.get(`/chat/unread-count/${leagueId}`),
  getAllUnreadCounts: () => apiService.get('/chat/unread-counts'),
  getNotificationPreferences: (leagueId: number) => apiService.get(`/chat/notification-preferences/${leagueId}`),
  updateNotificationPreferences: (leagueId: number, notificationsEnabled: boolean) =>
    apiService.put(`/chat/notification-preferences/${leagueId}`, { notificationsEnabled }),
  getAllNotificationPreferences: () => apiService.get('/chat/notification-preferences'),
  getOnlineUsers: (leagueId: number) => apiService.get(`/chat/online-users/${leagueId}`),
  updateStatus: (isOnline: boolean) => apiService.post('/chat/update-status', { isOnline }),
};

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  role?: 'user' | 'admin';
  chatFeatureEnabled?: boolean;
  positionChangesEnabled?: boolean;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface League {
  id: number;
  name: string;
  ownerId: number;
  seasonYear: number;
  joinCode?: string;
  memberCount?: number;
  isMember?: boolean;
  userRole?: 'Owner' | 'Member';
  requiredPositions?: number[];
  isPublic?: boolean;
  seasonActivity?: number;
  lastTwoRaceWeeksActivity?: number;
  seasonPicks?: number;
  lastTwoRaceWeeksPicks?: number;
  totalPicks?: number;
  totalActivity?: number;
  activityScore?: number;
  positionStatus?: PositionStatus;
}

// Position status types for efficient pick status
export interface PositionStatus {
  weekNumber: number;
  positions: PositionPickStatus[];
}

export interface PositionPickStatus {
  position: number;
  hasPick: boolean;
}

export interface Driver {
  id: number;
  name: string;
  team: string;
  driverNumber: number;
  country: string;
  isActive?: boolean;
}

export interface Pick {
  id: number;
  leagueId: number;
  weekNumber: number;
  driverId: number;
  driverName: string;
  isLocked: boolean;
  points: number;
}

// New types for V2 multiple position support
export interface PickV2 {
  position: number;
  driverId: number;
}

export interface UserPickV2 {
  id: number;
  leagueId: number;
  userId: number;
  weekNumber: number;
  position: number;
  driverId: number;
  driverName: string;
  driverTeam: string;
  isLocked: boolean;
  isScored: boolean;
  points: number;
}

export interface RaceResultV2 {
  userId: number;
  userName: string;
  userAvatar?: string;
  picks: {
    position: number;
    driverId: number | null;
    driverName: string | null;
    driverTeam: string | null;
    actualDriverId: number;
    actualDriverName: string;
    actualDriverTeam: string;
    positionDifference: number | null;
    isCorrect: boolean;
    points: number;
  }[];
  totalPoints: number;
  totalCorrect: number;
  hasMadeAllPicks: boolean;
}

// New interfaces for V2 result views
export interface PositionResultV2 {
  leagueId: number;
  weekNumber: number;
  position: number;
  picks: {
    userId: number;
    userName: string;
    userAvatar?: string;
    driverId: number;
    driverName: string;
    driverTeam: string;
    position: number;
    isCorrect: boolean | null;
    points: number | null;
    actualDriverId: number | null;
    actualDriverName: string | null;
    actualDriverTeam: string | null;
    actualFinishPosition: number | null;
  }[];
  actualResult: {
    driverId: number;
    driverName: string;
    driverTeam: string;
  } | null;
  totalParticipants: number;
  correctPicks: number;
}

export interface MemberPicksV2 {
  leagueId: number;
  weekNumber: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  picks: {
    position: number;
    driverId: number;
    driverName: string;
    driverTeam: string;
    isCorrect: boolean | null;
    points: number | null;
    actualDriverId: number | null;
    actualDriverName: string | null;
    actualDriverTeam: string | null;
    actualFinishPosition: number | null;
  }[];
  totalPoints: number;
  correctPicks: number;
  totalPicks: number;
  accuracy: string;
}

export interface LeaguePicksOverview {
  leagueId: number;
  leagueName: string;
  requiredPositions: number[];
  positions: {
    position: number;
    totalPicks: number;
    picksSummary: string;
  }[];
}

export interface PicksByPositionOverview {
  position: number;
  totalPicks: number;
  picksSummary: string;
  leaguesInvolved: string;
}

export interface PicksByPositionDetailed {
  position: number;
  totalPicks: number;
  drivers: {
    driverId: number;
    driverName: string;
    driverTeam: string;
    pickCount: number;
    percentage: number;
  }[];
}

export interface NotificationPreferences {
  emailReminders: boolean;
  emailScoreUpdates: boolean;
  pushReminders: boolean;
  pushScoreUpdates: boolean;
  pushChatMessages: boolean;
  emailReminder5Days: boolean;
  emailReminder3Days: boolean;
  emailReminder1Day: boolean;
  emailReminder1Hour: boolean;
  pushReminder5Days: boolean;
  pushReminder3Days: boolean;
  pushReminder1Day: boolean;
  pushReminder1Hour: boolean;
  emailOther: boolean;
  pushOther: boolean;
}

// Activity interface for league activities
export interface Activity {
  id: number;
  leagueId: number;
  userId: number;
  activityType: string;
  weekNumber: number | null;
  driverId: number | null;
  driverName: string | null;
  driverTeam: string | null;
  previousDriverId: number | null;
  previousDriverName: string | null;
  previousDriverTeam: string | null;
  position: number | null;
  raceName: string | null;
  userName: string | null;
  userAvatar: string | null;
  leagueName: string | null;
  createdAt: string;
  // New fields for formatted messages from backend
  primaryMessage?: string;
  secondaryMessage?: string;
  // New field for flexible activity data
  activityData?: string;
} 
