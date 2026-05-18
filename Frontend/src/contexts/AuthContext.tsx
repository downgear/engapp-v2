import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3001/api/auth';
const LEGACY_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Types — aligned with server gateway's hydrated identity
export type UserRole = 'student' | 'parent' | 'teacher' | 'mentor' | 'admin';

export interface User {
  id: string;
  username: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  roles: UserRole[];
  // Backward-compat: primary role for components using user.role
  role: UserRole;
  // Backward-compat: email preserved from login input
  email: string;
  // Backward-compat: engapp-v2 profile ID (student/teacher/parent record).
  // Not available from server identity — looked up from engapp-v2 backend.
  profileId: number;
  // Backward-compat: engapp-v2 users.id (integer), used by notifications, chat, etc.
  legacyUserId: number;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  grade?: string;
  cefrLevel?: string;
  teacherType?: 'in_person' | 'video_call' | 'both';
  bio?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const ACCESS_TOKEN_KEY = 'lingriser_access_token';
const REFRESH_TOKEN_KEY = 'lingriser_refresh_token';
const USER_KEY = 'lingriser_user';

async function fetchIdentity(accessToken: string, email: string): Promise<User> {
  const res = await fetch(`${AUTH_API_URL}/my/identity`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch identity');
  const data = await res.json();
  const roles: UserRole[] = data.roles ?? [];

  // Look up legacy IDs from engapp-v2 backend by email
  let profileId = 0;
  let legacyUserId = 0;
  try {
    const legacyRes = await fetch(`${LEGACY_API_URL}/auth/profile-by-email?email=${encodeURIComponent(email)}`);
    if (legacyRes.ok) {
      const legacy = await legacyRes.json();
      profileId = legacy.profileId ?? 0;
      legacyUserId = legacy.id ?? 0;
    }
  } catch {
    // engapp-v2 backend may be unavailable — non-blocking
  }

  return {
    id: data.id,
    username: data.username,
    fullName: data.fullName,
    bio: data.bio,
    avatarUrl: data.avatarUrl,
    phoneNumber: data.phoneNumber,
    roles,
    role: roles[0] ?? 'student',
    email,
    profileId,
    legacyUserId,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const refreshingRef = useRef(false);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    if (refreshingRef.current) return false;
    refreshingRef.current = true;

    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return false;

      const res = await fetch(`${AUTH_API_URL}/refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${refreshToken}` },
      });

      if (!res.ok) {
        clearAuth();
        return false;
      }

      const tokens = await res.json();
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

      const savedUser = localStorage.getItem(USER_KEY);
      const savedEmail = savedUser ? (JSON.parse(savedUser) as User).email : '';
      const user = await fetchIdentity(tokens.accessToken, savedEmail);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      setState({
        user,
        accessToken: tokens.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch {
      clearAuth();
      return false;
    } finally {
      refreshingRef.current = false;
    }
  }, [clearAuth]);

  // Load saved auth state on mount
  useEffect(() => {
    const loadSavedAuth = async () => {
      try {
        const savedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_KEY);

        if (savedAccessToken && savedUser) {
          setState({
            user: JSON.parse(savedUser),
            accessToken: savedAccessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } else if (localStorage.getItem(REFRESH_TOKEN_KEY)) {
          await refreshTokens();
        } else {
          // Migrate from old storage keys if present
          const oldToken = localStorage.getItem('lingriser_token');
          if (oldToken) {
            localStorage.removeItem('lingriser_token');
            localStorage.removeItem('lingriser_user');
          }
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch {
        clearAuth();
      }
    };

    loadSavedAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mail: email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Đăng nhập thất bại' }));
      throw new Error(error.message || 'Đăng nhập thất bại');
    }

    const tokens = await response.json();

    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

    const user = await fetchIdentity(tokens.accessToken, email);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    setState({
      user,
      accessToken: tokens.accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const register = useCallback(async (registerData: RegisterData) => {
    const username = registerData.email.split('@')[0];

    const response = await fetch(`${AUTH_API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mail: registerData.email,
        password: registerData.password,
        username,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Đăng ký thất bại' }));
      throw new Error(error.message || 'Đăng ký thất bại');
    }

    const tokens = await response.json();

    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

    // Update profile with fullName and phone after registration
    if (registerData.fullName || registerData.phone) {
      await fetch(`${AUTH_API_URL}/my/identity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify({
          fullName: registerData.fullName,
          phoneNumber: registerData.phone,
        }),
      });
    }

    const user = await fetchIdentity(tokens.accessToken, registerData.email);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    setState({
      user,
      accessToken: tokens.accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      fetch(`${AUTH_API_URL}/logout-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    clearAuth();
  }, [clearAuth]);

  const refreshProfile = useCallback(async () => {
    if (!state.accessToken || !state.user) return;

    try {
      const user = await fetchIdentity(state.accessToken, state.user.email);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setState(prev => ({ ...prev, user }));
    } catch {
      const refreshed = await refreshTokens();
      if (!refreshed) clearAuth();
    }
  }, [state.accessToken, state.user, refreshTokens, clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshProfile,
        refreshTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper hook for role-based access
export const useRequireAuth = (allowedRoles?: UserRole[]) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  const hasAccess = isAuthenticated && (!allowedRoles || (user && user.roles.some(r => allowedRoles.includes(r))));

  return {
    isAuthenticated,
    hasAccess,
    isLoading,
    user,
  };
};
