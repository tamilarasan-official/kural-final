import apiService from './apiService';
import { API_ENDPOINTS } from '../config/api';

class AuthService {
  // Login user
  async login(credentials) {
    try {
      const { email, password } = credentials;
      
      const response = await apiService.post(
        API_ENDPOINTS.AUTH.LOGIN,
        { email, password },
        false // Don't include auth header for login
      );

      if (response.success && response.data.token) {
        // Store token
        await apiService.setToken(response.data.token);
        return {
          success: true,
          data: response.data,
          message: 'Login successful',
        };
      }

      return {
        success: false,
        error: response.error || 'Login failed',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  }

  // Register new user
  async register(userData) {
    try {
      const { name, email, password } = userData;
      
      const response = await apiService.post(
        API_ENDPOINTS.AUTH.REGISTER,
        { name, email, password },
        false // Don't include auth header for registration
      );

      if (response.success && response.data.token) {
        // Store token
        await apiService.setToken(response.data.token);
        return {
          success: true,
          data: response.data,
          message: 'Registration successful',
        };
      }

      return {
        success: false,
        error: response.error || 'Registration failed',
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed',
      };
    }
  }

  // Logout user
  async logout() {
    try {
      // Call logout endpoint
      await apiService.get(API_ENDPOINTS.AUTH.LOGOUT);
      
      // Remove token from storage
      await apiService.removeToken();
      
      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, remove local token
      await apiService.removeToken();
      return {
        success: true,
        message: 'Logout successful',
      };
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await apiService.get(API_ENDPOINTS.AUTH.ME);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to get user profile',
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get user profile',
      };
    }
  }

  // Update user details
  async updateUserDetails(userData) {
    try {
      const response = await apiService.put(
        API_ENDPOINTS.AUTH.UPDATE_DETAILS,
        userData
      );

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Profile updated successfully',
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to update profile',
      };
    } catch (error) {
      console.error('Update user details error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile',
      };
    }
  }

  // Update password
  async updatePassword(passwordData) {
    try {
      const { currentPassword, newPassword } = passwordData;
      
      const response = await apiService.put(
        API_ENDPOINTS.AUTH.UPDATE_PASSWORD,
        { currentPassword, newPassword }
      );

      if (response.success) {
        // Update token if new one is provided
        if (response.data.token) {
          await apiService.setToken(response.data.token);
        }
        
        return {
          success: true,
          message: 'Password updated successfully',
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to update password',
      };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update password',
      };
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email },
        false // Don't include auth header
      );

      if (response.success) {
        return {
          success: true,
          message: 'Password reset email sent',
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to send password reset email',
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send password reset email',
      };
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await apiService.put(
        `${API_ENDPOINTS.AUTH.RESET_PASSWORD}/${token}`,
        { password: newPassword },
        false // Don't include auth header
      );

      if (response.success) {
        // Store new token if provided
        if (response.data.token) {
          await apiService.setToken(response.data.token);
        }
        
        return {
          success: true,
          message: 'Password reset successful',
          data: response.data,
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to reset password',
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.message || 'Failed to reset password',
      };
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const token = await apiService.getToken();
      if (!token) {
        return false;
      }

      // Verify token by getting user profile
      const response = await this.getCurrentUser();
      return response.success;
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;