export const API_CONFIG = {
  // Change this to your actual API domain in production
  BASE_URL: "https://api.kuralapp.in/api/v1",

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
    CADRES: "/cadres",
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