import { API_CONFIG } from './config';

const BASE_URL = `${API_CONFIG.BASE_URL}/activity`;

// Helper function to handle API requests
const post = async (endpoint: string, body: object) => {
  const token = await API_CONFIG.getToken();
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  // Read the response as text first to avoid "Already read" errors
  const rawResponse = await response.text();

  if (!response.ok) {
    // Try to parse the raw text as JSON for a structured error message
    try {
      const errorData = JSON.parse(rawResponse);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    } catch (e) {
      // If parsing fails, the error is likely plain text
      throw new Error(rawResponse || `HTTP error! status: ${response.status}`);
    }
  }

  // Try to parse the raw text as JSON for a successful response
  try {
    return JSON.parse(rawResponse);
  } catch (e) {
    // If the successful response is not JSON, handle it gracefully
    console.warn('API success response was not valid JSON:', rawResponse);
    return { success: true, data: rawResponse };
  }
};

export const activityAPI = {
  login: (userId: string, aci_id: string, booth_id: string) => {
    console.log('Recording login activity with:', { userId, aci_id, booth_id });
    return post('/login', { userId, aci_id, booth_id });
  },
  logout: (userId: string) => {
    return post('/logout', { userId });
  },
  updateLocation: (userId: string, coordinates: { latitude: number; longitude: number }) => {
    // The backend expects coordinates as [longitude, latitude]
    const location = {
      type: 'Point',
      coordinates: [coordinates.longitude, coordinates.latitude],
    };
    return post('/location', { userId, location });
  },
};
