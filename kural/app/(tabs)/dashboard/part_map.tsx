import React, { useRef, useState, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../../contexts/LanguageContext';
import HeaderBack from '../../components/HeaderBack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_ELECTION_KEY, ELECTION_LOCATIONS } from '../../_config/electionLocations';

export const options = { headerShown: false };

export default function PartMapScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const mapRef = useRef<MapView | null>(null);

  // Default region (fallback to Coimbatore center if no selection)
  const initialRegion: Region = {
    latitude: 11.0168,
    longitude: 76.9558,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  };

  // Load persisted election and set initial region if mapping exists
  const loadSavedElection = async () => {
    try {
      const savedRaw = await AsyncStorage.getItem(DEFAULT_ELECTION_KEY);
      const saved = savedRaw ? savedRaw.trim() : savedRaw;
      console.log('PartMap: loaded saved default election key:', savedRaw);
      if (saved && ELECTION_LOCATIONS[saved]) {
        const loc = ELECTION_LOCATIONS[saved];
        const regionFromElection: Region = {
          latitude: loc.latitude,
          longitude: loc.longitude,
          latitudeDelta: loc.latitudeDelta ?? 0.06,
          longitudeDelta: loc.longitudeDelta ?? 0.06,
        };
        setRegion(regionFromElection);
        // center map
        mapRef.current?.animateToRegion(regionFromElection, 600);
      } else if (saved) {
        // Fallback: try to match by AC name part (e.g., 'Thaliyur')
        const namePart = saved.includes('-') ? saved.split('-').pop()!.trim() : saved;
        const matchedKey = Object.keys(ELECTION_LOCATIONS).find(k => k.includes(namePart));
        if (matchedKey) {
          console.log('PartMap: fallback matched key for', saved, '=>', matchedKey);
          const loc = ELECTION_LOCATIONS[matchedKey];
          const regionFromElection: Region = {
            latitude: loc.latitude,
            longitude: loc.longitude,
            latitudeDelta: loc.latitudeDelta ?? 0.06,
            longitudeDelta: loc.longitudeDelta ?? 0.06,
          };
          setRegion(regionFromElection);
          mapRef.current?.animateToRegion(regionFromElection, 600);
        } else {
          console.log('PartMap: no mapping found for saved default election key:', saved);
        }
      }
    } catch (err) {
      console.warn('Failed to load default election location', err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSavedElection();
    }, [])
  );

  const [region, setRegion] = useState<Region>(initialRegion);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <HeaderBack onPress={() => { try { router.back(); } catch { router.replace('/(tabs)/' as any); } }} />
        <Text style={styles.title}>{t('partMap.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider={PROVIDER_GOOGLE}
          region={region}
          onRegionChangeComplete={setRegion}
        />

        {/* Top search + actions bar placeholder with Reload/Clear */}
        <View style={styles.topBar}>
          <View style={styles.fakeSearch} />
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              // reload: reset to initial region (placeholder for future data refetch)
              setRegion(initialRegion);
              mapRef.current?.animateToRegion(initialRegion, 600);
            }}
          >
            <Text style={styles.actionText}>{t('common.reload')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              // clear: future hook to clear drawn shapes/markers; for now no-op
            }}
          >
            <Text style={styles.actionText}>{t('common.clear')}</Text>
          </TouchableOpacity>
        </View>

        {/* Zoom controls */}
        <View style={styles.zoomWrap}>
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => {
              const next: Region = {
                ...region,
                latitudeDelta: region.latitudeDelta * 0.7,
                longitudeDelta: region.longitudeDelta * 0.7,
              };
              setRegion(next);
              mapRef.current?.animateToRegion(next, 200);
            }}
          >
            <Text style={styles.zoomText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => {
              const next: Region = {
                ...region,
                latitudeDelta: region.latitudeDelta / 0.7,
                longitudeDelta: region.longitudeDelta / 0.7,
              };
              setRegion(next);
              mapRef.current?.animateToRegion(next, 200);
            }}
          >
            <Text style={styles.zoomText}>−</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#E3F2FD', paddingTop: 12, paddingBottom: 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  backBtn: { width: 36, height: 36, borderRadius: 0, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#1976D2', fontSize: 18, fontWeight: '700' },
  title: { color: '#000', fontSize: 20, fontWeight: '800' },
  topBar: { position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 8, gap: 8 },
  fakeSearch: { flex: 1, height: 34, backgroundColor: '#EEF2F7', borderRadius: 8 },
  actionBtn: { backgroundColor: '#0D47A1', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  actionText: { color: '#fff', fontWeight: '700' },
  zoomWrap: { position: 'absolute', right: 12, bottom: 24, gap: 10 },
  zoomBtn: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  zoomText: { fontSize: 22, color: '#111827', fontWeight: '800' },
});


