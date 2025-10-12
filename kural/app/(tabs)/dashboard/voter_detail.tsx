import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useLanguage } from '../../../contexts/LanguageContext';
import { settingsAPI } from '../../../services/api/settings';
import { voterAPI } from '../../../services/api/voter';

export const options = {
  headerShown: false,
};

const { width } = Dimensions.get('window');

interface Voter {
  _id: string;
  sr: number;
  Name: string;
  Number: string;
  Relation: string;
  'Father Name': string;
  sex: string;
  Door_No: number;
  age: number;
  Part_no: number;
  'Part Name': string;
  Anubhag_number: number;
  Anubhag_name: string;
  vidhansabha: number;
  'Mobile No': string;
}

interface GenderSummary {
  male: number;
  female: number;
  other: number;
  total: number;
}

export default function VoterDetailScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { partNumber } = useLocalSearchParams();
  const [voters, setVoters] = useState<Voter[]>([]);
  const [filteredVoters, setFilteredVoters] = useState<Voter[]>([]);
  const [genderSummary, setGenderSummary] = useState<GenderSummary>({ male: 0, female: 0, other: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  useEffect(() => {
    if (partNumber) {
      loadVotersByPart(partNumber as string);
    }
  }, [partNumber]);

  useEffect(() => {
    // Load filter dropdown options
    (async () => {
      try {
        const [hist, cats, prts, rels] = await Promise.all([
          settingsAPI.getHistories?.(),
          settingsAPI.getCategories(),
          settingsAPI.getParties(),
          settingsAPI.getReligions(),
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
    // Filter voters based on search query
    if (searchQuery.trim() === '') {
      setFilteredVoters(voters);
    } else {
      const filtered = voters.filter(voter => 
        voter.Number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voter.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voter['Father Name'].toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVoters(filtered);
    }
  }, [searchQuery, voters]);

  const loadVotersByPart = async (part: string) => {
    try {
      setLoading(true);
      
      // Try preferred endpoints first
      const [resByPart, resStats] = await Promise.allSettled([
        voterAPI.getVotersByPart(part),
        voterAPI.getVoterStats(part)
      ]);

      let list: any[] | null = null;
      if (resByPart.status === 'fulfilled') {
        const data = resByPart.value;
        list = Array.isArray(data?.voters) ? data.voters : (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : null));
      }

      // Fallback to search API by part number when list is missing
      if (!list) {
        try {
          const s = await voterAPI.searchVoters({ partNo: String(part), limit: 1000, page: 1 });
          list = Array.isArray(s?.data) ? s.data : (Array.isArray(s?.voters) ? s.voters : (Array.isArray(s) ? s : []));
        } catch {
          list = [];
        }
      }

      setVoters(list as any);
      setFilteredVoters(list as any);

      // Stats if available; else compute client-side
      if (resStats.status === 'fulfilled' && resStats.value?.stats) {
        const stats = resStats.value.stats;
        setGenderSummary({ male: stats.male || 0, female: stats.female || 0, other: stats.other || 0, total: stats.total || list.length });
      } else {
        calculateGenderSummary(list as any);
      }
    } catch (error) {
      console.error('Error loading voters:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGenderSummary = (voterList: Voter[]) => {
    const summary = voterList.reduce((acc, voter) => {
      acc.total++;
      if (voter.sex.toLowerCase() === 'male') {
        acc.male++;
      } else if (voter.sex.toLowerCase() === 'female') {
        acc.female++;
      } else {
        acc.other++;
      }
      return acc;
    }, { male: 0, female: 0, other: 0, total: 0 });
    
    setGenderSummary(summary);
  };

  const handleVoterPress = (voter: Voter) => {
    // Navigate to voter info screen - pass the voter object data directly
    console.log('Navigating with voter data:', voter);
    router.push({
      pathname: '/(tabs)/dashboard/voter_info',
      params: {
        voterData: JSON.stringify(voter),
        partNumber: partNumber
      }
    });
  };

  const getGenderIcon = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'male':
        return '👨';
      case 'female':
        return '👩';
      default:
        return '👤';
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'male':
        return '#4CAF50';
      case 'female':
        return '#E91E63';
      default:
        return '#9E9E9E';
    }
  };

  // Floating labels above each thumb for the age range slider
  const AgeLabel = ({
    oneMarkerLeftPosition,
    twoMarkerLeftPosition,
    oneMarkerValue,
    twoMarkerValue,
  }: any) => {
    return (
      <View style={{ position: 'relative', height: 20, marginBottom: 6 }}>
        <Text
          style={{
            position: 'absolute',
            left: Math.max(0, oneMarkerLeftPosition - 18),
            color: '#64748B',
            fontSize: 12,
          }}
        >
          {oneMarkerValue}
        </Text>
        <Text
          style={{
            position: 'absolute',
            left: Math.max(0, twoMarkerLeftPosition - 18),
            color: '#64748B',
            fontSize: 12,
          }}
        >
          {twoMarkerValue}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>{t('voterDetail.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('voterDetail.partNumber')} {partNumber}</Text>
        <TouchableOpacity style={styles.locationButton} onPress={() => router.push({ pathname: '/(tabs)/dashboard/voters_map', params: { partNumber: String(partNumber || '') } })}>
          <Icon name="location-on" size={24} color="#1976D2" />
        </TouchableOpacity>
      </View>

      {/* Gender Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryItem, { backgroundColor: '#C8E6C9' }]}>
            <Text style={styles.summaryLabel}>{t('common.male')}</Text>
            <Text style={styles.summaryValue}>{genderSummary.male}</Text>
          </View>
          <View style={[styles.summaryItem, { backgroundColor: '#F8BBD9' }]}>
            <Text style={styles.summaryLabel}>{t('common.female')}</Text>
            <Text style={styles.summaryValue}>{genderSummary.female}</Text>
          </View>
          <View style={[styles.summaryItem, { backgroundColor: '#E0E0E0' }]}>
            <Text style={styles.summaryLabel}>{t('common.others')}</Text>
            <Text style={styles.summaryValue}>{genderSummary.other}</Text>
          </View>
          <View style={[styles.summaryItem, { backgroundColor: '#BBDEFB' }]}>
            <Text style={styles.summaryLabel}>{t('common.total')}</Text>
            <Text style={styles.summaryValue}>{genderSummary.total}</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
              <Icon name="search" size={18} color="#90A4AE" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('dashboard.searchPlaceholder')}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchAction}>
            <Text style={styles.searchActionIcon}>⇅</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchAction} onPress={() => setFiltersVisible(true)}>
            <Icon name="tune" size={18} color="#607D8B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Voter List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredVoters.map((voter) => (
          <TouchableOpacity
            key={voter._id}
            style={styles.voterCard}
            onPress={() => handleVoterPress(voter)}
            activeOpacity={0.7}
          >
            {/* Serial Number */}
            <View style={styles.serialContainer}>
              <Icon name="star" size={18} color="#FFD54F" />
              <Text style={styles.serialText}>{t('dashboard.serial')} No: {voter.sr}</Text>
            </View>

            <View style={styles.voterContent}>
              {/* Left Side - Image and EPIC ID */}
              <View style={styles.imageContainer}>
                <View style={styles.imagePlaceholder}>
                <Icon name="image" size={16} color="#B0BEC5" />
                  <Text style={styles.noImageIcon}>🚫</Text>
                </View>
                <View style={styles.epicContainer}>
                  <Text style={styles.epicId}>{voter.Number}</Text>
                </View>
              </View>

              {/* Right Side - Voter Details */}
              <View style={styles.voterDetails}>
                <Text style={styles.voterName}>{voter.Name}</Text>
                <Text style={styles.relationName}>{voter['Father Name']}</Text>
                <Text style={styles.address}>{t('dashboard.doorNo')} {voter.Door_No}</Text>
              </View>
            </View>

            {/* Bottom Info */}
            <View style={styles.bottomInfo}>
              <View style={styles.ageContainer}>
                <Icon name="person" size={16} color={getGenderColor(voter.sex)} />
                <Text style={styles.ageText}>{voter.age}</Text>
                <Text style={styles.relationType}>{voter.Relation}</Text>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Icon name="call" size={18} color="#1976D2" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filters Modal */}
      {filtersVisible && (
        <View style={styles.filterOverlay}>
          <View style={styles.filterCard}>
            <Text style={styles.filterTitle}>{t('dashboard.filterVoters')}</Text>
            <Text style={styles.filterSubtitle}>{t('dashboard.filterSubtitle')}</Text>

            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.sectionTitle}>{t('dashboard.age')}</Text>
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

              <Text style={styles.sectionTitle}>{t('dashboard.gender')}</Text>
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

              <Text style={styles.sectionTitle}>{t('dashboard.voterHistory')}</Text>
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

              <Text style={styles.sectionTitle}>{t('dashboard.voterCategory')}</Text>
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

              <Text style={styles.sectionTitle}>{t('dashboard.politicalParty')}</Text>
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

              <Text style={styles.sectionTitle}>{t('dashboard.religion')}</Text>
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
                  setFilteredVoters(voters);
                }}
              >
                <Text style={styles.clearText}>{t('dashboard.clearAll')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  const filtered = voters.filter(v => {
                    const withinAge = (v.age ?? 0) >= minAge && (v.age ?? 0) <= maxAge;
                    const genderOk = genderFilter.size === 0 || genderFilter.has((v.sex || '').toLowerCase());
                    return withinAge && genderOk;
                  });
                  setFilteredVoters(filtered);
                  setFiltersVisible(false);
                }}
              >
                <Text style={styles.applyText}>{t('dashboard.applyFilters')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeBar} onPress={() => setFiltersVisible(false)}>
              <Text style={styles.closeText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#E3F2FD',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
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
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  locationButton: {
    width: 40,
    height: 40,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    fontSize: 18,
    color: '#999',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  searchAction: {
    padding: 8,
    marginLeft: 5,
  },
  searchActionIcon: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  filterCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  filterTitle: { fontSize: 24, fontWeight: '700', color: '#1F2937' },
  filterSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginTop: 12, marginBottom: 8 },
  rangeRow: { flexDirection: 'row', gap: 12 },
  rangeBox: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 10, padding: 10 },
  rangeLabel: { fontSize: 12, color: '#64748B' },
  rangeInput: { marginTop: 4, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
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
  voterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  serialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  starIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  serialText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  voterContent: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  imageIcon: {
    fontSize: 24,
    color: '#1976D2',
  },
  noImageIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 12,
    color: '#1976D2',
  },
  epicContainer: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  epicId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  voterDetails: {
    flex: 1,
  },
  voterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  voterNameTamil: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  relationName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  relationNameTamil: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    color: '#999',
  },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  ageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginRight: 5,
  },
  relationType: {
    fontSize: 12,
    color: '#666',
  },
  callButton: {
    padding: 8,
  },
  callIcon: {
    fontSize: 18,
    color: '#1976D2',
  },
});
