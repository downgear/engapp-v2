/**
 * Hook for Google Identity Services OAuth
 * Uses popup flow to get authorization code, then sends to backend
 */

import { useCallback, useEffect, useState } from 'react';

// Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initCodeClient: (config: GoogleCodeClientConfig) => GoogleCodeClient;
        };
      };
    };
  }
}

interface GoogleCodeClientConfig {
  client_id: string;
  scope: string;
  ux_mode: 'popup' | 'redirect';
  callback: (response: GoogleCodeResponse) => void;
  error_callback?: (error: GoogleErrorResponse) => void;
}

interface GoogleCodeClient {
  requestCode: () => void;
}

interface GoogleCodeResponse {
  code: string;
  scope: string;
}

interface GoogleErrorResponse {
  type: string;
  message?: string;
}

interface UseGoogleAuthOptions {
  onSuccess?: (code: string) => void;
  onError?: (error: string) => void;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Scopes needed for Google Calendar + Meet
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

export function useGoogleAuth(options: UseGoogleAuthOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Google SDK is loaded
  useEffect(() => {
    const checkGoogleSDK = () => {
      if (window.google?.accounts?.oauth2) {
        setIsReady(true);
        return true;
      }
      return false;
    };

    if (checkGoogleSDK()) return;

    // Poll for SDK to be ready (it's loaded async)
    const interval = setInterval(() => {
      if (checkGoogleSDK()) {
        clearInterval(interval);
      }
    }, 100);

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!isReady) {
        setError('Google SDK failed to load');
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isReady]);

  const requestAuth = useCallback(() => {
    if (!window.google?.accounts?.oauth2) {
      setError('Google SDK not loaded');
      options.onError?.('Google SDK not loaded');
      return;
    }

    if (!GOOGLE_CLIENT_ID) {
      setError('Google Client ID not configured');
      options.onError?.('Google Client ID not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    const client = window.google.accounts.oauth2.initCodeClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      ux_mode: 'popup',
      callback: (response: GoogleCodeResponse) => {
        setIsLoading(false);
        if (response.code) {
          options.onSuccess?.(response.code);
        } else {
          setError('No authorization code received');
          options.onError?.('No authorization code received');
        }
      },
      error_callback: (errorResponse: GoogleErrorResponse) => {
        setIsLoading(false);
        const errorMessage = errorResponse.message || errorResponse.type || 'Unknown error';
        setError(errorMessage);
        options.onError?.(errorMessage);
      },
    });

    client.requestCode();
  }, [options]);

  return {
    requestAuth,
    isLoading,
    isReady,
    error,
  };
}
