import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';
import { Loading } from "@/components/ui/loading";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsAuthenticated(false);
        setToken(null);
        return false;
      }

      // Verify token with backend
      const response = await api.get('/auth/verify');
      if (response.data?.valid) {
        setToken(storedToken);
        setIsAuthenticated(true);
        return true;
      } else {
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await logout();
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await checkAuthStatus();
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
