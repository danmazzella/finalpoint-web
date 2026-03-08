'use client';

import { useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import Avatar from '@/components/Avatar';
import PasswordStrengthIndicator, { validatePasswordComplexity } from '@/components/PasswordStrengthIndicator';

function SignupForm() {
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');
  const {
    signup,
    isLoading,
    signupError,
    signupFormData,
    setSignupFormData,
    clearSignupError
  } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { name, email, password, confirmPassword } = signupFormData;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setValidationError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setValidationError('File size must be less than 5MB');
        return;
      }

      setAvatar(file);
      setValidationError('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous errors
    clearSignupError();
    setValidationError('');

    if (!name || !email || !password || !confirmPassword) {
      setValidationError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    // Validate password complexity
    const passwordValidation = validatePasswordComplexity(password);
    if (!passwordValidation.isValid) {
      setValidationError(passwordValidation.errors[0]);
      return;
    }

    try {
      const result = await signup(email, password, name, avatar || undefined);
      if (result.success) {
        router.push(redirectTo);
      }
      // Error handling is done in the AuthContext
    } catch (error) {
      console.error('Unexpected error in handleSubmit:', error);
    }
  };

  return (
    <div className="page-bg min-h-screen flex flex-col justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-[420px] mx-auto animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo className="w-20 h-20 drop-shadow-lg" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">FinalPoint</h1>
          <p className="text-sm text-gray-500">F1 Prediction Game</p>
        </div>

        {/* Card */}
        <div className="glass-card px-8 py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Create your account</h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Avatar Upload Section */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Profile Picture <span className="normal-case font-normal">(optional)</span>
              </label>
              <div className="flex items-center gap-4">
                <Avatar
                  src={avatarPreview}
                  alt="Avatar preview"
                  size="lg"
                  className="flex-shrink-0"
                />
                <div className="flex-1 flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="btn-ghost text-sm py-1.5 px-3 cursor-pointer"
                  >
                    Choose Image
                  </label>
                  {avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="btn-danger text-sm py-1.5 px-3"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-1.5 text-xs text-gray-400">JPEG, PNG, GIF, or WebP. Max 5MB.</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setSignupFormData({ ...signupFormData, name: e.target.value })}
                placeholder="No spaces"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setSignupFormData({ ...signupFormData, email: e.target.value })}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setSignupFormData({ ...signupFormData, password: e.target.value })}
                placeholder="••••••••"
                className="input-field"
              />
              <PasswordStrengthIndicator password={password} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setSignupFormData({ ...signupFormData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            {(signupError || validationError) && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-scale-in">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{signupError || validationError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2.5 text-sm"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </>
              ) : 'Create account'}
            </button>
          </form>

          <div className="mt-6">
            <div className="divider-text my-5">already have an account?</div>
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
              className="btn-secondary w-full py-2.5 text-sm"
            >
              Sign in instead
            </Link>
          </div>

          {/* Legal Links */}
          <div className="mt-5 pt-5 border-t border-gray-100 text-center text-xs text-gray-400">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
              Terms & Conditions
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
              Privacy Policy
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/info" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Learn more about FinalPoint
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="page-bg min-h-screen flex flex-col justify-center items-center">
        <div className="glass-card px-10 py-10 flex flex-col items-center gap-4">
          <Logo size="lg" />
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
} 