import { API_CONFIG } from './config';

const BASE_URL = `${API_CONFIG.BASE_URL}/auth`;

export const authAPI = {
  // Login for Assembly CI / Admin users
  login: async (phone: string, password: string) => {
    try {
      console.log('authAPI.login called with phone:', phone);
      console.log('Calling URL:', `${BASE_URL}/login`);
      
      // Add timeout to detect network issues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      console.log('Success response:', data);
      return data;
    } catch (error: any) {
      // Silently fail - this is expected when user is not Assembly CI
      // The login screen will try booth agent login next
      if (error.name === 'AbortError') {
        throw new Error('Cannot connect to server. Please check your network connection.');
      }
      throw error;
    }
  },

  // Register new user (Assembly CI / Admin)
  register: async (userData: {
    name: string;
    phone: string;
    password: string;
    role: string;
    aci_id?: string;
    aci_name?: string;
    email?: string;
  }) => {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    return await response.json();
  },

  // Logout
  logout: async (token: string) => {
    const response = await fetch(`${BASE_URL}/logout`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Logout failed');
    }

    return await response.json();
  },

  // Get current user profile
  getMe: async (token: string) => {
    const response = await fetch(`${BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get user profile');
    }

    return await response.json();
  },
};
