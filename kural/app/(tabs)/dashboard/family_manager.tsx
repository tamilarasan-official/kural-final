import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import HeaderBack from '../../components/HeaderBack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { voterAPI } from '../../../services/api/voter';
import { useLanguage } from '../../../contexts/LanguageContext';

type Voter = {
  _id: string;
  sr: number;
  Name: string;
  Number: string;
  'Father Name': string;
  sex: string;
  Door_No: number;
  age: number;
  Part_no: number;
  'Part Name': string;
};

export const options = { headerShown: false };

export default function FamilyManagerScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { partNumber } = useLocalSearchParams();
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedFamilyKey, setSelectedFamilyKey] = useState<string | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [advOpen, setAdvOpen] = useState(false);
  const [showPartsModal, setShowPartsModal] = useState(false);
  const [partsSearch, setPartsSearch] = useState('');
  const [adv, setAdv] = useState({
    mobileNo: '',
    Number: '',
    age: '',
    partNo: '',
    serialNo: '',
    Name: '',
    'Father Name': '',
    relationFirstName: '',
    relationLastName: '',
  });

  useEffect(() => {
    if (!partNumber) { setLoading(false); return; }
    (async () => {
      try {
        setLoading(true);
        // Try primary endpoint
        let list: any[] | null = null;
        try {
          const res = await voterAPI.getVotersByPart(partNumber as string, { page: 1, limit: 1000 });
          if (res?.success && Array.isArray(res.voters)) list = res.voters;
          else if (Array.isArray(res?.data)) list = res.data;
          else if (Array.isArray(res)) list = res as any[];
        } catch {}

        // Fallback: search API by part number
        if (!list) {
          try {
            const s = await voterAPI.searchVoters({ partNo: String(partNumber), page: 1, limit: 1000 });
            if (Array.isArray(s?.data)) list = s.data as any[];
            else if (Array.isArray(s?.voters)) list = s.voters as any[];
            else if (Array.isArray(s)) list = s as any[];
          } catch { list = []; }
        }

        setVoters(list || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [partNumber]);

  const doSearch = async () => {
    if (!query.trim()) { setResults([]); setShowSearchModal(false); return; }
    try {
      const resp = await voterAPI.searchVoters({ Name: query.trim(), partNo: String(partNumber || ''), page: 1, limit: 10 });
      if (resp?.success) {
        setResults(resp.data || []);
        setPagination(resp.pagination);
        setCurrentPage(resp.pagination?.currentPage || 1);
      } else {
        setResults(resp?.data || resp || []);
        setPagination(resp?.pagination || null);
        setCurrentPage(resp?.pagination?.currentPage || 1);
      }
      setShowSearchModal(true);
    } catch (e) {
      setResults([]);
      setShowSearchModal(true);
    }
  };

  const doAdvanceSearch = async () => {
    try {
      const clean = Object.fromEntries(Object.entries(adv).filter(([_, v]) => String(v || '').trim() !== '')) as any;
      const resp = await voterAPI.searchVoters({ ...clean, page: 1, limit: 10 });
      if (resp?.success) {
        setResults(resp.data || []);
        setPagination(resp.pagination);
        setCurrentPage(resp.pagination?.currentPage || 1);
      } else {
        setResults(resp?.data || resp || []);
        setPagination(resp?.pagination || null);
        setCurrentPage(resp?.pagination?.currentPage || 1);
      }
      setAdvOpen(false);
      setShowSearchModal(true);
    } catch (e) {
      setAdvOpen(false);
      setResults([]);
      setShowSearchModal(true);
    }
  };

  const handleNoFamilyPress = () => {
    if (partNumber) {
      router.push(`/(tabs)/dashboard/no_family?partNumber=${partNumber}`);
    }
  };

  // Clear search data when screen loses focus
  useFocusEffect(
    useCallback(() => {
      // Clear search data when screen comes into focus
      return () => {
        setQuery('');
        setResults([]);
        setPagination(null);
        setCurrentPage(1);
        setAdvOpen(false);
        setAdv({
          mobileNo: '',
          Number: '',
          age: '',
          partNo: '',
          serialNo: '',
          Name: '',
          'Father Name': '',
          relationFirstName: '',
          relationLastName: '',
        });
      };
    }, [])
  );

  const changePage = async (dir: 'prev' | 'next') => {
    if (!pagination) return;
    const next = dir === 'prev' ? Math.max(1, (pagination.currentPage || 1) - 1) : Math.min(pagination.totalPages || 1, (pagination.currentPage || 1) + 1);
    if (next === pagination.currentPage) return;
    try {
      const resp = await voterAPI.searchVoters({ Name: query.trim(), partNo: String(partNumber || ''), page: next, limit: pagination.limit || 10 });
      if (resp?.success) {
        setResults(resp.data || []);
        setPagination(resp.pagination);
        setCurrentPage(resp.pagination?.currentPage || next);
      }
    } catch {}
  };

  const families = useMemo(() => {
    // Group by Door_No; fallback to 'Unknown' if missing
    const map = new Map<string, Voter[]>();
    voters.forEach(v => {
      const key = (v.Door_No ?? 'Unknown').toString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    });
    return map;
  }, [voters]);

  const familyKeys = useMemo(() => Array.from(families.keys()).sort((a, b) => {
    const na = parseInt(a, 10); const nb = parseInt(b, 10);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  }), [families]);

  const totalVoters = voters.length;
  const totalFamilies = familyKeys.length;

  const filteredFamilyKeys = useMemo(() => {
    if (!query.trim()) return familyKeys;
    const q = query.toLowerCase();
    // filter by Door_No key or by member names/ids
    const keysByMember = new Set<string>();
    voters.forEach(v => {
      if (
        v.Number?.toLowerCase().includes(q) ||
        v.Name?.toLowerCase().includes(q) ||
        v['Father Name']?.toLowerCase().includes(q)
      ) {
        keysByMember.add((v.Door_No ?? 'Unknown').toString());
      }
    });
    return familyKeys.filter(k => k.includes(q) || keysByMember.has(k));
  }, [query, familyKeys, voters]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>{t('dashboard.loadingFamilies')}</Text>
      </View>
    );
  }

  if (!partNumber) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
            <HeaderBack onPress={() => { try { router.back(); } catch (_) { router.replace('/(tabs)/' as any); } }} />
          <Text style={styles.headerTitle}>{t('dashboard.familyManager')}</Text>
          <View style={styles.headerActions} />
        </View>
        <View style={{ padding: 20 }}>
          <Text style={{ color: '#374151', fontSize: 16, marginBottom: 12 }}>{t('dashboard.selectPartToViewFamilies')}</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/dashboard/part_management')}
            style={{ backgroundColor: '#1976D2', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t('dashboard.choosePart')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <HeaderBack onPress={() => { try { router.back(); } catch (_) { router.replace('/(tabs)/' as any); } }} />
        <Text style={styles.headerTitle}>Part-{partNumber} Family</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleNoFamilyPress}>
            <Icon name="group-off" size={22} color="#0D47A1" />
          </TouchableOpacity>
          <View style={{ width: 12 }} />
          <TouchableOpacity>
            <Icon name="tune" size={22} color="#0D47A1" />
          </TouchableOpacity>
          <View style={{ width: 12 }} />
          <TouchableOpacity onPress={() => setShowPartsModal(true)}>
            <Icon name="filter-list" size={22} color="#0D47A1" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Counters */}
      <View style={styles.countersRow}>
        <View style={[styles.counterCard, { backgroundColor: '#C8E6C9' }]}>
          <Text style={styles.counterTitle}>{t('dashboard.partVoter')}</Text>
          <Text style={styles.counterValue}>{totalVoters}</Text>
        </View>
        <View style={[styles.counterCard, { backgroundColor: '#F8BBD9' }]}>
          <Text style={styles.counterTitle}>{t('dashboard.familyVoters')}</Text>
          <Text style={styles.counterValue}>{selectedFamilyKey ? families.get(selectedFamilyKey)?.length ?? 0 : 0}</Text>
        </View>
        <View style={[styles.counterCard, { backgroundColor: '#1565C0' }]}>
          <Text style={[styles.counterTitle, { color: '#fff' }]}>{t('dashboard.totalFamily')}</Text>
          <Text style={[styles.counterValue, { color: '#fff' }]}>{totalFamilies}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <TextInput
            placeholder={t('dashboard.searchPlaceholder')}
            placeholderTextColor="#90A4AE"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={doSearch}
          />
          <TouchableOpacity onPress={doSearch}>
            <Icon name="search" size={20} color="#607D8B" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.roundIcon} onPress={() => setAdvOpen(true)}>
          <Icon name="search" size={18} color="#0D47A1" />
        </TouchableOpacity>
      </View>

      {/* Family chips */}
      <ScrollView contentContainerStyle={styles.familiesWrap}>
        {filteredFamilyKeys.map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => setSelectedFamilyKey(key)}
            style={[styles.familyChip, selectedFamilyKey === key && styles.familyChipActive]}
          >
            <Text style={[styles.familyChipText, selectedFamilyKey === key && styles.familyChipTextActive]}>
              {key}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search results modal */}
      {showSearchModal && (
        <Modal visible={true} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', width: '92%', maxWidth: 560, borderRadius: 16, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>{t('dashboard.searchResults')}</Text>
                <TouchableOpacity onPress={() => setShowSearchModal(false)}><Text style={{ fontSize: 22 }}>✕</Text></TouchableOpacity>
              </View>

              {pagination && (
                <Text style={{ textAlign: 'center', color: '#22C55E', fontWeight: '700', paddingVertical: 10 }}>
                  {`${t('dashboard.showingResults', { start: ((pagination.currentPage-1)*(pagination.limit||10))+1, end: Math.min((pagination.currentPage)*(pagination.limit||10), pagination.totalCount), total: pagination.totalCount })}`}
                </Text>
              )}

              <ScrollView style={{ maxHeight: 520, paddingHorizontal: 12, paddingBottom: 12 }}>
                {results.map((v: any) => (
                  <View key={v._id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, marginVertical: 6, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ color: '#2563EB', fontWeight: '800' }}>{t('dashboard.serial')} : {v.sr ?? '-'}</Text>
                      <Text style={{ color: '#2563EB', fontWeight: '800' }}>{t('dashboard.section')} : {v.Anubhag_number ?? '-'}</Text>
                      <Text style={{ color: '#2563EB', fontWeight: '800' }}>{t('dashboard.part')} : {v.Part_no ?? '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ width: 58, height: 58, borderRadius: 8, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                        <Icon name="image" size={22} color="#90A4AE" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#111827' }}>{v.Name}</Text>
                        <Text style={{ fontSize: 14, color: '#374151' }}>{v['Father Name']}</Text>
                        <Text style={{ fontSize: 13, color: '#6B7280' }}>{t('dashboard.doorNo')} {v.Door_No}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                          <Icon name="person" size={14} color="#E91E63" />
                          <Text style={{ marginLeft: 6, color: '#374151' }}>{v.age ?? '-'} | {v.sex ?? '-'}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
                {results.length === 0 && (
                  <Text style={{ textAlign: 'center', color: '#6B7280', paddingVertical: 20 }}>{t('dashboard.noResults')}</Text>
                )}
              </ScrollView>

              {pagination && (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderTopWidth: 1, borderTopColor: '#E5E7EB', gap: 14 }}>
                  <TouchableOpacity onPress={() => changePage('prev')} disabled={!pagination.hasPrev} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: pagination.hasPrev ? '#E3F2FD' : '#ECEFF1', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#1565C0', fontSize: 18 }}>{'‹'}</Text>
                  </TouchableOpacity>
                  <View style={{ minWidth: 90, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' }}>
                    <Text style={{ color: '#111827', fontWeight: '700' }}>{currentPage} / {pagination.totalPages}</Text>
                  </View>
                  <TouchableOpacity onPress={() => changePage('next')} disabled={!pagination.hasNext} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: pagination.hasNext ? '#E3F2FD' : '#ECEFF1', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#1565C0', fontSize: 18 }}>{'›'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* Advance search modal */}
      {advOpen && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setAdvOpen(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '90%', maxWidth: 400, maxHeight: '80%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>{t('dashboard.advanceSearch')}</Text>
                <TouchableOpacity onPress={() => setAdvOpen(false)}><Text style={{ fontSize: 18 }}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView>
                {[
                  ['Mobile No','mobileNo'],
                  ['EPIC Id','Number'],
                  ['Age','age'],
                  ['Part No','partNo'],
                  ['Serial No','serialNo'],
                  ['Voter First Name','Name'],
                  ['Voter Last Name','Father Name'],
                  ['Relation First Name','relationFirstName'],
                  ['Relation Last Name','relationLastName'],
                ].map(([ph, key]) => (
                  <TextInput
                    key={key as string}
                    placeholder={ph as string}
                    placeholderTextColor="#999"
                    style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, color: '#111' }}
                    value={(adv as any)[key as string]}
                    onChangeText={(t) => setAdv(prev => ({ ...prev, [key as string]: t }))}
                  />
                ))}
              </ScrollView>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: '#1976D2', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }} onPress={doAdvanceSearch}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{t('dashboard.search')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, borderWidth: 1, borderColor: '#1976D2', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }} onPress={() => setAdvOpen(false)}>
                  <Text style={{ color: '#1976D2', fontWeight: '700' }}>{t('common.cancel')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Parts selection modal */}
      {showPartsModal && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setShowPartsModal(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, maxHeight: '70%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>{t('dashboard.selectPart')}</Text>
                <TouchableOpacity onPress={() => setShowPartsModal(false)}><Text style={{ fontSize: 22 }}>✕</Text></TouchableOpacity>
              </View>
              <View style={{ backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10 }}>
                <TextInput
                  placeholder={t('dashboard.searchPartNumber')}
                  placeholderTextColor="#94A3B8"
                  value={partsSearch}
                  onChangeText={setPartsSearch}
                  style={{ color: '#0F172A' }}
                  keyboardType="number-pad"
                />
              </View>
              <ScrollView style={{ maxHeight: '80%' }}>
                {Array.from({ length: 299 }, (_, i) => i + 1)
                  .filter(n => n.toString().includes(partsSearch))
                  .map((n) => (
                    <TouchableOpacity
                      key={n}
                      onPress={() => {
                        setShowPartsModal(false);
                        setSelectedFamilyKey(null);
                        router.replace({ pathname: '/(tabs)/dashboard/family_manager', params: { partNumber: String(n) } });
                      }}
                      style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}
                    >
                      <Text style={{ color: '#0F172A', fontSize: 16 }}>{t('dashboard.partNumber', { number: n })}</Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  loadingText: { marginTop: 8, color: '#666' },
  header: {
    backgroundColor: '#E3F2FD', paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  // back button is provided by shared HeaderBack component
  headerTitle: { color: '#000', fontSize: 20, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  countersRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  counterCard: { flex: 1, borderRadius: 10, padding: 8 },
  counterTitle: { color: '#000', fontWeight: '700', fontSize: 12 },
  counterValue: { color: '#000', fontWeight: '800', fontSize: 14 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10 },
  searchBar: { flex: 1, backgroundColor: '#fff', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, marginRight: 10 },
  searchInput: { flex: 1, color: '#000' },
  roundIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
  familiesWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  familyChip: { backgroundColor: '#D7EBFF', width: '22%', aspectRatio: 1, borderRadius: 9999, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  familyChipActive: { backgroundColor: '#BBDEFB', borderWidth: 1, borderColor: '#1976D2' },
  familyChipText: { color: '#0D47A1', fontWeight: '700', fontSize: 18 },
  familyChipTextActive: { color: '#0D47A1' },
});


