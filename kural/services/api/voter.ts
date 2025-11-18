import { API_CONFIG } from './config';

const BASE_URL = `${API_CONFIG.BASE_URL}/voters`;

export const voterAPI = {
  // Search voters with advance search parameters
  searchVoters: async (searchParams: {
    mobileNo?: string;
    Number?: string;
    age?: string;
    boothno?: string;
    serialNo?: string;
    Name?: string;
    'Father Name'?: string;
    relationFirstName?: string;
    relationLastName?: string;
    'Mobile No'?: string;
    page?: number;
    limit?: number;
  }) => {
    const token = await API_CONFIG.getToken();
    const response = await fetch(`${BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
    const token = await API_CONFIG.getToken();
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const qs = query.toString();
    const response = await fetch(`${API_CONFIG.BASE_URL}/transgender-voters${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
    const token = await API_CONFIG.getToken();
    const response = await fetch(`${BASE_URL}/${voterId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
    const token = await API_CONFIG.getToken();
    const response = await fetch(`${BASE_URL}/by-epic/${epicNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  // Get unique booth names from votersdata collection
  getBoothNames: async () => {
    const token = await API_CONFIG.getToken();
    const response = await fetch(`${BASE_URL}/booth-names`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  // Get voters by booth number
  getVotersByBooth: async (boothNumber: string, options?: { page?: number; limit?: number }) => {
    const token = await API_CONFIG.getToken();
    const ts = Date.now();
    const qp = new URLSearchParams();
    if (options?.page) qp.append('page', String(options.page));
    if (options?.limit) qp.append('limit', String(options.limit));
    qp.append('_', String(ts));
    const qs = qp.toString();
    const response = await fetch(`${BASE_URL}/by-booth/${boothNumber}?${qs}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  // Get voters by booth ID and ACI ID
  getVotersByBoothId: async (aciId: string, boothId: string, options?: { page?: number; limit?: number }) => {
    const token = await API_CONFIG.getToken();
    const ts = Date.now();
    const qp = new URLSearchParams();
    if (options?.page) qp.append('page', String(options.page));
    if (options?.limit) qp.append('limit', String(options.limit));
    qp.append('_', String(ts));
    const qs = qp.toString();
    const response = await fetch(`${BASE_URL}/by-booth/${aciId}/${boothId}?${qs}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  // Get voter statistics by booth number
  getVoterStats: async (boothNumber: string) => {
    const token = await API_CONFIG.getToken();
    const ts = Date.now();
    const response = await fetch(`${BASE_URL}/stats/${boothNumber}?_=${ts}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  // Get Booth & Section Info by Booth Name
  getBoothSectionInfo: async (boothName: string) => {
    const token = await API_CONFIG.getToken();
    const response = await fetch(`${BASE_URL}/booth-section-info/${encodeURIComponent(boothName)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
    const token = await API_CONFIG.getToken();
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const response = await fetch(`${API_CONFIG.BASE_URL}/fatherless-voters?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
    const token = await API_CONFIG.getToken();
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const response = await fetch(`${API_CONFIG.BASE_URL}/guardian-voters?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
    const token = await API_CONFIG.getToken();
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const response = await fetch(`${API_CONFIG.BASE_URL}/mobile-voters?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
    const token = await API_CONFIG.getToken();
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const response = await fetch(`${API_CONFIG.BASE_URL}/age80above-voters?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  // Get age 60+ voters (collection: '60 and above')
  getAge60AboveVoters: async (params: { q?: string; page?: number; limit?: number }) => {
    const token = await API_CONFIG.getToken();
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const response = await fetch(`${API_CONFIG.BASE_URL}/age60above-voters?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
    const token = await API_CONFIG.getToken();
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.category) query.append('category', params.category);

    const response = await fetch(`${API_CONFIG.BASE_URL}/catalogue?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
    const token = await API_CONFIG.getToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/catalogue/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  // Get voters by age range (for Age 60+ screen)
  getVotersByAgeRange: async ({ minAge, maxAge, page = 1, limit = 1000 }: { minAge: number; maxAge: number; page?: number; limit?: number }) => {
    const token = await API_CONFIG.getToken();
    const query = new URLSearchParams();
    query.append('minAge', String(minAge));
    query.append('maxAge', String(maxAge));
    query.append('page', String(page));
    query.append('limit', String(limit));
    const qs = query.toString();
    const response = await fetch(`${BASE_URL}/age-range?${qs}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  },

  // Mark voter as verified
  markAsVerified: async (voterId: string) => {
    const token = await API_CONFIG.getToken();
    const response = await fetch(`${BASE_URL}/${voterId}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  // Update voter information
  updateVoterInfo: async (voterId: string, updateData: any) => {
    const token = await API_CONFIG.getToken();
    const response = await fetch(`${BASE_URL}/${voterId}/info`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  // Create new voter
  createVoter: async (voterData: {
    voterId: string;
    nameEnglish: string;
    nameTamil?: string;
    dob?: string;
    address: string;
    fatherName?: string;
    doorNumber?: string;
    fatherless?: boolean;
    guardian?: string;
    age: string;
    gender: string;
    mobile?: string;
    email?: string;
    aadhar?: string;
    pan?: string;
    religion?: string;
    caste?: string;
    subcaste?: string;
    booth_id: string;
    boothname?: string;
    boothno?: number;
    aci_id?: string;
    aci_name?: string;
  }) => {
    const token = await API_CONFIG.getToken();
    console.log('🔵 Sending voter creation request:', JSON.stringify(voterData, null, 2));
    const response = await fetch(`${BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(voterData),
    });

    console.log('🔵 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Backend error response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      } catch (e) {
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('✅ Voter created successfully:', data);
    return data;
  },
};
