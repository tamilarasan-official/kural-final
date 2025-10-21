import { API_CONFIG } from './config';

// Generic API function for modal content
const apiCall = async (endpoint: string, method: string = 'GET', data?: any) => {
  // Debounce/throttle: Only allow one call per endpoint per 500ms
  if (!apiCall._lastCall) apiCall._lastCall = {};
  const now = Date.now();
  if (apiCall._lastCall[endpoint] && now - apiCall._lastCall[endpoint] < 500) {
    return Promise.reject(new Error('Throttled: Too many requests'));
  }
  apiCall._lastCall[endpoint] = now;

  let attempt = 0;
  let lastError = null;
  while (attempt < 4) {
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

      // Retry for 429 Too Many Requests
      if (response.status === 429) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, 8s
        await new Promise(res => setTimeout(res, delay));
        attempt++;
        lastError = new Error('HTTP 429 Too Many Requests');
        continue;
      }

      if (!response.ok) {
        // Try to log raw text for debugging
        const text = await response.text();
        console.error(`API call failed for ${endpoint}: HTTP ${response.status}, Response:`, text);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check content-type before parsing JSON
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error(`API call for ${endpoint} did not return JSON. Raw response:`, text);
        throw new Error('API did not return JSON');
      }

      // Try-catch for JSON parsing
      try {
        return await response.json();
      } catch (jsonErr) {
        const text = await response.text();
        console.error(`API call for ${endpoint} returned invalid JSON. Raw response:`, text);
        throw new Error('API returned invalid JSON');
      }
    } catch (error) {
      lastError = error;
      if (attempt >= 3) {
        console.error(`API call failed for ${endpoint}:`, error);
        throw error;
      }
      attempt++;
    }
  }
  throw lastError || new Error('API call failed');
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
