import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  subscription?: {
    plan: string;
    gamesCreatedThisMonth: number;
    maxGamesPerMonth: number;
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing user
    const savedUser = localStorage.getItem('drawplay-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - in a real app, this would call an API
    let mockUser: User;
    
    if (email === 'demo@drawplay.com' && password === 'demo123') {
      // Free demo account
      mockUser = {
        id: 'demo-free-user',
        email,
        firstName: 'Free',
        lastName: 'Demo',
        subscription: {
          plan: 'free',
          gamesCreatedThisMonth: 0,
          maxGamesPerMonth: 3,
        },
      };
    } else if (email === 'pro@drawplay.com' && password === 'pro123') {
      // Pro demo account
      mockUser = {
        id: 'demo-pro-user',
        email,
        firstName: 'Pro',
        lastName: 'Demo',
        subscription: {
          plan: 'pro',
          gamesCreatedThisMonth: 0,
          maxGamesPerMonth: 999, // Unlimited
        },
      };
    } else {
      // Regular user account
      mockUser = {
        id: 'mock-user-id',
        email,
        firstName: 'Demo',
        lastName: 'User',
        subscription: {
          plan: 'free',
          gamesCreatedThisMonth: 0,
          maxGamesPerMonth: 3,
        },
      };
    }
    
    setUser(mockUser);
    localStorage.setItem('drawplay-user', JSON.stringify(mockUser));
  };

  const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
    // Mock signup - in a real app, this would call an API
    const mockUser: User = {
      id: 'mock-user-id',
      email,
      firstName: firstName || 'Demo',
      lastName: lastName || 'User',
      subscription: {
        plan: 'free',
        gamesCreatedThisMonth: 0,
        maxGamesPerMonth: 3,
      },
    };
    
    setUser(mockUser);
    localStorage.setItem('drawplay-user', JSON.stringify(mockUser));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('drawplay-user');
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };
}
