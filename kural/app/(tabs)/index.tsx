import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, Dimensions, Modal } from 'react-native';
import { useRouter } from 'expo-router';

export const options = {
  headerShown: false,
};

export default function DashboardScreen() {
  const router = useRouter();
  const [constituency, setConstituency] = useState('119 - Thondamuthur');
  const { width } = Dimensions.get('window');
  const bannerRef = useRef<ScrollView>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const [searchResults, setSearchResults] = useState([]); // State for search results
  const [showSearchModal, setShowSearchModal] = useState(false); // State for search modal
  const [pagination, setPagination] = useState(null); // State for pagination
  const [currentPage, setCurrentPage] = useState(1); // State for current page

  // Auto-swipe banners every 3s
  useEffect(() => {
    const id = setInterval(() => {
      const next = (bannerIndex + 1) % 2; // two banners
      setBannerIndex(next);
      bannerRef.current?.scrollTo({ x: next * width, animated: true });
    }, 3000);
    return () => clearInterval(id);
  }, [bannerIndex, width]);

  // Function to handle search when search icon is clicked
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchModal(false);
      return;
    }

    // Reset to page 1 for new search
    setCurrentPage(1);

    try {
      const response = await fetch(`http://192.168.31.31:5000/api/v1/search?q=${encodeURIComponent(searchQuery)}&page=1&limit=10`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setSearchResults(data.voters || []);
      setPagination(data.pagination);
      setShowSearchModal(true);
    } catch (error) {
      console.error('Error fetching search results:', error.message);
      // Optionally show an alert or update UI with error message
    }
  };

  // Function to handle pagination
  const handlePageChange = async (newPage: number) => {
    if (!searchQuery.trim()) return;
    
    setCurrentPage(newPage);
    
    try {
      const response = await fetch(`http://192.168.31.31:5000/api/v1/search?q=${encodeURIComponent(searchQuery)}&page=${newPage}&limit=10`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setSearchResults(data.voters || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching search results:', error.message);
    }
  };

  // Reset search when query is cleared
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchModal(false);
    }
  }, [searchQuery]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top area with blue background */}
      <View style={styles.topArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/(drawer)/drawerscreen')}>
            <View style={styles.menuBar} />
            <View style={styles.menuBar} />
            <View style={styles.menuBar} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.selector} activeOpacity={0.8}>
            <Text style={styles.selectorText}>{constituency}</Text>
            <Text style={styles.selectorChevron}>▾</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bell}>
            <Text style={styles.bellText}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Manager quick actions */}
        <View style={styles.quickRow}>
          <ManagerCard title="Cadre Manager" source={require('../../assets/images/cadre_manager.png')} />
          <ManagerCard title="Voter Manager" source={require('../../assets/images/voter_manager.png')} />
          <ManagerCard title="Family Manager" source={require('../../assets/images/family_manager.png')} />
          <ManagerCard title="Survey Manager" source={require('../../assets/images/survey_manager.png')} />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Voter Id or Voter Name"
            placeholderTextColor="#B0BEC5"
            value={searchQuery} // Bind search input to state
            onChangeText={setSearchQuery} // Update state on text change
            onSubmitEditing={handleSearch} // Search when user presses enter
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonIcon}>🔍</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Feature grid (icons + labels, no squares) */}
      <View style={styles.grid}>
        <IconTile title="Cadre" src={require('../../assets/images/cadre.png')} />
        <IconTile title="Part" src={require('../../assets/images/part.png')} />
        <IconTile title="Voter" src={require('../../assets/images/voter.png')} />
        <IconTile title="New" src={require('../../assets/images/New.png')} />
        <IconTile title="Transgender" src={require('../../assets/images/transegender.png')} />
        <IconTile title="Fatherless" src={require('../../assets/images/fatherless.png')} />
        <IconTile title="Guardian" src={require('../../assets/images/guardian.png')} />
        <IconTile title="Overseas" src={require('../../assets/images/overseas.png')} />
        <IconTile title="Birthday" src={require('../../assets/images/birthday.png')} />
        <IconTile title="Star" src={require('../../assets/images/star.png')} />
        <IconTile title="Mobile" src={require('../../assets/images/Mobile.png')} />
        <IconTile title="80 Above" src={require('../../assets/images/80 Above.png')} />
      </View>

      {/* Banners - auto swipe */}
      <ScrollView
        ref={bannerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setBannerIndex(idx);
        }}
        style={styles.bannerScroller}
      >
        <View style={[styles.banner, { width: width - 32, height: 190, backgroundColor: '#2E7D32' }]}>
          <Text style={styles.bannerTitle}>Community Event</Text>
        </View>
        <View style={[styles.banner, { width: width - 32, height: 190, backgroundColor: '#1976D2' }]}>
          <Text style={styles.bannerTitle}>Political Meeting</Text>
        </View>
      </ScrollView>
      <View style={styles.dotsRow}>
        <View style={[styles.dot, bannerIndex === 0 ? styles.dotActive : undefined]} />
        <View style={[styles.dot, bannerIndex === 1 ? styles.dotActive : undefined]} />
      </View>

      {/* Cadre Overview */}
      <Text style={styles.sectionTitle}>Cadre Overview</Text>
      <View style={styles.overviewRow}>
        <OverviewCard title={'Total\nCadres'} value={'0'} accent="#1976D2" large iconEmoji="🚶" />
        <View style={styles.overviewColSmall}>
          <OverviewCard title={'Cadre\nActive'} value={'0'} accent="#2E7D32" />
          <OverviewCard title={'Logged\nIn'} value={'0'} accent="#2E7D32" />
        </View>
        <View style={styles.overviewColSmall}>
          <OverviewCard title={'Cadre\nInActive'} value={'0'} accent="#D32F2F" />
          <OverviewCard title={'Not\nLogged'} value={'0'} accent="#D32F2F" />
        </View>
      </View>

      {/* Search Results Modal */}
      {showSearchModal && (
        <Modal
          visible={showSearchModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Results</Text>
              <TouchableOpacity 
                onPress={() => setShowSearchModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {pagination && (
              <Text style={styles.resultsCount}>
                Showing {((pagination.currentPage - 1) * 10) + 1}-{Math.min(pagination.currentPage * 10, pagination.totalCount)} of {pagination.totalCount} Voters
              </Text>
            )}

            <ScrollView style={styles.modalContent}>
              {searchResults.map((voter, index) => (
                <View key={index} style={styles.voterCard}>
                  <View style={styles.voterHeader}>
                    <Text style={styles.serialText}>Serial : {voter.sr}</Text>
                    <Text style={styles.sectionText}>Section : {voter.Anubhag_number}</Text>
                    <Text style={styles.partText}>Part : {voter.bhag_no}</Text>
                  </View>
                  
                  <View style={styles.voterContent}>
                    <View style={styles.voterImageContainer}>
                      <View style={styles.voterImagePlaceholder}>
                        <Text style={styles.voterImageIcon}>🏔️</Text>
                      </View>
                      <Text style={styles.voterId}>{voter.Number}</Text>
                    </View>
                    
                    <View style={styles.voterDetails}>
                      <Text style={styles.voterName}>{voter.Name}</Text>
                      <Text style={styles.voterRelation}>{voter.Relation}</Text>
                      <Text style={styles.voterFather}>{voter['Father Name']}</Text>
                      <Text style={styles.voterAddress}>Door No {voter.makan}</Text>
                      <View style={styles.voterFooter}>
                        <Text style={styles.voterAge}>{voter.age} | {voter.Relation}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity 
                  onPress={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={!pagination.hasPrev}
                  style={[styles.paginationButton, !pagination.hasPrev && styles.paginationButtonDisabled]}
                >
                  <Text style={styles.paginationButtonText}>‹</Text>
                </TouchableOpacity>
                
                <Text style={styles.paginationText}>
                  {pagination.currentPage} / {pagination.totalPages}
                </Text>
                
                <TouchableOpacity 
                  onPress={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={!pagination.hasNext}
                  style={[styles.paginationButton, !pagination.hasNext && styles.paginationButtonDisabled]}
                >
                  <Text style={styles.paginationButtonText}>›</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

type ManagerCardProps = { title: string; source: any };
const ManagerCard = ({ title, source }: ManagerCardProps) => (
  <TouchableOpacity style={styles.managerCard} activeOpacity={0.8}>
    <Image source={source} style={styles.managerIcon} />
    <Text style={styles.managerLabel}>{title}</Text>
  </TouchableOpacity>
);

type IconTileProps = { title: string; src: any };
const IconTile = ({ title, src }: IconTileProps) => (
  <TouchableOpacity style={styles.tileIconOnly} activeOpacity={0.8}>
    <Image source={src} style={styles.tileIcon} />
    <Text style={styles.tileLabel} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
      {title}
    </Text>
  </TouchableOpacity>
);

type OverviewCardProps = {
  title: string;
  value: string;
  accent: string;
  large?: boolean;
  iconEmoji?: string;
};

const OverviewCard = ({ title, value, accent, large, iconEmoji }: OverviewCardProps) => (
  <View style={[large ? styles.overviewLarge : styles.overviewSmall]}>
    {iconEmoji ? <Text style={styles.overviewIcon}>{iconEmoji}</Text> : null}
    <Text style={styles.overviewTitle}>{title}</Text>
    <View style={[styles.badge, { backgroundColor: accent }]}>
      <Text style={styles.badgeText}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    backgroundColor: '#F3F6FB',
  },
  topArea: {
    backgroundColor: '#E6F0FE',
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 36,
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBar: {
    width: 20,
    height: 2,
    backgroundColor: '#263238',
    marginVertical: 2,
    borderRadius: 2,
  },
  selector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 8,
    elevation: 2,
  },
  selectorText: {
    flex: 1,
    fontWeight: '600',
    color: '#263238',
  },
  selectorChevron: {
    marginLeft: 8,
    color: '#607D8B',
    fontSize: 16,
  },
  bell: {
    width: 44,
    height: 44,
    backgroundColor: '#0A0A0A',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellText: { color: '#fff', fontSize: 16 },

  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  managerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '23%',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DCE4EC',
  },
  managerIcon: { width: 28, height: 28, resizeMode: 'contain', marginBottom: 8 },
  managerLabel: { textAlign: 'center', fontSize: 12, color: '#263238' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 12,
    height: 48,
    flex: 1,
    elevation: 2,
  },
  searchIcon: { fontSize: 18, color: '#90A4AE' },
  searchInput: { flex: 1, marginLeft: 8, color: '#263238' },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  clearIcon: {
    fontSize: 12,
    color: '#666666',
  },
  searchButton: {
    width: 48,
    height: 48,
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  searchButtonIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  filterButton: {
    width: 48,
    height: 48,
    marginLeft: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  filterText: { fontSize: 18, color: '#263238' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 18,
  },
  tileIconOnly: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  tileIcon: { width: 44, height: 44, resizeMode: 'contain', marginBottom: 6 },
  tileLabel: { fontSize: 13, color: '#263238', textAlign: 'center' },

  bannerScroller: { marginTop: 8 },
  banner: {
    height: 160,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CFD8DC', marginHorizontal: 4 },
  dotActive: { backgroundColor: '#1565C0' },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  overviewRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 12 },
  overviewLarge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  overviewSmall: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  overviewColSmall: { width: 130, marginLeft: 12 },
  overviewIcon: { fontSize: 32, marginBottom: 8 },
  overviewTitle: { textAlign: 'center', color: '#263238', marginBottom: 12, fontWeight: '700', fontSize: 18 },
  badge: { minWidth: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  badgeText: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },

  // Search Results Styles
  searchResultsContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  searchResultItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  searchResultDetails: {
    fontSize: 14,
    color: '#666666',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666666',
  },
  resultsCount: {
    fontSize: 14,
    color: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  voterCard: {
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  serialText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  sectionText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  partText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  voterContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  voterImageContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  voterImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  voterImageIcon: {
    fontSize: 24,
  },
  voterId: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  voterDetails: {
    flex: 1,
  },
  voterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  voterRelation: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  voterFather: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  voterAddress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  voterFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voterAge: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  paginationButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  paginationButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  paginationText: {
    fontSize: 16,
    color: '#1A1A1A',
    marginHorizontal: 16,
  },
});