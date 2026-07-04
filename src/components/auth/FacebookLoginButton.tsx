/**
 * FacebookLoginButton
 *
 * Loads the Facebook JavaScript SDK via a <script> tag injected once into <head>
 * (idempotent — won't double-inject on re-renders or hot reloads).
 * On click it calls FB.login() which opens the Facebook OAuth popup.
 * On success the short-lived access token is sent directly to the backend.
 *
 * SECURITY: The Facebook access token is passed to the backend in a single fetch call
 * and is never written to localStorage, sessionStorage, or any React state.
 * The backend verifies it via the Graph API debug_token endpoint independently.
 *
 * NOTE — "idToken" field naming: The backend endpoint accepts the field named `idToken`
 * for both providers. For Facebook the value is actually an OAuth access token (not a JWT
 * ID token), but the backend normalizes this naming convention. We send it as-is.
 *
 * Package choice: We use the raw Facebook JavaScript SDK script rather than any React
 * wrapper (e.g. react-facebook-login) because:
 *  - The official FB.login() API is stable and well-documented.
 *  - All React wrappers ultimately call FB.login() internally.
 *  - Fewer dependencies = smaller bundle and no version-drift risk.
 *
 * Environment variable read: import.meta.env.VITE_FACEBOOK_APP_ID
 */

import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { FacebookIcon } from '../common/SocialIcons';
import { useExternalLogin } from '../../hooks/useExternalLogin';

// ─── TypeScript ambient declaration for the Facebook JS SDK ──────────────────
declare global {
  interface Window {
    FB?: {
      init: (params: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: FacebookLoginResponse) => void,
        options?: { scope: string; return_scopes?: boolean },
      ) => void;
      getLoginStatus: (callback: (response: FacebookLoginResponse) => void) => void;
    };
    fbAsyncInit?: () => void;
  }
}

interface FacebookLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
  };
}

// ─── Script loader (idempotent) ───────────────────────────────────────────────
const FB_SCRIPT_ID = 'facebook-jssdk';
const FB_SCRIPT_SRC = 'https://connect.facebook.net/en_US/sdk.js';

/**
 * Injects the Facebook JS SDK <script> tag once, wires `window.fbAsyncInit`
 * (the SDK's official initialization hook), and returns a Promise that resolves
 * when the SDK is ready. Safe to call multiple times.
 */
const loadFacebookSdk = (appId: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const initSdk = () => {
      if (!window.FB) {
        reject(new Error('Facebook SDK loaded but FB object is not available.'));
        return;
      }

      window.FB.init({
        appId,
        cookie: false,   // Do NOT enable cookies — we rely on the backend session only.
        xfbml: false,    // We don't use FB social plugins.
        version: 'v21.0',
      });

      resolve();
    };

    if (document.getElementById(FB_SCRIPT_ID)) {
      // Script tag already in DOM.
      if (window.FB) {
        // SDK already initialized (e.g. HMR or second component mount).
        resolve();
      } else {
        // Script is loading — fbAsyncInit will fire when ready.
        const previousInit = window.fbAsyncInit;
        window.fbAsyncInit = () => {
          previousInit?.();
          initSdk();
        };
      }
      return;
    }

    // First injection.
    window.fbAsyncInit = initSdk;

    const script = document.createElement('script');
    script.id = FB_SCRIPT_ID;
    script.src = FB_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => reject(new Error('Failed to load Facebook SDK.'));
    document.head.appendChild(script);
  });

// ─── Component ────────────────────────────────────────────────────────────────
interface FacebookLoginButtonProps {
  /** 'login' (default) → "Facebook" label. 'signup' → "Sign up with Facebook" label. */
  mode?: 'login' | 'signup';
}

export const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({ mode = 'login' }) => {
  const { isLoading, handleProviderToken } = useExternalLogin();
  const sdkReadyRef = useRef(false);
  const label = mode === 'signup' ? 'Sign up with Facebook' : 'Facebook';

  // ─── Read App ID from env ───────────────────────────────────────────────────
  // If you are NOT using Vite, replace `import.meta.env.VITE_FACEBOOK_APP_ID`
  // with `process.env.REACT_APP_FACEBOOK_APP_ID` (CRA) or your framework's
  // equivalent. The variable must be set in .env (see .env.example).
  const appId = import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined;

  useEffect(() => {
    if (!appId) {
      console.error(
        '[FacebookLoginButton] VITE_FACEBOOK_APP_ID is not set. ' +
          'Add it to your .env file. Facebook Sign-In will not work.',
      );
      return;
    }

    loadFacebookSdk(appId)
      .then(() => {
        sdkReadyRef.current = true;
      })
      .catch((err: unknown) => {
        console.error('[FacebookLoginButton] FB SDK failed to load:', err);
      });
  }, [appId]);

  const handleClick = () => {
    if (!sdkReadyRef.current || !window.FB) {
      toast.error('Facebook Sign-In is not available yet. Please try again in a moment.');
      return;
    }

    if (!appId) {
      toast.error('Facebook Sign-In is not configured for this app.');
      return;
    }

    // Open the Facebook OAuth popup.
    // We request `email` scope — required for the backend to identify the user.
    // If the user denies email permission, the backend will return a descriptive
    // error (handled by useExternalLogin → toast.error).
    window.FB.login(
      (response: FacebookLoginResponse) => {
        if (response.status !== 'connected' || !response.authResponse?.accessToken) {
          // User closed the popup or denied permission — silent, treat as cancellation.
          // We intentionally do NOT show a toast here; this is an expected user action.
          return;
        }

        // Access token goes straight to the backend. Never stored anywhere.
        void handleProviderToken('facebook', response.authResponse.accessToken);
      },
      {
        scope: 'email,public_profile',
        return_scopes: true,
      },
    );
  };

  return (
    <button
      id={mode === 'signup' ? 'facebook-signup-btn' : 'facebook-login-btn'}
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-label={mode === 'signup' ? 'Sign up with Facebook' : 'Sign in with Facebook'}
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        /* Spinner */
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
        <FacebookIcon className="w-4 h-4 text-blue-600 fill-blue-600" />
      )}
      <span className="hidden sm:inline">{isLoading ? 'Signing in…' : label}</span>
    </button>
  );
};
