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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo className="w-32 h-32" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FinalPoint</h1>
          <h2 className="text-xl text-gray-600">F1 Prediction Game</h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setLoginFormData({ email: e.target.value, password })}
                  placeholder="Enter your email address"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setLoginFormData({ email, password: e.target.value })}
                  placeholder="Enter your password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
              </div>
            </div>

            {(loginError || validationError) && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm text-center font-medium">
                {loginError || validationError}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(!showForgotPassword)}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </button>
            </div>
          </form>

          {/* Forgot Password Form */}
          {showForgotPassword && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reset Password</h3>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="forgotEmail"
                      name="forgotEmail"
                      type="email"
                      autoComplete="email"
                      required
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                    />
                  </div>
                </div>

                {forgotPasswordError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm font-medium">
                    {forgotPasswordError}
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordEmail('');
                      setForgotPasswordError('');
                    }}
                    className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Google Sign-In Section */}
          {shouldShowGoogleSignIn() && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-4">
                <div ref={googleButtonRef} className="w-full flex justify-center">
                  {/* Google Sign-In button will be rendered here */}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don&apos;t have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href={`/signup?redirect=${encodeURIComponent(redirectTo)}`}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create an account
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/info"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Learn more about FinalPoint
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">FinalPoint</h1>
            <h2 className="text-xl text-gray-600">F1 Prediction Game</h2>
          </div>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
} 