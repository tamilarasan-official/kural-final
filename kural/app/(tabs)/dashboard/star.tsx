import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '../../../contexts/LanguageContext';
import { voterAPI } from '../../../services/api/voter';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

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
  const [showFilterModal, setShowFilterModal] = useState(false);
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

  const [availableCommunities, setAvailableCommunities] = useState<string[]>([]);
  const [availableParts, setAvailableParts] = useState<string[]>([]);

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

  const loadStarVoters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all voters and filter for serial 1 and 5
      const response = await voterAPI.getVoters({ page: 1, limit: 1000 });
      
      if (response.success && Array.isArray(response.data)) {
        // Filter for serial 1 and 5 only
        const starVoters = response.data.filter((voter: any) => 
          voter.serial === 1 || voter.serial === 5
        );
        
        setVoters(starVoters);
        setAllVoters(starVoters);
        
        // Calculate gender summary
        const maleCount = starVoters.filter(v => v.gender === 'Male').length;
        const femaleCount = starVoters.filter(v => v.gender === 'Female').length;
        const otherCount = starVoters.filter(v => v.gender === 'Third').length;
        
        setGenderSummary({
          male: maleCount,
          female: femaleCount,
          other: otherCount,
          total: starVoters.length,
        });

        // Get available communities and parts
        const communities = [...new Set(starVoters.map(v => v.community).filter(Boolean))];
        const parts = [...new Set(starVoters.map(v => v.part?.toString()).filter(Boolean))];
        
        setAvailableCommunities(communities);
        setAvailableParts(parts);
      } else {
        setError('Failed to load star voters');
      }
    } catch (err: any) {
      console.log('Star voters fetch error:', err?.message || err);
      setError('Failed to load star voters');
    } finally {
      setLoading(false);
    }
  };

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
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilters({
      gender: [],
      ageRange: [18, 100],
      community: [],
      part: [],
    });
    setVoters(allVoters);
    setShowFilterModal(false);
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

  const renderVoterCard = (voter: StarVoter, index: number) => (
    <View key={voter._id} style={styles.voterCard}>
      <View style={styles.voterHeader}>
        <Text style={styles.serialText}>Serial: {voter.serial}</Text>
        <Text style={styles.sectionText}>Section: {voter.section}</Text>
        <Text style={styles.partText}>Part: {voter.part}</Text>
      </View>

      <View style={styles.voterImageContainer}>
        {voter.photo ? (
          <Image source={{ uri: voter.photo }} style={styles.voterImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name="person" size={40} color="#ccc" />
          </View>
        )}
        <View style={styles.voterIdContainer}>
          <Text style={styles.voterIdText}>{voter.voterId}</Text>
        </View>
      </View>

      <View style={styles.voterDetails}>
        <Text style={styles.voterName}>{voter.name}</Text>
        {voter.tamilName && (
          <Text style={styles.tamilName}>{voter.tamilName}</Text>
        )}
        
        {voter.community && (
          <>
            <Text style={styles.communityText}>{voter.community}</Text>
            {voter.tamilCommunity && (
              <Text style={styles.tamilCommunityText}>{voter.tamilCommunity}</Text>
            )}
          </>
        )}

        <Text style={styles.doorNoText}>Door No {voter.doorNo}</Text>
      </View>

      <View style={styles.voterFooter}>
        <View style={styles.ageContainer}>
          <Icon name="person" size={16} color="#666" />
          <Text style={styles.ageText}>{voter.age}</Text>
          <Text style={styles.relationshipText}>{voter.relationship || 'Husban'}</Text>
        </View>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="download" size={20} color="#1976D2" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Loading star voters...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Star</Text>
        <TouchableOpacity onPress={() => setShowFilterModal(true)}>
          <Icon name="filter-list" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Gender Summary */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: '#4CAF50' }]}>
          <Text style={styles.summaryLabel}>Male</Text>
          <Text style={styles.summaryValue}>{genderSummary.male}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#E91E63' }]}>
          <Text style={styles.summaryLabel}>Female</Text>
          <Text style={styles.summaryValue}>{genderSummary.female}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#9E9E9E' }]}>
          <Text style={styles.summaryLabel}>Others</Text>
          <Text style={styles.summaryValue}>{genderSummary.other}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#2196F3' }]}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>{genderSummary.total}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Voter Id or Voter Name"
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
      </View>

      {/* Voters List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {voters.map((voter, index) => renderVoterCard(voter, index))}
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
              <Text style={styles.modalTitle}>Filter Voters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent}>
              {/* Gender Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Gender</Text>
                <View style={styles.chipContainer}>
                  {['Male', 'Female', 'Third'].map(gender => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.filterChip,
                        filters.gender.includes(gender) && styles.activeChip
                      ]}
                      onPress={() => toggleFilter('gender', gender)}
                    >
                      <Text style={[
                        styles.chipText,
                        filters.gender.includes(gender) && styles.activeChipText
                      ]}>
                        {gender}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Age Range Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Age Range</Text>
                <MultiSlider
                  values={filters.ageRange}
                  sliderLength={width - 80}
                  onValuesChange={(values) => setFilters(prev => ({ ...prev, ageRange: values as [number, number] }))}
                  min={18}
                  max={100}
                  step={1}
                  allowOverlap={false}
                  customLabel={AgeLabel}
                />
              </View>

              {/* Community Filter */}
              {availableCommunities.length > 0 && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterTitle}>Community</Text>
                  <View style={styles.chipContainer}>
                    {availableCommunities.map(community => (
                      <TouchableOpacity
                        key={community}
                        style={[
                          styles.filterChip,
                          filters.community.includes(community) && styles.activeChip
                        ]}
                        onPress={() => toggleFilter('community', community)}
                      >
                        <Text style={[
                          styles.chipText,
                          filters.community.includes(community) && styles.activeChipText
                        ]}>
                          {community}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Part Filter */}
              {availableParts.length > 0 && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterTitle}>Part</Text>
                  <View style={styles.chipContainer}>
                    {availableParts.map(part => (
                      <TouchableOpacity
                        key={part}
                        style={[
                          styles.filterChip,
                          filters.part.includes(part) && styles.activeChip
                        ]}
                        onPress={() => toggleFilter('part', part)}
                      >
                        <Text style={[
                          styles.chipText,
                          filters.part.includes(part) && styles.activeChipText
                        ]}>
                          {part}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    marginRight: 10,
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
  voterImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  filterContent: {
    maxHeight: 400,
    padding: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    marginBottom: 8,
  },
  activeChip: {
    backgroundColor: '#1976D2',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  activeChipText: {
    color: '#fff',
  },
  ageLabelContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  ageLabelText: {
    fontSize: 14,
    color: '#666',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
