'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';
import { CONTACT_EMAIL } from '@/lib/environment';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Avatar from '@/components/Avatar';
import PasswordStrengthIndicator, { validatePasswordComplexity } from '@/components/PasswordStrengthIndicator';
import { authAPI } from '@/lib/api';

export default function ProfilePage() {
  const { user, logout, updateProfile, changePassword, updateAvatar, refreshUserData } = useAuth();
  const { showToast } = useToast();
  const { resolvedTheme, toggleTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  // Debug theme values
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile avatar state - fetched directly from API
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true);

  // Edit Profile Form State
  const [editName, setEditName] = useState(user?.name || '');

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Avatar Upload State
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile data directly from API when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoadingAvatar(true);
        const response = await authAPI.getProfile();
        if (response.data.success && response.data.data) {
          setProfileAvatar(response.data.data.avatar);
          setEditName(response.data.data.name || '');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoadingAvatar(false);
      }
    };

    fetchProfileData();
  }, []);

  // Show login prompt for logged-out users
  if (!user) {
    return (
      <div className="page-bg min-h-screen">
        <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="glass-card p-8 text-center max-w-md mx-auto mt-10">
            <svg className="mx-auto h-14 w-14 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Profile Page</h1>
            <p className="text-sm text-gray-500 mb-6">Sign up or log in to manage your account settings, avatar, and preferences.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/login" className="btn-ghost py-2 px-6 text-sm">Log In</Link>
              <Link href="/signup" className="btn-primary py-2 px-6 text-sm">Sign Up</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      // Redirect to root page after logout
      window.location.href = '/';
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setAvatar(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAvatarUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatar) {
      setError('Please select an image to upload');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const success = await updateAvatar(avatar);
      if (success) {
        setSuccess('Avatar updated successfully!');
        showToast('Avatar updated successfully!', 'success');

        // Refresh user data from API to get the updated avatar
        await refreshUserData();

        // Also update the local profile avatar state
        const response = await authAPI.getProfile();

        if (response.data.success && response.data.data) {
          setProfileAvatar(response.data.data.avatar);
        }

        setShowAvatarUpload(false);
        setAvatar(null);
        setAvatarPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError('Failed to update avatar. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const success = await updateProfile(editName.trim());
      if (success) {
        setSuccess('Profile updated successfully!');
        setShowEditProfile(false);

        // Refresh profile data from API
        const response = await authAPI.getProfile();

        if (response.data.success && response.data.data) {
          setProfileAvatar(response.data.data.avatar);
          setEditName(response.data.data.name || '');
        }
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
        if (axiosError.response?.data?.errors?.some((e) => e.message === 'Username already taken')) {
          setError('Username already taken. Please choose a different username.');
        } else {
          setError('An error occurred. Please try again.');
        }
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    // Validate password complexity
    const passwordValidation = validatePasswordComplexity(newPassword);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0]);
      return;
    }

    setIsLoading(true);

    try {
      const success = await changePassword(currentPassword, newPassword);
      if (success) {
        setSuccess('Password changed successfully!');
        setShowChangePassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError('Failed to change password. Please check your current password.');
      }
    } catch (error: unknown) {
      console.error('Change password error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSettings = () => {
    router.push(`/notifications?redirect=${encodeURIComponent(redirectTo)}`);
  };

  const chevron = (
    <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className="page-bg min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 flex items-start gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3 animate-scale-in">
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-700 font-medium">{success}</p>
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-scale-in">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Profile Header */}
          <div className="glass-card p-6 mb-4 animate-fade-in-up">
            <div className="flex items-center gap-4">
              {isLoadingAvatar ? (
                <div className="w-16 h-16 rounded-full skeleton flex-shrink-0" />
              ) : (
                <Avatar
                  src={profileAvatar || user?.avatar}
                  alt={`${user?.name}'s avatar`}
                  size="lg"
                  className="flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-900 truncate">{user?.name}</h2>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="glass-card mb-4 overflow-hidden animate-fade-in-up" style={{ animationDelay: '60ms' }}>
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Account Settings</h3>
            </div>
            <div className="divide-y divide-gray-100">
              <button onClick={() => setShowAvatarUpload(true)} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50/80 transition-colors text-left">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Update Avatar</p>
                  <p className="text-xs text-gray-500">Change your profile picture</p>
                </div>
                {chevron}
              </button>

              <button onClick={() => setShowEditProfile(true)} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50/80 transition-colors text-left">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Edit Profile</p>
                  <p className="text-xs text-gray-500">Update your username</p>
                </div>
                {chevron}
              </button>

              <button onClick={() => setShowChangePassword(true)} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50/80 transition-colors text-left">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Change Password</p>
                  <p className="text-xs text-gray-500">Update your password</p>
                </div>
                {chevron}
              </button>

              <button onClick={handleNotificationSettings} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50/80 transition-colors text-left">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Notification Settings</p>
                  <p className="text-xs text-gray-500">Manage email and push notifications</p>
                </div>
                {chevron}
              </button>

              {/* Theme Toggle */}
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Theme</p>
                  <p className="text-xs text-gray-500">Switch between light and dark mode</p>
                </div>
                <div
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${resolvedTheme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'}`}
                  onClick={toggleTheme}
                >
                  <input type="checkbox" className="sr-only" checked={resolvedTheme === 'dark'} readOnly />
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${resolvedTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </div>

              <Link href="/profile/delete-account" className="flex items-center gap-3 px-5 py-4 hover:bg-red-50/60 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-700">Delete Account</p>
                  <p className="text-xs text-red-400">Permanently delete your account</p>
                </div>
                <svg className="h-4 w-4 text-red-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>

          {/* App Information */}
          <div className="glass-card mb-4 overflow-hidden animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">App Information</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { href: 'https://finalpoint.app/info', label: 'About FinalPoint', sub: 'Learn more about the app', external: true },
                { href: `/privacy?redirect=${encodeURIComponent(redirectTo)}`, label: 'Privacy Policy', sub: 'Read our privacy policy' },
                { href: `/terms?redirect=${encodeURIComponent(redirectTo)}`, label: 'Terms of Service', sub: 'Read our terms of service' },
                { href: `/scoring?redirect=${encodeURIComponent(redirectTo)}`, label: 'Scoring System', sub: 'Learn how points are calculated' },
              ].map(({ href, label, sub, external }) => (
                external ? (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/80 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{sub}</p>
                    </div>
                    {chevron}
                  </a>
                ) : (
                  <Link key={label} href={href} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/80 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{sub}</p>
                    </div>
                    {chevron}
                  </Link>
                )
              ))}
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=FinalPoint%20Support%20Request`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/80 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Help & Support</p>
                  <p className="text-xs text-gray-500">Get help and support</p>
                </div>
                {chevron}
              </a>
            </div>
          </div>

          {/* Logout */}
          <div className="animate-fade-in-up" style={{ animationDelay: '180ms' }}>
            <button onClick={handleLogout} className="btn-ghost w-full py-3 text-sm text-red-600 border-red-200 hover:bg-red-50">
              Sign Out
            </button>
          </div>

          {/* App Version */}
          <div className="text-center mt-6 mb-4">
            <p className="text-xs text-gray-400">FinalPoint v1.0.0 · F1 Prediction Game</p>
          </div>
        </div>
      </main>

      {/* Avatar Upload Modal */}
      {showAvatarUpload && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-16 px-4">
          <div className="glass-card w-full max-w-sm p-6 animate-fade-in-up">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Update Avatar</h3>
            <form onSubmit={handleAvatarUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <Avatar
                    src={avatarPreview || profileAvatar || user?.avatar}
                    alt="Avatar preview"
                    size="lg"
                    className="flex-shrink-0"
                  />
                  <div className="flex gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" id="avatar-upload-profile" />
                    <label htmlFor="avatar-upload-profile" className="btn-ghost text-sm py-1.5 px-3 cursor-pointer">Choose Image</label>
                    {avatar && (
                      <button type="button" onClick={handleRemoveAvatar} className="btn-danger text-sm py-1.5 px-3">Remove</button>
                    )}
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-gray-400">JPEG, PNG, GIF, or WebP. Max 5MB.</p>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowAvatarUpload(false); setAvatar(null); setAvatarPreview(null); setError(''); setSuccess(''); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="btn-ghost flex-1 py-2.5 text-sm">Cancel</button>
                <button type="submit" disabled={isLoading || !avatar} className="btn-primary flex-1 py-2.5 text-sm">
                  {isLoading ? 'Uploading…' : 'Upload Avatar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-16 px-4">
          <div className="glass-card w-full max-w-sm p-6 animate-fade-in-up">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Edit Profile</h3>
            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Username</label>
                <input
                  type="text"
                  id="name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field"
                  required
                  minLength={2}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowEditProfile(false); setEditName(user?.name || ''); setError(''); setSuccess(''); }} className="btn-ghost flex-1 py-2.5 text-sm">Cancel</button>
                <button type="submit" disabled={isLoading} className="btn-primary flex-1 py-2.5 text-sm">
                  {isLoading ? 'Updating…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-16 px-4">
          <div className="glass-card w-full max-w-sm p-6 animate-fade-in-up">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Current Password</label>
                <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
                <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" required minLength={6} />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" required minLength={6} />
              </div>
              <PasswordStrengthIndicator password={newPassword} />
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowChangePassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setError(''); setSuccess(''); }} className="btn-ghost flex-1 py-2.5 text-sm">Cancel</button>
                <button type="submit" disabled={isLoading} className="btn-primary flex-1 py-2.5 text-sm">
                  {isLoading ? 'Changing…' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
} 