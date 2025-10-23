import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '../../../contexts/LanguageContext';
import { voterAPI } from '../../../services/api/voter';
import { settingsAPI } from '../../../services/api/settings';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import AgeSlider from '../../components/AgeSlider';

const { width } = Dimensions.get('window');

type StarVoter = {
  _id: string;
  serial: number;
  section: number;
  part: number;
  voterId: string;
  name: string;
  tamilName?: string;
  community?: string;
  tamilCommunity?: string;
  guardianName?: string;
  tamilGuardianName?: string;
  doorNo: string;
  age: number;
  relationship?: string;
  gender: string;
  photo?: string;
};

type GenderSummary = {
  male: number;
  female: number;
  other: number;
  total: number;
};

type FilterState = {
  gender: string[];
  ageRange: [number, number];
  community: string[];
  part: string[];
};

export default function StarScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const [voters, setVoters] = useState<StarVoter[]>([]);
  const [allVoters, setAllVoters] = useState<StarVoter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [genderSummary, setGenderSummary] = useState<GenderSummary>({
    male: 0,
    female: 0,
    other: 0,
    total: 0,
  });

  const [filters, setFilters] = useState<FilterState>({
    gender: [],
    ageRange: [18, 100],
    community: [],
    part: [],
  });

  // Mobile-like filter controls
  const [minAge, setMinAge] = useState<number>(18);
  const [maxAge, setMaxAge] = useState<number>(100);
  const [genderFilter, setGenderFilter] = useState<Set<string>>(new Set());

  const [availableCommunities, setAvailableCommunities] = useState<string[]>([]);
  const [availableParts, setAvailableParts] = useState<string[]>([]);

  // Settings-driven filter options (match Mobile/Fatherless)
  const [histories, setHistories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [religions, setReligions] = useState<any[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<Set<string>>(new Set());
  const [selectedParty, setSelectedParty] = useState<Set<string>>(new Set());
  const [selectedReligion, setSelectedReligion] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      loadStarVoters();
      return () => {
        setSearchQuery('');
        setFilters({
          gender: [],
          ageRange: [18, 100],
          community: [],
          part: [],
        });
      };
    }, [])
  );

  // Fetch voters from '60 and above' collection and show in UI
  const loadStarVoters = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch from the dedicated 60+ endpoint (backend provides `/age60above-voters`)
      // Support both shapes: { success, voters: [] } and { success, data: { items: [] } }
  // Reduce initial page size to improve first-load latency. Use pagination/infinite-scroll for more data.
  const response = await voterAPI.getAge60AboveVoters?.({ limit: 100 }) || await voterAPI.getVotersByAgeRange({ minAge: 60, maxAge: 120, page: 1, limit: 100 });
      let votersList: StarVoter[] = [];
      if (response) {
        if (Array.isArray(response.voters)) {
          votersList = response.voters as StarVoter[];
        } else if (response.data && Array.isArray(response.data)) {
          votersList = response.data as StarVoter[];
        } else if (response.data && Array.isArray(response.data.items)) {
          votersList = response.data.items as StarVoter[];
        } else if (Array.isArray(response.items)) {
          votersList = response.items as StarVoter[];
        }
      }
      if (votersList.length > 0 || response) {
        // proceed (response may include summary/pagination even when items are on a different path)
        // Normalize items to the frontend shape so fields like 'Name'/'Number'/'sex' or nested 's' are handled
        const normalize = (it: any): StarVoter => {
          const s = it.s || {};
          const name = it.name || it.Name || s.Name || s.name || '';
          const voterId = it.voterId || it.Number || s.Number || it.number || '';
          const doorNo = it.doorNo || it.DoorNo || it.Door_no || it.Door_no || s.doorNo || '';
          const age = it.age ?? it.Age ?? s.age ?? s.Age ?? 0;
          const gender = (it.gender || it.sex || it.Sex || s.sex || s.Sex || '').toString();
          const serial = it.serial ?? it.Serial ?? it.Sr ?? it.sr ?? 0;
          const section = it.section ?? it.Section ?? it.s?.Section ?? it.Anubhag_number ?? it.Anubhag_number ?? 0;
          const part = it.part ?? it.Part ?? it.partNo ?? it.part_no ?? it.Part_Name ?? it['Part Name'] ?? it.part_no ?? s.part ?? 0;
          const photo = it.photo || it.Photo || s.photo || '';
          return {
            _id: it._id || it.id || `${serial}_${voterId}`,
            serial,
            section,
            part,
            voterId,
            name,
            tamilName: it.tamilName || it.TamilName || s.tamilName || undefined,
            community: it.community || it.Community || s.community || undefined,
            tamilCommunity: it.tamilCommunity || undefined,
            guardianName: it.guardianName || it.FatherName || s.guardianName || undefined,
            tamilGuardianName: undefined,
            doorNo,
            age,
            relationship: it.relationship || it.Relation || s.relationship || undefined,
            gender,
            photo,
          } as StarVoter;
        };

        const normalized = votersList.map(normalize);
        setVoters(normalized);
        setAllVoters(normalized);

        // Prefer genderSummary from the API if present
        const respGender = (response && (response.genderSummary || response.gender_summary)) || null;
        const respPagination = response?.pagination || response?.data?.pagination || null;
        const totalFromResp = response?.total ?? respPagination?.totalCount ?? respPagination?.total ?? response?.data?.total ?? response?.data?.count ?? 0;

        // Use server-provided gender summary only if it looks valid (positive total). Otherwise compute from normalized items.
        const serverGenderTotal = respGender?.total ?? respGender?.Total ?? 0;
        if (respGender && serverGenderTotal > 0) {
          setGenderSummary({
            male: respGender.male ?? respGender.Male ?? 0,
            female: respGender.female ?? respGender.Female ?? 0,
            other: respGender.other ?? respGender.others ?? 0,
            total: serverGenderTotal,
          });
        } else {
          // Calculate gender summary from returned/normalized items
          const maleCount = normalized.filter((v: StarVoter) => {
            const g = (v.gender || '').toLowerCase();
            return g === 'male' || g === 'm' || g === 'man';
          }).length;
          const femaleCount = normalized.filter((v: StarVoter) => {
            const g = (v.gender || '').toLowerCase();
            return g === 'female' || g === 'f' || g === 'woman';
          }).length;
          const otherCount = normalized.filter((v: StarVoter) => {
            const g = (v.gender || '').toLowerCase();
            return g === 'third' || g === 'other' || g === 'transgender' || g === 'o' || g === 't';
          }).length;
          setGenderSummary({
            male: maleCount,
            female: femaleCount,
            other: otherCount,
            total: totalFromResp > 0 ? totalFromResp : normalized.length,
          });
        }

        // Get available communities and parts (if items exist)
  const communities: string[] = Array.from(new Set(normalized.map((v: StarVoter) => v.community).filter((c): c is string => Boolean(c))));
  const parts: string[] = Array.from(new Set(normalized.map((v: StarVoter) => v.part?.toString()).filter((p): p is string => Boolean(p))));
        setAvailableCommunities(communities);
        setAvailableParts(parts);
      } else {
        setError('Failed to load voters');
      }
    } catch (err: any) {
      console.log('Voters fetch error:', err?.message || err);
      setError('Failed to load voters');
    } finally {
      setLoading(false);
    }
  };

  // Load filter dropdown options (same as Mobile/Fatherless)
  useEffect(() => {
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
      } catch {
        // silent
      }
    })();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setVoters(allVoters);
      return;
    }

    const filtered = allVoters.filter(voter =>
      voter.name?.toLowerCase().includes(query.toLowerCase()) ||
      voter.voterId?.toLowerCase().includes(query.toLowerCase()) ||
      voter.tamilName?.toLowerCase().includes(query.toLowerCase())
    );
    setVoters(filtered);
  };

  const applyFilters = () => {
    let filtered = [...allVoters];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(voter =>
        voter.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voter.voterId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voter.tamilName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply gender filter
    if (filters.gender.length > 0) {
      filtered = filtered.filter(voter => filters.gender.includes(voter.gender));
    }

    // Apply age range filter
    filtered = filtered.filter(voter => 
      voter.age >= filters.ageRange[0] && voter.age <= filters.ageRange[1]
    );

    // Apply community filter
    if (filters.community.length > 0) {
      filtered = filtered.filter(voter => 
        voter.community && filters.community.includes(voter.community)
      );
    }

    // Apply part filter
    if (filters.part.length > 0) {
      filtered = filtered.filter(voter => 
        voter.part && filters.part.includes(voter.part.toString())
      );
    }

  setVoters(filtered);
  setFiltersVisible(false);
  };

  const clearFilters = () => {
    setFilters({
      gender: [],
      ageRange: [18, 100],
      community: [],
      part: [],
    });
  setVoters(allVoters);
  setFiltersVisible(false);
  };

  const toggleFilter = (type: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };
const AgeLabel = (props: any) => {
  const { oneMarkerValue, twoMarkerValue } = props;
  return (
    <View style={styles.ageLabelContainer}>
      <Text style={styles.ageLabelText}>
        {oneMarkerValue} - {twoMarkerValue} years
      </Text>
    </View>
  );
};

  const renderVoterCard = (voter: StarVoter, index: number) => {
    const openVoter = () => {
      try {
        const payload = encodeURIComponent(JSON.stringify(voter));
        router.push(`/(tabs)/dashboard/voter_info?voterData=${payload}`);
      } catch (e) {
        console.log('Routing error', e);
      }
    };

    return (
      <TouchableOpacity key={voter._id} style={styles.voterCard} activeOpacity={0.8} onPress={openVoter}>
        <View style={styles.rowTop}>
          <Text style={styles.linkText}>Serial : {voter.serial ?? index + 1}</Text>
          <Text style={styles.linkText}>Section : {voter.section ?? '-'}</Text>
          <Text style={styles.linkText}>Part : {voter.part ?? '-'}</Text>
        </View>

        <View style={{ flexDirection: 'row' }}>
          <View style={styles.imagePlaceholder}>
            {voter.photo ? (
              <Image source={{ uri: voter.photo }} style={styles.voterImage} />
            ) : (
              <Icon name="image" size={24} color="#90A4AE" />
            )}
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.voterName}>{voter.name || '-'}</Text>
            {!!voter.voterId && (
              <Text style={styles.voterIdBadge}>{voter.voterId}</Text>
            )}
            <Text style={styles.relationName}>{voter.relationship || ''}</Text>
            <Text style={styles.address}>Door No {voter.doorNo ?? '-'}</Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="person" size={16} color="#9E9E9E" />
            <Text style={{ marginLeft: 6 }}>{voter.age ?? '-'}</Text>
            <Text style={{ marginLeft: 6 }}>{voter.relationship || ''}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={styles.callButton}>
              <Icon name="call" size={18} color="#1976D2" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    // Minimal loading indicator (simple spinning circle)
    return (
      <View style={[styles.loadingContainer, { justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {
          try { router.back(); } catch { router.replace('/(tabs)/' as any); }
        }}>
          <Icon name="arrow-back" size={24} color="#1976D2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Age 60+')}</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={() => setFiltersVisible(true)}>
          <Icon name="tune" size={22} color="#0D47A1" />
        </TouchableOpacity>
      </View>

      {/* Gender Summary */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: '#C8E6C9' }]}>
            <Text style={styles.summaryLabel}>{t('common.male')}</Text>
            <Text style={styles.summaryValue}>{genderSummary.male}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#F8BBD9' }]}>
            <Text style={styles.summaryLabel}>{t('common.female')}</Text>
            <Text style={styles.summaryValue}>{genderSummary.female}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#E0E0E0' }]}>
            <Text style={styles.summaryLabel}>{t('common.others')}</Text>
            <Text style={styles.summaryValue}>{genderSummary.other}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#BBDEFB' }]}>
            <Text style={styles.summaryLabel}>{t('common.total')}</Text>
            <Text style={styles.summaryValue}>{genderSummary.total}</Text>
          </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('dashboard.searchPlaceholder')}
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
      </View>

      {/* Voters List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {voters.map((voter, index) => renderVoterCard(voter, index))}
      </ScrollView>

      {/* Filters Modal (match Mobile/Fatherless screens) */}
      {filtersVisible && (
        <View style={styles.filterOverlay}>
          <View style={styles.filterCard}>
            <Text style={styles.filterTitleSheet}>{t('dashboard.filterVoters')}</Text>
            <Text style={styles.filterSubtitle}>{t('dashboard.filterSubtitle')}</Text>

            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.sectionTitle}>{t('dashboard.age')}</Text>
              <View style={{ paddingHorizontal: 0, marginBottom: 6 }}>
                <AgeSlider values={[minAge, maxAge]} onChange={(vals) => { const a = Math.round(Math.min(vals[0], vals[1])); const b = Math.round(Math.max(vals[0], vals[1])); setMinAge(a); setMaxAge(b); }} min={60} max={120} />
              </View>

              <Text style={styles.sectionTitle}>{t('dashboard.gender')}</Text>
              <View style={styles.chipsRow}>
                {['male','female','other'].map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.chip, genderFilter.has(g) && styles.chipActive]}
                    onPress={() => {
                      const s = new Set(genderFilter);
                      if (s.has(g)) { s.delete(g); } else { s.add(g); }
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
                      if (s.has(id)) { s.delete(id); } else { s.add(id); }
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
                      if (s.has(id)) { s.delete(id); } else { s.add(id); }
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
                      if (s.has(id)) { s.delete(id); } else { s.add(id); }
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
                      if (s.has(id)) { s.delete(id); } else { s.add(id); }
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
                style={styles.clearButtonSheet}
                onPress={() => {
                  setMinAge(60); setMaxAge(120); setGenderFilter(new Set());
                  setSelectedHistory(new Set()); setSelectedCategory(new Set()); setSelectedParty(new Set()); setSelectedReligion(new Set());
                  setVoters(allVoters);
                }}
              >
                <Text style={styles.clearText}>{t('dashboard.clearAll')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButtonSheet}
                onPress={() => {
                  const filtered = allVoters.filter(v => {
                    const withinAge = (v.age ?? 0) >= minAge && (v.age ?? 0) <= maxAge;
                    const genderVal = (v.gender || '').toLowerCase();
                    const genderOk = genderFilter.size === 0 || genderFilter.has(genderVal === 'third' ? 'other' : genderVal);
                    // Add voterHistory and voterCategory filter logic
                    const historyOk = selectedHistory.size === 0 || (v.history && selectedHistory.has(v.history));
                    const categoryOk = selectedCategory.size === 0 || (v.category && selectedCategory.has(v.category));
                    return withinAge && genderOk && historyOk && categoryOk;
                  });
                  setVoters(filtered);
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
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#E3F2FD',
  paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  backButton: {
    marginRight: 10,
    borderRadius: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  voterCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  voterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  voterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serialSmall: {
    color: '#1976D2',
    fontWeight: '600',
    fontSize: 14,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  avatarBox: { width: 72, alignItems: 'center', marginRight: 12 },
  avatarImage: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#E3F2FD' },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1 },
  voterNameBig: { fontSize: 18, fontWeight: '700', color: '#000' },
  epicRow: { flexDirection: 'row', marginTop: 6, marginBottom: 6 },
  epicBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  epicText: { color: '#1976D2', fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  relationRow: { flexDirection: 'row', alignItems: 'center' },
  relationText: { marginLeft: 6, color: '#757575' },
  callButton: { padding: 6 },
  serialText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  partText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  voterImageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  voterIdContainer: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  voterIdText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  voterDetails: {
    marginBottom: 12,
  },
  voterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  tamilName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  communityText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  tamilCommunityText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  doorNoText: {
    fontSize: 14,
    color: '#666',
  },
  voterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ageLabelContainer: { alignItems: 'center', paddingVertical: 6 },
  ageLabelText: { color: '#374151', fontWeight: '600' },
  headerIcon: { width: 36, alignItems: 'flex-end', borderRadius: 0 },
  ageText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    marginRight: 8,
  },
  relationshipText: {
    fontSize: 12,
    color: '#999',
  },
  actionButton: {
    padding: 8,
  },
  // Bottom sheet filter styles (aligned with Mobile screen)
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
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  filterTitleSheet: { fontSize: 24, fontWeight: '700', color: '#1F2937' },
  filterSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginTop: 12, marginBottom: 8 },
  chipsRow: { flexDirection: 'row', gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EAF2FE', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  chipActive: { backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#1976D2' },
  chipText: { color: '#455A64', fontSize: 14 },
  chipTextActive: { color: '#1976D2', fontWeight: '600' },
  chipsRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  circleChip: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EAF2FE', alignItems: 'center', justifyContent: 'center' },
  circleChipActive: { backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#1976D2' },
  circleChipText: { color: '#1976D2', fontWeight: '700' },
  filterFooter: { flexDirection: 'row', gap: 12, marginTop: 14 },
  clearButtonSheet: { flex: 1, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12 },
  applyButtonSheet: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#90CAF9', borderRadius: 12 },
  applyText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  clearText: { color: '#64748B', fontSize: 16, fontWeight: '600' },
  closeBar: { marginTop: 12, backgroundColor: '#111827', borderRadius: 12, alignItems: 'center', paddingVertical: 14 },
  closeText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  // Aliases / additional styles to match Age 80+ card UI
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  linkText: { color: '#1565C0', fontWeight: '700' },
  imagePlaceholder: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
  voterImage: { width: 80, height: 80, borderRadius: 8, marginBottom: 8 },
  voterIdBadge: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#1976D2', color: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 12, fontWeight: '700' },
  relationName: { fontSize: 14, color: '#666' },
  address: { fontSize: 12, color: '#999' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
});
