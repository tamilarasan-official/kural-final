import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLanguage } from '../../../contexts/LanguageContext';
import HeaderBack from '../../components/HeaderBack';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function VotersMapScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { partNumber } = useLocalSearchParams();
  const mapRef = useRef<MapView | null>(null);

  // build a readable header title with fallbacks when translation keys are not available
  const titleText = (() => {
    const rawTitle = t('votersMap.title');
    const rawPart = t('votersMap.part');
    const title = (typeof rawTitle === 'string' && rawTitle.indexOf('votersMap.') === -1) ? rawTitle : 'Voters Map';
    const partLabel = (typeof rawPart === 'string' && rawPart.indexOf('votersMap.') === -1) ? rawPart : 'Part';
    return partNumber ? `${title} (${partLabel} ${partNumber})` : title;
  })();

  const initialRegion: Region = useMemo(() => ({
    latitude: 13.0827,
    longitude: 80.2707,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  }), []);

  const [region, setRegion] = useState<Region>(initialRegion);

  // top overlay labels with fallbacks
  const loadedAtLabel = (() => {
    const r = t('votersMap.dataLoadedAt');
    return (typeof r === 'string' && r.indexOf('votersMap.') === -1) ? r : 'Loaded at';
  })();
  const reloadLabel = (() => {
    const r = t('votersMap.reload');
    return (typeof r === 'string' && r.indexOf('votersMap.') === -1) ? r : 'Reload';
  })();
  const clearLabel = (() => {
    const r = t('votersMap.clear');
    return (typeof r === 'string' && r.indexOf('votersMap.') === -1) ? r : 'Clear';
  })();

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <HeaderBack onPress={() => { try { router.back(); } catch { router.push('/(tabs)/'); } }} />
        <Text style={styles.headerTitle}>{titleText}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider={PROVIDER_GOOGLE}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation
          showsMyLocationButton
        />

        {/* Top overlay with loaded time, Reload and Clear */}
        <View style={styles.topOverlay}>
          <View style={styles.loadedAtBox}>
            <Text style={styles.loadedAtText}>{loadedAtLabel}:</Text>
          </View>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              mapRef.current?.animateToRegion(initialRegion, 600);
              setRegion(initialRegion);
            }}
          >
            <Text style={styles.actionText}>{reloadLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              // Placeholder for clearing drawn items/markers when added
            }}
          >
            <Text style={styles.actionText}>{clearLabel}</Text>
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
  header: {
    backgroundColor: '#E3F2FD',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1976D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#000', fontSize: 20, fontWeight: '700' },
  topOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 8,
    gap: 8,
  },
  loadedAtBox: { flex: 1, height: 34, backgroundColor: '#EEF2F7', borderRadius: 8, justifyContent: 'center', paddingHorizontal: 10 },
  loadedAtText: { color: '#111827', fontWeight: '600' },
  actionBtn: { backgroundColor: '#0D47A1', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  actionText: { color: '#fff', fontWeight: '700' },
  zoomWrap: { position: 'absolute', right: 12, bottom: 24, gap: 10 },
  zoomBtn: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  zoomText: { fontSize: 22, color: '#111827', fontWeight: '800' },
});



