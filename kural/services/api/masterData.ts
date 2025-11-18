import { API_CONFIG } from './config';

const BASE_URL = `${API_CONFIG.BASE_URL}/master-data`;

export const masterDataAPI = {
  /**
   * Get all active master data sections
   */
  getSections: async () => {
    try {
      const token = await API_CONFIG.getToken();
      const response = await fetch(`${BASE_URL}/sections`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching master data sections:', error);
      throw error;
    }
  },

  /**
   * Get a single section by ID
   */
  getSectionById: async (sectionId: string) => {
    try {
      const token = await API_CONFIG.getToken();
      const response = await fetch(`${BASE_URL}/sections/${sectionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching section:', error);
      throw error;
    }
  },

  /**
   * Submit master data response
   */
  submitResponse: async (data: {
    voterId: string;
    sectionId: string;
    responses: Record<string, any>;
    boothId?: string;
    aciId?: number;
    deviceInfo?: {
      platform: string;
      version: string;
    };
    location?: {
      type: string;
      coordinates: [number, number];
    };
  }) => {
    try {
      const token = await API_CONFIG.getToken();
      const response = await fetch(`${BASE_URL}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting master data response:', error);
      throw error;
    }
  },

  /**
   * Get all responses for a specific voter
   */
  getResponsesByVoter: async (voterId: string) => {
    try {
      const token = await API_CONFIG.getToken();
      const response = await fetch(`${BASE_URL}/responses/${voterId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching voter responses:', error);
      throw error;
    }
  },

  /**
   * Check completion status for a voter
   */
  getCompletionStatus: async (voterId: string) => {
    try {
      const token = await API_CONFIG.getToken();
      const response = await fetch(`${BASE_URL}/completion/${voterId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking completion status:', error);
      throw error;
    }
  },
};
