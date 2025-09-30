import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, Dimensions, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_CONFIG } from '../../services/api/config';
import { useBanner } from '../../contexts/BannerContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { voterAPI } from '../../services/api/voter';

export const options = {
  headerShown: false,
};

export default function DashboardScreen() {
  const router = useRouter();
  const { openElectionModal } = useLocalSearchParams();
  const { banners } = useBanner();
  const { t } = useLanguage();
  const [constituency, setConstituency] = useState('119 - Thondamuthur');
  const { width } = Dimensions.get('window');
  const bannerRef = useRef<ScrollView>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const [searchResults, setSearchResults] = useState([]); // State for search results
  const [showSearchModal, setShowSearchModal] = useState(false); // State for search modal
  const [pagination, setPagination] = useState(null); // State for pagination
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [showElectionModal, setShowElectionModal] = useState(false); // State for election dropdown modal
  const [selectedElection, setSelectedElection] = useState('119 - Thondamuthur'); // State for selected election
  const [showAdvanceSearchModal, setShowAdvanceSearchModal] = useState(false); // State for advance search modal
  const [advanceSearchData, setAdvanceSearchData] = useState({
    mobileNo: '',
    Number: '',
    age: '',
    partNo: '',
    serialNo: '',
    Name: '',
    'Father Name': '',
    relationFirstName: '',
    relationLastName: '',
  }); // State for advance search form data
  const [voterSearchResults, setVoterSearchResults] = useState([]); // State for voter search results
  const [voterSearchPagination, setVoterSearchPagination] = useState(null); // State for voter search pagination
  const [showVoterSearchModal, setShowVoterSearchModal] = useState(false); // State for voter search results modal
  const [voterSearchLoading, setVoterSearchLoading] = useState(false); // State for voter search loading

  // Auto-swipe banners every 3s
  useEffect(() => {
    if (banners.length > 1) {
      const id = setInterval(() => {
        const next = (bannerIndex + 1) % banners.length;
        setBannerIndex(next);
        bannerRef.current?.scrollTo({ x: next * width, animated: true });
      }, 3000);
      return () => clearInterval(id);
    }
  }, [bannerIndex, width, banners.length]);

  // Function to handle advance search
  const handleAdvanceSearch = async () => {
    try {
      setVoterSearchLoading(true);
      
      // Filter out empty fields
      const searchParams = Object.entries(advanceSearchData)
        .filter(([key, value]) => value.trim() !== '')
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value.trim() }), {});

      if (Object.keys(searchParams).length === 0) {
        alert('Please fill at least one search field');
        setVoterSearchLoading(false);
        return;
      }

      // Add pagination parameters
      searchParams.page = 1;
      searchParams.limit = 10;

      console.log('Searching voters with params:', searchParams);
      
      // Call the voter search API
      const response = await voterAPI.searchVoters(searchParams);
      
      if (response.success) {
        setVoterSearchResults(response.data);
        setVoterSearchPagination(response.pagination);
        setShowAdvanceSearchModal(false);
        setShowVoterSearchModal(true);
      } else {
        alert(response.message || 'Search failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Advance search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setVoterSearchLoading(false);
    }
  };

  // Function to clear advance search form
  const clearAdvanceSearch = () => {
    setAdvanceSearchData({
      mobileNo: '',
      epicId: '',
      age: '',
      partNo: '',
      serialNo: '',
      voterFirstName: '',
      voterLastName: '',
      relationFirstName: '',
      relationLastName: ''
    });
  };

  // Function to handle voter search pagination
  const handleVoterSearchPageChange = async (newPage: number) => {
    try {
      setVoterSearchLoading(true);
      
      // Get current search parameters
      const searchParams = Object.entries(advanceSearchData)
        .filter(([key, value]) => value.trim() !== '')
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value.trim() }), {});

      searchParams.page = newPage;
      searchParams.limit = 10;

      const response = await voterAPI.searchVoters(searchParams);
      
      if (response.success) {
        setVoterSearchResults(response.data);
        setVoterSearchPagination(response.pagination);
      } else {
        alert(response.message || 'Failed to load page');
      }
      
    } catch (error) {
      console.error('Voter search pagination error:', error);
      alert('Failed to load page. Please try again.');
    } finally {
      setVoterSearchLoading(false);
    }
  };

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
      // Use the voter search API with the search query as voter name
      const searchParams = {
        voterFirstName: searchQuery.trim(),
        page: 1,
        limit: 10
      };

      const response = await voterAPI.searchVoters(searchParams);
      
      if (response.success) {
        setSearchResults(response.data);
        setPagination(response.pagination);
        setShowSearchModal(true);
      } else {
        console.error('Search failed:', response.message);
        alert('Search failed. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching search results:', error.message);
      alert('Search failed. Please try again.');
    }
  };

  // Function to handle pagination
  const handlePageChange = async (newPage: number) => {
    if (!searchQuery.trim()) return;
    
    setCurrentPage(newPage);
    
    try {
      // Use the voter search API with the search query as voter name
      const searchParams = {
        voterFirstName: searchQuery.trim(),
        page: newPage,
        limit: 10
      };

      const response = await voterAPI.searchVoters(searchParams);
      
      if (response.success) {
        setSearchResults(response.data);
        setPagination(response.pagination);
      } else {
        console.error('Search failed:', response.message);
        alert('Failed to load page. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching search results:', error.message);
      alert('Failed to load page. Please try again.');
    }
  };

  // Reset search when query is cleared
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchModal(false);
    }
  }, [searchQuery]);

  // Handle URL parameter to open election modal
  useEffect(() => {
    console.log('openElectionModal parameter:', openElectionModal);
    if (openElectionModal === 'true') {
      console.log('Opening election modal...');
      // Auto-open modal immediately
      setShowElectionModal(true);
      console.log('Modal should be open now');
    }
  }, [openElectionModal]);

  // Handle election selection
  const handleElectionSelect = () => {
    setShowElectionModal(true);
  };

  // Handle election update
  const handleElectionUpdate = () => {
    setConstituency(selectedElection);
    setShowElectionModal(false);
  };

  // Handle election modal close
  const handleElectionClose = () => {
    setShowElectionModal(false);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 80 }]}>
      {/* Top area with blue background */}
      <View style={styles.topArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/(drawer)/drawerscreen')}>
            <View style={styles.menuBar} />
            <View style={styles.menuBar} />
            <View style={styles.menuBar} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.selector} activeOpacity={0.8} onPress={handleElectionSelect}>
            <Text style={styles.selectorText}>{constituency}</Text>
            <Text style={styles.selectorChevron}>▾</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bell}>
            <Icon name="notifications" size={24} color="#1976D2" />
          </TouchableOpacity>
        </View>

        {/* Manager quick actions */}
        <View style={styles.quickRow}>
          <ManagerCard 
            title="Cadre Manager" 
            source={require('../../assets/images/cadre_manager.png')} 
            onPress={() => router.push('/(tabs)/dashboard/my_cadre')}
          />
          <ManagerCard 
            title="Voter Manager" 
            source={require('../../assets/images/voter_manager.png')} 
            onPress={() => router.push('/(tabs)/dashboard/part_numbers')}
          />
          <ManagerCard title="Family Manager" source={require('../../assets/images/family_manager.png')} />
          <ManagerCard 
            title="Survey Manager" 
            source={require('../../assets/images/survey_manager.png')} 
            onPress={() => router.push('/(tabs)/dashboard/survey')}
          />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color="#90A4AE" />
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
          <Icon name="search" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowAdvanceSearchModal(true)}
        >
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
        {banners.map((banner, index) => (
          <View key={banner.id} style={[styles.banner, { width: width - 32, height: 190 }]}>
            <Image
              source={{ uri: banner.localUri || banner.imageUri }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>
      <View style={styles.dotsRow}>
        {banners.map((_, index) => (
          <View key={index} style={[styles.dot, bannerIndex === index ? styles.dotActive : undefined]} />
        ))}
      </View>

      {/* Cadre Overview */}
      <Text style={styles.sectionTitle}>Cadre Overview</Text>
      <View style={styles.overviewRow}>
        <OverviewCard 
          title={'Total\nCadres'} 
          value={'0'} 
          accent="#1976D2" 
          large 
          iconEmoji="🚶" 
          onPress={() => router.push('/(tabs)/dashboard/my_cadre?tab=all')}
        />
        <View style={styles.overviewColSmall}>
          <OverviewCard 
            title={'Cadre\nActive'} 
            value={'0'} 
            accent="#2E7D32" 
            onPress={() => router.push('/(tabs)/dashboard/my_cadre?tab=active')}
          />
          <OverviewCard title={'Logged\nIn'} value={'0'} accent="#2E7D32" />
        </View>
        <View style={styles.overviewColSmall}>
          <OverviewCard 
            title={'Cadre\nInActive'} 
            value={'0'} 
            accent="#D32F2F" 
            onPress={() => router.push('/(tabs)/dashboard/my_cadre?tab=inactive')}
          />
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
                        <Icon name="image" size={18} color="#B0BEC5" />
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

      {/* Election Selection Modal */}
      {showElectionModal && (
        <Modal
          visible={showElectionModal}
          animationType="fade"
          transparent={true}
          onRequestClose={handleElectionClose}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.electionModalContainer}>
              <Text style={styles.electionModalTitle}>Set Default Election</Text>
              
              <View style={styles.electionInputContainer}>
                <TextInput
                  style={styles.electionInput}
                  value={selectedElection}
                  onChangeText={setSelectedElection}
                  placeholder="Select election"
                  placeholderTextColor="#999999"
                />
              </View>
              
              <View style={styles.electionButtonContainer}>
                <TouchableOpacity style={styles.updateButton} onPress={handleElectionUpdate}>
                  <Text style={styles.updateButtonText}>UPDATE</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.electionCloseButton} onPress={handleElectionClose}>
                  <Text style={styles.electionCloseButtonText}>CLOSE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Advance Search Modal */}
      {showAdvanceSearchModal && (
        <Modal
          visible={showAdvanceSearchModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAdvanceSearchModal(false)}
        >
          <View style={styles.advanceSearchModalOverlay}>
            <View style={styles.advanceSearchModalContainer}>
              {/* Header */}
              <View style={styles.advanceSearchHeader}>
                <Text style={styles.advanceSearchTitle}>Advance Search</Text>
                <TouchableOpacity 
                  style={styles.advanceSearchCloseButton}
                  onPress={() => setShowAdvanceSearchModal(false)}
                >
                  <Text style={styles.advanceSearchCloseIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <View style={styles.advanceSearchForm}>
                {/* Full width fields */}
                <TextInput
                  style={styles.advanceSearchInputFull}
                  placeholder="Mobile No"
                  placeholderTextColor="#999999"
                  value={advanceSearchData.mobileNo}
                  onChangeText={(text) => setAdvanceSearchData(prev => ({ ...prev, mobileNo: text }))}
                  keyboardType="numeric"
                />
                
                <TextInput
                  style={styles.advanceSearchInputFull}
                  placeholder="EPIC Id"
                  placeholderTextColor="#999999"
                  value={advanceSearchData.Number}
                  onChangeText={(text) => setAdvanceSearchData(prev => ({ ...prev, Number: text }))}
                />
                
                <TextInput
                  style={styles.advanceSearchInputFull}
                  placeholder="Age"
                  placeholderTextColor="#999999"
                  value={advanceSearchData.age}
                  onChangeText={(text) => setAdvanceSearchData(prev => ({ ...prev, age: text }))}
                  keyboardType="numeric"
                />

                {/* Half width fields - Part No and Serial No */}
                <View style={styles.advanceSearchRow}>
                  <TextInput
                    style={styles.advanceSearchInputHalf}
                    placeholder="Part No"
                    placeholderTextColor="#999999"
                    value={advanceSearchData.partNo}
                    onChangeText={(text) => setAdvanceSearchData(prev => ({ ...prev, partNo: text }))}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.advanceSearchInputHalf}
                    placeholder="Serial No"
                    placeholderTextColor="#999999"
                    value={advanceSearchData.serialNo}
                    onChangeText={(text) => setAdvanceSearchData(prev => ({ ...prev, serialNo: text }))}
                    keyboardType="numeric"
                  />
                </View>


                {/* Half width fields - Voter First Name and Last Name */}
                <View style={styles.advanceSearchRow}>
                  <TextInput
                    style={styles.advanceSearchInputHalf}
                    placeholder="Voter First Name"
                    placeholderTextColor="#999999"
                    value={advanceSearchData.Name}
                    onChangeText={(text) => setAdvanceSearchData(prev => ({ ...prev, Name: text }))}
                  />
                  <TextInput
                    style={styles.advanceSearchInputHalf}
                    placeholder="Voter Last Name"
                    placeholderTextColor="#999999"
                    value={advanceSearchData['Father Name']}
                    onChangeText={(text) => setAdvanceSearchData(prev => ({ ...prev, 'Father Name': text }))}
                  />
                </View>

                {/* Half width fields - Relation First Name and Last Name */}
                <View style={styles.advanceSearchRow}>
                  <TextInput
                    style={styles.advanceSearchInputHalf}
                    placeholder="Relation First Name"
                    placeholderTextColor="#999999"
                    value={advanceSearchData.relationFirstName}
                    onChangeText={(text) => setAdvanceSearchData(prev => ({ ...prev, relationFirstName: text }))}
                  />
                  <TextInput
                    style={styles.advanceSearchInputHalf}
                    placeholder="Relation Last Name"
                    placeholderTextColor="#999999"
                    value={advanceSearchData.relationLastName}
                    onChangeText={(text) => setAdvanceSearchData(prev => ({ ...prev, relationLastName: text }))}
                  />
                </View>

              </View>

              {/* Action Buttons */}
              <View style={styles.advanceSearchButtons}>
                <TouchableOpacity 
                  style={styles.advanceSearchButton}
                  onPress={handleAdvanceSearch}
                >
                  <Text style={styles.advanceSearchButtonText}>Search</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.advanceSearchCancelButton}
                  onPress={() => setShowAdvanceSearchModal(false)}
                >
                  <Text style={styles.advanceSearchCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Voter Search Results Modal */}
      {showVoterSearchModal && (
        <Modal
          visible={showVoterSearchModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowVoterSearchModal(false)}
        >
          <View style={styles.voterSearchModalOverlay}>
            <View style={styles.voterSearchModalContainer}>
              {/* Header */}
              <View style={styles.voterSearchHeader}>
                <Text style={styles.voterSearchTitle}>Search Results</Text>
                <TouchableOpacity 
                  style={styles.voterSearchCloseButton}
                  onPress={() => setShowVoterSearchModal(false)}
                >
                  <Text style={styles.voterSearchCloseIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Results Summary */}
              {voterSearchPagination && (
                <Text style={styles.voterSearchSummary}>
                  Showing {((voterSearchPagination.currentPage - 1) * voterSearchPagination.limit) + 1}-{Math.min(voterSearchPagination.currentPage * voterSearchPagination.limit, voterSearchPagination.totalCount)} of {voterSearchPagination.totalCount} Voters
                </Text>
              )}

              {/* Results List */}
              <ScrollView style={styles.voterSearchResults}>
                {voterSearchLoading ? (
                  <View style={styles.voterSearchLoading}>
                    <Text style={styles.voterSearchLoadingText}>Loading...</Text>
                  </View>
                ) : voterSearchResults.length > 0 ? (
                  voterSearchResults.map((voter: any, index: number) => (
                    <View key={voter._id || index} style={styles.voterCard}>
                      {/* Voter Info Header */}
                      <View style={styles.voterCardHeader}>
                        <Text style={styles.voterSerial}>Serial : {voter.sr}</Text>
                        <Text style={styles.voterSection}>Section : {voter.Anubhag_number}</Text>
                        <Text style={styles.voterPart}>Part : {voter.Part_no}</Text>
                      </View>

                      {/* Voter Details */}
                      <View style={styles.voterCardContent}>
                        {/* Voter Image Placeholder */}
                        <View style={styles.voterImageContainer}>
                          <View style={styles.voterImagePlaceholder}>
                            <Icon name="person" size={18} color="#90A4AE" />
                          </View>
                          <Text style={styles.voterId}>{voter.Number}</Text>
                        </View>

                        {/* Voter Information */}
                        <View style={styles.voterDetails}>
                          <Text style={styles.voterName}>{voter.Name}</Text>
                          <Text style={styles.voterRelation}>{voter.Relation}</Text>
                          <Text style={styles.voterFather}>{voter['Father Name']}</Text>
                          <Text style={styles.voterAddress}>Door No {voter.Door_No}</Text>
                          <View style={styles.voterAgeContainer}>
                            <Text style={styles.voterAge}>{voter.age} | {voter.sex}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.voterSearchEmpty}>
                    <Text style={styles.voterSearchEmptyText}>No voters found matching your search criteria</Text>
                  </View>
                )}
              </ScrollView>

              {/* Pagination */}
              {voterSearchPagination && voterSearchPagination.totalPages > 1 && (
                <View style={styles.voterSearchPagination}>
                  <TouchableOpacity
                    style={[
                      styles.voterSearchPageButton,
                      !voterSearchPagination.hasPrev && styles.voterSearchPageButtonDisabled
                    ]}
                    onPress={() => voterSearchPagination.hasPrev && handleVoterSearchPageChange(voterSearchPagination.currentPage - 1)}
                    disabled={!voterSearchPagination.hasPrev || voterSearchLoading}
                  >
                    <Text style={[
                      styles.voterSearchPageButtonText,
                      !voterSearchPagination.hasPrev && styles.voterSearchPageButtonTextDisabled
                    ]}>‹</Text>
                  </TouchableOpacity>

                  <Text style={styles.voterSearchPageInfo}>
                    {voterSearchPagination.currentPage} / {voterSearchPagination.totalPages}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.voterSearchPageButton,
                      !voterSearchPagination.hasNext && styles.voterSearchPageButtonDisabled
                    ]}
                    onPress={() => voterSearchPagination.hasNext && handleVoterSearchPageChange(voterSearchPagination.currentPage + 1)}
                    disabled={!voterSearchPagination.hasNext || voterSearchLoading}
                  >
                    <Text style={[
                      styles.voterSearchPageButtonText,
                      !voterSearchPagination.hasNext && styles.voterSearchPageButtonTextDisabled
                    ]}>›</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

type ManagerCardProps = { title: string; source: any; onPress?: () => void };
const ManagerCard = ({ title, source, onPress }: ManagerCardProps) => (
  <TouchableOpacity style={styles.managerCard} activeOpacity={0.8} onPress={onPress}>
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
  onPress?: () => void;
};

const OverviewCard = ({ title, value, accent, large, iconEmoji, onPress }: OverviewCardProps) => (
  <TouchableOpacity 
    style={[large ? styles.overviewLarge : styles.overviewSmall]} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    {iconEmoji ? <Text style={styles.overviewIcon}>{iconEmoji}</Text> : null}
    <Text style={styles.overviewTitle}>{title}</Text>
    <View style={[styles.badge, { backgroundColor: accent }]}>
      <Text style={styles.badgeText}>{value}</Text>
    </View>
  </TouchableOpacity>
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
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },

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
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
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

  // Election Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  electionModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  electionModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  electionInputContainer: {
    marginBottom: 20,
  },
  electionInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  electionButtonContainer: {
    gap: 12,
  },
  updateButton: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  electionCloseButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1976D2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  electionCloseButtonText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Advance Search Modal Styles
  advanceSearchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  advanceSearchModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  advanceSearchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  advanceSearchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  advanceSearchCloseButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  advanceSearchCloseIcon: {
    fontSize: 18,
    color: '#666666',
    fontWeight: 'bold',
  },
  advanceSearchForm: {
    marginBottom: 20,
  },
  advanceSearchInputFull: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#F9F9F9',
    marginBottom: 15,
  },
  advanceSearchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  advanceSearchInputHalf: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#F9F9F9',
    width: '48%',
  },
  advanceSearchButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  advanceSearchButton: {
    flex: 1,
    backgroundColor: '#1976D2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  advanceSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  advanceSearchCancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1976D2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  advanceSearchCancelButtonText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Voter Search Results Modal Styles
  voterSearchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voterSearchModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '95%',
    maxWidth: 500,
    maxHeight: '90%',
    padding: 20,
  },
  voterSearchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  voterSearchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  voterSearchCloseButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voterSearchCloseIcon: {
    fontSize: 18,
    color: '#666666',
    fontWeight: 'bold',
  },
  voterSearchSummary: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 15,
  },
  voterSearchResults: {
    maxHeight: 400,
    marginBottom: 15,
  },
  voterSearchLoading: {
    padding: 20,
    alignItems: 'center',
  },
  voterSearchLoadingText: {
    fontSize: 16,
    color: '#666666',
  },
  voterSearchEmpty: {
    padding: 20,
    alignItems: 'center',
  },
  voterSearchEmptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  voterCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  voterCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  voterSerial: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  voterSection: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  voterPart: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  voterCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  voterImageContainer: {
    alignItems: 'center',
    marginRight: 15,
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
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
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
    marginBottom: 4,
  },
  voterAgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voterAge: {
    fontSize: 12,
    color: '#666666',
  },
  voterSearchPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  voterSearchPageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  voterSearchPageButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  voterSearchPageButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  voterSearchPageButtonTextDisabled: {
    color: '#999999',
  },
  voterSearchPageInfo: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    marginHorizontal: 15,
  },
});