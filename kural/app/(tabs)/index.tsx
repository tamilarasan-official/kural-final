import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, Dimensions, Modal } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_CONFIG } from '../../services/api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_ELECTION_KEY, ELECTION_LOCATIONS } from '../_config/electionLocations';
import { useBanner } from '../../contexts/BannerContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { voterAPI } from '../../services/api/voter';
import { boothAPI } from '../../services/api/booth';

export const options = {
  headerShown: false,
};

export default function DashboardScreen() {
  const router = useRouter();
  const { openElectionModal } = useLocalSearchParams();
  const { banners } = useBanner();
  const { t } = useLanguage();
  const [constituency, setConstituency] = useState('118 - Thondamuthur');
  const [totalBooths, setTotalBooths] = useState(0);
  const [boothStats, setBoothStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    loggedIn: 0,
    notLogged: 0
  });
  const { width } = Dimensions.get('window');
  // Responsive layout measurements for "Booth Overview"
  const contentHorizontalPadding = 16;
  const columnGap = 12;
  const contentWidth = width - contentHorizontalPadding * 2;
  // Stable grid: prefer 3 equal columns when possible, otherwise 2 equal columns
  const isThreeCol = contentWidth >= 360; // conservative breakpoint for many phones
  const colWidth3 = Math.round((contentWidth - columnGap * 2) / 3);
  const colWidth2 = Math.round((contentWidth - columnGap * 1) / 2);
  const bannerRef = useRef<ScrollView>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const [searchResults, setSearchResults] = useState([]); // State for search results
  const [showSearchModal, setShowSearchModal] = useState(false); // State for search modal
  const [pagination, setPagination] = useState(null); // State for pagination
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [showElectionModal, setShowElectionModal] = useState(false); // State for election dropdown modal
  const [selectedElection, setSelectedElection] = useState('118 - Thondamuthur'); // State for selected election
  const [showElectionDropdown, setShowElectionDropdown] = useState(false); // State for election dropdown
  const [showSurveyDetailsModal, setShowSurveyDetailsModal] = useState(false); // State for survey details modal
  const [surveyProgress, setSurveyProgress] = useState<any>(null); // State for survey progress data
  const [surveyLoading, setSurveyLoading] = useState(false); // State for survey loading
  const [showFormCreationModal, setShowFormCreationModal] = useState(false); // State for form creation modal
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedBooths: [] as string[],
    questions: [] as any[]
  });
  const [selectAllBooths, setSelectAllBooths] = useState(false);
  const [showQuestionTypeDropdown, setShowQuestionTypeDropdown] = useState<string | null>(null);
  const [availableBooths, setAvailableBooths] = useState<any[]>([]);
  const [showBoothDropdown, setShowBoothDropdown] = useState(false);
  
  const questionTypes = [
    { value: 'short_text', label: 'dashboard.questionType.short_text' },
    { value: 'paragraph', label: 'dashboard.questionType.paragraph' },
    { value: 'yes_no', label: 'dashboard.questionType.yes_no' },
    { value: 'multiple_choice', label: 'dashboard.questionType.multiple_choice' },
    { value: 'checkboxes', label: 'dashboard.questionType.checkboxes' },
    { value: 'dropdown', label: 'dashboard.questionType.dropdown' },
    { value: 'date', label: 'dashboard.questionType.date' },
    { value: 'number', label: 'dashboard.questionType.number' },
  ];
  
  // Election options (restricted to the configured default)
  const electionOptions = [
    '118 - Thondamuthur',
    '119 - Thaliyur',
  ];
  const [showAdvanceSearchModal, setShowAdvanceSearchModal] = useState(false); // State for advance search modal
  const [advanceSearchData, setAdvanceSearchData] = useState({
    mobileNo: '',
    Number: '',
    age: '',
    boothno: '',
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

  // Load booth statistics
  useEffect(() => {
    loadBoothStats();
  }, []);

  const loadBoothStats = async () => {
    try {
      const response = await boothAPI.getStats();
      if (response.success && response.data) {
        const stats = response.data;
        setBoothStats({
          total: stats.total || 0,
          active: stats.active || 0,
          inactive: stats.inactive || 0,
          loggedIn: stats.loggedIn || 0,
          notLogged: (stats.total || 0) - (stats.loggedIn || 0)
        });
        setTotalBooths(stats.total || 0);
      }
    } catch (error) {
      console.error('Error loading booth stats:', error);
    }
  };

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

  // Clear search data when screen loses focus
  useFocusEffect(
    useCallback(() => {
      // Clear search data when screen comes into focus
      return () => {
        setSearchQuery('');
        setSearchResults([]);
        setPagination(null);
        setCurrentPage(1);
        setShowSearchModal(false);
        setShowAdvanceSearchModal(false);
        setAdvanceSearchData({
          mobileNo: '',
          Number: '',
          age: '',
          boothno: '',
          serialNo: '',
          Name: '',
          'Father Name': '',
          relationFirstName: '',
          relationLastName: '',
        });
        setVoterSearchResults([]);
        setVoterSearchPagination(null);
        setShowVoterSearchModal(false);
        setVoterSearchLoading(false);
      };
    }, [])
  );

  // Function to handle advance search
  const handleAdvanceSearch = async () => {
    try {
      setVoterSearchLoading(true);
      
      // Filter out empty fields
      const searchParams = Object.entries(advanceSearchData)
        .filter(([key, value]) => value.trim() !== '')
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value.trim() }), {});

      if (Object.keys(searchParams).length === 0) {
        alert(t('dashboard.pleaseFillAtLeastOne'));
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
        alert(response.message || t('dashboard.searchFailed'));
      }
      
    } catch (error) {
      console.error('Advance search error:', error);
      alert(t('dashboard.searchFailed'));
    } finally {
      setVoterSearchLoading(false);
    }
  };

  // Function to clear advance search form (keys must match backend contract)
  const clearAdvanceSearch = () => {
    setAdvanceSearchData({
      mobileNo: '',
      Number: '',
      age: '',
      boothno: '',
      serialNo: '',
      Name: '',
      'Father Name': '',
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
        alert(response.message || t('dashboard.failedToLoadPage'));
      }
      
    } catch (error) {
      console.error('Voter search pagination error:', error);
      alert(t('dashboard.failedToLoadPage'));
    } finally {
      setVoterSearchLoading(false);
    }
  };

  // Build params based on the free-text search query (mobile/EPIC/name/serial)
  const buildQuickSearchParams = (q: string) => {
    const trimmed = q.trim();
    const params: any = { page: 1, limit: 10 };
    
    if (/^\d{10}$/.test(trimmed)) {
      // Mobile number (10 digits)
      params.mobileNo = trimmed;
    } else if (/^[A-Za-z0-9]{6,}$/.test(trimmed)) {
      // Likely EPIC Id
      params.Number = trimmed.toUpperCase();
    } else if (/^\d{1,3}$/.test(trimmed)) {
      // Serial number (1-3 digits) - search by serialNo field (backend parameter)
      params.serialNo = trimmed;
    } else {
      // Name fallback
      params.Name = trimmed;
    }
    return params;
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
      const response = await voterAPI.searchVoters(buildQuickSearchParams(searchQuery));
      
      if (response.success) {
        setSearchResults(response.data);
        setPagination(response.pagination);
        setShowSearchModal(true);
      } else {
        console.error('Search failed:', response.message);
        alert(t('dashboard.searchFailed'));
      }
    } catch (error) {
      console.error('Error fetching search results:', error.message);
      alert(t('dashboard.searchFailed'));
    }
  };

  // Function to handle pagination
  const handlePageChange = async (newPage: number) => {
    if (!searchQuery.trim()) return;
    
    setCurrentPage(newPage);
    
    try {
      const params = buildQuickSearchParams(searchQuery);
      params.page = newPage;
      const response = await voterAPI.searchVoters(params);
      
      if (response.success) {
        setSearchResults(response.data);
        setPagination(response.pagination);
      } else {
        console.error('Search failed:', response.message);
        alert(t('dashboard.failedToLoadPage'));
      }
    } catch (error) {
      console.error('Error fetching search results:', error.message);
      alert(t('dashboard.failedToLoadPage'));
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
  const handleElectionUpdate = async () => {
    // Trim and validate the selected election key before saving
    const key = (selectedElection || '').trim();
    if (ELECTION_LOCATIONS[key]) {
      setConstituency(key);
      // persist selection (await to ensure it's written before navigation)
      try {
        await AsyncStorage.setItem(DEFAULT_ELECTION_KEY, key);
        console.log('Saved default election key:', key);
      } catch (err) {
        console.warn('Failed to persist default election', err);
      }
    } else {
      console.warn('Attempted to save unknown election key:', selectedElection);
    }
    setShowElectionModal(false);
  };

  // Load constituency from user data on mount
  useEffect(() => {
    (async () => {
      try {
        const userDataStr = await AsyncStorage.getItem('userData');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          if (userData?.aci_id && userData?.aci_name) {
            const constituencyName = `${userData.aci_id} - ${userData.aci_name}`;
            setConstituency(constituencyName);
            setSelectedElection(constituencyName);
            console.log('Loaded constituency from user data:', constituencyName);
            
            // Fetch total booths count and survey progress
            await fetchTotalBooths(userData.aci_id);
            await fetchSurveyProgress(userData.aci_id);
          }
        } else {
          // Fallback to saved election if userData not available
          const saved = await AsyncStorage.getItem(DEFAULT_ELECTION_KEY);
          if (saved) {
            setSelectedElection(saved);
            setConstituency(saved);
          }
        }
      } catch (err) {
        console.warn('Failed to load constituency', err);
      }
    })();
  }, []);

  // Function to fetch total booths count
  const fetchTotalBooths = async (aciId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('No token found');
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/users/booth-count?aci_id=${aciId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setTotalBooths(data.data.count || 0);
        console.log('Total booths count:', data.data.count);
      } else {
        console.error('Failed to fetch booth count:', data.message);
      }
    } catch (error) {
      console.error('Error fetching booth count:', error);
    }
  };

  // Function to fetch survey progress
  const fetchSurveyProgress = async (aciId: string) => {
    try {
      setSurveyLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('No token found');
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/surveys/progress?aci_id=${aciId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setSurveyProgress(data.data);
        console.log('Survey progress:', data.data);
      } else {
        console.error('Failed to fetch survey progress:', data.message);
      }
    } catch (error) {
      console.error('Error fetching survey progress:', error);
    } finally {
      setSurveyLoading(false);
    }
  };

  // Fetch available booths for form assignment
  const fetchAvailableBooths = async (aciId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('No token found');
        return;
      }

      console.log('Fetching booths for aci_id:', aciId);
      const response = await fetch(`${API_CONFIG.BASE_URL}/users?aci_id=${aciId}&role=Booth Agent&status=Active`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Booths API Response:', data);
      
      if (data.success && data.data) {
        setAvailableBooths(data.data);
        console.log('Available booths count:', data.data.length);
        console.log('Sample booth:', data.data[0]);
      } else {
        console.error('Failed to fetch booths:', data.message);
        setAvailableBooths([]);
      }
    } catch (error) {
      console.error('Error fetching booths:', error);
      setAvailableBooths([]);
    }
  };

  // Handle election modal close
  const handleElectionClose = () => {
    setShowElectionModal(false);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 24 }]}> 
      {/* Top area with blue background */}
      <View style={styles.topArea}>
        <View style={styles.headerRow}>
          <View style={styles.leftSection}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => {
                console.log('Menu button clicked - navigating to drawer');
                router.push('/(tabs)/dashboard/drawer/drawerscreen');
              }}
            >
              <View style={styles.menuBar} />
              <View style={styles.menuBar} />
              <View style={styles.menuBar} />
            </TouchableOpacity>
            <View style={styles.constituencyDisplay}>
              <Text style={styles.constituencyText}>{constituency}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bell} onPress={() => router.push('/(tabs)/dashboard/notifications')}>
            <Icon name="notifications" size={24} color="#0D47A1" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Manager quick actions */}
        
        <View style={styles.quickRow}>
          <ManagerCard 
            title={t('dashboard.insights')} 
            value={totalBooths.toString()}
            subtitle={t('dashboard.totalBooths')}
            isInsights={true}
          />
          <ManagerCard 
            title="Voters"
            isInsights={true}
            isPlaceholder={true}
          />
          <ManagerCard 
            title="Familys"
            isInsights={true}
            isPlaceholder={true}
          />
          <ManagerCard 
            title="Survey"
            isInsights={true}
            isPlaceholder={true}
          />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('dashboard.searchPlaceholder')}
            placeholderTextColor="#B0BEC5"
            value={searchQuery} // Bind search input to state
            onChangeText={setSearchQuery} // Update state on text change
            onSubmitEditing={handleSearch} // Search when user presses enter
          />
          <Icon name="search" size={18} color="#90A4AE" />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowAdvanceSearchModal(true)}
        >
          <Icon name="tune" size={18} color="#90A4AE" />
        </TouchableOpacity>
      </View>

      {/* Feature grid (icons + labels, no squares) */}
      <View style={styles.grid}>
        <IconTile 
          title={t('dashboard.booth')} 
          src={require('../../assets/images/cadre.png')} 
          onPress={() => router.push('/(tabs)/dashboard/volunteers_tracking')}
        />
        <IconTile title={t('dashboard.part')} src={require('../../assets/images/part.png')} onPress={() => router.push('/(tabs)/dashboard/part_map')} />
        <IconTile title={t('dashboard.voter')} src={require('../../assets/images/voter.png')} onPress={() => router.push('/(tabs)/dashboard/voter_parts')} />
        <IconTile title={t('dashboard.new')} src={require('../../assets/images/New.png')} onPress={() => router.push('/(tabs)/dashboard/soon_to_be_voter')} />
        <IconTile title={t('dashboard.transgender')} src={require('../../assets/images/transegender.png')} onPress={() => router.push('/(tabs)/dashboard/transgender')} />
        <IconTile title={t('dashboard.fatherless')} src={require('../../assets/images/fatherless.png')} onPress={() => router.push('/(tabs)/dashboard/fatherless')} />
  <IconTile title={t('dashboard.other')} src={require('../../assets/images/guardian.png')} onPress={() => router.push('/(tabs)/dashboard/guardian')} />
  <IconTile title={t('dashboard.overseas')} src={require('../../assets/images/overseas.png')} />
  <IconTile title={t('dashboard.birthday')} src={require('../../assets/images/birthday.png')} />
  <IconTile title={t('dashboard.mobile')} src={require('../../assets/images/Mobile.png')} onPress={() => router.push('/(tabs)/dashboard/mobile')} />
  <IconTile title={t('dashboard.age60above')} src={require('../../assets/images/80 Above.png')} onPress={() => router.push('/(tabs)/dashboard/age60above')} />
        <IconTile title={t('dashboard.age80above')} src={require('../../assets/images/80 Above.png')} onPress={() => router.push('/(tabs)/dashboard/age80above')} />
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

      {/* Survey Overview */}
      <Text style={styles.sectionTitle}>{t('dashboard.surveyOverview')}</Text>
      <TouchableOpacity 
        style={styles.surveyOverviewBox}
        onPress={() => setShowSurveyDetailsModal(true)}
        activeOpacity={0.8}
      >
        <View style={styles.surveyOverviewHeader}>
          <Text style={styles.surveyOverviewTitle}>{t('dashboard.overallAssemblySurvey')}</Text>
          <Icon name="chevron-right" size={24} color="#1976D2" />
        </View>
        <View style={styles.surveyProgressContainer}>
          <View style={styles.surveyProgressBar}>
            <View style={[styles.surveyProgressFill, { width: `${surveyProgress?.surveyRate || 0}%` }]} />
          </View>
          <Text style={styles.surveyProgressText}>{surveyProgress?.surveyRate || 0}% {t('dashboard.surveyRate')}</Text>
        </View>
        <View style={styles.surveyStatsRow}>
          <View style={styles.surveyStatItem}>
            <Text style={styles.surveyStatValue}>{surveyProgress?.avgCompleted || 0}</Text>
            <Text style={styles.surveyStatLabel}>{t('dashboard.avgCompleted')}</Text>
          </View>
          <View style={styles.surveyStatDivider} />
          <View style={styles.surveyStatItem}>
            <Text style={styles.surveyStatValue}>{surveyProgress?.fullyCompletedBooths || 0}</Text>
            <Text style={styles.surveyStatLabel}>{t('dashboard.fullyCompleted')}</Text>
          </View>
          <View style={styles.surveyStatDivider} />
          <View style={styles.surveyStatItem}>
            <Text style={styles.surveyStatValue}>{surveyProgress?.totalBooths || totalBooths}</Text>
            <Text style={styles.surveyStatLabel}>{t('dashboard.totalBooths')}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Booth Overview */}
      <Text style={styles.sectionTitle}>{t('dashboard.boothOverview')}</Text>
      <View style={styles.boothOverviewContainer}>
        {/* Top row - Total Booths (full width) */}
        <View style={styles.boothOverviewRowFull}>
          <OverviewCard title={t('dashboard.totalBooths')} value={totalBooths.toString()} accent="#1976D2" iconName="directions-walk" onPress={() => router.push('/(tabs)/dashboard/my_booth?tab=all')} />
        </View>

        {/* First row - Booth Active & Inactive */}
        <View style={styles.boothOverviewRow}>
          <View style={styles.boothOverviewItem}>
            <OverviewCard title={t('dashboard.boothActive')} value={boothStats.active.toString()} accent="#2E7D32" onPress={() => router.push('/(tabs)/dashboard/my_booth?tab=active')} />
          </View>
          <View style={styles.boothOverviewItem}>
            <OverviewCard title={t('dashboard.boothInActive')} value={boothStats.inactive.toString()} accent="#D32F2F" onPress={() => router.push('/(tabs)/dashboard/my_booth?tab=inactive')} />
          </View>
        </View>

        {/* Second row - Logged In & Not Logged */}
        <View style={styles.boothOverviewRow}>
          <View style={styles.boothOverviewItem}>
            <OverviewCard title={t('dashboard.loggedIn')} value={boothStats.loggedIn.toString()} accent="#2E7D32" />
          </View>
          <View style={styles.boothOverviewItem}>
            <OverviewCard title={t('dashboard.notLogged')} value={boothStats.notLogged.toString()} accent="#D32F2F" />
          </View>
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
              <Text style={styles.modalTitle}>{t('dashboard.searchResults')}</Text>
              <TouchableOpacity 
                onPress={() => setShowSearchModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {pagination && (
              <Text style={styles.resultsCount}>
                {t('dashboard.showingResults', { start: ((pagination.currentPage - 1) * 10) + 1, end: Math.min(pagination.currentPage * 10, pagination.totalCount), total: pagination.totalCount })}
              </Text>
            )}

            <ScrollView style={styles.modalContent}>
              {searchResults.map((voter, index) => (
                <TouchableOpacity key={index} style={styles.voterCard} activeOpacity={0.85} onPress={() => {
                  try { router.push({ pathname: '/(tabs)/dashboard/voter_info', params: { voterData: JSON.stringify(voter) } }); } catch {}
                }}>
                  {/* Voter Card Header */}
                  <View style={styles.voterCardHeader}>
                    <View style={styles.serialContainer}>
                      <TouchableOpacity 
                        style={styles.starButton}
                        onPress={() => {
                          // Toggle favorite status
                          console.log('Toggle favorite for voter:', voter.Number);
                        }}
                      >
                        <Icon name="star-border" size={20} color="#FFD700" style={styles.starIcon} />
                      </TouchableOpacity>
                      <Text style={styles.serialText}>{t('dashboard.serial')} : {voter.sr || index + 1}</Text>
                    </View>
                  </View>

                  {/* Voter Card Content */}
                  <View style={styles.voterCardContent}>
                    {/* Voter Image and ID */}
                    <View style={styles.voterImageSection}>
                      <View style={styles.voterImageContainer}>
                        <View style={styles.voterImagePlaceholder}>
                          <Icon name="person" size={32} color="#90A4AE" />
                        </View>
                        <View style={styles.noImageOverlay}>
                          <Icon name="block" size={16} color="#F44336" />
                        </View>
                      </View>
                      <View style={styles.voterIdBadge}>
                        <Text style={styles.voterIdText}>{voter.Number}</Text>
                      </View>
                    </View>

                    {/* Voter Details */}
                    <View style={styles.voterInfoSection}>
                      <Text style={styles.voterNameEnglish}>{voter.Name}</Text>
                      <Text style={styles.voterNameTamil}>{voter.NameTamil || voter.Name}</Text>
                      <Text style={styles.voterRelationEnglish}>{voter['Father Name']}</Text>
                      <Text style={styles.voterRelationTamil}>{voter.RelationNameTamil || voter['Father Name']}</Text>
                      <Text style={styles.voterAddress}>{t('dashboard.doorNo')} {voter.makan || voter.Door_No}</Text>
                    </View>
                  </View>

                  {/* Age and Gender Footer */}
                  <View style={styles.voterAgeGenderContainer}>
                    <View style={styles.genderIconContainer}>
                      <Icon 
                        name={voter.sex === 'Male' ? 'male' : voter.sex === 'Female' ? 'female' : 'person'} 
                        size={18} 
                        color={voter.sex === 'Male' ? '#2196F3' : voter.sex === 'Female' ? '#E91E63' : '#9E9E9E'} 
                      />
                    </View>
                    <Text style={styles.voterAgeGender}>{voter.age} {voter.Relation || 'Husband'}</Text>
                  </View>
                </TouchableOpacity>
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
          animationType="slide"
          transparent={true}
          onRequestClose={handleElectionClose}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.electionModalContainer}>
              <Text style={styles.electionModalTitle}>{t('dashboard.setDefaultElection')}</Text>
              
              <View style={styles.electionInputContainer}>
                <TouchableOpacity 
                  style={styles.electionDropdown}
                  onPress={() => setShowElectionDropdown(!showElectionDropdown)}
                >
                  <Text style={styles.electionDropdownText}>{selectedElection}</Text>
                  <Icon name={showElectionDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="#666" />
                </TouchableOpacity>
                
                {showElectionDropdown && (
                  <View style={styles.electionDropdownList}>
                    <ScrollView style={styles.electionScrollView}>
                      {electionOptions.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.electionOption,
                            selectedElection === option && styles.electionOptionSelected
                          ]}
                          onPress={() => {
                            setSelectedElection(option);
                            setShowElectionDropdown(false);
                          }}
                        >
                          <Text style={[
                            styles.electionOptionText,
                            selectedElection === option && styles.electionOptionTextSelected
                          ]}>
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              
              <View style={styles.electionButtonContainer}>
                <TouchableOpacity style={styles.updateButton} onPress={handleElectionUpdate}>
                  <Text style={styles.updateButtonText}>{t('dashboard.update')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.electionCloseButton} onPress={handleElectionClose}>
                  <Text style={styles.electionCloseButtonText}>{t('dashboard.close')}</Text>
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
          onRequestClose={() => {
            setShowAdvanceSearchModal(false);
            clearAdvanceSearch();
          }}
        >
          <View style={styles.advanceSearchModalOverlay}>
            <View style={styles.advanceSearchModalContainer}>
              {/* Header */}
              <View style={styles.advanceSearchHeader}>
                <Text style={styles.advanceSearchTitle}>{t('dashboard.advanceSearch')}</Text>
                <TouchableOpacity 
                  style={styles.advanceSearchCloseButton}
                  onPress={() => {
                    setShowAdvanceSearchModal(false);
                    clearAdvanceSearch();
                  }}
                >
                  <Text style={styles.advanceSearchCloseIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <View style={styles.advanceSearchForm}>
                {/* Full width fields */}
                <TextInput
                  style={styles.advanceSearchInputFull}
                  placeholder={t('dashboard.mobileNo')}
                  placeholderTextColor="#999999"
                  value={advanceSearchData.mobileNo}
                  onChangeText={(text) => setAdvanceSearchData(prev => ({ ...prev, mobileNo: text }))}
                  keyboardType="numeric"
                />
                
                <TextInput
                  style={styles.advanceSearchInputFull}
                  placeholder={t('dashboard.epicId')}
                  placeholderTextColor="#999999"
                  value={advanceSearchData.Number}
                  onChangeText={(text) => setAdvanceSearchData(prev => ({ ...prev, Number: text }))}
                />
                
                <TextInput
                  style={styles.advanceSearchInputFull}
                  placeholder={t('dashboard.age')}
                  placeholderTextColor="#999999"
                  value={advanceSearchData.age}
                  onChangeText={(text) => setAdvanceSearchData(prev => ({ ...prev, age: text }))}
                  keyboardType="numeric"
                />

                {/* Half width fields - Part No and Serial No */}
                <View style={styles.advanceSearchRow}>
                  <TextInput
                    style={styles.advanceSearchInputHalf}
                    placeholder={t('dashboard.boothno')}
                    placeholderTextColor="#999999"
                    value={advanceSearchData.boothno}
                    onChangeText={(text) => setAdvanceSearchData(prev => ({ ...prev, boothno: text }))}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.advanceSearchInputHalf}
                    placeholder={t('dashboard.serialNo')}
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
                    placeholder={t('dashboard.voterFirstName')}
                    placeholderTextColor="#999999"
                    value={advanceSearchData.Name}
                    onChangeText={(text) => setAdvanceSearchData(prev => ({ ...prev, Name: text }))}
                  />
                  <TextInput
                    style={styles.advanceSearchInputHalf}
                    placeholder={t('dashboard.voterLastName')}
                    placeholderTextColor="#999999"
                    value={advanceSearchData['Father Name']}
                    onChangeText={(text) => setAdvanceSearchData(prev => ({ ...prev, 'Father Name': text }))}
                  />
                </View>

                {/* Half width fields - Relation First Name and Last Name */}
                <View style={styles.advanceSearchRow}>
                  <TextInput
                    style={styles.advanceSearchInputHalf}
                    placeholder={t('dashboard.relationFirstName')}
                    placeholderTextColor="#999999"
                    value={advanceSearchData.relationFirstName}
                    onChangeText={(text) => setAdvanceSearchData(prev => ({ ...prev, relationFirstName: text }))}
                  />
                  <TextInput
                    style={styles.advanceSearchInputHalf}
                    placeholder={t('dashboard.relationLastName')}
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
                  <Text style={styles.advanceSearchButtonText}>{t('dashboard.search')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.advanceSearchCancelButton}
                  onPress={() => {
                    setShowAdvanceSearchModal(false);
                    clearAdvanceSearch();
                  }}
                >
                  <Text style={styles.advanceSearchCancelButtonText}>{t('dashboard.cancel')}</Text>
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
                <Text style={styles.voterSearchTitle}>{t('dashboard.searchResults')}</Text>
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
                  {t('dashboard.showingResults', { start: ((voterSearchPagination.currentPage - 1) * voterSearchPagination.limit) + 1, end: Math.min(voterSearchPagination.currentPage * voterSearchPagination.limit, voterSearchPagination.totalCount), total: voterSearchPagination.totalCount })}
                </Text>
              )}

              {/* Results List */}
              <ScrollView style={styles.voterSearchResults}>
                {voterSearchLoading ? (
                  <View style={styles.voterSearchLoading}>
                    <Text style={styles.voterSearchLoadingText}>{t('dashboard.loading')}</Text>
                  </View>
                ) : voterSearchResults.length > 0 ? (
                  voterSearchResults.map((voter: any, index: number) => (
                    <TouchableOpacity key={voter._id || index} style={styles.voterCard} activeOpacity={0.85} onPress={() => {
                      try { router.push({ pathname: '/(tabs)/dashboard/voter_info', params: { voterData: JSON.stringify(voter) } }); } catch {}
                    }}>
                      {/* Voter Card Header with Star and Serial */}
                      <View style={styles.voterCardHeader}>
                        <TouchableOpacity 
                          style={styles.starButton}
                          onPress={() => {
                            // Toggle favorite status
                            console.log('Toggle favorite for voter:', voter.Number);
                          }}
                        >
                          <Icon name="star" size={20} color="#FFD700" />
                        </TouchableOpacity>
                        <Text style={styles.serialText}>{t('dashboard.serial')} No: {voter.sr || index + 1}</Text>
                      </View>

                      {/* Voter Card Content - Two Column Layout */}
                      <View style={styles.voterCardContent}>
                        {/* Left Column - Image and ID */}
                        <View style={styles.voterImageSection}>
                          <View style={styles.voterImageContainer}>
                            <View style={styles.voterImagePlaceholder}>
                              <Icon name="person" size={32} color="#90A4AE" />
                            </View>
                            <View style={styles.noImageOverlay}>
                              <Icon name="block" size={16} color="#F44336" />
                            </View>
                          </View>
                          <View style={styles.voterIdBadge}>
                            <Text style={styles.voterIdText}>{voter.Number}</Text>
                          </View>
                        </View>

                        {/* Right Column - Voter Details */}
                        <View style={styles.voterInfoSection}>
                          <Text style={styles.voterNameEnglish}>{voter.Name}</Text>
                          <Text style={styles.voterNameTamil}>{voter.NameTamil || voter.Name}</Text>
                          <Text style={styles.voterRelationEnglish}>{voter['Father Name']}</Text>
                          <Text style={styles.voterRelationTamil}>{voter.RelationNameTamil || voter['Father Name']}</Text>
                          <Text style={styles.voterAddress}>{t('dashboard.doorNo')} {voter.Door_No}</Text>
                        </View>
                      </View>

                      {/* Bottom Footer - Gender Icon and Age */}
                      <View style={styles.voterAgeGenderContainer}>
                        <Icon 
                          name={voter.sex === 'Male' ? 'male' : voter.sex === 'Female' ? 'female' : 'person'} 
                          size={18} 
                          color={voter.sex === 'Male' ? '#4CAF50' : voter.sex === 'Female' ? '#E91E63' : '#9E9E9E'} 
                        />
                        <Text style={styles.voterAgeGender}>{voter.age} {voter.Relation || 'Husband'}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.voterSearchEmpty}>
                    <Text style={styles.voterSearchEmptyText}>{t('dashboard.noVotersFound')}</Text>
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

      {/* Survey Details Modal */}
      {showSurveyDetailsModal && (
        <Modal
          visible={showSurveyDetailsModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('dashboard.boothSurveyProgress')}</Text>
              <View style={styles.modalHeaderActions}>
                <TouchableOpacity 
                  onPress={async () => {
                    const userDataStr = await AsyncStorage.getItem('userData');
                    if (userDataStr) {
                      const userData = JSON.parse(userDataStr);
                      await fetchAvailableBooths(userData.aci_id);
                    }
                    setShowFormCreationModal(true);
                    setFormData({
                      title: '',
                      description: '',
                      assignedBooths: [],
                      questions: []
                    });
                    setSelectAllBooths(false);
                  }}
                  style={styles.createFormButton}
                >
                  <Icon name="add-circle-outline" size={24} color="#1976D2" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setShowSurveyDetailsModal(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.modalContent}>
              {surveyLoading ? (
                <View style={styles.boothSurveyCard}>
                  <Text style={styles.boothNumberText}>{t('dashboard.loading')}</Text>
                </View>
              ) : surveyProgress?.booths && surveyProgress.booths.length > 0 ? (
                surveyProgress.booths.map((booth: any, index: number) => (
                  <View key={booth._id || index} style={styles.boothSurveyCard}>
                    <View style={styles.boothSurveyHeader}>
                      <View style={styles.boothInfoSection}>
                        <Text style={styles.boothNumberText}>{booth.boothNumber}</Text>
                        <Text style={styles.boothAgentName}>Agent: {booth.agentName}</Text>
                        <Text style={styles.boothAgentPhone}>📞 {booth.agentPhone || 'N/A'}</Text>
                      </View>
                      <View style={styles.boothProgressBadge}>
                        <Text style={styles.boothProgressPercentage}>{booth.progressPercentage || 0}%</Text>
                      </View>
                    </View>
                    
                    <View style={styles.boothProgressBarContainer}>
                      <View style={styles.boothProgressBar}>
                        <View style={[styles.boothProgressFill, { width: `${booth.progressPercentage || 0}%` }]} />
                      </View>
                    </View>

                    <View style={styles.boothSurveyStats}>
                      <View style={styles.boothSurveyStatItem}>
                        <Text style={styles.boothSurveyStatValue}>{booth.completed || 0}</Text>
                        <Text style={styles.boothSurveyStatLabel}>{t('dashboard.completed')}</Text>
                      </View>
                      <View style={styles.boothSurveyStatItem}>
                        <Text style={styles.boothSurveyStatValue}>{booth.total || 0}</Text>
                        <Text style={styles.boothSurveyStatLabel}>{t('dashboard.total')}</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.boothSurveyCard}>
                  <Text style={styles.boothNumberText}>{t('dashboard.noVotersFound')}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* Form Creation Modal */}
      {showFormCreationModal && (
        <Modal
          visible={showFormCreationModal}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('dashboard.createSurveyForm')}</Text>
              <TouchableOpacity 
                onPress={() => setShowFormCreationModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Form Title */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>{t('dashboard.formTitle')}</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={t('dashboard.enterFormTitle')}
                  value={formData.title}
                  onChangeText={(text) => setFormData({...formData, title: text})}
                />
              </View>

              {/* Form Description */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>{t('dashboard.formDescription')}</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  placeholder={t('dashboard.enterFormDescription')}
                  value={formData.description}
                  onChangeText={(text) => setFormData({...formData, description: text})}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Assign to Booths */}
              <View style={styles.formSection}>
                <View style={styles.boothsHeaderRow}>
                  <Text style={styles.formLabel}>{t('dashboard.assignToBooths')}</Text>
                  <TouchableOpacity 
                    style={styles.selectAllBoothsButton}
                    onPress={() => {
                      const allBoothIds = availableBooths.map((b: any) => b._id);
                      if (selectAllBooths) {
                        setFormData({...formData, assignedBooths: []});
                        setSelectAllBooths(false);
                      } else {
                        setFormData({...formData, assignedBooths: allBoothIds});
                        setSelectAllBooths(true);
                      }
                    }}
                  >
                    <View style={styles.checkbox}>
                      {selectAllBooths && <Icon name="check" size={18} color="#1976D2" />}
                    </View>
                    <Text style={styles.selectAllBoothsText}>{t('dashboard.selectAllBooths')}</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Booths Dropdown */}
                <TouchableOpacity 
                  style={styles.boothDropdownButton}
                  onPress={() => setShowBoothDropdown(!showBoothDropdown)}
                >
                  <Text style={styles.boothDropdownText}>
                    {formData.assignedBooths.length > 0 
                      ? `${formData.assignedBooths.length} ${t('dashboard.boothsSelected')}`
                      : t('dashboard.selectBooths')}
                  </Text>
                  <Icon name={showBoothDropdown ? "arrow-drop-up" : "arrow-drop-down"} size={24} color="#666" />
                </TouchableOpacity>

                {/* Dropdown List */}
                {showBoothDropdown && (
                  <View style={styles.boothDropdownList}>
                    {availableBooths.length > 0 ? (
                      availableBooths.map((booth: any) => (
                        <TouchableOpacity 
                          key={booth._id}
                          style={styles.boothDropdownItem}
                          onPress={() => {
                            const isSelected = formData.assignedBooths.includes(booth._id);
                            if (isSelected) {
                              setFormData({
                                ...formData, 
                                assignedBooths: formData.assignedBooths.filter(id => id !== booth._id)
                              });
                            } else {
                              setFormData({
                                ...formData, 
                                assignedBooths: [...formData.assignedBooths, booth._id]
                              });
                            }
                            // Update selectAll state
                            const newLength = isSelected ? formData.assignedBooths.length - 1 : formData.assignedBooths.length + 1;
                            setSelectAllBooths(newLength === availableBooths.length);
                          }}
                        >
                          <View style={styles.checkbox}>
                            {formData.assignedBooths.includes(booth._id) && <Icon name="check" size={18} color="#1976D2" />}
                          </View>
                          <View style={styles.boothDropdownItemInfo}>
                            <Text style={styles.boothDropdownItemName}>
                              {booth.booth_id || `Booth ${booth.name}`}
                            </Text>
                            <Text style={styles.boothDropdownItemAgent}>{booth.name} • {booth.phone || 'No phone'}</Text>
                          </View>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.boothDropdownItem}>
                        <Text style={styles.boothDropdownItemAgent}>{t('dashboard.noBooths')}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Questions Section */}
              <View style={styles.formSection}>
                <View style={styles.questionsSectionHeader}>
                  <Text style={styles.formLabel}>{t('dashboard.questions')}</Text>
                  <TouchableOpacity 
                    style={styles.addQuestionButton}
                    onPress={() => {
                      setFormData({
                        ...formData,
                        questions: [...formData.questions, {
                          id: Date.now().toString(),
                          question: '',
                          type: 'short_text',
                          required: false
                        }]
                      });
                    }}
                  >
                    <Icon name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.addQuestionButtonText}>{t('dashboard.addQuestion')}</Text>
                  </TouchableOpacity>
                </View>

                {/* Questions List */}
                {formData.questions.map((question, index) => (
                  <View key={question.id} style={styles.questionCard}>
                    <View style={styles.questionHeader}>
                      <Text style={styles.questionNumber}>{t('dashboard.question')} {index + 1}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setFormData({
                            ...formData,
                            questions: formData.questions.filter((_, i) => i !== index)
                          });
                        }}
                        style={styles.deleteQuestionButton}
                      >
                        <Icon name="delete" size={20} color="#F44336" />
                      </TouchableOpacity>
                    </View>

                    {/* Question Text */}
                    <TextInput
                      style={styles.formInput}
                      placeholder={t('dashboard.enterQuestion')}
                      value={question.question}
                      onChangeText={(text) => {
                        const updatedQuestions = [...formData.questions];
                        updatedQuestions[index].question = text;
                        setFormData({...formData, questions: updatedQuestions});
                      }}
                    />

                    {/* Question Type Dropdown */}
                    <View style={styles.questionTypeContainer}>
                      <Text style={styles.questionTypeLabel}>{t('dashboard.questionType')}</Text>
                      <TouchableOpacity 
                        style={styles.questionTypeSelector}
                        onPress={() => {
                          setShowQuestionTypeDropdown(
                            showQuestionTypeDropdown === question.id ? null : question.id
                          );
                        }}
                      >
                        <Text style={styles.questionTypeText}>
                          {t(`dashboard.questionType.${question.type}`)}
                        </Text>
                        <Icon name={showQuestionTypeDropdown === question.id ? "arrow-drop-up" : "arrow-drop-down"} size={24} color="#666" />
                      </TouchableOpacity>
                      
                      {/* Dropdown Options */}
                      {showQuestionTypeDropdown === question.id && (
                        <View style={styles.questionTypeDropdown}>
                          {questionTypes.map((type) => (
                            <TouchableOpacity
                              key={type.value}
                              style={[
                                styles.questionTypeOption,
                                question.type === type.value && styles.questionTypeOptionSelected
                              ]}
                              onPress={() => {
                                const updatedQuestions = [...formData.questions];
                                updatedQuestions[index].type = type.value;
                                setFormData({...formData, questions: updatedQuestions});
                                setShowQuestionTypeDropdown(null);
                              }}
                            >
                              <Text style={[
                                styles.questionTypeOptionText,
                                question.type === type.value && styles.questionTypeOptionTextSelected
                              ]}>
                                {t(type.label)}
                              </Text>
                              {question.type === type.value && (
                                <Icon name="check" size={20} color="#1976D2" />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>

                    {/* Required Toggle */}
                    <View style={styles.requiredToggleContainer}>
                      <Text style={styles.requiredToggleLabel}>{t('dashboard.required')}</Text>
                      <TouchableOpacity
                        style={[styles.toggleSwitch, question.required && styles.toggleSwitchActive]}
                        onPress={() => {
                          const updatedQuestions = [...formData.questions];
                          updatedQuestions[index].required = !question.required;
                          setFormData({...formData, questions: updatedQuestions});
                        }}
                      >
                        <View style={[styles.toggleThumb, question.required && styles.toggleThumbActive]} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              {/* Save Button */}
              <TouchableOpacity 
                style={styles.saveFormButton}
                onPress={() => {
                  // TODO: Implement form submission logic
                  console.log('Form Data:', formData);
                  setShowFormCreationModal(false);
                  setShowSurveyDetailsModal(false);
                }}
              >
                <Text style={styles.saveFormButtonText}>{t('dashboard.saveForm')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

type ManagerCardProps = { 
  title: string; 
  source?: any; 
  onPress?: () => void;
  value?: string;
  subtitle?: string;
  isInsights?: boolean;
  isPlaceholder?: boolean;
};

const ManagerCard = ({ title, source, onPress, value, subtitle, isInsights, isPlaceholder }: ManagerCardProps) => (
  <TouchableOpacity style={styles.managerCard} activeOpacity={0.8} onPress={onPress} disabled={isInsights || isPlaceholder}>
    {isInsights ? (
      <View style={styles.insightsContent}>
        {isPlaceholder ? (
          <Text style={styles.placeholderTitle}>{title}</Text>
        ) : (
          <>
            <Text style={styles.insightsValue}>{value || '0'}</Text>
            <Text style={styles.insightsSubtitle}>{subtitle}</Text>
          </>
        )}
      </View>
    ) : (
      <>
        {source && <Image source={source} style={styles.managerIcon} />}
        <Text style={styles.managerLabel}>{title}</Text>
      </>
    )}
  </TouchableOpacity>
);

type IconTileProps = { title: string; src: any; onPress?: () => void };
const IconTile = ({ title, src, onPress }: IconTileProps) => (
  <TouchableOpacity style={styles.tileIconOnly} activeOpacity={0.8} onPress={onPress}>
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
  iconName?: string;
  onPress?: () => void;
};

const OverviewCard = ({ title, value, accent, large, iconEmoji, iconName, onPress }: OverviewCardProps) => {
  const { language } = useLanguage();
  const isTamilOrMalayalam = language === 'ta' || language === 'ml';
  
  return (
    <TouchableOpacity 
      style={[large ? styles.overviewLarge : styles.overviewSmall]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {iconEmoji ? <Text style={styles.overviewIcon}>{iconEmoji}</Text> : null}
      {iconName ? <Icon name={iconName} size={large ? 32 : 24} color={accent} style={styles.overviewIconVector} /> : null}
      <View style={styles.titleContainer}>
        <Text style={[
          styles.overviewTitle,
          isTamilOrMalayalam && styles.overviewTitleTamilMalayalam
        ]}>{title}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: accent }]}>
        <Text style={styles.badgeText}>{value}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    backgroundColor: '#F3F6FB',
  },
  topArea: {
    backgroundColor: '#E3F2FD',
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
  },
  menuBar: {
    width: 16,
    height: 1.8,
    backgroundColor: '#263238',
    marginVertical: 1.5,
    borderRadius: 2,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 6,
    flex: 1,
  },
  constituencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 8,
    flex: 1,
  },
  constituencyText: {
    fontWeight: '700',
    color: '#000000',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  selectorText: {
    fontWeight: '700',
    color: '#000000',
    fontSize: 16,
  },
  selectorChevron: {
    marginLeft: 6,
    color: '#0D47A1',
    fontSize: 16,
  },
  bell: {
    width: 44,
    height: 44,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D32F2F',
  },

  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
    flexWrap: 'nowrap',
  },
  managerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '23%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  managerIcon: { width: 32, height: 32, resizeMode: 'contain', marginBottom: 8 },
  managerLabel: { textAlign: 'center', fontSize: 13, color: '#263238', fontWeight: '500' },
  insightsContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  insightsSubtitle: {
    fontSize: 11,
    color: '#546E7A',
    textAlign: 'center',
    fontWeight: '500',
  },
  placeholderTitle: {
    fontSize: 14,
    color: '#546E7A',
    textAlign: 'center',
    fontWeight: '600',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 48,
    flex: 1,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  searchIcon: { fontSize: 18, color: '#90A4AE' },
  searchInput: { flex: 1, color: '#263238', fontSize: 16 },
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
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  filterText: { fontSize: 18, color: '#263238' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    marginTop: 18,
  },
  tileIconOnly: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 22,
  },
  tileIcon: { width: 48, height: 48, resizeMode: 'contain', marginBottom: 8 },
  tileLabel: { 
    fontSize: 11, 
    color: '#263238', 
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 13,
    minHeight: 26,
    paddingHorizontal: 2,
  },

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
  overviewRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    marginTop: 12,
    columnGap: 12,
    rowGap: 12,
  },
  overviewItem: {
    marginBottom: 12,
  },
  // New Booth Overview Styles
  boothOverviewContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  boothOverviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8, // Reduced margin for tighter layout
    gap: 8, // Reduced gap for tighter layout
  },
  boothOverviewItem: {
    flex: 1,
  },
  boothOverviewRowFull: {
    marginBottom: 8, // Reduced margin for tighter layout
  },
  overviewRightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    columnGap: 12,
    rowGap: 12,
  },
  overviewRowTwoCol: {
    paddingHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  twoColItem: {
    width: '48%',
  },
  overviewLarge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 85, // Reduced height for tighter layout
  },
  overviewSmall: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 85, // Reduced height for tighter layout
  },
  overviewColSmall: { marginLeft: 0 },
  overviewIcon: { fontSize: 32, marginBottom: 6 },
  overviewIconVector: { marginBottom: 6 },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    minHeight: 45, // Reduced height for tighter layout
    paddingHorizontal: 1,
    flex: 1,
  },
  overviewTitle: { 
    textAlign: 'center', 
    color: '#263238', 
    fontWeight: '700', 
    fontSize: 13,
    lineHeight: 15,
    flexWrap: 'wrap',
    maxWidth: '100%',
    flexShrink: 1,
  },
  overviewTitleTamilMalayalam: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '600',
    textAlign: 'center',
    flexWrap: 'wrap',
    maxWidth: '100%',
    flexShrink: 1,
  },
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
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  selectedItemBox: {
    backgroundColor: '#424242',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'center',
  },
  selectedItemText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  electionModalContainer: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: '60%',
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
  electionDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  electionDropdownText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  electionDropdownList: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  electionScrollView: {
    maxHeight: 200,
  },
  electionOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  electionOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  electionOptionText: {
    fontSize: 16,
    color: '#000000',
  },
  electionOptionTextSelected: {
    color: '#1976D2',
    fontWeight: '600',
  },
  electionButtonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  updateButton: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  electionCloseButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  electionCloseButtonText: {
    color: '#424242',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  voterCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  starButton: {
    marginRight: 8,
  },
  serialText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
  voterCardContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  voterImageSection: {
    alignItems: 'center',
    marginRight: 16,
  },
  voterImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  voterImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voterIdBadge: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  voterIdText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  voterInfoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  voterNameEnglish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  voterNameTamil: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
  },
  voterRelationEnglish: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  voterRelationTamil: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 6,
  },
  voterAddress: {
    fontSize: 12,
    color: '#666666',
  },
  voterAgeGenderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  voterAgeGender: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
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
  welcomeText: {
    fontSize: 14,
    color: '#0D47A1',
    paddingHorizontal: 16,
    marginTop: 8,
    fontWeight: '600',
  },

  // Survey Overview Styles
  surveyOverviewBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  surveyOverviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  surveyOverviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  surveyProgressContainer: {
    marginBottom: 16,
  },
  surveyProgressBar: {
    height: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  surveyProgressFill: {
    height: '100%',
    backgroundColor: '#1976D2',
    borderRadius: 6,
  },
  surveyProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    textAlign: 'center',
  },
  surveyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  surveyStatItem: {
    alignItems: 'center',
  },
  surveyStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 4,
  },
  surveyStatLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  surveyStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },

  // Booth Survey Details Modal Styles
  boothSurveyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
  },
  boothSurveyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  boothInfoSection: {
    flex: 1,
  },
  boothNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  boothAgentName: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  boothAgentPhone: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '500',
  },
  boothProgressBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  boothProgressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976D2',
  },
  boothProgressBarContainer: {
    marginBottom: 12,
  },
  boothProgressBar: {
    height: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
    overflow: 'hidden',
  },
  boothProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  boothSurveyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  boothSurveyStatItem: {
    alignItems: 'center',
  },
  boothSurveyStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  boothSurveyStatLabel: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '500',
  },

  // Missing Voter Card Styles
  serialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 4,
  },
  genderIconContainer: {
    marginRight: 4,
  },
  // Form Creation Modal Styles
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  createFormButton: {
    padding: 8,
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333333',
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  boothSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#1976D2',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boothSelectText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  questionsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addQuestionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  questionCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
  },
  deleteQuestionButton: {
    padding: 4,
  },
  questionTypeContainer: {
    marginTop: 12,
  },
  questionTypeLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
  },
  questionTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
  },
  questionTypeText: {
    fontSize: 14,
    color: '#333333',
  },
  requiredToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  requiredToggleLabel: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    backgroundColor: '#E0E0E0',
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#1976D2',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  saveFormButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  saveFormButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  boothsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectAllBoothsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectAllBoothsText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  boothDropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
  },
  boothDropdownText: {
    fontSize: 14,
    color: '#333333',
  },
  boothDropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 300,
  },
  boothDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  boothDropdownItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  boothDropdownItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  boothDropdownItemAgent: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  questionTypeDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionTypeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  questionTypeOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  questionTypeOptionText: {
    fontSize: 14,
    color: '#333333',
  },
  questionTypeOptionTextSelected: {
    color: '#1976D2',
    fontWeight: '600',
  },
})