'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import logger from '@/utils/logger';

// Type for axios error responses
interface AxiosError {
  response?: {
    data?: {
      errors?: Array<{ reason: string; message: string }>;
      message?: string;
    };
  };
  message?: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  role?: 'user' | 'admin';
  chatFeatureEnabled?: boolean;
  positionChangesEnabled?: boolean;
}

interface AuthResponse {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginError: string | null;
  signupError: string | null;
  loginFormData: { email: string; password: string };
  signupFormData: { name: string; email: string; password: string; confirmPassword: string };
  setLoginFormData: (data: { email: string; password: string }) => void;
  setSignupFormData: (data: { name: string; email: string; password: string; confirmPassword: string }) => void;
  clearLoginError: () => void;
  clearSignupError: () => void;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (email: string, password: string, name: string, avatar?: File) => Promise<AuthResponse>;
  loginWithGoogle: (idToken: string) => Promise<AuthResponse>;
  logout: () => void;
  updateProfile: (name: string) => Promise<boolean>;
  updateAvatar: (avatar: File) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  refreshUserData: () => Promise<boolean>;
  deleteAccount: (password: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<AuthResponse>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [loginFormData, setLoginFormData] = useState<{ email: string; password: string }>({ email: '', password: '' });
  const [signupFormData, setSignupFormData] = useState<{ name: string; email: string; password: string; confirmPassword: string }>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        setUser(userData);

        // Try to refresh user data from API to get latest feature flags
        try {
          await refreshUserData();
        } catch (refreshError) {
          console.log('⚠️ AuthContext: Error refreshing user data, using cached data:', refreshError);
        }

        // Initialize WebSocket connection for existing authenticated users
        try {
          const { SecureChatService } = await import('../services/secureChatService');
          SecureChatService.updateWebSocketToken(storedToken);
          await SecureChatService.initializeWebSocket();
        } catch (wsError) {
          logger.error('Could not initialize WebSocket for existing user:', wsError);
          // Don't fail auth initialization if WebSocket initialization fails
        }

        // Initialize push notification refresh for existing authenticated users
        try {
          const { notificationRefreshService } = await import('../services/notificationRefreshService');
          await notificationRefreshService.initialize();
        } catch (notificationError) {
          logger.error('Could not initialize push notification refresh:', notificationError);
          // Don't fail auth initialization if notification initialization fails
        }
      } else {
        logger.info('AuthContext: No stored user or token found');
      }
    } catch (error) {
      logger.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      setLoginError(null); // Clear any previous login error

      const response = await authAPI.login({ email, password });

      if (response.data.success) {
        const userData = response.data.user;
        logger.info('User login successful:', { email: userData.email, id: userData.id });
        // Example of force logging - this will always show even in production
        logger.forceInfo('🔐 User authentication completed - This message will always show');
        // Don't strip the avatar path - the backend returns the correct format
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.token);

        // Initialize WebSocket connection for chat
        try {
          const { SecureChatService } = await import('../services/secureChatService');
          SecureChatService.updateWebSocketToken(response.data.token);
          await SecureChatService.initializeWebSocket();
        } catch (wsError) {
          logger.error('Could not initialize WebSocket after login:', wsError);
          // Don't fail login if WebSocket initialization fails
        }

        // Initialize push notification refresh after login
        try {
          const { notificationRefreshService } = await import('../services/notificationRefreshService');
          await notificationRefreshService.initialize();
        } catch (notificationError) {
          console.error('Could not initialize push notification refresh after login:', notificationError);
          // Don't fail login if notification initialization fails
        }

        setLoginError(null); // Clear any error on success
        setLoginFormData({ email: '', password: '' }); // Clear form data on success
        return { success: true };
      }
      return { success: false, error: 'You have entered an invalid email or password' };
    } catch (error: unknown) {
      console.error('Login error:', error);

      // Extract error message from API response
      let errorMessage = 'You have entered an invalid email or password';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data?.errors && axiosError.response.data.errors.length > 0) {
          // Handle ErrorClass format from backend
          const firstError = axiosError.response.data.errors[0];
          errorMessage = firstError.message || 'You have entered an invalid email or password';
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      }

      setLoginError(errorMessage); // Store error in context
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const clearLoginError = () => {
    setLoginError(null);
  };

  const clearSignupError = () => {
    setSignupError(null);
  };

  const signup = async (email: string, password: string, name: string, avatar?: File): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      setSignupError(null); // Clear any previous signup error

      const data: any = { email, password, name };

      if (avatar) {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('name', name);
        formData.append('avatar', avatar);

        const response = await authAPI.signup(formData);

        if (response.data.success) {
          const userData = response.data.user;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', response.data.token);

          setSignupError(null); // Clear any error on success
          setSignupFormData({ name: '', email: '', password: '', confirmPassword: '' }); // Clear form data on success
          return { success: true };
        }
        return { success: false, error: 'Failed to create account. Please try again.' };
      } else {
        const response = await authAPI.signup(data);

        if (response.data.success) {
          const userData = response.data.user;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', response.data.token);

          setSignupError(null); // Clear any error on success
          setSignupFormData({ name: '', email: '', password: '', confirmPassword: '' }); // Clear form data on success
          return { success: true };
        }
        return { success: false, error: 'Failed to create account. Please try again.' };
      }
    } catch (error: any) {
      console.error('Signup error:', error);

      // Extract error message from API response
      let errorMessage = 'Failed to create account. Please try again.';

      if (error?.response?.data?.errors?.length > 0) {
        // Handle ErrorClass format from backend
        const backendError = error.response.data.errors[0].message;

        if (backendError === 'Username already taken') {
          errorMessage = 'Username already taken. Please choose a different username.';
        } else if (backendError === 'User already exists') {
          errorMessage = 'Email already registered. Please use a different email or sign in.';
        } else if (backendError.includes('Password must')) {
          errorMessage = backendError; // Show specific password validation error from backend
        } else {
          errorMessage = backendError;
        }
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setSignupError(errorMessage); // Store error in context
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authAPI.googleAuth(idToken);
      if (response.data.success) {
        const userData = response.data.user;
        // Don't strip the avatar path - the backend returns the correct format
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.token);

        // Initialize WebSocket connection for chat
        try {
          const { SecureChatService } = await import('../services/secureChatService');
          SecureChatService.updateWebSocketToken(response.data.token);
          await SecureChatService.initializeWebSocket();
        } catch (wsError) {
          console.error('Could not initialize WebSocket after Google login:', wsError);
          // Don't fail login if WebSocket initialization fails
        }

        return { success: true };
      }
      return { success: false, error: 'Failed to sign in with Google. Please try again.' };
    } catch (error: any) {
      console.error('Google login error:', error);
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      if (error?.response?.data?.errors?.length > 0) {
        errorMessage = error.response.data.errors[0].message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Disconnect WebSocket connection
    try {
      const { SecureChatService } = await import('../services/secureChatService');
      SecureChatService.disconnectWebSocket();
    } catch (wsError) {
      console.error('Could not disconnect WebSocket on logout:', wsError);
    }

    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateProfile = async (name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.updateProfile({ name });
      if (response.data.success && user) {
        // Update the user state with the new name
        const updatedUser = { ...user, name };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Update profile error:', error);

      // Extract error message from API response
      let errorMessage = 'Failed to update profile. Please try again.';

      if (error?.response?.data?.errors?.length > 0) {
        errorMessage = error.response.data.errors[0].message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      console.error('Update profile error details:', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAvatar = async (avatar: File): Promise<boolean> => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('avatar', avatar);

      const response = await authAPI.updateAvatar(formData);
      if (response.data.success && user) {
        // Don't strip the avatar path - the backend returns the correct format
        const avatarUrl = response.data.avatar;
        const updatedUser = { ...user, avatar: avatarUrl };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Update avatar error:', error);

      // Extract error message from API response
      let errorMessage = 'Failed to update avatar. Please try again.';

      if (error?.response?.data?.errors?.length > 0) {
        errorMessage = error.response.data.errors[0].message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      console.error('Update avatar error details:', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.changePassword({ currentPassword, newPassword });
      if (response.data.success) {
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Change password error:', error);

      // Extract error message from API response
      let errorMessage = 'Failed to change password. Please try again.';

      if (error?.response?.data?.errors?.length > 0) {
        errorMessage = error.response.data.errors[0].message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      // For now, we'll just log the error since this function returns boolean
      // In the future, we might want to modify the interface to return error messages
      console.error('Change password error details:', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getProfile();
      if (response.data.success && response.data.data) {
        const userData = response.data.data;

        // Don't strip the avatar path - the backend returns the correct format
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Refresh user data error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.deleteAccount({ password });
      if (response.data.success) {
        // Clear user data and redirect to login
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Delete account error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authAPI.forgotPassword({ email });

      if (response.data.success) {
        return { success: true };
      }
      return { success: false, error: 'Failed to send password reset email. Please try again.' };
    } catch (error: any) {
      console.error('Forgot password error:', error);

      let errorMessage = 'Failed to send password reset email. Please try again.';

      if (error?.response?.data?.errors?.length > 0) {
        errorMessage = error.response.data.errors[0].message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authAPI.resetPassword({ token, newPassword });

      if (response.data.success) {
        return { success: true };
      }
      return { success: false, error: 'Failed to reset password. Please try again.' };
    } catch (error: any) {
      console.error('Reset password error:', error);

      let errorMessage = 'Failed to reset password. Please try again.';

      if (error?.response?.data?.errors?.length > 0) {
        errorMessage = error.response.data.errors[0].message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    loginError,
    signupError,
    loginFormData,
    signupFormData,
    setLoginFormData,
    setSignupFormData,
    clearLoginError,
    clearSignupError,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateProfile,
    updateAvatar,
    changePassword,
    refreshUserData,
    deleteAccount,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 