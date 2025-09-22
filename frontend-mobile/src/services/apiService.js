import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, getApiConfig } from '../config/api';

class ApiService {
    constructor() {
        this.config = getApiConfig();
        this.baseURL = `${this.config.BASE_URL}/api/${this.config.API_VERSION}`;
    }

    // Get stored token
    async getToken() {
        try {
            const token = await AsyncStorage.getItem('userToken');
            return token;
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    }

    // Set token in storage
    async setToken(token) {
        try {
            await AsyncStorage.setItem('userToken', token);
        } catch (error) {
            console.error('Error setting token:', error);
        }
    }

    // Remove token from storage
    async removeToken() {
        try {
            await AsyncStorage.removeItem('userToken');
        } catch (error) {
            console.error('Error removing token:', error);
        }
    }

    // Get request headers
    async getHeaders(includeAuth = true) {
        const headers = { ...this.config.DEFAULT_HEADERS };

        if (includeAuth) {
            const token = await this.getToken();
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Make HTTP request
    async makeRequest(endpoint, options = {}) {
        const {
            method = 'GET',
            body = null,
            includeAuth = true,
            isFormData = false,
        } = options;

        try {
            const headers = await this.getHeaders(includeAuth);

            // Remove content-type header for FormData
            if (isFormData) {
                delete headers['Content-Type'];
            }

            const config = {
                method,
                headers,
                timeout: this.config.TIMEOUT,
            };

            // Add body for POST, PUT, PATCH requests
            if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
                config.body = isFormData ? body : JSON.stringify(body);
            }

            const url = `${this.baseURL}${endpoint}`;
            console.log(`Making ${method} request to:`, url);

            const response = await fetch(url, config);

            // Handle different response types
            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw new Error(data.error || data.message || `HTTP ${response.status}`);
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message,
                status: response.status,
            };
        } catch (error) {
            console.error('API Request Error:', error);
            return {
                success: false,
                error: error.message || 'Network request failed',
                status: error.status || 500,
            };
        }
    }

    // GET request
    async get(endpoint, includeAuth = true) {
        return this.makeRequest(endpoint, { method: 'GET', includeAuth });
    }

    // POST request
    async post(endpoint, body, includeAuth = true, isFormData = false) {
        return this.makeRequest(endpoint, {
            method: 'POST',
            body,
            includeAuth,
            isFormData,
        });
    }

    // PUT request
    async put(endpoint, body, includeAuth = true, isFormData = false) {
        return this.makeRequest(endpoint, {
            method: 'PUT',
            body,
            includeAuth,
            isFormData,
        });
    }

    // DELETE request
    async delete(endpoint, includeAuth = true) {
        return this.makeRequest(endpoint, { method: 'DELETE', includeAuth });
    }

    // PATCH request
    async patch(endpoint, body, includeAuth = true) {
        return this.makeRequest(endpoint, {
            method: 'PATCH',
            body,
            includeAuth,
        });
    }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;