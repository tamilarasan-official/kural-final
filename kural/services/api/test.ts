import { API_CONFIG } from './config';

export const testAPI = {
  // Test if API is reachable
  testConnection: async () => {
    try {
      console.log('Testing connection to:', API_CONFIG.BASE_URL);
      const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api/v1', '')}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error: any) {
      console.error('Connection test failed:', error.message);
      throw error;
    }
  },
};
