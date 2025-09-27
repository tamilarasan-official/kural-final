import { API_CONFIG } from './config';

// Generic API function for modal content
const apiCall = async (endpoint: string, method: string = 'GET', data?: any) => {
  try {
    const token = API_CONFIG.getToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

export const modalContentAPI = {
  // Get all modal content
  getAll: () => apiCall('/modal-content'),

  // Get modal content by type
  getByType: (modalType: string) => apiCall(`/modal-content/${modalType}`),

  // Create or update modal content
  createOrUpdate: (modalData: { modalType: string; title: string; content: string }) => 
    apiCall('/modal-content', 'POST', modalData),

  // Delete modal content
  delete: (modalType: string) => apiCall(`/modal-content/${modalType}`, 'DELETE'),
};
