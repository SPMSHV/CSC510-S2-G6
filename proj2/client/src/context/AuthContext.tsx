import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { getStoredToken, getStoredUser, setAuthData, clearAuthData, login as apiLogin, register as apiRegister, getCurrentUser as apiGetCurrentUser } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string, role?: 'STUDENT' | 'VENDOR' | 'ADMIN' | 'ENGINEER') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage and verify token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();

      if (storedToken && storedUser) {
        try {
          // Verify token is still valid by fetching current user
          const currentUser = await apiGetCurrentUser();
          setUser(currentUser);
          setToken(storedToken);
          // Update stored user in case it changed
          setAuthData(storedToken, currentUser);
        } catch (error) {
          // Token is invalid, clear auth
          clearAuthData();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for logout events (from API interceptor)
    const handleLogout = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await apiLogin(email, password);
    setUser(response.user);
    setToken(response.token);
  };

  const register = async (
    email: string,
    name: string,
    password: string,
    role: 'STUDENT' | 'VENDOR' | 'ADMIN' | 'ENGINEER' = 'STUDENT'
  ): Promise<void> => {
    const response = await apiRegister(email, name, password, role);
    setUser(response.user);
    setToken(response.token);
  };

  const logout = (): void => {
    clearAuthData();
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

