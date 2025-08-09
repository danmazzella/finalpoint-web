'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  role?: 'user' | 'admin';
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
  logout: () => void;
  updateProfile: (name: string) => Promise<boolean>;
  updateAvatar: (avatar: File) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  refreshUserData: () => Promise<boolean>;
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

  const loadStoredUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
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
        // Extract filename from avatar URL if present
        if (userData.avatar) {
          userData.avatar = userData.avatar.split('/').pop();
        }
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.token);
        setLoginError(null); // Clear any error on success
        setLoginFormData({ email: '', password: '' }); // Clear form data on success
        return { success: true };
      }
      return { success: false, error: 'You have entered an invalid email or password' };
    } catch (error: any) {
      console.error('Login error:', error);

      // Extract error message from API response
      let errorMessage = 'You have entered an invalid email or password';

      if (error?.response?.data?.errors?.length > 0) {
        // Handle ErrorClass format from backend - but use generic message for security
        errorMessage = 'You have entered an invalid email or password';
      } else if (error?.response?.data?.message) {
        errorMessage = 'You have entered an invalid email or password';
      } else if (error?.message) {
        errorMessage = 'You have entered an invalid email or password';
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
          // Extract filename from avatar URL if present
          if (userData.avatar) {
            userData.avatar = userData.avatar.split('/').pop();
          }
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

  const logout = () => {
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
    } catch (error) {
      console.error('Update profile error:', error);
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
        // Extract filename from the backend response URL
        // Backend returns "/uploads/avatars/filename.jpg", we want just "filename.jpg"
        const avatarUrl = response.data.avatar;
        const filename = avatarUrl ? avatarUrl.split('/').pop() : null;

        const updatedUser = { ...user, avatar: filename };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update avatar error:', error);
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
    } catch (error) {
      console.error('Change password error:', error);
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
        if (userData.avatar) {
          userData.avatar = userData.avatar.split('/').pop();
        }
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
    logout,
    updateProfile,
    updateAvatar,
    changePassword,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 