'use client';

import { useEffect, useCallback, useState } from 'react';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleSignInConfig {
  clientId: string;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
}

export const useGoogleSignIn = (config: GoogleSignInConfig) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: config.clientId,
          callback: config.onSuccess,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        setIsLoaded(true);
      }
    };
    script.onerror = () => {
      console.error('Failed to load Google Identity Services');
      config.onError(new Error('Failed to load Google Identity Services'));
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [config.clientId, config.onSuccess, config.onError]);

  const renderButton = useCallback((element: HTMLElement) => {
    if (isLoaded && window.google?.accounts?.id) {
      window.google.accounts.id.renderButton(element, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });
    }
  }, [isLoaded]);

  const signIn = useCallback(() => {
    if (isLoaded && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  }, [isLoaded]);

  return {
    isLoaded,
    renderButton,
    signIn,
  };
};
