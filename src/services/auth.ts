import type { User } from '../context/appTypes';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthSession {
  token: string;
  refreshToken?: string;
  user: User;
}

type TokenPayload = Record<string, unknown>;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const TOKEN_KEY = 'byway_auth_token';
const REFRESH_TOKEN_KEY = 'byway_refresh_token';

const ROLE_CLAIM_KEYS = [
  'role',
  'roles',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
];

const NAME_CLAIM_KEYS = [
  'name',
  'unique_name',
  'given_name',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
];

const EMAIL_CLAIM_KEYS = [
  'email',
  'sub',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
];

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
  return atob(padded);
};

const decodeJwtPayload = (token: string): TokenPayload => {
  const payload = token.split('.')[1];

  if (!payload) {
    throw new Error('The server returned an invalid authentication token.');
  }

  return JSON.parse(decodeBase64Url(payload)) as TokenPayload;
};

const claimAsString = (payload: TokenPayload, keys: string[]) => {
  for (const key of keys) {
    const value = payload[key];

    if (typeof value === 'string') {
      return value;
    }

    if (Array.isArray(value) && typeof value[0] === 'string') {
      return value[0];
    }
  }

  return undefined;
};

const normalizeRole = (role: string | undefined): User['role'] => {
  if (role?.toLowerCase() === 'admin') {
    return 'admin';
  }

  return 'student';
};

const userFromToken = (token: string): User => {
  const payload = decodeJwtPayload(token);
  const email = claimAsString(payload, EMAIL_CLAIM_KEYS) ?? '';
  const name = claimAsString(payload, NAME_CLAIM_KEYS) ?? email;
  const role = normalizeRole(claimAsString(payload, ROLE_CLAIM_KEYS));

  return { email, name, role };
};

const authRequest = async (path: string, body: unknown): Promise<AuthSession> => {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Unable to reach the authentication server. Check the API URL, CORS, or dev proxy configuration.');
  }

  if (!response.ok) {
    const message = await response.json()
      .then((envelope: { message?: string | null }) => envelope.message)
      .catch(() => null);

    throw new Error(message ?? 'Authentication failed. Please check your details and try again.');
  }

  const envelope = await response.json() as {
    success?: boolean;
    message?: string | null;
    data?: {
      token?: string;
      accessToken?: string;
      jwt?: string;
      refreshToken?: string;
      email?: string;
      user?: Partial<User>;
    };
  };
  const data = envelope.data ?? {};
  const token = data.token ?? data.accessToken ?? data.jwt;

  if (!token) {
    throw new Error('The server did not return an authentication token.');
  }

  const tokenUser = userFromToken(token);

  return {
    token,
    refreshToken: data.refreshToken,
    user: {
      ...tokenUser,
      ...data.user,
      email: data.user?.email ?? data.email ?? tokenUser.email,
      role: data.user?.role ?? tokenUser.role,
    },
  };
};

export const saveToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);

export const saveRefreshToken = (refreshToken?: string) => {
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getStoredSession = (): AuthSession | null => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    return null;
  }

  try {
    return { token, user: userFromToken(token) };
  } catch {
    clearToken();
    return null;
  }
};

export const loginRequest = (credentials: LoginCredentials) => authRequest('/api/Auth/login', credentials);

export const registerRequest = ({ firstName, lastName, email, password }: RegisterPayload) => (
  authRequest('/api/Auth/register', { firstName, lastName, email, password })
);

export const refreshRequest = (email: string, refreshToken: string) => (
  authRequest('/api/Auth/refresh', { email, refreshToken })
);
