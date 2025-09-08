import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

  useEffect(() => {
    // Check if user is authenticated and get user data
    const initializeAuth = async () => {
      try {
        const storedUser = getStoredUser();
        if (storedUser) {
          // Verify the token is still valid by getting current user
          const response = await apiClient.getCurrentUser();
          if (response.success) {
            setUser(response.user);
            storeUser(response.user);
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
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      
      if (response.success && response.user) {
        console.log('Login successful, setting user:', response.user);
        setUser(response.user);
        storeUser(response.user);
        console.log('User state updated');
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

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear user data, even if API call fails
      setUser(null);
      clearStoredUser();
      // Small delay to ensure state is updated before redirect
      setTimeout(() => {
        setLocation("/");
      }, 200);
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
