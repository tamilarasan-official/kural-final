import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRole } from '../contexts/RoleContext';
import ScreenWrapper from '../components/ScreenWrapper';
import { voterAPI } from '../../services/api/voter';

export default function VotersScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { userData } = useRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [voters, setVoters] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPageModal, setShowPageModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All Voters');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVoters, setTotalVoters] = useState(0);
  const ITEMS_PER_PAGE = 50;
  const [newVoter, setNewVoter] = useState({
    voterId: '',
    fullName: '',
    age: '',
    gender: '',
    phoneNumber: '',
    address: '',
    familyId: '',
    specialCategory: '',
  });

  const loadVoters = useCallback(async (page: number = 1) => {
      try {
        setLoading(true);
        const boothId = userData?.booth_id || '';
        
        console.log('🔍 Voters Screen - Loading voters for booth:', boothId, 'Page:', page);
        console.log('🔍 Voters Screen - userData:', JSON.stringify(userData, null, 2));
        
        if (boothId) {
          // Load voters by booth ID with server-side pagination
          const response = await voterAPI.getVotersByBoothId(boothId, { 
            page: page,
            limit: ITEMS_PER_PAGE 
          });
          console.log('📊 Voters Screen - API Response:', response);
          
          if (response?.success) {
            // Handle 'voters' response format
            const votersArray = Array.isArray(response.voters) ? response.voters : [];
            
            // Set voters for current page
            setVoters(votersArray);
            
            // Update pagination info from server response
            if (response.pagination) {
              setTotalPages(response.pagination.totalPages || 1);
              setTotalVoters(response.pagination.totalVoters || 0);
              setCurrentPage(response.pagination.currentPage || page);
            }
          } else {
            setVoters([]);
            setTotalPages(1);
            setTotalVoters(0);
          }
        }
      } catch (error) {
        console.error('Failed to load voters:', error);
        Alert.alert('Error', 'Failed to load voters. Please try again.');
        setVoters([]);
        setTotalPages(1);
        setTotalVoters(0);
      } finally {
        setLoading(false);
      }
    }, [userData]);

  useEffect(() => {
    loadVoters(1);
  }, [loadVoters]);

  // Reload voters when screen comes into focus (e.g., after navigating back from detail screen)
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Screen focused - Reloading voters for page:', currentPage);
      loadVoters(currentPage);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage])
  );

  // Filter voters based on search query and selected filter
  const filteredVoters = voters.filter(voter => {
    // Apply search filter - support both old and new field names
    const voterName = voter.name?.english || voter.name?.tamil || voter.Name || '';
    const voterNumber = voter.voterID || voter.Number || voter['EPIC No'] || '';
    const voterMobile = voter.mobile || voter.phoneNumber || '';
    
    const matchesSearch = searchQuery.trim() === '' || 
      voterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voterNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voterMobile.includes(searchQuery);
    
    if (!matchesSearch) return false;

    // Apply dropdown filter
    const age = parseInt(voter.age || voter.Age) || 0;
    const voterGender = voter.gender || voter.sex || '';
    
    switch (selectedFilter) {
      case 'All Voters':
        return true;
      case 'Verified':
        return voter.verified === true || voter.status === 'verified';
      case 'Pending':
        return voter.verified === false || voter.status === 'pending' || !voter.verified;
      case 'Age 60+':
        return age >= 60 && age < 80;
      case 'Age 80+':
        return age >= 80;
      case 'Transgender':
        return voterGender.toLowerCase() === 'transgender' || voterGender.toLowerCase() === 'others' || voter.specialCategories?.includes('Transgender');
      case 'Fatherless':
        return voter.specialCategories?.includes('Fatherless') || false;
      case 'Overseas':
        return voter.specialCategories?.includes('Overseas') || false;
      case 'Other':
        return voter.specialCategories?.includes('Other') || false;
      default:
        return true;
    }
  });
  
  console.log(`🔍 Voters Screen - Total voters: ${voters.length}, Filtered: ${filteredVoters.length}, Search: "${searchQuery}", Filter: ${selectedFilter}`);

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setShowDropdown(false);
  };

  const loadPage = async (pageNumber: number) => {
    setShowPageModal(false);
    await loadVoters(pageNumber);
  };

  const handleAddVoter = async () => {
    // Validate required fields
    if (!newVoter.voterId || !newVoter.fullName || !newVoter.age || !newVoter.gender || !newVoter.address) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    try {
      // Get booth ID from userData
      const boothId = userData?.booth_id || '';
      
      if (!boothId) {
        Alert.alert('Error', 'Booth allocation not found. Please contact administrator.');
        return;
      }

      // Call API to create voter
      const response = await voterAPI.createVoter({
        voterId: newVoter.voterId,
        fullName: newVoter.fullName,
        age: newVoter.age,
        gender: newVoter.gender,
        phoneNumber: newVoter.phoneNumber,
        address: newVoter.address,
        familyId: newVoter.familyId,
        specialCategories: newVoter.specialCategory ? [newVoter.specialCategory] : [],
        boothId: boothId,
      });

      if (response.success) {
        Alert.alert('Success', 'Voter added successfully');
        setShowAddModal(false);
        
        // Reset form
        setNewVoter({
          voterId: '',
          fullName: '',
          age: '',
          gender: '',
          phoneNumber: '',
          address: '',
          familyId: '',
          specialCategory: '',
        });
        
        // Reload voters
        loadVoters(currentPage);
      } else {
        Alert.alert('Error', response.message || 'Failed to add voter');
      }
    } catch (error) {
      console.error('Error adding voter:', error);
      Alert.alert('Error', 'Failed to add voter. Please try again.');
    }
  };

  const toggleSpecialCategory = (category: string) => {
    setNewVoter(prev => ({
      ...prev,
      specialCategory: prev.specialCategory === category ? '' : category
    }));
  };

  return (
    <ScreenWrapper userRole="booth_agent">
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Loading voters...</Text>
        </View>
      ) : (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(boothAgent)/dashboard')}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Voter Manager</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Icon name="person-add" size={24} color="#1976D2" />
          </TouchableOpacity>
        </View>

        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>
            Booth {userData?.boothAllocation || userData?.activeElection || '119 '} - {totalVoters} total voters
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or voter ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        {/* Filter Dropdown */}
        <View style={styles.filterContainer}>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Text style={styles.filterText}>{selectedFilter}</Text>
              <Icon name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>
            
            {/* Dropdown Options */}
            {showDropdown && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity 
                  style={styles.dropdownOption}
                  onPress={() => handleFilterSelect('All Voters')}
                >
                  <View style={styles.checkmark}>
                    {selectedFilter === 'All Voters' && (
                      <Icon name="check" size={16} color="#2196F3" />
                    )}
                  </View>
                  <Text style={styles.dropdownOptionText}>All Voters</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dropdownOption}
                  onPress={() => handleFilterSelect('Verified')}
                >
                  <View style={styles.checkmark}>
                    {selectedFilter === 'Verified' && (
                      <Icon name="check" size={16} color="#2196F3" />
                    )}
                  </View>
                  <Text style={styles.dropdownOptionText}>Verified</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dropdownOption}
                  onPress={() => handleFilterSelect('Pending')}
                >
                  <View style={styles.checkmark}>
                    {selectedFilter === 'Pending' && (
                      <Icon name="check" size={16} color="#2196F3" />
                    )}
                  </View>
                  <Text style={styles.dropdownOptionText}>Pending</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dropdownOption}
                  onPress={() => handleFilterSelect('Age 60+')}
                >
                  <View style={styles.checkmark}>
                    {selectedFilter === 'Age 60+' && (
                      <Icon name="check" size={16} color="#2196F3" />
                    )}
                  </View>
                  <Text style={styles.dropdownOptionText}>Age 60+</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dropdownOption}
                  onPress={() => handleFilterSelect('Age 80+')}
                >
                  <View style={styles.checkmark}>
                    {selectedFilter === 'Age 80+' && (
                      <Icon name="check" size={16} color="#2196F3" />
                    )}
                  </View>
                  <Text style={styles.dropdownOptionText}>Age 80+</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dropdownOption}
                  onPress={() => handleFilterSelect('Transgender')}
                >
                  <View style={styles.checkmark}>
                    {selectedFilter === 'Transgender' && (
                      <Icon name="check" size={16} color="#2196F3" />
                    )}
                  </View>
                  <Text style={styles.dropdownOptionText}>Transgender</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dropdownOption}
                  onPress={() => handleFilterSelect('Fatherless')}
                >
                  <View style={styles.checkmark}>
                    {selectedFilter === 'Fatherless' && (
                      <Icon name="check" size={16} color="#2196F3" />
                    )}
                  </View>
                  <Text style={styles.dropdownOptionText}>Fatherless</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dropdownOption}
                  onPress={() => handleFilterSelect('Overseas')}
                >
                  <View style={styles.checkmark}>
                    {selectedFilter === 'Overseas' && (
                      <Icon name="check" size={16} color="#2196F3" />
                    )}
                  </View>
                  <Text style={styles.dropdownOptionText}>Overseas</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dropdownOption}
                  onPress={() => handleFilterSelect('Other')}
                >
                  <View style={styles.checkmark}>
                    {selectedFilter === 'Other' && (
                      <Icon name="check" size={16} color="#2196F3" />
                    )}
                  </View>
                  <Text style={styles.dropdownOptionText}>Other</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.filterIconButton}
            onPress={() => setShowPageModal(true)}
          >
            <Icon name="filter-list" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Voters List with Page Info */}
        <View style={styles.pageInfo}>
          <Text style={styles.pageInfoText}>
            Page {currentPage} of {totalPages} (Showing {voters.length} of {totalVoters} voters)
          </Text>
        </View>

        {/* Voters List */}
        <ScrollView style={styles.votersList} showsVerticalScrollIndicator={false}>
          {filteredVoters.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="people-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No voters found</Text>
            </View>
          ) : (
            filteredVoters.map((voter, index) => {
              const age = parseInt(voter.age || voter.Age) || 0;
              const isSenior60 = age >= 60 && age < 80;
              const isSenior80 = age >= 80;
              const hasPhone = voter.mobile || voter['Mobile No'] || voter.Mobile || voter['Mobile Number'];
              const isVerified = voter.verified === true || voter.status === 'verified';
              const specialCategories = voter.specialCategories || [];
              const hasSpecialCategories = specialCategories.length > 0 || isSenior60 || isSenior80;
              
              return (
                <TouchableOpacity 
                  key={voter._id || voter.Number || index} 
                  style={styles.voterCard}
                  onPress={() => {
                    const voterId = voter._id ? `_id:${voter._id}` : voter['EPIC No'] || voter.Number;
                    router.push({
                      pathname: '/(boothAgent)/voter-detail',
                      params: { voterId }
                    });
                  }}
                >
                  {/* Voter Name and Status Badge */}
                  <View style={styles.voterHeader}>
                    <View style={styles.nameContainer}>
                      <Text style={styles.voterName}>
                        {voter.name?.english || voter.Name || 'Unknown'}
                      </Text>
                      {voter.name?.tamil && (
                        <Text style={styles.voterNameTamil}>
                          {voter.name.tamil}
                        </Text>
                      )}
                    </View>
                    {isVerified ? (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    ) : (
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingText}>Pending</Text>
                      </View>
                    )}
                  </View>

                  {/* Voter ID */}
                  <Text style={styles.voterId}>ID: {voter.voterID || voter['EPIC No'] || voter.Number || 'N/A'}</Text>

                  {/* Age and Gender */}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Age: </Text>
                    <Text style={styles.infoValue}>{voter.age || voter.Age || 'N/A'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Gender: </Text>
                    <Text style={styles.infoValue}>{voter.gender || voter.sex || voter.Sex || voter.Gender || 'N/A'}</Text>
                  </View>

                  {/* Phone Number */}
                  {hasPhone && (
                    <View style={styles.phoneRow}>
                      <Icon name="phone" size={16} color="#333" />
                      <Text style={styles.phoneText}>{hasPhone}</Text>
                    </View>
                  )}

                  {/* Special Categories Tags */}
                  {hasSpecialCategories && (
                    <View style={styles.tagContainer}>
                      {isSenior60 && (
                        <View style={styles.ageTag}>
                          <Text style={styles.ageTagText}>Age 60+</Text>
                        </View>
                      )}
                      {isSenior80 && (
                        <View style={styles.ageTag}>
                          <Text style={styles.ageTagText}>Age 80+</Text>
                        </View>
                      )}
                      {specialCategories.includes('Transgender') && (
                        <View style={[styles.ageTag, { backgroundColor: '#E1BEE7' }]}>
                          <Text style={styles.ageTagText}>Transgender</Text>
                        </View>
                      )}
                      {specialCategories.includes('Fatherless') && (
                        <View style={[styles.ageTag, { backgroundColor: '#FFCCBC' }]}>
                          <Text style={styles.ageTagText}>Fatherless</Text>
                        </View>
                      )}
                      {specialCategories.includes('Overseas') && (
                        <View style={[styles.ageTag, { backgroundColor: '#B2DFDB' }]}>
                          <Text style={styles.ageTagText}>Overseas</Text>
                        </View>
                      )}
                      {specialCategories.includes('Other') && (
                        <View style={[styles.ageTag, { backgroundColor: '#CFD8DC' }]}>
                          <Text style={styles.ageTagText}>Other</Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* Add Voter Modal */}
        <Modal
          visible={showAddModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowAddModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalContainer}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Voter</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalSubtitle}>
                Enter the voter&apos;s details to register them in the booth
              </Text>

              <ScrollView 
                style={{ flex: 1 }}
                contentContainerStyle={styles.modalContent} 
                showsVerticalScrollIndicator={false}
              >
                {/* Voter ID */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Voter ID <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., TND119 0007"
                    placeholderTextColor="#999"
                    value={newVoter.voterId}
                    onChangeText={(text) => setNewVoter({ ...newVoter, voterId: text })}
                  />
                </View>

                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Full Name <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter full name"
                    placeholderTextColor="#999"
                    value={newVoter.fullName}
                    onChangeText={(text) => setNewVoter({ ...newVoter, fullName: text })}
                  />
                </View>

                {/* Age */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Age <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter age"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={newVoter.age}
                    onChangeText={(text) => setNewVoter({ ...newVoter, age: text })}
                  />
                </View>

                {/* Gender */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Gender <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity 
                    style={styles.selectInput}
                    onPress={() => {
                      Alert.alert(
                        'Select Gender',
                        '',
                        [
                          { text: 'Male', onPress: () => setNewVoter({ ...newVoter, gender: 'Male' }) },
                          { text: 'Female', onPress: () => setNewVoter({ ...newVoter, gender: 'Female' }) },
                          { text: 'Other', onPress: () => setNewVoter({ ...newVoter, gender: 'Other' }) },
                          { text: 'Cancel', style: 'cancel' }
                        ]
                      );
                    }}
                  >
                    <Text style={newVoter.gender ? styles.selectInputTextFilled : styles.selectInputText}>
                      {newVoter.gender || 'Select gender'}
                    </Text>
                    <Icon name="arrow-drop-down" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Phone Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="+91 98765 43210"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    value={newVoter.phoneNumber}
                    onChangeText={(text) => setNewVoter({ ...newVoter, phoneNumber: text })}
                  />
                </View>

                {/* Address */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Address <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Enter complete address"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                    value={newVoter.address}
                    onChangeText={(text) => setNewVoter({ ...newVoter, address: text })}
                  />
                </View>

                {/* Family ID */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Family ID</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., F001"
                    placeholderTextColor="#999"
                    value={newVoter.familyId}
                    onChangeText={(text) => setNewVoter({ ...newVoter, familyId: text })}
                  />
                  <Text style={styles.helperText}>Leave empty to create a new family</Text>
                </View>

                {/* Special Categories */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Special Categories</Text>
                  
                  <TouchableOpacity 
                    style={styles.checkboxItem}
                    onPress={() => toggleSpecialCategory('Age 60+')}
                  >
                    <View style={[
                      styles.checkbox,
                      newVoter.specialCategory === 'Age 60+' && styles.checkboxChecked
                    ]}>
                      {newVoter.specialCategory === 'Age 60+' && (
                        <Icon name="check" size={16} color="#2196F3" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>Age 60+</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.checkboxItem}
                    onPress={() => toggleSpecialCategory('Age 80+')}
                  >
                    <View style={[
                      styles.checkbox,
                      newVoter.specialCategory === 'Age 80+' && styles.checkboxChecked
                    ]}>
                      {newVoter.specialCategory === 'Age 80+' && (
                        <Icon name="check" size={16} color="#2196F3" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>Age 80+</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.checkboxItem}
                    onPress={() => toggleSpecialCategory('Transgender')}
                  >
                    <View style={[
                      styles.checkbox,
                      newVoter.specialCategory === 'Transgender' && styles.checkboxChecked
                    ]}>
                      {newVoter.specialCategory === 'Transgender' && (
                        <Icon name="check" size={16} color="#2196F3" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>Transgender</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.checkboxItem}
                    onPress={() => toggleSpecialCategory('Fatherless')}
                  >
                    <View style={[
                      styles.checkbox,
                      newVoter.specialCategory === 'Fatherless' && styles.checkboxChecked
                    ]}>
                      {newVoter.specialCategory === 'Fatherless' && (
                        <Icon name="check" size={16} color="#2196F3" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>Fatherless</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.checkboxItem}
                    onPress={() => toggleSpecialCategory('Overseas')}
                  >
                    <View style={[
                      styles.checkbox,
                      newVoter.specialCategory === 'Overseas' && styles.checkboxChecked
                    ]}>
                      {newVoter.specialCategory === 'Overseas' && (
                        <Icon name="check" size={16} color="#2196F3" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>Overseas</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.checkboxItem}
                    onPress={() => toggleSpecialCategory('Other')}
                  >
                    <View style={[
                      styles.checkbox,
                      newVoter.specialCategory === 'Other' && styles.checkboxChecked
                    ]}>
                      {newVoter.specialCategory === 'Other' && (
                        <Icon name="check" size={16} color="#2196F3" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>Other</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ height: 20 }} />
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.addVoterButton}
                  onPress={handleAddVoter}
                >
                  <Text style={styles.addVoterButtonText}>Add Voter</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Page Selection Modal */}
        <Modal
          visible={showPageModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPageModal(false)}
        >
          <TouchableOpacity 
            style={styles.pageModalOverlay}
            activeOpacity={1}
            onPress={() => setShowPageModal(false)}
          >
            <TouchableOpacity 
              style={styles.pageModalContainer}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <View style={styles.pageModalHeader}>
                <Text style={styles.pageModalTitle}>Select Page</Text>
                <TouchableOpacity onPress={() => setShowPageModal(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Page List */}
              <ScrollView style={styles.pageList} showsVerticalScrollIndicator={false}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  // Calculate voters per page
                  const isLastPage = pageNum === totalPages;
                  const votersCount = isLastPage 
                    ? totalVoters - ((totalPages - 1) * ITEMS_PER_PAGE)
                    : ITEMS_PER_PAGE;
                  
                  return (
                    <TouchableOpacity
                      key={pageNum}
                      style={[
                        styles.pageOption,
                        currentPage === pageNum && styles.pageOptionActive
                      ]}
                      onPress={() => loadPage(pageNum)}
                    >
                      <View>
                        <Text style={[
                          styles.pageOptionText,
                          currentPage === pageNum && styles.pageOptionTextActive
                        ]}>
                          Page {pageNum}
                        </Text>
                        <Text style={styles.pageOptionSubtext}>
                          {votersCount} voters
                        </Text>
                      </View>
                      {currentPage === pageNum && (
                        <Icon name="check" size={20} color="#2196F3" />
                      )}
                    </TouchableOpacity>
                  );
                })}
                <View style={{ height: 20 }} />
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
      )
      }
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#E3F2FD',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 4,
  },
  subtitleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#E3F2FD',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  dropdownContainer: {
    flex: 1,
    position: 'relative',
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkmark: {
    width: 20,
    height: 20,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  filterText: {
    fontSize: 14,
    color: '#000',
  },
  filterIconButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 1,
  },
  votersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  voterCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  voterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  voterName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  voterNameTamil: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  pendingText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  voterId: {
    fontSize: 13,
    color: '#1976D2',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  phoneText: {
    fontSize: 14,
    color: '#333',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  ageTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ageTagText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingBottom: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1A1A1A',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  selectInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectInputText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  selectInputTextFilled: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: '#2196F3',
    backgroundColor: '#EFF6FF',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    flexWrap: 'wrap',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  addVoterButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addVoterButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Page Info Styles
  pageInfo: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F0F4F8',
  },
  pageInfoText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  // Page Modal Styles
  pageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pageModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  pageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pageModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  pageList: {
    maxHeight: 400,
  },
  pageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pageOptionActive: {
    backgroundColor: '#E3F2FD',
  },
  pageOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  pageOptionTextActive: {
    color: '#2196F3',
    fontWeight: '700',
  },
  pageOptionSubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
});