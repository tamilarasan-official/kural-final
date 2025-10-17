// Election location type
export type ElectionLocation = {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
};

// Mapping of election display name -> default map location (latitude/longitude)
export const ELECTION_LOCATIONS: Record<string, ElectionLocation> = {
  '118 - Thondamuthur': {
    // Approximate location near Thondamuthur
    latitude: 10.9753,
    longitude: 76.8586,
    latitudeDelta: 0.06,
    longitudeDelta: 0.06,
  },
  '119 - Thaliyur': {
    // Approximate location near Thaliyur (Dhaliyur)
    latitude: 11.0098,
    longitude: 76.8487,
    latitudeDelta: 0.06,
    longitudeDelta: 0.06,
  },
};

export const DEFAULT_ELECTION_KEY = 'defaultElection';
