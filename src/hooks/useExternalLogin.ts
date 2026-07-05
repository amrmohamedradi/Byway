import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { externalLoginRequest } from '../services/auth';
import type { ExternalProvider } from '../services/auth';
import { useApp } from '../context/useApp';

export interface UseExternalLoginResult {

  isLoading: boolean;

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


      const session = await externalLoginRequest(provider, providerToken);


      loginWithSession(session);



      navigate(session.user.role === 'admin' ? '/admin/dashboard' : '/');
    } catch (error) {




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
