import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useLanguage } from '../../../contexts/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { voterAPI } from '../../../services/api/voter';
import HeaderBack from '../../components/HeaderBack';

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

export default function NoFamilyScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { partNumber } = useLocalSearchParams();
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [advOpen, setAdvOpen] = useState(false);
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

  // Filter voters with no family (empty or missing Door_No)
  // Show voters whose Door_No is unique (appears only once)
  const noFamilyVoters = useMemo(() => {
    const doorNoCount: Record<string, number> = {};
    voters.forEach(v => {
      const key = (v.Door_No ?? '').toString();
      if (!key || key === '0' || key.trim() === '') return;
      doorNoCount[key] = (doorNoCount[key] || 0) + 1;
    });
    return voters.filter(voter => {
      const key = (voter.Door_No ?? '').toString();
      // If Door_No is missing, treat as no family (legacy logic)
      if (!key || key === '0' || key.trim() === '') return true;
      return doorNoCount[key] === 1;
    });
  }, [voters]);

  // Filter by search query
  const filteredVoters = useMemo(() => {
    if (!query.trim()) return noFamilyVoters;
    const q = query.toLowerCase();
    return noFamilyVoters.filter(voter => 
      String(voter.sr || '').toLowerCase().includes(q) ||
      String(voter.Name || '').toLowerCase().includes(q) ||
      String(voter.Number || '').toLowerCase().includes(q) ||
      String(voter['Father Name'] || '').toLowerCase().includes(q)
    );
  }, [noFamilyVoters, query]);

  // Calculate stats
  const stats = useMemo(() => {
    const male = noFamilyVoters.filter(v => v.sex?.toLowerCase() === 'male').length;
    const female = noFamilyVoters.filter(v => v.sex?.toLowerCase() === 'female').length;
    const others = noFamilyVoters.filter(v => 
      v.sex?.toLowerCase() !== 'male' && v.sex?.toLowerCase() !== 'female'
    ).length;
    const total = noFamilyVoters.length;
    
    return { male, female, others, total };
  }, [noFamilyVoters]);

  useEffect(() => {
    if (!partNumber) { setLoading(false); return; }
    (async () => {
      try {
        setLoading(true);
        // Try primary endpoint
        let list: any[] | null = null;
        try {
          const res = await voterAPI.getVotersByBooth(partNumber as string, { page: 1, limit: 1000 });
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

  const changePage = async (dir: 'prev' | 'next') => {
    if (!pagination) return;
    const next = dir === 'prev' ? Math.max(1, (pagination.currentPage || 1) - 1) : Math.min(pagination.totalPages || 1, (pagination.currentPage || 1) + 1);
    if (next === pagination.currentPage) return;

    try {
      const resp = await voterAPI.searchVoters({ Name: query.trim(), partNo: String(partNumber || ''), page: next, limit: 10 });
      if (resp?.success) {
        setResults(resp.data || []);
        setPagination(resp.pagination);
        setCurrentPage(resp.pagination?.currentPage || 1);
      } else {
        setResults(resp?.data || resp || []);
        setPagination(resp?.pagination || null);
        setCurrentPage(resp?.pagination?.currentPage || 1);
      }
    } catch (e) {
      setResults([]);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D47A1" />
        <Text style={styles.loadingText}>{t('noFamily.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <HeaderBack onPress={() => { try { router.back(); } catch { router.replace('/(tabs)/' as any); } }} />
        <Text style={styles.headerTitle}>{t('noFamily.title')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push(`/(tabs)/dashboard/family_manager?partNumber=${partNumber}`)}>
            <Icon name="groups" size={22} color="#0D47A1" />
          </TouchableOpacity>
          <View style={{ width: 12 }} />
          <TouchableOpacity>
            <Icon name="tune" size={22} color="#0D47A1" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Counters */}
      <View style={styles.countersRow}>
        <View style={[styles.counterCard, { backgroundColor: '#C8E6C9' }]}>
          <Text style={styles.counterTitle}>{t('common.male')}</Text>
          <Text style={styles.counterValue}>{stats.male}</Text>
        </View>
        <View style={[styles.counterCard, { backgroundColor: '#F8BBD9' }]}>
          <Text style={styles.counterTitle}>{t('common.female')}</Text>
          <Text style={styles.counterValue}>{stats.female}</Text>
        </View>
        <View style={[styles.counterCard, { backgroundColor: '#E0E0E0' }]}>
          <Text style={styles.counterTitle}>{t('common.others')}</Text>
          <Text style={styles.counterValue}>{stats.others}</Text>
        </View>
        <View style={[styles.counterCard, { backgroundColor: '#BBDEFB' }]}>
          <Text style={styles.counterTitle}>{t('common.total')}</Text>
          <Text style={styles.counterValue}>{stats.total}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <TextInput
            placeholder={t('dashboard.searchPlaceholder')}
            placeholderTextColor="#90A4AE"
            
            
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

      {/* Voters List */}
      <ScrollView style={styles.votersList}>
        {filteredVoters.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="group-off" size={64} color="#BDBDBD" />
            <Text style={styles.emptyText}>{t('noFamily.emptyTitle')}</Text>
            <Text style={styles.emptySubText}>{t('noFamily.emptySubtitle')}</Text>
          </View>
        ) : (
          filteredVoters.map((voter) => (
            <View key={voter._id} style={styles.voterCard}>
              <View style={styles.voterHeader}>
                <Text style={styles.serialNumber}>Serial: {voter.sr}</Text>
                <Text style={styles.sectionNumber}>Section: {voter.Anubhag_number || '-'}</Text>
              </View>
              <Text style={styles.voterName}>{voter.Name}</Text>
              <Text style={styles.fatherName}>Father: {voter['Father Name']}</Text>
              <View style={styles.voterDetails}>
                <Text style={styles.detailText}>Age: {voter.age}</Text>
                <Text style={styles.detailText}>Gender: {voter.sex}</Text>
                <Text style={styles.detailText}>Voter ID: {voter.Number}</Text>
              </View>
            </View>
          ))
        )}
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
                  {t('dashboard.showingResults', { start: ((pagination.currentPage-1)*(pagination.limit||10))+1, end: Math.min((pagination.currentPage)*(pagination.limit||10), pagination.totalCount), total: pagination.totalCount })}
                </Text>
              )}

              <ScrollView style={{ maxHeight: 520, paddingHorizontal: 12, paddingBottom: 12 }}>
                {results.map((v: any) => (
                  <View key={v._id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, marginVertical: 6, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ color: '#2563EB', fontWeight: '800' }}>{t('dashboard.serial')} : {v.sr ?? '-'}</Text>
                      <Text style={{ color: '#2563EB', fontWeight: '800' }}>{t('dashboard.section')} : {v.Anubhag_number ?? '-'}</Text>
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 }}>{v.Name ?? '-'}</Text>
                    <Text style={{ color: '#6B7280', marginBottom: 8 }}>{t('noFamily.father')} : {v['Father Name'] ?? '-'}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: '#059669', fontWeight: '600' }}>{t('common.age')} : {v.age ?? '-'}</Text>
                      <Text style={{ color: '#059669', fontWeight: '600' }}>{t('common.gender')} : {v.sex ?? '-'}</Text>
                    </View>
                    <Text style={{ color: '#6B7280', marginTop: 4 }}>{t('noFamily.voterId')} : {v.Number ?? '-'}</Text>
                  </View>
                ))}
              </ScrollView>

              {pagination && pagination.totalPages > 1 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                  <TouchableOpacity onPress={() => changePage('prev')} disabled={!pagination.hasPrevPage} style={{ paddingVertical: 8, paddingHorizontal: 16, backgroundColor: pagination.hasPrevPage ? '#1976D2' : '#E0E0E0', borderRadius: 6 }}>
                    <Text style={{ color: pagination.hasPrevPage ? '#fff' : '#9E9E9E', fontWeight: '600' }}>{t('common.previous')}</Text>
                  </TouchableOpacity>
                  <Text style={{ color: '#6B7280', fontWeight: '600' }}>{pagination.currentPage} {t('common.of')} {pagination.totalPages}</Text>
                  <TouchableOpacity onPress={() => changePage('next')} disabled={!pagination.hasNextPage} style={{ paddingVertical: 8, paddingHorizontal: 16, backgroundColor: pagination.hasNextPage ? '#1976D2' : '#E0E0E0', borderRadius: 6 }}>
                    <Text style={{ color: pagination.hasNextPage ? '#fff' : '#9E9E9E', fontWeight: '600' }}>{t('common.next')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* Advanced search modal */}
      {advOpen && (
        <Modal visible={true} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', width: '92%', maxWidth: 560, borderRadius: 16, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>{t('dashboard.advanceSearch')}</Text>
                <TouchableOpacity onPress={() => setAdvOpen(false)}><Text style={{ fontSize: 22 }}>✕</Text></TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 520, paddingHorizontal: 16, paddingVertical: 12 }}>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>{t('noFamily.voterName')}</Text>
                  <TextInput style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 }} value={adv.Name} onChangeText={(t) => setAdv({ ...adv, Name: t })} placeholder={t('noFamily.enterVoterName')} />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>{t('noFamily.fatherName')}</Text>
                  <TextInput style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 }} value={adv['Father Name']} onChangeText={(t) => setAdv({ ...adv, 'Father Name': t })} placeholder={t('noFamily.enterFatherName')} />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>{t('noFamily.voterId')}</Text>
                  <TextInput style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 }} value={adv.Number} onChangeText={(t) => setAdv({ ...adv, Number: t })} placeholder={t('noFamily.enterVoterId')} />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>{t('noFamily.serialNumber')}</Text>
                  <TextInput style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 }} value={adv.serialNo} onChangeText={(t) => setAdv({ ...adv, serialNo: t })} placeholder={t('noFamily.enterSerialNumber')} />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>{t('dashboard.age')}</Text>
                  <TextInput style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 }} value={adv.age} onChangeText={(t) => setAdv({ ...adv, age: t })} placeholder={t('noFamily.enterAge')} keyboardType="numeric" />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>{t('booth.mobileNumber')}</Text>
                  <TextInput style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 }} value={adv.mobileNo} onChangeText={(t) => setAdv({ ...adv, mobileNo: t })} placeholder={t('noFamily.enterMobileNumber')} keyboardType="phone-pad" />
                </View>
              </ScrollView>

              <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: '#1976D2', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }} onPress={doAdvanceSearch}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{t('dashboard.search')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, borderWidth: 1, borderColor: '#1976D2', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }} onPress={() => setAdvOpen(false)}>
                  <Text style={{ color: '#1976D2', fontWeight: '700' }}>{t('dashboard.cancel')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#E3F2FD',
    borderBottomWidth: 1,
    borderBottomColor: '#BBDEFB',
    paddingTop: 40,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D47A1',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  counterCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  counterTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  counterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchWrap: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  roundIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  votersList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  voterCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  voterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serialNumber: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 14,
  },
  sectionNumber: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 14,
  },
  voterName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  fatherName: {
    color: '#6B7280',
    marginBottom: 8,
    fontSize: 14,
  },
  voterDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    color: '#059669',
    fontWeight: '600',
    fontSize: 12,
  },
});
