import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { externalLoginRequest } from '../services/auth';
import type { ExternalProvider } from '../services/auth';
import { useApp } from '../context/useApp';

export interface UseExternalLoginResult {
  /** True while the backend round-trip is in flight. Disable your button while this is true. */
  isLoading: boolean;
  /**
   * Call this once you have the provider token (Google ID token or Facebook access token).
   * It sends the token to the backend, commits the returned JWT session, and redirects the user.
   * The provider token is used only for this single call and is NEVER stored anywhere.
   */
  handleProviderToken: (provider: ExternalProvider, providerToken: string) => Promise<void>;
}

export const useExternalLogin = (): UseExternalLoginResult => {
  const { loginWithSession } = useApp();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleProviderToken = async (
    provider: ExternalProvider,
    providerToken: string,
  ): Promise<void> => {
    setIsLoading(true);

    try {
      // Single call: provider token goes to the backend and is validated server-side.
      // It is NEVER written to localStorage, sessionStorage, or any React state.
      const session = await externalLoginRequest(provider, providerToken);

      // Commit the JWT session into AppContext — identical effect to a normal login.
      loginWithSession(session);

      // Navigate based on role (same behaviour as the email/password login flow).
      // NOTE: `session.user.role` is decoded from the returned JWT, so it is authoritative.
      navigate(session.user.role === 'admin' ? '/admin/dashboard' : '/');
    } catch (error) {
      // The backend returns a descriptive message for known failure cases
      // (invalid token, email not provided by Facebook, account conflict, etc.).
      // `externalLoginRequest` (via `authRequest`) already extracts `envelope.message`,
      // so we just surface whatever the Error carries.
      const message =
        error instanceof Error
          ? error.message
          : `Sign in with ${provider === 'google' ? 'Google' : 'Facebook'} failed. Please try again.`;

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handleProviderToken };
};
