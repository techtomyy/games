// API configuration and service functions
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

// Types
export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  fullname: string;
  email_confirmed: boolean;
  created_at: string;
  last_sign_in?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  timestamp?: string;
}

// API client class
class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private onUnauthorizedCallback: (() => void) | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage() {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.accessToken = token;
    }
  }

  private setToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('access_token', token);
    // If the backend did not set an explicit expiry yet, try to infer from JWT
    try {
      const inferred = this.inferExpiryFromJwt(token);
      if (inferred) {
        localStorage.setItem('access_expires_at', String(inferred));
      }
    } catch {}
  }

  private clearToken() {
    this.accessToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('access_expires_at');
  }

  // Allow consumers (AuthContext) to react to 401s globally
  registerOnUnauthorized(handler: () => void) {
    this.onUnauthorizedCallback = handler;
  }

  private setSession(session?: { access_token: string; refresh_token: string; expires_at: number }) {
    if (!session) return;
    this.setToken(session.access_token);
    localStorage.setItem('refresh_token', session.refresh_token);
    // Store as milliseconds epoch for easier timers
    const expiresMs = session.expires_at * 1000;
    localStorage.setItem('access_expires_at', String(expiresMs));
  }

  private inferExpiryFromJwt(token: string): number | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson);
      if (!payload || typeof payload.exp !== 'number') return null;
      return payload.exp * 1000;
    } catch {
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as any).Authorization = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Only auto-logout if we actually attempted an authenticated request
          if (this.accessToken && this.onUnauthorizedCallback) {
            try { this.onUnauthorizedCallback(); } catch {}
          }
          const message = data?.error || 'Invalid credentials';
          throw new Error(`401: ${message}`);
        }
        throw new Error(`${response.status}: ${data?.error || 'Request failed'}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Authentication methods
  async signup(data: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // If we get a session, store the tokens and expiry
    if (response.session) {
      this.setSession(response.session);
    }

    return response;
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store the tokens and expiry
    if (response.session) {
      this.setSession(response.session);
    }

    return response;
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.request<{ success: boolean; message: string }>('/auth/logout', {
        method: 'POST',
      });
      this.clearToken();
      return response;
    } catch (error) {
      // Even if the request fails, clear local tokens
      this.clearToken();
      // Return a success response even if the server request failed
      // This ensures the client-side logout always works
      return {
        success: true,
        message: "Logged out successfully"
      };
    }
  }

  async getCurrentUser(): Promise<{ success: boolean; user: User }> {
    return this.request<{ success: boolean; user: User }>('/auth/me');
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    // Update stored tokens and expiry
    if (response.session) {
      this.setSession(response.session);
    }

    return response;
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async updatePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/auth/update-password', {
      method: 'PUT',
      body: JSON.stringify({ new_password: newPassword }),
    });
  }

  async resendConfirmation(email: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/auth/resend-confirmation', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
  // Health check
  async healthCheck(): Promise<{ success: boolean; status: string; database: string }> {
    return this.request<{ success: boolean; status: string; database: string }>('/health');
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Helper function to check if user is authenticated
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('access_token');
}

// Helper function to get stored user data
export function getStoredUser(): User | null {
  const userData = localStorage.getItem('user_data');
  return userData ? JSON.parse(userData) : null;
}

// Helper function to store user data
export function storeUser(user: User): void {
  localStorage.setItem('user_data', JSON.stringify(user));
}

// Helper function to clear stored user data
export function clearStoredUser(): void {
  localStorage.removeItem('user_data');
}
