import { API_CONFIG } from './config';

// Settings endpoints are namespaced under /settings
const BASE_URL = `${API_CONFIG.BASE_URL}/settings`;

export const settingsAPI = {
  // Get all languages (KEPT)
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

  // REMOVED: getReligions, getCastes, getSubCastes, getCategories, getCasteCategories, 
  // getParties, getSchemes, getHistory, createHistory, updateHistory, deleteHistory,
  // getFeedbacks, getHistories, getVoterInfo, saveVoterInfo
  // These methods have been disabled as their backend endpoints no longer exist
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

// KEPT: Voter Language API
export const voterLanguageAPI = {
  getAll: () => request('GET', '/settings/voter-languages'),
  update: (id: string, payload: any) => request('PUT', `/settings/voter-languages/${id}`, payload),
};

// REMOVED: voterCategoryAPI, schemeAPI, feedbackAPI, partyAPI, religionAPI,
// casteCategoryAPI, casteAPI, subCasteAPI
// These APIs have been disabled as their backend endpoints no longer exist
