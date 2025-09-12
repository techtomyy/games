import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiClient, getStoredUser, storeUser, clearStoredUser, User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, firstName?: string, lastName?: string) => Promise<any>;
  logout: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const refreshTimeoutRef = useRef<number | null>(null);
  const hasRegistered401HandlerRef = useRef(false);

  const clearRefreshTimer = () => {
    if (refreshTimeoutRef.current) {
      window.clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear user data, even if API call fails
      setUser(null);
      clearStoredUser();
      clearRefreshTimer();
      // Small delay to ensure state is updated before redirect
      setTimeout(() => {
        setLocation("/");
      }, 200);
    }
  };

  const scheduleAutoRefreshOrLogout = async () => {
    clearRefreshTimer();
    const expiresAtStr = localStorage.getItem('access_expires_at');
    const refreshToken = localStorage.getItem('refresh_token');
    if (!expiresAtStr || !refreshToken) {
      return;
    }
    const expiresAtMs = parseInt(expiresAtStr, 10);
    const now = Date.now();

    if (Number.isFinite(expiresAtMs) && expiresAtMs <= now) {
      toast({
        title: "Signed out",
        description: "Your session expired. Please sign in again.",
        variant: "destructive",
      });
      await logout();
      return;
    }

    const REFRESH_EARLY_MS = 60_000;
    const delay = Math.max(0, (Number.isFinite(expiresAtMs) ? expiresAtMs : now) - now - REFRESH_EARLY_MS);
    refreshTimeoutRef.current = window.setTimeout(async () => {
      // On timer fire (close to expiry), log out immediately per requirement
      toast({
        title: "Signed out",
        description: "Your session expired. Please sign in again.",
        variant: "destructive",
      });
      await logout();
    }, delay);
  };

  // Ensure immediate logout even after sleep or across tabs
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const expiresAtStr = localStorage.getItem('access_expires_at');
        const expiresAtMs = expiresAtStr ? parseInt(expiresAtStr, 10) : NaN;
        if (Number.isFinite(expiresAtMs) && expiresAtMs <= Date.now()) {
          toast({
            title: "Signed out",
            description: "Your session expired. Please sign in again.",
            variant: "destructive",
          });
          logout();
        }
      }
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'access_expires_at' || e.key === 'access_token') {
        const expiresAtStr = localStorage.getItem('access_expires_at');
        const expiresAtMs = expiresAtStr ? parseInt(expiresAtStr, 10) : NaN;
        if (Number.isFinite(expiresAtMs) && expiresAtMs <= Date.now()) {
          toast({
            title: "Signed out",
            description: "Your session expired. Please sign in again.",
            variant: "destructive",
          });
          logout();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('storage', handleStorage);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('storage', handleStorage);
    };
  }, [logout]);

  useEffect(() => {
    // Check if user is authenticated and get user data
    const initializeAuth = async () => {
      try {
        const storedUser = getStoredUser();
        if (storedUser) {
          // If token is already expired at startup, log out immediately
          const expiresAtStr = localStorage.getItem('access_expires_at');
          const expiresAtMs = expiresAtStr ? parseInt(expiresAtStr, 10) : NaN;
          if (Number.isFinite(expiresAtMs) && expiresAtMs <= Date.now()) {
            toast({
              title: "Signed out",
              description: "Your session expired. Please sign in again.",
              variant: "destructive",
            });
            await logout();
            return;
          }
          // Verify the token is still valid by getting current user
          const response = await apiClient.getCurrentUser();
          if (response.success) {
            setUser(response.user);
            storeUser(response.user);
            await scheduleAutoRefreshOrLogout();
          } else {
            // Token is invalid, clear stored data
            clearStoredUser();
          }
        }
      } catch (error) {
        // Token is invalid or expired, clear stored data
        clearStoredUser();
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    if (!hasRegistered401HandlerRef.current) {
      apiClient.registerOnUnauthorized(() => {
        toast({
          title: "Signed out",
          description: "Your session expired. Please sign in again.",
          variant: "destructive",
        });
        logout();
      });
      hasRegistered401HandlerRef.current = true;
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      
      if (response.success && response.user) {
        console.log('Login successful, setting user:', response.user);
        setUser(response.user);
        storeUser(response.user);
        console.log('User state updated');
        await scheduleAutoRefreshOrLogout();
        return response;
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const response = await apiClient.signup({
        firstname: firstName || '',
        lastname: lastName || '',
        email,
        password,
      });
      
      if (response.success) {
        // Don't set user state - user needs to confirm email first
        return response;
      } else {
        throw new Error('Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };


  const resendConfirmation = async (email: string) => {
    try {
      const response = await apiClient.resendConfirmation(email);
      return response;
    } catch (error) {
      console.error('Resend confirmation error:', error);
      throw error;
    }
  };


  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    resendConfirmation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
