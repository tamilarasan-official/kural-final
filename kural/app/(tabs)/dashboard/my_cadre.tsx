import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, ActivityIndicator, Modal } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '../../../contexts/LanguageContext';
import { cadreAPI } from '../../../services/api/cadre';

const { width } = Dimensions.get('window');

export default function MyCadreScreen() {
  const { t } = useLanguage();
  const { tab } = useLocalSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(tab as string || 'active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cadres, setCadres] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    loggedIn: 0
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [boothFilter, setBoothFilter] = useState('');

  useEffect(() => {
    loadCadres();
    loadStats();
  }, [activeTab, searchQuery, boothFilter]);

  // Update active tab when tab parameter changes
  useEffect(() => {
    if (tab && typeof tab === 'string') {
      setActiveTab(tab);
    }
  }, [tab]);

  const loadCadres = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cadreAPI.getAll({
        status: activeTab === 'all' ? undefined : activeTab,
        search: searchQuery || undefined,
        boothNumber: boothFilter || undefined,
        limit: 50
      });
      
      if (response.success) {
        setCadres(response.data);
      } else {
        setError('Failed to load cadres');
      }
    } catch (err: any) {
      console.error('Error loading cadres:', err);
      setError(err.message || 'Failed to load cadres');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await cadreAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleApplyFilter = () => {
    setShowFilterModal(false);
    loadCadres();
  };

  const handleClearFilter = () => {
    setBoothFilter('');
    setShowFilterModal(false);
    loadCadres();
  };

  const getTabCount = (status: string) => {
    if (status === 'all') return stats.total;
    if (status === 'active') return stats.active;
    if (status === 'inactive') return stats.inactive;
    return stats.pending;
  };

  const renderCadreCard = (cadre: any) => (
    <View key={cadre._id} style={styles.cadreCard}>
      <View style={styles.cadreInfo}>
        <Text style={styles.cadreName}>{cadre.firstName} {cadre.lastName}</Text>
        <Text style={styles.cadreMobile}>{cadre.mobileNumber}</Text>
        <Text style={styles.cadreBooth}>{cadre.boothAllocation}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: cadre.status === 'Active' ? '#4CAF50' : '#F44336' }]}>
        <Text style={styles.statusText}>{cadre.status.toUpperCase()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.timeText}>3:50</Text>
        <View style={styles.statusIcons}>
          <Text style={styles.statusText}>Vo1 1.57 LTE2 MB/s</Text>
          <Text style={styles.statusText}>5G+</Text>
          <Text style={styles.batteryText}>47%</Text>
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cadre</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => router.push('/(tabs)/dashboard/create_cadre')}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, mobile or booth"
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.activeTab]} 
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Active</Text>
          <View style={[styles.tabBadge, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.tabBadgeText}>{getTabCount('active')}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'inactive' && styles.activeTab]} 
          onPress={() => setActiveTab('inactive')}
        >
          <Text style={[styles.tabText, activeTab === 'inactive' && styles.activeTabText]}>Inactive</Text>
          <View style={[styles.tabBadge, { backgroundColor: '#F44336' }]}>
            <Text style={styles.tabBadgeText}>{getTabCount('inactive')}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]} 
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
          <View style={[styles.tabBadge, { backgroundColor: '#9E9E9E' }]}>
            <Text style={styles.tabBadgeText}>{getTabCount('all')}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1976D2" />
            <Text style={styles.loadingText}>Loading cadres...</Text>
          </View>
        ) : cadres.length > 0 ? (
          cadres.map(renderCadreCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Cadres Found</Text>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Cadres</Text>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.filterLabel}>Search by booth number</Text>
              <TextInput
                style={styles.boothInput}
                placeholder="Enter booth number"
                placeholderTextColor="#999999"
                value={boothFilter}
                onChangeText={setBoothFilter}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={handleApplyFilter}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={handleClearFilter}
              >
                <Text style={styles.clearButtonText}>Clear Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#000000',
  },
  batteryText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#E3F2FD',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
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
  addButton: {
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
  addIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333333',
  },
  searchButton: {
    padding: 5,
  },
  searchIcon: {
    fontSize: 18,
    color: '#1976D2',
  },
  filterButton: {
    width: 45,
    height: 45,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterIcon: {
    fontSize: 18,
    color: '#666666',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#1976D2',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    marginRight: 8,
  },
  activeTabText: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  tabBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999999',
    fontWeight: '500',
  },
  cadreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cadreInfo: {
    flex: 1,
  },
  cadreName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  cadreMobile: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  cadreBooth: {
    fontSize: 14,
    color: '#666666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  modalContent: {
    marginBottom: 30,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 10,
  },
  boothInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#F9F9F9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#1976D2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1976D2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
