'use client';

/**
 * Auth Context
 * Provides authentication state and methods throughout the app
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, Tenant } from '@/lib/services';
import { rbacService, AccessData } from '@/lib/services/rbacService';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  refreshTenant: () => Promise<void>;
  access: AccessData | null;
  can: (module: string, action?: string) => boolean;
  refreshAccess: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [access, setAccess] = useState<AccessData | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = authService.getToken();
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authService.verify();
      setUser(response.data.user);
      setTenant(response.data.tenant);
      setIsAuthenticated(true);
      const accessResponse = await rbacService.getAccess();
      setAccess(accessResponse.data);
    } catch {
      authService.logout();
      setUser(null);
      setTenant(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.data.user);
    setTenant(response.data.tenant);
    setIsAuthenticated(true);
    const accessResponse = await rbacService.getAccess();
    setAccess(accessResponse.data);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setTenant(null);
    setIsAuthenticated(false);
    setAccess(null);
  };

  const refreshTenant = async () => {
    try {
      const response = await authService.verify();
      setTenant(response.data.tenant);
    } catch (error) {
      console.error('Failed to refresh tenant:', error);
    }
  };

  const isOnboardingComplete = tenant?.onboarding?.completed ?? false;
  const refreshAccess = async () => { const response = await rbacService.getAccess(); setAccess(response.data); };
  const can = (module: string, action = 'view') => access?.isSuperAdmin === true || access?.permissions?.[`${module}.${action}`] === true;

  const value = {
    user,
    tenant,
    loading,
    isAuthenticated,
    isOnboardingComplete,
    login,
    logout,
    checkAuth,
    refreshTenant,
    access,
    can,
    refreshAccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
