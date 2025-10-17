import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

const { width } = Dimensions.get('window');
const INNER_WIDTH = width - 96; // consistent with other filter layouts

type Props = {
  values: [number, number];
  min?: number;
  max?: number;
  onChange: (v: [number, number]) => void;
};

export default function AgeSlider({ values, min = 0, max = 120, onChange }: Props) {
  const [liveValues, setLiveValues] = useState<[number, number]>([values[0], values[1]]);

  // Keep local liveValues in sync when parent updates values
  useEffect(() => {
    setLiveValues([values[0], values[1]]);
  }, [values[0], values[1]]);

  return (
    <View style={styles.container}>
      <View style={[styles.inner, { width: INNER_WIDTH }]}> 
        {/* Selected values (dynamic) shown above the track */}
        <View style={styles.selectedRow}>
          <Text style={styles.selectedValue}>{liveValues[0]}</Text>
          <Text style={styles.selectedValue}>{liveValues[1]}</Text>
        </View>

        {/* Slider row: two handles, blue selected track between them */}
        <View style={styles.sliderRow}>
          <MultiSlider
            values={[liveValues[0], liveValues[1]]}
            min={min}
            max={max}
            step={1}
            sliderLength={INNER_WIDTH}
            onValuesChange={(vals) => {
              const a = Math.round(Math.min(vals[0], vals[1]));
              const b = Math.round(Math.max(vals[0], vals[1]));
              setLiveValues([a, b]);
              onChange([a, b]);
            }}
            allowOverlap={false}
            snapped
            selectedStyle={{ backgroundColor: '#1976D2' }}
            unselectedStyle={{ backgroundColor: '#BBDEFB' }}
            markerStyle={{ height: 22, width: 22, borderRadius: 11, backgroundColor: '#1976D2' }}
            trackStyle={{ height: 4 }}
          />
        </View>

        {/* bottom labels removed as requested */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  inner: { paddingVertical: 8 },
  sliderRow: { paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  selectedRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 6 },
  selectedValue: { color: '#1976D2', fontWeight: '700', fontSize: 14 },
});
