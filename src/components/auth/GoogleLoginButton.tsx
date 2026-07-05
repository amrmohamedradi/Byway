

import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { GoogleIcon } from '../common/SocialIcons';
import { useExternalLogin } from '../../hooks/useExternalLogin';





declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string; error?: string }) => void;
            cancel_on_tap_outside: boolean;
          }) => void;
          prompt: (
            momentListener?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              isDismissedMoment: () => boolean;
              getNotDisplayedReason: () => string;
              getSkippedReason: () => string;
              getDismissedReason: () => string;
            }) => void,
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}


const GSI_SCRIPT_ID = 'google-gsi-script';
const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';


const loadGsiScript = (): Promise<void> =>
  new Promise((resolve, reject) => {

    if (document.getElementById(GSI_SCRIPT_ID)) {

      if (window.google?.accounts) {
        resolve();
      } else {

        const existing = document.getElementById(GSI_SCRIPT_ID) as HTMLScriptElement;
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () =>
          reject(new Error('Failed to load Google Identity Services.')),
        );
      }
      return;
    }

    const script = document.createElement('script');
    script.id = GSI_SCRIPT_ID;
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services.'));
    document.head.appendChild(script);
  });


interface GoogleLoginButtonProps {

  mode?: 'login' | 'signup';
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ mode = 'login' }) => {
  const { isLoading, handleProviderToken } = useExternalLogin();
  const initializedRef = useRef(false);
  const label = mode === 'signup' ? 'Sign up with Google' : 'Google';





  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!clientId) {
      console.error(
        '[GoogleLoginButton] VITE_GOOGLE_CLIENT_ID is not set. ' +
          'Add it to your .env file. Google Sign-In will not work.',
      );
      return;
    }

    if (initializedRef.current) return;

    loadGsiScript()
      .then(() => {
        if (!window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          cancel_on_tap_outside: true,
          callback: (response) => {
            if (!response.credential) {


              return;
            }


            void handleProviderToken('google', response.credential);
          },
        });

        initializedRef.current = true;
      })
      .catch((err: unknown) => {
        console.error('[GoogleLoginButton] GIS script failed to load:', err);
      });


    return () => {
      window.google?.accounts?.id?.cancel();
    };
  }, [clientId, handleProviderToken]);

  const handleClick = () => {
    if (!window.google?.accounts?.id) {
      toast.error('Google Sign-In is not available. Please try again in a moment.');
      return;
    }

    if (!clientId) {
      toast.error('Google Sign-In is not configured for this app.');
      return;
    }


    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {


        const reason = notification.getNotDisplayedReason();
        if (reason === 'opt_out_or_no_session') {
          toast.error(
            'No Google account found in this browser. Please sign in to Google first.',
          );
        } else {
          toast.error(
            'Google Sign-In prompt could not be displayed. ' +
              'Try allowing third-party cookies or signing in to Google in your browser.',
          );
        }
      }

      if (notification.isSkippedMoment()) {


      }

      if (notification.isDismissedMoment()) {
        const reason = notification.getDismissedReason();
        if (reason === 'credential_returned') {

        }

      }
    });
  };

  return (
    <button
      id={mode === 'signup' ? 'google-signup-btn' : 'google-login-btn'}
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-label={mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? (

        <svg
          className="animate-spin h-4 w-4 text-slate-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        <GoogleIcon className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">{isLoading ? 'Signing in…' : label}</span>
    </button>
  );
};
