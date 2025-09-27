import { API_CONFIG } from './config';

// Generic API functions
const apiCall = async (endpoint: string, method: string = 'GET', data?: any) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method,
      headers: {
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

// Voter Categories API
export const voterCategoryAPI = {
  getAll: () => apiCall('/settings/voter-categories'),
  getById: (id: string) => apiCall(`/settings/voter-categories/${id}`),
  create: (data: any) => apiCall('/settings/voter-categories', 'POST', data),
  update: (id: string, data: any) => apiCall(`/settings/voter-categories/${id}`, 'PUT', data),
  delete: (id: string) => apiCall(`/settings/voter-categories/${id}`, 'DELETE'),
};

// Voter Languages API
export const voterLanguageAPI = {
  getAll: () => apiCall('/settings/voter-languages'),
  getById: (id: string) => apiCall(`/settings/voter-languages/${id}`),
  create: (data: any) => apiCall('/settings/voter-languages', 'POST', data),
  update: (id: string, data: any) => apiCall(`/settings/voter-languages/${id}`, 'PUT', data),
  delete: (id: string) => apiCall(`/settings/voter-languages/${id}`, 'DELETE'),
};

// Schemes API
export const schemeAPI = {
  getAll: () => apiCall('/settings/schemes'),
  getById: (id: string) => apiCall(`/settings/schemes/${id}`),
  create: (data: any) => apiCall('/settings/schemes', 'POST', data),
  update: (id: string, data: any) => apiCall(`/settings/schemes/${id}`, 'PUT', data),
  delete: (id: string) => apiCall(`/settings/schemes/${id}`, 'DELETE'),
};

// Feedback API
export const feedbackAPI = {
  getAll: () => apiCall('/settings/feedback'),
  getById: (id: string) => apiCall(`/settings/feedback/${id}`),
  create: (data: any) => apiCall('/settings/feedback', 'POST', data),
  update: (id: string, data: any) => apiCall(`/settings/feedback/${id}`, 'PUT', data),
  delete: (id: string) => apiCall(`/settings/feedback/${id}`, 'DELETE'),
};

// Parties API
export const partyAPI = {
  getAll: () => apiCall('/settings/parties'),
  getById: (id: string) => apiCall(`/settings/parties/${id}`),
  create: (data: any) => apiCall('/settings/parties', 'POST', data),
  update: (id: string, data: any) => apiCall(`/settings/parties/${id}`, 'PUT', data),
  delete: (id: string) => apiCall(`/settings/parties/${id}`, 'DELETE'),
};

// Religions API
export const religionAPI = {
  getAll: () => apiCall('/settings/religions'),
  getById: (id: string) => apiCall(`/settings/religions/${id}`),
  create: (data: any) => apiCall('/settings/religions', 'POST', data),
  update: (id: string, data: any) => apiCall(`/settings/religions/${id}`, 'PUT', data),
  delete: (id: string) => apiCall(`/settings/religions/${id}`, 'DELETE'),
};

// Caste Categories API
export const casteCategoryAPI = {
  getAll: () => apiCall('/settings/caste-categories'),
  getById: (id: string) => apiCall(`/settings/caste-categories/${id}`),
  create: (data: any) => apiCall('/settings/caste-categories', 'POST', data),
  update: (id: string, data: any) => apiCall(`/settings/caste-categories/${id}`, 'PUT', data),
  delete: (id: string) => apiCall(`/settings/caste-categories/${id}`, 'DELETE'),
};

// Castes API
export const casteAPI = {
  getAll: () => apiCall('/settings/castes'),
  getById: (id: string) => apiCall(`/settings/castes/${id}`),
  create: (data: any) => apiCall('/settings/castes', 'POST', data),
  update: (id: string, data: any) => apiCall(`/settings/castes/${id}`, 'PUT', data),
  delete: (id: string) => apiCall(`/settings/castes/${id}`, 'DELETE'),
};

// Sub-Castes API
export const subCasteAPI = {
  getAll: () => apiCall('/settings/sub-castes'),
  getById: (id: string) => apiCall(`/settings/sub-castes/${id}`),
  create: (data: any) => apiCall('/settings/sub-castes', 'POST', data),
  update: (id: string, data: any) => apiCall(`/settings/sub-castes/${id}`, 'PUT', data),
  delete: (id: string) => apiCall(`/settings/sub-castes/${id}`, 'DELETE'),
};
