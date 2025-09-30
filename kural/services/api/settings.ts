import { API_CONFIG } from './config';

// Settings endpoints are namespaced under /settings
const BASE_URL = `${API_CONFIG.BASE_URL}/settings`;

export const settingsAPI = {
  // Get all religions
  getReligions: async () => {
    const response = await fetch(`${BASE_URL}/religions`, {
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

  // Get all castes
  getCastes: async () => {
    const response = await fetch(`${BASE_URL}/castes`, {
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

  // Get all sub-castes
  getSubCastes: async () => {
    const response = await fetch(`${BASE_URL}/sub-castes`, {
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

  // Get all voter categories
  getCategories: async () => {
    const response = await fetch(`${BASE_URL}/voter-categories`, {
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

  // Get all caste categories
  getCasteCategories: async () => {
    const response = await fetch(`${BASE_URL}/caste-categories`, {
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

  // Get all parties
  getParties: async () => {
    const response = await fetch(`${BASE_URL}/parties`, {
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

  // Get all schemes
  getSchemes: async () => {
    const response = await fetch(`${BASE_URL}/schemes`, {
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

  // Get all languages
  getLanguages: async () => {
    const response = await fetch(`${BASE_URL}/voter-languages`, {
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

  // Get voting history (Settings)
  getHistory: async () => {
    const response = await fetch(`${BASE_URL}/history`, {
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

  // Create a history item
  createHistory: async (item: { id: string; year?: string; title: string; tag: string; icon?: string }) => {
    const response = await fetch(`${BASE_URL}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.getToken()}`,
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Update a history item
  updateHistory: async (mongoId: string, patch: Partial<{ id: string; year?: string; title: string; tag: string; icon?: string }>) => {
    const response = await fetch(`${BASE_URL}/history/${mongoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.getToken()}`,
      },
      body: JSON.stringify(patch),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Delete a history item
  deleteHistory: async (mongoId: string) => {
    const response = await fetch(`${BASE_URL}/history/${mongoId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.getToken()}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Get all feedbacks
  getFeedbacks: async () => {
    const response = await fetch(`${BASE_URL}/feedback`, {
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

  // Optional: voter history collection if available
  getHistories: async () => {
    const response = await fetch(`${BASE_URL}/history`, {
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

  // Get voter additional info
  getVoterInfo: async (voterId: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/voter-info/${voterId}`, {
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

  // Get voter additional info
  getVoterInfo: async (voterId: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/voter-info/${voterId}`, {
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

  // Save voter additional info
  saveVoterInfo: async (voterId: string, voterInfo: any) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/voter-info/${voterId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.getToken()}`,
      },
      body: JSON.stringify(voterInfo),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }
};

// Compatibility layer for existing settings screens expecting *API.getAll/update*
const request = async (method: 'GET'|'PUT', path: string, body?: any) => {
  const response = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.getToken()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `HTTP ${response.status}`);
  }
  return data;
};

export const voterCategoryAPI = {
  getAll: () => request('GET', '/settings/voter-categories'),
  update: (id: string, payload: any) => request('PUT', `/settings/voter-categories/${id}`, payload),
};

export const voterLanguageAPI = {
  getAll: () => request('GET', '/settings/voter-languages'),
  update: (id: string, payload: any) => request('PUT', `/settings/voter-languages/${id}`, payload),
};

export const schemeAPI = {
  getAll: () => request('GET', '/settings/schemes'),
  update: (id: string, payload: any) => request('PUT', `/settings/schemes/${id}`, payload),
};

export const feedbackAPI = {
  getAll: () => request('GET', '/settings/feedback'),
  update: (id: string, payload: any) => request('PUT', `/settings/feedback/${id}`, payload),
};

export const partyAPI = {
  getAll: () => request('GET', '/settings/parties'),
  update: (id: string, payload: any) => request('PUT', `/settings/parties/${id}`, payload),
};

export const religionAPI = {
  getAll: () => request('GET', '/settings/religions'),
  update: (id: string, payload: any) => request('PUT', `/settings/religions/${id}`, payload),
};

export const casteCategoryAPI = {
  getAll: () => request('GET', '/settings/caste-categories'),
  update: (id: string, payload: any) => request('PUT', `/settings/caste-categories/${id}`, payload),
};

export const casteAPI = {
  getAll: () => request('GET', '/settings/castes'),
  update: (id: string, payload: any) => request('PUT', `/settings/castes/${id}`, payload),
};

export const subCasteAPI = {
  getAll: () => request('GET', '/settings/sub-castes'),
  update: (id: string, payload: any) => request('PUT', `/settings/sub-castes/${id}`, payload),
};