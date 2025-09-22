const API_CONFIG = {
    // Base URL for your backend API
    BASE_URL: 'http://localhost:5000',

    // API Version
    API_VERSION: 'v1',

    // Request timeout in milliseconds
    TIMEOUT: 30000,

    // Retry attempts for failed requests
    MAX_RETRY_ATTEMPTS: 3,

    // Request headers
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
};

// API Endpoints
export const API_ENDPOINTS = {
    // Base API URL
    BASE: `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}`,

    // Authentication endpoints
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        ME: '/auth/me',
        UPDATE_DETAILS: '/auth/updatedetails',
        UPDATE_PASSWORD: '/auth/updatepassword',
        FORGOT_PASSWORD: '/auth/forgotpassword',
        RESET_PASSWORD: '/auth/resetpassword',
    },

    // User endpoints
    USERS: {
        BASE: '/users',
        BY_ID: (id) => `/users/${id}`,
    },

    // Health check
    HEALTH: '/health',
};

// Environment-specific configurations
export const getApiConfig = () => {
    const isDevelopment = __DEV__;

    return {
        ...API_CONFIG,
        BASE_URL: isDevelopment
            ? 'http://10.0.2.2:5000' // Android emulator
            : 'https://your-production-api.com',
    };
};

export default API_CONFIG;