import { API_CONFIG } from './config';

const BASE_URL = `${API_CONFIG.BASE_URL}/survey-forms`;

export const surveyFormAPI = {
  // Get all survey forms
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const url = `${BASE_URL}?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.getToken()}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Survey Form API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  // Get survey form by ID
  getById: async (formId: string) => {
    const response = await fetch(`${BASE_URL}/${formId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.getToken()}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Survey Form API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  // Submit survey response
  submitResponse: async (formId: string, responseData: {
    respondentId: string;
    respondentName: string;
    respondentMobile: string;
    respondentAge?: number;
    respondentCity?: string;
    respondentVoterId?: string;
    answers: Array<{
      questionId: string;
      answer: any;
      answerText?: string;
      selectedOptions?: string[];
      rating?: number;
    }>;
  }) => {
    const response = await fetch(`${BASE_URL}/${formId}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.getToken()}`,
      },
      body: JSON.stringify(responseData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  // Get survey responses
  getResponses: async (formId: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `${BASE_URL}/${formId}/responses?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.getToken()}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Survey Form API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }
};
