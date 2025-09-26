import { API_CONFIG, getAuthHeaders } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  role: 'hoster' | 'tenant';
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  role: 'hoster' | 'tenant';
  profile?: {
    phone?: string;
    occupation?: string;
    company?: string;
    university?: string;
    avatar?: string;
    // Extended fields for better user experience
    position?: string;
    workEmail?: string;
    workSince?: string;
    incomeRange?: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

class AuthService {

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store token in localStorage
    if (data.data?.token) {
      localStorage.setItem('roc_token', data.data.token);
    }

    return data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Store token in localStorage
    if (data.data?.token) {
      localStorage.setItem('roc_token', data.data.token);
    }

    return data;
  }

  async getProfile(): Promise<{ success: boolean; data: { user: User } }> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch profile');
    }

    return data;
  }

  async updateProfile(profileData: Partial<User['profile']>): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ profile: profileData }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    return data;
  }

  async uploadAvatar(file: File): Promise<{ success: boolean; data: { avatarUrl: string; user: User } }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE_URL}/auth/profile/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getStoredToken()}`
        // Don't set Content-Type for FormData, let browser handle it
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload avatar');
    }

    return data;
  }

  logout(): void {
    localStorage.removeItem('roc_token');
    localStorage.removeItem('roc_user');
    // Note: No longer storing separate role since users can only use their registered role
  }

  getStoredToken(): string | null {
    return localStorage.getItem('roc_token');
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

export const authService = new AuthService();
