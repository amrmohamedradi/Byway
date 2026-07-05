

import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { FacebookIcon } from '../common/SocialIcons';
import { useExternalLogin } from '../../hooks/useExternalLogin';


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


const FB_SCRIPT_ID = 'facebook-jssdk';
const FB_SCRIPT_SRC = 'https://connect.facebook.net/en_US/sdk.js';


const loadFacebookSdk = (appId: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const initSdk = () => {
      if (!window.FB) {
        reject(new Error('Facebook SDK loaded but FB object is not available.'));
        return;
      }

      window.FB.init({
        appId,
        cookie: false,
        xfbml: false,
        version: 'v21.0',
      });

      resolve();
    };

    if (document.getElementById(FB_SCRIPT_ID)) {

      if (window.FB) {

        resolve();
      } else {

        const previousInit = window.fbAsyncInit;
        window.fbAsyncInit = () => {
          previousInit?.();
          initSdk();
        };
      }
      return;
    }


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


interface FacebookLoginButtonProps {

  mode?: 'login' | 'signup';
}

export const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({ mode = 'login' }) => {
  const { isLoading, handleProviderToken } = useExternalLogin();
  const sdkReadyRef = useRef(false);
  const label = mode === 'signup' ? 'Sign up with Facebook' : 'Facebook';





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





    window.FB.login(
      (response: FacebookLoginResponse) => {
        if (response.status !== 'connected' || !response.authResponse?.accessToken) {


          return;
        }


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
