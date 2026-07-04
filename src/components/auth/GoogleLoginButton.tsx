/**
 * GoogleLoginButton
 *
 * Loads the Google Identity Services (GIS) library via a <script> tag injected
 * once into <head> (idempotent — won't double-inject on re-renders or hot reloads).
 * When the user clicks the button, google.accounts.id.prompt() fires the One-Tap
 * / popup flow. On success the ID token is sent directly to the backend.
 *
 * SECURITY: The Google ID token is passed to the backend in a single fetch call
 * and is never written to localStorage, sessionStorage, or any React state.
 * The backend re-validates the token against Google's public keys independently.
 *
 * Package choice: We use the raw Google Identity Services script (accounts.google.com/gsi/client)
 * rather than @react-oauth/google because:
 *  - Zero extra npm dependency (GIS is always served fresh from Google's CDN).
 *  - The GIS library is the industry-current replacement for the deprecated gapi.auth2.
 *  - @react-oauth/google is a thin wrapper around the same script that adds React overhead
 *    with no material benefit when we only need the credential callback.
 *
 * Environment variable read: import.meta.env.VITE_GOOGLE_CLIENT_ID
 */

import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { GoogleIcon } from '../common/SocialIcons';
import { useExternalLogin } from '../../hooks/useExternalLogin';

// ─── TypeScript ambient declaration for the GIS library ──────────────────────
// The GIS library attaches `google` to `window`. We declare a minimal subset of
// the API that we actually use so TypeScript is satisfied without installing a
// separate @types/google package.
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

// ─── Script loader (idempotent) ───────────────────────────────────────────────
const GSI_SCRIPT_ID = 'google-gsi-script';
const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

/**
 * Injects the GIS <script> tag once and returns a Promise that resolves when
 * the library is ready. Safe to call multiple times — subsequent calls just
 * resolve against the already-loaded script.
 */
const loadGsiScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    // Already loaded (e.g. second render, HMR, or another component).
    if (document.getElementById(GSI_SCRIPT_ID)) {
      // window.google may not be defined yet if the script is still loading.
      if (window.google?.accounts) {
        resolve();
      } else {
        // Wait for the existing script's onload.
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

// ─── Component ────────────────────────────────────────────────────────────────
export const GoogleLoginButton: React.FC = () => {
  const { isLoading, handleProviderToken } = useExternalLogin();
  const initializedRef = useRef(false);

  // ─── Read client ID from env ────────────────────────────────────────────────
  // If you are NOT using Vite, replace `import.meta.env.VITE_GOOGLE_CLIENT_ID`
  // with `process.env.REACT_APP_GOOGLE_CLIENT_ID` (CRA) or your framework's
  // equivalent. The variable must be set in .env (see .env.example).
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!clientId) {
      console.error(
        '[GoogleLoginButton] VITE_GOOGLE_CLIENT_ID is not set. ' +
          'Add it to your .env file. Google Sign-In will not work.',
      );
      return;
    }

    if (initializedRef.current) return; // Already initialized for this mount.

    loadGsiScript()
      .then(() => {
        if (!window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          cancel_on_tap_outside: true,
          callback: (response) => {
            if (!response.credential) {
              // This can happen if the One-Tap flow is dismissed or blocked.
              // We treat it as a silent cancellation (no error toast).
              return;
            }
            // credential is the ID token — pass it directly to the backend.
            // It is a signed JWT. We never decode, store, or re-use it.
            void handleProviderToken('google', response.credential);
          },
        });

        initializedRef.current = true;
      })
      .catch((err: unknown) => {
        console.error('[GoogleLoginButton] GIS script failed to load:', err);
      });

    // cleanup: cancel any pending One-Tap prompt when the component unmounts.
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

    // Trigger the One-Tap / popup flow.
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        // The prompt was suppressed (e.g. user previously dismissed it too many times,
        // or cookies are blocked). Fall back with an informative message.
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
        // User dismissed the One-Tap without selecting an account — silent, no toast.
        // This is an expected user action, not an error.
      }

      if (notification.isDismissedMoment()) {
        const reason = notification.getDismissedReason();
        if (reason === 'credential_returned') {
          // Success path — callback already fires, nothing to do here.
        }
        // Any other dismiss reason (user closed popup) — silent.
      }
    });
  };

  return (
    <button
      id="google-login-btn"
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-label="Sign in with Google"
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        /* Spinner — matches the visual weight of the icon */
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
      <span className="hidden sm:inline">{isLoading ? 'Signing in…' : 'Google'}</span>
    </button>
  );
};
