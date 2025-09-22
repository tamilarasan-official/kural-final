export const API_CONFIG = {
  // Change this to your actual API domain in production
  BASE_URL: "http://localhost:3000/api",

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
};