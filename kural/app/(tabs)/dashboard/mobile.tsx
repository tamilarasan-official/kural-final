import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { voterAPI } from '../../../services/api/voter';
import { settingsAPI } from '../../../services/api/settings';

export const options = { headerShown: false };

const { width } = Dimensions.get('window');

type Mobile = {
  _id: string;
  Name: string;
  Relation: string;
  'Father Name': string;
  Number: string;
  sex: string;
  Door_no: string | number;
  age: number;
  part_no: number;
  Anubhag_number: number;
  'Part Name'?: string;
  'Mobile No'?: string;
  createdAt?: string;
  updatedAt?: string;
};

const AgeLabel = ({
  oneMarkerLeftPosition,
  twoMarkerLeftPosition,
  oneMarkerValue,
  twoMarkerValue,
}: any) => {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ color: '#1976D2', fontWeight: '600' }}>Age {oneMarkerValue}</Text>
    </View>
  );
};

export default function MobileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Mobile[]>([]);
  const [allItems, setAllItems] = useState<Mobile[]>([]);
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState({ male: 0, female: 0, other: 0, total: 0 });

  // Filters modal state
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [minAge, setMinAge] = useState<number>(0);
  const [maxAge, setMaxAge] = useState<number>(120);
  const [genderFilter, setGenderFilter] = useState<Set<string>>(new Set());
  const [histories, setHistories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [religions, setReligions] = useState<any[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<Set<string>>(new Set());
  const [selectedParty, setSelectedParty] = useState<Set<string>>(new Set());
  const [selectedReligion, setSelectedReligion] = useState<Set<string>>(new Set());

  const load = async () => {
    try {
      setLoading(true);
      const res = await voterAPI.getMobileVoters({ q: query, page: 1, limit: 50 });
      
      let arr: Mobile[] = Array.isArray(res?.data) ? res.data : [];
      // Handle mixed data structure - some fields at root, some in 's' object
      arr = arr.map((doc: any) => {
        if (doc && doc.s && typeof doc.s === 'object') {
          // Merge s object with root level, prioritizing root level fields
          return { ...doc.s, ...doc } as Mobile;
        }
        return doc as Mobile;
      });
      setItems(arr);
      setAllItems(arr);
      
      // Use gender summary from API response if available
      if (res?.genderSummary) {
        setStats(res.genderSummary);
      } else {
        // Fallback to calculating from data
        const counts = arr.reduce((acc, it) => {
          const g = (it?.sex || '').toLowerCase();
          if (g === 'male') acc.male += 1; else if (g === 'female') acc.female += 1; else acc.other += 1;
          acc.total += 1;
          return acc;
        }, { male: 0, female: 0, other: 0, total: 0 });
        setStats(counts);
      }
    } catch (e: any) {
      console.log('Mobile fetch error:', e?.message || e);
      setItems([]);
      setStats({ male: 0, female: 0, other: 0, total: 0 });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    // Load filter dropdown options
    (async () => {
      try {
        const [hist, cats, prts, rels] = await Promise.all([
          settingsAPI.getHistories?.() || Promise.resolve({ data: [] }),
          settingsAPI.getCategories() || Promise.resolve({ data: [] }),
          settingsAPI.getParties() || Promise.resolve({ data: [] }),
          settingsAPI.getReligions() || Promise.resolve({ data: [] }),
        ]);
        setHistories(Array.isArray(hist?.data) ? hist.data : (hist?.data ? hist.data : (hist?.items || hist) || []));
        setCategories(Array.isArray(cats?.data) ? cats.data : (cats?.items || cats) || []);
        setParties(Array.isArray(prts?.data) ? prts.data : (prts?.items || prts) || []);
        setReligions(Array.isArray(rels?.data) ? rels.data : (rels?.items || rels) || []);
      } catch (e) {
        // silent
      }
    })();
  }, []);

  useEffect(() => { 
    load(); 
  }, []);

  // Clear search and reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setQuery('');
      load();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#1976D2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mobile</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={() => setFiltersVisible(true)}>
          <Icon name="tune" size={22} color="#0D47A1" />
        </TouchableOpacity>
      </View>

      <View style={styles.countersRow}>
        <View style={[styles.counterCard, { backgroundColor: '#C8E6C9' }]}>
          <Text style={styles.counterTitle}>Male</Text>
          <Text style={styles.counterValue}>{stats.male}</Text>
        </View>
        <View style={[styles.counterCard, { backgroundColor: '#F8BBD9' }]}>
          <Text style={styles.counterTitle}>Female</Text>
          <Text style={styles.counterValue}>{stats.female}</Text>
        </View>
        <View style={[styles.counterCard, { backgroundColor: '#E0E0E0' }]}>
          <Text style={styles.counterTitle}>Others</Text>
          <Text style={styles.counterValue}>{stats.other}</Text>
        </View>
        <View style={[styles.counterCard, { backgroundColor: '#BBDEFB' }]}>
          <Text style={styles.counterTitle}>Total</Text>
          <Text style={styles.counterValue}>{stats.total}</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color="#90A4AE" />
          <TextInput
            style={styles.searchInput}
            placeholder="Voter Id or Voter Name"
            placeholderTextColor="#999"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={load}
          />
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#1976D2" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {items.map((it, idx) => (
            <View key={it._id} style={styles.voterCard}>
              <View style={styles.rowTop}>
                <Text style={styles.linkText}>Serial : {idx + 1}</Text>
                <Text style={styles.linkText}>Section : {it.Anubhag_number ?? '-'}</Text>
                <Text style={styles.linkText}>Part : {it.part_no ?? '-'}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <View style={styles.imagePlaceholder}>
                  <Icon name="image" size={24} color="#90A4AE" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.voterName}>{it.Name || '-'}</Text>
                  {!!it.Number && (
                    <Text style={styles.voterIdBadge}>{it.Number}</Text>
                  )}
                  <Text style={styles.relationName}>{it['Father Name'] || ''}</Text>
                  <Text style={styles.address}>Door No {it.Door_no ?? '-'}</Text>
                </View>
              </View>
              <View style={styles.bottomRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="person" size={16} color="#9E9E9E" />
                  <Text style={{ marginLeft: 6 }}>{it.age ?? '-'}</Text>
                  <Text style={{ marginLeft: 6 }}>{it.Relation || ''}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {it.createdAt && (
                    <Text style={styles.dateText}>
                      {new Date(it.createdAt).toLocaleDateString()}
                    </Text>
                  )}
                  <TouchableOpacity style={styles.callButton}>
                    <Icon name="call" size={18} color="#1976D2" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Filters Modal */}
      {filtersVisible && (
        <View style={styles.filterOverlay}>
          <View style={styles.filterCard}>
            <Text style={styles.filterTitle}>Filter Voters</Text>
            <Text style={styles.filterSubtitle}>Select filters to narrow down the voter list</Text>

            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.sectionTitle}>Age</Text>
              <View style={{ paddingHorizontal: 0, marginBottom: 6 }}>
                <View style={{ paddingHorizontal: 0, paddingTop: 8 }}>
                  <MultiSlider
                    values={[minAge, maxAge]}
                    min={0}
                    max={120}
                    step={1}
                    sliderLength={width - 64}
                    onValuesChange={(vals) => {
                      const a = Math.round(Math.min(vals[0], vals[1]));
                      const b = Math.round(Math.max(vals[0], vals[1]));
                      setMinAge(a);
                      setMaxAge(b);
                    }}
                    allowOverlap={false}
                    snapped
                    selectedStyle={{ backgroundColor: '#1976D2' }}
                    unselectedStyle={{ backgroundColor: '#BBDEFB' }}
                    markerStyle={{ height: 22, width: 22, backgroundColor: '#1976D2' }}
                    trackStyle={{ height: 4 }}
                    enableLabel
                    customLabel={AgeLabel}
                  />
                </View>
              </View>

              <Text style={styles.sectionTitle}>Gender</Text>
              <View style={styles.chipsRow}>
                {['male','female','other'].map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.chip, genderFilter.has(g) && styles.chipActive]}
                    onPress={() => {
                      const s = new Set(genderFilter);
                      s.has(g) ? s.delete(g) : s.add(g);
                      setGenderFilter(s);
                    }}
                  >
                    <Icon name="person" size={16} color={genderFilter.has(g) ? '#1976D2' : '#607D8B'} />
                    <Text style={[styles.chipText, genderFilter.has(g) && styles.chipTextActive]}>{g.charAt(0).toUpperCase()+g.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Voter History</Text>
              <View style={styles.chipsRowWrap}>
                {histories.map((h:any) => (
                  <TouchableOpacity
                    key={h.id || h._id}
                    style={[styles.circleChip, selectedHistory.has(h.id || h._id) && styles.circleChipActive]}
                    onPress={() => {
                      const s = new Set(selectedHistory);
                      const id = h.id || h._id;
                      s.has(id) ? s.delete(id) : s.add(id);
                      setSelectedHistory(s);
                    }}
                  >
                    <Text style={styles.circleChipText}>{h.tag || h.title?.[0] || 'H'}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Voter Category</Text>
              <View style={styles.chipsRowWrap}>
                {categories.map((c:any) => (
                  <TouchableOpacity
                    key={c.id || c._id}
                    style={[styles.circleChip, selectedCategory.has(c.id || c._id) && styles.circleChipActive]}
                    onPress={() => {
                      const s = new Set(selectedCategory);
                      const id = c.id || c._id;
                      s.has(id) ? s.delete(id) : s.add(id);
                      setSelectedCategory(s);
                    }}
                  >
                    <Icon name="check-circle" size={18} color={selectedCategory.has(c.id || c._id) ? '#1976D2' : '#90A4AE'} />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Political Party</Text>
              <View style={styles.chipsRowWrap}>
                {parties.map((p:any) => (
                  <TouchableOpacity
                    key={p.id || p._id}
                    style={[styles.circleChip, selectedParty.has(p.id || p._id) && styles.circleChipActive]}
                    onPress={() => {
                      const s = new Set(selectedParty);
                      const id = p.id || p._id;
                      s.has(id) ? s.delete(id) : s.add(id);
                      setSelectedParty(s);
                    }}
                  >
                    <Icon name="flag" size={18} color={selectedParty.has(p.id || p._id) ? '#1976D2' : '#90A4AE'} />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Religion</Text>
              <View style={styles.chipsRowWrap}>
                {religions.map((r:any) => (
                  <TouchableOpacity
                    key={r.id || r._id}
                    style={[styles.circleChip, selectedReligion.has(r.id || r._id) && styles.circleChipActive]}
                    onPress={() => {
                      const s = new Set(selectedReligion);
                      const id = r.id || r._id;
                      s.has(id) ? s.delete(id) : s.add(id);
                      setSelectedReligion(s);
                    }}
                  >
                    <Icon name="temple-buddhist" size={18} color={selectedReligion.has(r.id || r._id) ? '#1976D2' : '#90A4AE'} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.filterFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setMinAge(0); setMaxAge(120); setGenderFilter(new Set());
                  setSelectedHistory(new Set()); setSelectedCategory(new Set()); setSelectedParty(new Set()); setSelectedReligion(new Set());
                  setItems(allItems);
                }}
              >
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  const filtered = allItems.filter(v => {
                    const withinAge = (v.age ?? 0) >= minAge && (v.age ?? 0) <= maxAge;
                    const genderOk = genderFilter.size === 0 || genderFilter.has((v.sex || '').toLowerCase());
                    return withinAge && genderOk;
                  });
                  setItems(filtered);
                  setFiltersVisible(false);
                }}
              >
                <Text style={styles.applyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeBar} onPress={() => setFiltersVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#E3F2FD', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000', flex: 1, textAlign: 'center' },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },

  countersRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 12 },
  counterCard: { flex: 1, borderRadius: 12, alignItems: 'center', paddingVertical: 10, marginHorizontal: 4 },
  counterTitle: { fontWeight: '700', color: '#000' },
  counterValue: { fontSize: 18, fontWeight: '800', color: '#000' },

  searchWrap: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, elevation: 2 },
  searchInput: { marginLeft: 8, flex: 1, color: '#000' },

  content: { flex: 1, paddingHorizontal: 16 },
  voterCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 14, elevation: 2 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  linkText: { color: '#1565C0', fontWeight: '700' },
  imagePlaceholder: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
  voterName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  voterIdBadge: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#1976D2', color: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 12, fontWeight: '700' },
  voterNameTamil: { fontSize: 14, color: '#666' },
  relationName: { fontSize: 14, color: '#666' },
  relationNameTamil: { fontSize: 12, color: '#999' },
  address: { fontSize: 12, color: '#999' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  callButton: { padding: 6 },
  dateText: { fontSize: 12, color: '#666', marginRight: 8 },

  // Filter modal styles (matching voter_detail.tsx)
  filterOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  filterCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  filterTitle: { fontSize: 24, fontWeight: '700', color: '#1F2937' },
  filterSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginTop: 12, marginBottom: 8 },
  chipsRow: { flexDirection: 'row', gap: 10 },
  chipsRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EAF2FE', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  chipActive: { backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#1976D2' },
  chipText: { color: '#455A64', fontSize: 14 },
  chipTextActive: { color: '#1976D2', fontWeight: '600' },
  circleChip: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EAF2FE', alignItems: 'center', justifyContent: 'center' },
  circleChipActive: { backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#1976D2' },
  circleChipText: { color: '#1976D2', fontWeight: '700' },
  filterFooter: { flexDirection: 'row', gap: 12, marginTop: 14 },
  clearButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12 },
  clearText: { color: '#64748B', fontSize: 16, fontWeight: '600' },
  applyButton: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#90CAF9', borderRadius: 12 },
  applyText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  closeBar: { marginTop: 12, backgroundColor: '#111827', borderRadius: 12, alignItems: 'center', paddingVertical: 14 },
  closeText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
