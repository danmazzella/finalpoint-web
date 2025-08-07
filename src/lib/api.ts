import axios from 'axios';

// API URL configuration
const getApiBaseUrl = () => {
  // Check for environment variable first
  if (process.env.NEXT_PUBLIC_API_URL) {
    console.log('🔧 Using NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    // Ensure the URL ends with /api if it doesn't already
    const url = process.env.NEXT_PUBLIC_API_URL;
    if (!url.endsWith('/api')) {
      console.log('🔧 Adding /api to URL');
      return url.endsWith('/') ? url + 'api' : url + '/api';
    }
    return url;
  }

  // Check if we're in production (deployed to finalpoint.app)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    console.log('🔧 Current hostname:', hostname);
    if (hostname === 'finalpoint.app' || hostname === 'www.finalpoint.app') {
      console.log('🔧 Using production API URL');
      return 'https://api.finalpoint.app/api';
    }
  }

  // Fallback to development URL
  console.log('🔧 Using development API URL');
  return 'http://192.168.0.15:6075/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log('🔧 Final API Base URL:', API_BASE_URL);

// Helper function to get full avatar URL
export const getAvatarUrl = (avatarPath: string | null | undefined): string | null => {
  console.log('🔧 getAvatarUrl called with:', avatarPath, 'type:', typeof avatarPath);

  // Handle null, undefined, empty string, or the string "null"
  if (!avatarPath || avatarPath === 'null' || avatarPath.trim() === '') {
    console.log('🔧 getAvatarUrl returning null for:', avatarPath);
    return null;
  }

  // If it's already a full URL, return as is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    console.log('🔧 getAvatarUrl returning full URL:', avatarPath);
    return avatarPath;
  }

  // For production (finalpoint.app), use the API domain for avatars
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'finalpoint.app' || hostname === 'www.finalpoint.app') {
      // Use the API domain for avatars in production
      const url = `https://api.finalpoint.app/uploads/avatars/${avatarPath}`;
      console.log('🔧 getAvatarUrl returning production URL:', url);
      return url;
    }
  }

  // For development, remove /api from the base URL since avatar paths don't include it
  const baseUrl = API_BASE_URL.replace('/api', '');
  const url = `${baseUrl}/uploads/avatars/${avatarPath}`;
  console.log('🔧 getAvatarUrl returning development URL:', url);
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

    console.log('🔧 Making request to:', config.url);
    console.log('🔧 Full URL:', (config.baseURL || '') + (config.url || ''));
    console.log('🔧 Request method:', config.method);
    console.log('🔧 Request headers:', config.headers);
    console.log('🔧 Request data:', config.data);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only handle 401 errors with automatic redirect
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      console.log('🔧 401 error - removing auth and redirecting');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Let all other errors (including 400 login failures) pass through normally
    return Promise.reject(error);
  }
);

// API methods
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
};

export const leaguesAPI = {
  getLeagues: () => apiService.get('/leagues/get'),
  createLeague: (name: string, positions: number[] = []) => apiService.post('/leagues/create', { name, positions }),
  getLeague: (leagueId: number) => apiService.get(`/leagues/get/${leagueId}`),
  joinLeague: (leagueId: number) => apiService.post(`/leagues/${leagueId}/join`),
  joinByCode: (joinCode: string) => apiService.post('/leagues/join-by-code', { joinCode }),
  getLeagueByCode: (joinCode: string) => apiService.get(`/leagues/code/${joinCode}`),
  getLeagueMembers: (leagueId: number) => apiService.get(`/leagues/${leagueId}/members`),
  getLeagueStandings: (leagueId: number) => apiService.get(`/leagues/${leagueId}/standings`),
  getDetailedLeagueStandings: (leagueId: number) => apiService.get(`/leagues/${leagueId}/standings/detailed`),
  getLeagueStats: (leagueId: number) => apiService.get(`/leagues/${leagueId}/stats`),
  updateLeague: (leagueId: number, name: string) => apiService.put(`/leagues/${leagueId}`, { name }),
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
};

export const driversAPI = {
  getDrivers: () => apiService.get('/drivers/get'),
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

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
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
}

export interface Driver {
  id: number;
  name: string;
  team: string;
  driverNumber: number;
  country: string;
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

export interface NotificationPreferences {
  emailReminders: boolean;
  emailScoreUpdates: boolean;
  pushReminders: boolean;
  pushScoreUpdates: boolean;
} 
