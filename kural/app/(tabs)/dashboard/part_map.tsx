import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useRouter } from 'expo-router';

export const options = { headerShown: false };

export default function PartMapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);

  const initialRegion: Region = {
    latitude: 13.0827,
    longitude: 80.2707,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  };

  const [region, setRegion] = useState<Region>(initialRegion);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ color: '#1976D2', fontSize: 18 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Part Map</Text>
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
            <Text style={styles.actionText}>Reload</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              // clear: future hook to clear drawn shapes/markers; for now no-op
            }}
          >
            <Text style={styles.actionText}>Clear</Text>
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
  header: { backgroundColor: '#E3F2FD', paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#000', fontSize: 20, fontWeight: '800' },
  topBar: { position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 8, gap: 8 },
  fakeSearch: { flex: 1, height: 34, backgroundColor: '#EEF2F7', borderRadius: 8 },
  actionBtn: { backgroundColor: '#0D47A1', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  actionText: { color: '#fff', fontWeight: '700' },
  zoomWrap: { position: 'absolute', right: 12, bottom: 24, gap: 10 },
  zoomBtn: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  zoomText: { fontSize: 22, color: '#111827', fontWeight: '800' },
});


