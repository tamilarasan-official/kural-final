// Determine the correct base URL based on environment
// For Android Emulator: use 10.0.2.2
// For Physical Device: use your computer's local IP (check ipconfig)
// For iOS Simulator: use localhost

const getBaseURL = () => {
  // Default to Physical Device on WiFi (Expo Go)
  const LOCAL_NETWORK_URL = "http://10.19.146.109:5000/api/v1"; // Your WiFi IP for physical device
  // const EMULATOR_URL = "http://10.0.2.2:5000/api/v1"; // Uncomment for Android Emulator
  
  // You can manually switch between these based on your testing device
  // For Physical Device with Expo Go: use LOCAL_NETWORK_URL
  // For Android Emulator: use EMULATOR_URL
  
  return LOCAL_NETWORK_URL; // Currently set for Expo Go on physical device
};

export const API_CONFIG = {
  // Change this to your actual API domain in production
  BASE_URL: getBaseURL(),

  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
    },
    VOTERS: "/voters",
    VOTER_INFO: "/voter-info",
    TRANSGENDER_VOTERS: "/transgender-voters",
    FATHERLESS_VOTERS: "/fatherless-voters",
    GUARDIAN_VOTERS: "/guardian-voters",
    MOBILE_VOTERS: "/mobile-voters",
    AGE80ABOVE_VOTERS: "/age80above-voters",
    PART_COLORS: "/part-colors",
    VULNERABILITIES: "/vulnerabilities",
    SETTINGS: "/settings",
    SURVEYS: "/surveys",
    SURVEY_FORMS: "/survey-forms",
    BOOTHS: "/booths",
    MODAL_CONTENT: "/modal-content",
    CATALOGUE: "/catalogue",
    SOON_VOTERS: "/soon-voters",
  },

  // Get authentication token from storage
  getToken: () => {
    // For now, return a placeholder token
    // In a real app, you would get this from AsyncStorage or secure storage
    return "placeholder-token";
  },
};