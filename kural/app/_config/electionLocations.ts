// Mapping of election display name -> default map location (latitude/longitude)
// NOTE: These coordinates are approximate placeholders for the Coimbatore area.
// Please verify and adjust the latitude/longitude values to the authoritative values
// for each election/area (Thondamuthur, Thaliyur, etc.) before release.
export const ELECTION_LOCATIONS: Record<string, { latitude: number; longitude: number; latitudeDelta?: number; longitudeDelta?: number }> = {
  '118 - Thondamuthur': {
    // Approximate location near Thondamuthur, Coimbatore - verify
    latitude: 10.9225,
    longitude: 76.7950,
    latitudeDelta: 0.06,
    longitudeDelta: 0.06,
  },
  '119 - Thaliyur': {
    // Approximate location near Dhaliyur/Thaliyur, Coimbatore - updated
    latitude: 10.9764,
    longitude: 76.8521,
    latitudeDelta: 0.06,
    longitudeDelta: 0.06,
  },
};

export const DEFAULT_ELECTION_KEY = 'defaultElection';
