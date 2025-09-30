export const API_CONFIG = {
  // Change this to your actual API domain in production
  BASE_URL: "http://192.168.31.31:5000/api/v1",

  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      SIGNUP: "/auth/signup",
      VERIFY: "/auth/verify",
    },
    DOCTOR: {
      DASHBOARD: "/doctor/dashboard",
      PATIENTS: "/doctor/patients",
      PROFILE: "/doctor/profile",
      QUERIES: "/doctor/queries",
      DELETE: "/doctor/delete",
    },
    GAMES: {
      RESULTS: "/games/results",
      TODAY: "/games/today",
      HISTORY: "/games/history",
    },
    PATIENT: {
      DASHBOARD: "/patient/dashboard",
      QUERIES: "/patient/queries",
      PROFILE: "/patient/profile",
      DOCTORS: "/patient/doctors",
      DELETE: "/patient/delete",
    },
    QUERIES: "/queries",
  },

  // Get authentication token from storage
  getToken: () => {
    // For now, return a placeholder token
    // In a real app, you would get this from AsyncStorage or secure storage
    return "placeholder-token";
  },
};