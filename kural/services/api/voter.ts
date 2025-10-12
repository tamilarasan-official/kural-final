import { API_CONFIG } from './config';

const BASE_URL = `${API_CONFIG.BASE_URL}/voters`;

export const voterAPI = {
  // Search voters with advance search parameters
  searchVoters: async (searchParams: {
    mobileNo?: string;
    Number?: string;
    age?: string;
    partNo?: string;
    serialNo?: string;
    Name?: string;
    'Father Name'?: string;
    relationFirstName?: string;
    relationLastName?: string;
    'Mobile No'?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await fetch(`${BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.getToken()}`,
      },
      body: JSON.stringify(searchParams),
    });

    // Read as text first to avoid JSON parse crashes when server returns plain text/HTML
    const raw = await response.text();

    if (!response.ok) {
      try {
        const errorData = JSON.parse(raw);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      } catch {
        throw new Error(raw || `HTTP error! status: ${response.status}`);
      }
    }

    try {
      return JSON.parse(raw);
    } catch {
      // Normalize non-JSON success payloads
      return { success: false, message: raw } as any;
    }
  },

  // Transgender voters list
  getTransgenderVoters: async (params?: { q?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const qs = query.toString();
    const response = await fetch(`${API_CONFIG.BASE_URL}/transgender-voters${qs ? `?${qs}` : ''}`, {
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

  // Get voter by ID
  getVoterById: async (voterId: string) => {
    const response = await fetch(`${BASE_URL}/${voterId}`, {
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

  // Get voter by EPIC number
  getVoterByEpic: async (epicNumber: string) => {
    const response = await fetch(`${BASE_URL}/by-epic/${epicNumber}`, {
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

  // Get unique part names from votersdata collection
  getPartNames: async () => {
    const response = await fetch(`${BASE_URL}/part-names`, {
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

  // Get voters by part number
  getVotersByPart: async (partNumber: string, options?: { page?: number; limit?: number }) => {
    const ts = Date.now();
    const qp = new URLSearchParams();
    if (options?.page) qp.append('page', String(options.page));
    if (options?.limit) qp.append('limit', String(options.limit));
    qp.append('_', String(ts));
    const qs = qp.toString();
    const response = await fetch(`${BASE_URL}/by-part/${partNumber}?${qs}`, {
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

  // Get voter statistics by part number
  getVoterStats: async (partNumber: string) => {
    const ts = Date.now();
    const response = await fetch(`${BASE_URL}/stats/${partNumber}?_=${ts}`, {
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

  // Get Part & Section Info by Part Name
  getPartSectionInfo: async (partName: string) => {
    const response = await fetch(`${BASE_URL}/part-section-info/${encodeURIComponent(partName)}`, {
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

  // Get fatherless voters
  getFatherlessVoters: async (params: { q?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const response = await fetch(`${API_CONFIG.BASE_URL}/fatherless-voters?${query.toString()}`, {
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

  // Get guardian voters
  getGuardianVoters: async (params: { q?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const response = await fetch(`${API_CONFIG.BASE_URL}/guardian-voters?${query.toString()}`, {
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

  // Get mobile voters
  getMobileVoters: async (params: { q?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const response = await fetch(`${API_CONFIG.BASE_URL}/mobile-voters?${query.toString()}`, {
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

  // Get age 80+ voters
  getAge80AboveVoters: async (params: { q?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const response = await fetch(`${API_CONFIG.BASE_URL}/age80above-voters?${query.toString()}`, {
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

  // Get catalogue items
  getCatalogueItems: async (params: { q?: string; page?: number; limit?: number; category?: string }) => {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.category) query.append('category', params.category);

    const response = await fetch(`${API_CONFIG.BASE_URL}/catalogue?${query.toString()}`, {
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

  // Get single catalogue item
  getCatalogueItem: async (id: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/catalogue/${id}`, {
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
