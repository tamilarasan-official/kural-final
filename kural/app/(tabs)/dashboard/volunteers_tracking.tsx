import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeaderBack from '../../components/HeaderBack';
import { useLanguage } from '../../../contexts/LanguageContext';
import { cadreAPI } from '../../../services/api/cadre';

type Cadre = {
  _id: string;
  name: string;
  mobile: string;
  status: 'active' | 'inactive';
  designation?: string;
  area?: string;
};

type FilterType = 'all' | 'active' | 'inactive';

export const options = { headerShown: false };

export default function VolunteersTrackingScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const [cadres, setCadres] = useState<Cadre[]>([]);
  const [filteredCadres, setFilteredCadres] = useState<Cadre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [stats, setStats] = useState({ active: 0, inactive: 0, total: 0 });

  useEffect(() => {
    loadCadres();
  }, []);

  useEffect(() => {
    filterCadres();
  }, [cadres, searchQuery, activeFilter]);

  const loadCadres = async () => {
    try {
      setLoading(true);
      const response = await cadreAPI.getAll();
      
      if (response?.success && Array.isArray(response.data)) {
        setCadres(response.data);
        calculateStats(response.data);
      } else if (Array.isArray(response)) {
        setCadres(response as any);
        calculateStats(response as any);
      } else {
        setCadres([]);
        setStats({ active: 0, inactive: 0, total: 0 });
      }
    } catch (error) {
      console.error('Error loading cadres:', error);
      setCadres([]);
      setStats({ active: 0, inactive: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (cadreList: Cadre[]) => {
    const active = cadreList.filter(c => c.status === 'active').length;
    const inactive = cadreList.filter(c => c.status === 'inactive').length;
    setStats({ active, inactive, total: cadreList.length });
  };

  const filterCadres = () => {
    let filtered = cadres;

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(c => c.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name?.toLowerCase().includes(query) ||
        c.mobile?.includes(query) ||
        c.designation?.toLowerCase().includes(query) ||
        c.area?.toLowerCase().includes(query)
      );
    }

    setFilteredCadres(filtered);
  };

  const getFilterStats = () => {
    switch (activeFilter) {
      case 'active':
        return stats.active;
      case 'inactive':
        return stats.inactive;
      default:
        return stats.total;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>{t('volunteers.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <HeaderBack onPress={() => router.push('/(tabs)/')} />
        <Text style={styles.headerTitle}>{t('volunteers.title')}</Text>
        <View style={styles.headerActions} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('volunteers.searchPlaceholder')}
            placeholderTextColor="#90A4AE"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Icon name="search" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="tune" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'active' && styles.filterTabActive]}
          onPress={() => setActiveFilter('active')}
        >
          <Text style={[styles.filterTabText, activeFilter === 'active' && styles.filterTabTextActive]}>
            {t('volunteers.active')}
          </Text>
          <View style={[styles.badge, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.badgeText}>{stats.active}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'inactive' && styles.filterTabActive]}
          onPress={() => setActiveFilter('inactive')}
        >
          <Text style={[styles.filterTabText, activeFilter === 'inactive' && styles.filterTabTextActive]}>
            {t('volunteers.inactive')}
          </Text>
          <View style={[styles.badge, { backgroundColor: '#F44336' }]}>
            <Text style={styles.badgeText}>{stats.inactive}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterTabText, activeFilter === 'all' && styles.filterTabTextActive]}>
            {t('volunteers.all')}
          </Text>
          <View style={[styles.badge, { backgroundColor: '#9E9E9E' }]}>
            <Text style={styles.badgeText}>{stats.total}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {filteredCadres.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('volunteers.noVolunteers')}</Text>
          </View>
        ) : (
          filteredCadres.map((cadre) => (
            <View key={cadre._id} style={styles.cadreCard}>
              <View style={styles.cadreInfo}>
                <Text style={styles.cadreName}>{cadre.name}</Text>
                <Text style={styles.cadreMobile}>{cadre.mobile}</Text>
                {cadre.designation && (
                  <Text style={styles.cadreDesignation}>{cadre.designation}</Text>
                )}
                {cadre.area && (
                  <Text style={styles.cadreArea}>{cadre.area}</Text>
                )}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: cadre.status === 'active' ? '#4CAF50' : '#F44336' }]}>
                <Text style={styles.statusText}>{cadre.status.toUpperCase()}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
  backButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#1976D2', fontSize: 18, fontWeight: '700' },
  headerTitle: { color: '#000', fontSize: 20, fontWeight: '700' },
  headerActions: { width: 40 },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  searchInput: { flex: 1, color: '#000', fontSize: 16 },
  searchButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1976D2', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  filterButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  filterTabs: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12 },
  filterTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  filterTabActive: { borderBottomColor: '#1976D2' },
  filterTabText: { color: '#666', fontSize: 16, fontWeight: '600', marginRight: 8 },
  filterTabTextActive: { color: '#1976D2' },
  badge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#666', fontSize: 18, fontWeight: '600' },
  cadreCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cadreInfo: { flex: 1 },
  cadreName: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 4 },
  cadreMobile: { fontSize: 14, color: '#666', marginBottom: 2 },
  cadreDesignation: { fontSize: 12, color: '#999', marginBottom: 2 },
  cadreArea: { fontSize: 12, color: '#999' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
