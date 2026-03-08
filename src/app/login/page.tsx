'use client';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Logo from '@/components/Logo';
import { shouldShowGoogleSignIn } from '@/lib/environment';



function LoginForm() {
  const [validationError, setValidationError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const { login, forgotPassword, isLoading, loginError, loginFormData, setLoginFormData, clearLoginError, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const { email, password } = loginFormData;

  // Google Sign-In success handler
  const handleGoogleSuccess = useCallback(async (response: Record<string, unknown>) => {
    if (response.credential) {
      setGoogleLoading(true);
      setValidationError('');

      try {
        const result = await loginWithGoogle(response.credential as string);
        if (result.success) {
          router.push(redirectTo);
        } else {
          setValidationError(result.error || 'Google Sign-In failed. Please try again.');
        }
      } catch (err: unknown) {
        setValidationError('Google Sign-In failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    }
  }, [loginWithGoogle, redirectTo, router]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Clear any previous errors
    clearLoginError();
    setValidationError('');

    if (!email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }

    try {
      const result = await login(email, password);

      if (result?.success) {
        router.push(redirectTo);
      } else if (result?.error) {
        // Display the error from the login function
        setValidationError(result.error);
      }
    } catch (error) {
      console.error('Unexpected error in handleSubmit:', error);
      setValidationError('An unexpected error occurred. Please try again.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setForgotPasswordError('');

    if (!forgotPasswordEmail) {
      setForgotPasswordError('Please enter your email address');
      return;
    }

    try {
      const result = await forgotPassword(forgotPasswordEmail);

      if (result?.success) {
        // Show toast notification
        showToast('If there is an account associated with that email, you will receive a password reset link shortly.', 'success');

        // Reset form and hide forgot password section
        setForgotPasswordEmail('');
        setShowForgotPassword(false);
        setForgotPasswordError('');
      } else {
        setForgotPasswordError(result?.error || 'Failed to send password reset email. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setForgotPasswordError('Failed to send password reset email. Please try again.');
    }
  };

  // Google Sign-In functionality
  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: handleGoogleSuccess,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the Google Sign-In button
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          });
        }
      }
    };
    script.onerror = () => {
      console.error('Failed to load Google Identity Services');
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [handleGoogleSuccess, redirectTo]);



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
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Welcome back</h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
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
                onChange={(e) => setLoginFormData({ email: e.target.value, password })}
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setLoginFormData({ email, password: e.target.value })}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            {(loginError || validationError) && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-scale-in">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{loginError || validationError}</p>
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
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(!showForgotPassword)}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          </form>

          {/* Forgot Password */}
          {showForgotPassword && (
            <div className="mt-6 pt-6 border-t border-gray-200 animate-slide-down">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Reset your password</h3>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label htmlFor="forgotEmail" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Email address
                  </label>
                  <input
                    id="forgotEmail"
                    name="forgotEmail"
                    type="email"
                    autoComplete="email"
                    required
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field"
                  />
                </div>

                {forgotPasswordError && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">{forgotPasswordError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex-1 py-2.5 text-sm"
                  >
                    {isLoading ? 'Sending…' : 'Send reset link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordEmail('');
                      setForgotPasswordError('');
                    }}
                    className="btn-ghost flex-1 py-2.5 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Google Sign-In */}
          {shouldShowGoogleSignIn() && (
            <div className="mt-6">
              <div className="divider-text my-5">or continue with</div>
              <div ref={googleButtonRef} className="w-full flex justify-center" />
            </div>
          )}

          {/* Sign up link */}
          <div className="mt-6">
            <div className="divider-text my-5">new here?</div>
            <Link
              href={`/signup?redirect=${encodeURIComponent(redirectTo)}`}
              className="btn-secondary w-full py-2.5 text-sm"
            >
              Create an account
            </Link>
          </div>

          <div className="mt-5 text-center">
            <Link href="/info" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Learn more about FinalPoint
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
      <LoginForm />
    </Suspense>
  );
} 