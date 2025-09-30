import { API_CONFIG } from './config';

const BASE_URL = `${API_CONFIG.BASE_URL}/part-colors`;

export const partColorAPI = {
  // Get all part colors
  getPartColors: async () => {
    const response = await fetch(`${BASE_URL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  // Get part color by part number
  getPartColorByPartNumber: async (partNumber: number) => {
    const response = await fetch(`${BASE_URL}/${partNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  // Update part color
  updatePartColor: async (partNumber: number, vulnerabilityId: string, color?: string) => {
    const response = await fetch(`${BASE_URL}/${partNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.getToken()}`,
      },
      body: JSON.stringify({ vulnerabilityId, color }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  // Get part colors summary
  getPartColorsSummary: async () => {
    const response = await fetch(`${BASE_URL}/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }
};
