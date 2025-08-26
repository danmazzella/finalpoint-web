'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { shouldShowGoogleSignIn } from '@/lib/environment';
import AppleSigninButton from 'react-apple-signin-auth';
import { appleConfig, isAppleSignInAvailable, debugAppleConfig } from '@/lib/apple-config';

interface SimpleSocialSignInProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

const SimpleSocialSignIn: React.FC<SimpleSocialSignInProps> = ({ onSuccess, onError }) => {
    const { loginWithGoogle, loginWithApple } = useAuth();
    const { showToast } = useToast();
    const { resolvedTheme, setTheme } = useTheme();

    // Debug theme detection
    console.log('🔍 Theme Debug:', {
        resolvedTheme,
        isDark: resolvedTheme === 'dark',
        systemPrefersDark: typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : 'N/A',
        documentClasses: typeof document !== 'undefined' ? document.documentElement.className : 'N/A',
        dataTheme: typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : 'N/A'
    });

    // Theme detection - prioritize the context, fallback to system preference
    const isDarkMode = resolvedTheme === 'dark';

    // Debug the fallback calculation
    const systemPrefersDark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
    console.log('🔍 Theme Calculation:', {
        resolvedTheme,
        isDarkMode,
        systemPrefersDark,
        fallbackWouldBe: systemPrefersDark
    });

    console.log('🎨 Final Theme Decision:', { isDarkMode, resolvedTheme });

    // Force re-render when theme changes
    const [, forceUpdate] = useState({});
    useEffect(() => {
        const interval = setInterval(() => {
            forceUpdate({});
        }, 1000); // Check every second for theme changes

        return () => clearInterval(interval);
    }, [resolvedTheme]);

    // Monitor theme changes
    useEffect(() => {
        console.log('🎨 Theme changed:', { resolvedTheme, isDarkMode });

        // Force re-render when theme changes
        forceUpdate({});
    }, [resolvedTheme, isDarkMode]);

    // Additional debugging for theme context changes
    useEffect(() => {
        console.log('🔄 Component re-rendered with theme:', { resolvedTheme, isDarkMode });
    });

    // Debug Apple Sign-In configuration on mount
    useEffect(() => {
        debugAppleConfig();
    }, []);

    const handleGoogleSignIn = async () => {
        try {
            // Google Sign-In logic will be handled by the Google button component
            showToast('Google Sign-In clicked', 'info');
        } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : 'Google Sign-In failed';
            showToast(errorMsg, 'error');
            onError?.(errorMsg);
        }
    };

    const handleAppleSignIn = async (response: { authorization?: { id_token: string } }) => {
        try {
            if (response.authorization) {
                const result = await loginWithApple(response.authorization.id_token);

                if (result.success) {
                    showToast('Successfully signed in with Apple!', 'success');
                    onSuccess?.();
                } else {
                    const errorMsg = result.error || 'Apple Sign-In failed';
                    showToast(errorMsg, 'error');
                    onError?.(errorMsg);
                }
            }
        } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : 'Apple Sign-In failed';
            showToast(errorMsg, 'error');
            onError?.(errorMsg);
        }
    };

    const handleError = (error: unknown) => {
        console.error('Apple Sign-In error:', error);
        const errorMsg = 'Apple Sign-In failed';
        showToast(errorMsg, 'error');
        onError?.(errorMsg);
    };

    return (
        <>
            {/* Force CSS overrides */}
            <style jsx>{`
                /* Apple button theme-aware styling */
                .apple-btn-dark { background-color: #FFFFFF !important; color: #000000 !important; }
                .apple-btn-light { background-color: #000000 !important; color: #FFFFFF !important; }
                
                /* Google button theme-aware styling */
                .google-btn-dark { background-color: #FFFFFF !important; border-color: #D1D5DB !important; }
                .google-btn-light { background-color: #000000 !important; border-color: #4B5563 !important; }
                
                /* Target by data attribute for Google button */
                button[data-debug="google-button"] { 
                    background-color: ${isDarkMode ? '#FFFFFF' : '#000000'} !important; 
                    border-color: ${isDarkMode ? '#D1D5DB' : '#4B5563'} !important; 
                }
            `}</style>

            <div className="mt-6">
                {/* Theme Debug Info */}
                <div className="text-center mb-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-200 rounded">
                        Theme: {resolvedTheme} | Dark Mode: {isDarkMode ? 'Yes' : 'No'}
                    </span>
                    <button
                        onClick={() => {
                            const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
                            console.log('🔄 Manual theme toggle:', {
                                from: resolvedTheme,
                                to: newTheme,
                                currentIsDarkMode: isDarkMode
                            });

                            try {
                                // Use the proper theme context function
                                setTheme(newTheme);
                                console.log('✅ Theme context updated via setTheme');
                            } catch (error) {
                                console.error('❌ Error updating theme context:', error);

                                // Fallback to manual DOM manipulation
                                document.documentElement.classList.remove('dark', 'light');
                                document.documentElement.classList.add(newTheme);
                                document.documentElement.setAttribute('data-theme', newTheme);
                                console.log('🔄 Fallback: Manual DOM theme change applied');
                            }
                        }}
                        className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                    >
                        Toggle Theme
                    </button>
                </div>

                {/* Simple "Sign in with:" prompt */}
                <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sign in with:</p>
                </div>

                {/* Simple rounded buttons row */}
                <div className="flex justify-center space-x-4">
                    {/* Apple Sign-In Button */}
                    {isAppleSignInAvailable() && (
                        <AppleSigninButton
                            uiType={isDarkMode ? 'light' : 'dark'}
                            authOptions={{
                                clientId: appleConfig.clientId,
                                scope: appleConfig.scope,
                                redirectURI: appleConfig.redirectURI,
                                state: appleConfig.state,
                                usePopup: appleConfig.usePopup,
                            }}
                            onSuccess={handleAppleSignIn}
                            onError={handleError}
                            render={({ onClick, isDisabled, isLoading }: { onClick: () => void; isDisabled: boolean; isLoading: boolean }) => (
                                <button
                                    onClick={onClick}
                                    disabled={isDisabled || isLoading}
                                    className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode
                                        ? 'bg-white hover:bg-gray-100 apple-btn-dark'
                                        : 'bg-black hover:bg-gray-900 apple-btn-light'
                                        }`}
                                    style={{
                                        backgroundColor: isDarkMode ? '#FFFFFF' : '#000000',
                                        color: isDarkMode ? '#000000' : '#FFFFFF'
                                    }}
                                    data-theme={isDarkMode ? 'dark' : 'light'}
                                    data-dark-mode={isDarkMode.toString()}
                                    title="Sign in with Apple"
                                >
                                    {isLoading ? (
                                        <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${isDarkMode ? 'border-black' : 'border-white'
                                            }`}></div>
                                    ) : (
                                        <svg className={`w-8 h-8 ${isDarkMode ? 'text-black' : 'text-white'
                                            }`} viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                        </svg>
                                    )}
                                </button>
                            )}
                        />
                    )}

                    {/* Google Sign-In Button */}
                    {shouldShowGoogleSignIn() && (
                        <button
                            onClick={handleGoogleSignIn}
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-300 hover:bg-gray-50 ${isDarkMode ? 'google-btn-dark' : 'google-btn-light'}`}
                            style={{
                                backgroundColor: isDarkMode ? '#FFFFFF' : '#000000',
                                borderColor: isDarkMode ? '#D1D5DB' : '#4B5563',
                                '--tw-bg-opacity': '1',
                                '--tw-border-opacity': '1'
                            } as React.CSSProperties}
                            data-theme={isDarkMode ? 'dark' : 'light'}
                            data-dark-mode={isDarkMode.toString()}
                            data-debug="google-button"
                            title="Sign in with Google"
                            onMouseEnter={(e) => {
                                console.log('🔍 Google Button Debug:', {
                                    element: e.currentTarget,
                                    className: e.currentTarget.className,
                                    style: e.currentTarget.style.backgroundColor,
                                    computedStyle: window.getComputedStyle(e.currentTarget).backgroundColor,
                                    isDarkMode
                                });
                            }}
                        >
                            <svg className="w-8 h-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                <path d="M1 1h22v22H1z" fill="none" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default SimpleSocialSignIn;
