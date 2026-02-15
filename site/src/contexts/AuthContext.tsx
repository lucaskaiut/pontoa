'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { get, post } from '@/services/api';
import { ApiResponse } from '@/types/api-response';
import { User, UserWithToken } from '@/types/user';
import Cookies from 'js-cookie';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  validateAuth: () => Promise<void>;
  login: (email: string, password: string, document?: string | undefined) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  validateAuth: async () => {},
  login: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const validateAuth = async () => {
    setLoading(true);

    const authToken = Cookies.get('authToken');

    if (!authToken) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);

      return;
    }

    const { data: user } = await get<ApiResponse<User | null>>('/user', {}, {
      Authorization: `Bearer ${authToken}`,
    });

    setUser(user);
    setIsAuthenticated(!!user);
    setLoading(false);
  };

  const login = async (email: string, password: string, document?: string | undefined): Promise<boolean> => {
    setLoading(true);
    const { data: user } = await post<ApiResponse<UserWithToken | null>>('/login', {
      email,
      password,
      document,
    });

    if (!user) {
      return false;
    }

    setUser(user);
    setIsAuthenticated(!!user);
    Cookies.set('authToken', user.token);

    setLoading(false);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        user,
        isAuthenticated,
        loading,
        validateAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
