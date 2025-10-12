import { API_CONFIG } from './config';

const BASE = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SOON_VOTERS}`;

export type SoonVoterPayload = {
  part?: number;
  serialNo?: string;
  epicId?: string;
  voterName?: string;
  relationName?: string;
  relationType?: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  age?: number;
  ne?: string;
  address?: string;
  gender?: 'male' | 'female' | 'other';
  remarks?: string;
  location?: { type?: 'Point'; coordinates: [number, number] };
};

export const soonVoterAPI = {
  list: async (params?: { q?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.append('q', params.q);
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));
    const res = await fetch(`${BASE}${qs.toString() ? `?${qs.toString()}` : ''}` , {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await safeJson(res);
      throw new Error(err?.message || `HTTP ${res.status}`);
    }
    return res.json();
  },
  create: async (payload: SoonVoterPayload) => {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const raw = await res.text();
    if (!res.ok) {
      try { const j = JSON.parse(raw); throw new Error(j?.message || `HTTP ${res.status}`); }
      catch { throw new Error(raw || `HTTP ${res.status}`); }
    }
    try { return JSON.parse(raw); } catch { return { success: true } as any; }
  },
};

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return undefined as any; }
}


