import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRole } from '../contexts/RoleContext';
import ScreenWrapper from '../components/ScreenWrapper';
import { voterAPI } from '../../services/api/voter';

interface Family {
  id: string;
  address: string;
  members: any[];
  headOfFamily: string;
  totalMembers: number;
  verifiedMembers: number;
  phone?: string;
  surveyCompleted?: boolean; // Track if family has completed survey
}

export default function FamiliesScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { userData } = useRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'survey_completed', 'survey_pending'
  const [loading, setLoading] = useState(true);
  const [families, setFamilies] = useState<Family[]>([]);
  const [mapFamilyModalVisible, setMapFamilyModalVisible] = useState(false);
  const [familyIdInput, setFamilyIdInput] = useState('');
  const [voterSearchQuery, setVoterSearchQuery] = useState('');
  const [allVoters, setAllVoters] = useState<any[]>([]);
  const [selectedVoters, setSelectedVoters] = useState<string[]>([]);
  const [mappingFamily, setMappingFamily] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadFamilies();
    }, [userData])
  );

  const loadFamilies = async () => {
    try {
      setLoading(true);
      let boothId = userData?.booth_id || '';
      let aciId = userData?.aci_id || '';
      
      // Fallback: Load from AsyncStorage if userData not available
      if (!boothId || !aciId) {
        const savedUserData = await AsyncStorage.getItem('userData');
        if (savedUserData) {
          const parsed = JSON.parse(savedUserData);
          boothId = parsed.booth_id || '';
          aciId = parsed.aci_id || '';
        }
      }
      
      console.log('Families - userData:', userData);
      console.log('Families - loading for:', { aciId, boothId });
      
      if (!boothId || !aciId) {
        console.log('Families - No aci_id or booth_id found, cannot load families');
        setFamilies([]);
        setLoading(false);
        return;
      }
      
      if (aciId && boothId) {
        const aciIdStr = String(aciId);
        const boothIdStr = String(boothId);
        // First get the total count
        const initialResponse = await voterAPI.getVotersByBoothId(aciIdStr, boothIdStr, { page: 1, limit: 50 });
        console.log('Families - Initial response:', initialResponse);
        
        if (initialResponse?.success) {
          const totalVoters = initialResponse.pagination?.total || initialResponse.pagination?.totalVoters || 0;
          
          // Now fetch all voters
          const response = await voterAPI.getVotersByBoothId(aciIdStr, boothIdStr, { 
            page: 1, 
            limit: totalVoters || 5000 
          });
          
          if (response?.success && Array.isArray(response.voters)) {
            console.log('Families - Total voters fetched:', response.voters.length);
            console.log('Families - Sample voter:', response.voters[0]);
            
            // Group voters by:
            // 1. Manually mapped families (familyId field) - Priority
            // 2. Address-based grouping - Fallback
            const familyIdMap = new Map<string, any[]>();
            const addressBasedMap = new Map<string, any[]>();
            
            response.voters.forEach((voter: any) => {
              // Check if voter has a manually assigned familyId
              if (voter.familyId) {
                if (!familyIdMap.has(voter.familyId)) {
                  familyIdMap.set(voter.familyId, []);
                }
                familyIdMap.get(voter.familyId)!.push(voter);
              } else {
                // Fall back to address-based grouping
                const houseNo = voter['Address-House no'] || 
                               voter.HouseNo || 
                               voter.Door_No || 
                               voter.Door_no || 
                               voter.door_no || 
                               '';
                
                const street = voter['Address-Street'] || 
                              voter.Street || 
                              voter.Anubhag_name || 
                              voter.address || 
                              '';
                
                const addressKey = `${houseNo}-${street}`.trim();
                
                if (addressKey && addressKey !== '-') {
                  if (!addressBasedMap.has(addressKey)) {
                    addressBasedMap.set(addressKey, []);
                  }
                  addressBasedMap.get(addressKey)!.push(voter);
                }
              }
            });

            console.log('Families - Manually mapped:', familyIdMap.size);
            console.log('Families - Address-based:', addressBasedMap.size);

            // Convert manually mapped families to family objects
            const manualFamilies: Family[] = Array.from(familyIdMap.entries()).map(([familyId, members]) => {
              const sortedMembers = [...members].sort((a, b) => {
                const ageA = parseInt(a.Age || a.age) || 0;
                const ageB = parseInt(b.Age || b.age) || 0;
                return ageB - ageA;
              });
              
              const head = sortedMembers[0];
              const phone = members.find(m => m.mobile || m['Mobile No'] || m.Mobile)?.mobile || 
                           members.find(m => m.mobile || m['Mobile No'] || m.Mobile)?.['Mobile No'] || 
                           members.find(m => m.mobile || m['Mobile No'] || m.Mobile)?.Mobile;
              
              // Build address from first member
              const houseNo = head['Address-House no'] || head.HouseNo || head.Door_No || head.Door_no || head.door_no || '';
              const street = head['Address-Street'] || head.Street || head.Anubhag_name || head.address || '';
              const address = `${houseNo}${street ? ', ' + street : ''}`;

              return {
                id: familyId,
                address: address || familyId,
                members,
                headOfFamily: head.name?.english || head.Name || head.name || 'Unknown',
                totalMembers: members.length,
                verifiedMembers: members.filter(m => m.verified || m.Verified).length,
                phone,
                surveyCompleted: false, // TODO: Check if family has completed survey
              };
            });

            // Convert address-based families to family objects
            const addressFamilies: Family[] = Array.from(addressBasedMap.entries()).map(([address, members], index) => {
              const sortedMembers = [...members].sort((a, b) => {
                const ageA = parseInt(a.Age || a.age) || 0;
                const ageB = parseInt(b.Age || b.age) || 0;
                return ageB - ageA;
              });
              
              const head = sortedMembers[0];
              const phone = members.find(m => m.mobile || m['Mobile No'] || m.Mobile)?.mobile || 
                           members.find(m => m.mobile || m['Mobile No'] || m.Mobile)?.['Mobile No'] || 
                           members.find(m => m.mobile || m['Mobile No'] || m.Mobile)?.Mobile;

              return {
                id: `address-family-${index}`,
                address,
                members,
                headOfFamily: head.name?.english || head.Name || head.name || 'Unknown',
                totalMembers: members.length,
                verifiedMembers: members.filter(m => m.verified || m.Verified).length,
                phone,
                surveyCompleted: false, // TODO: Check if family has completed survey
              };
            });

            // Combine both types of families
            const allFamilies = [...manualFamilies, ...addressFamilies];
            console.log('Families - Total families:', allFamilies.length);
            setFamilies(allFamilies);
          } else {
            console.log('Families - No data or unsuccessful response');
            setFamilies([]);
          }
        } else {
          setFamilies([]);
        }
      }
    } catch (error) {
      console.error('Failed to load families:', error);
      Alert.alert('Error', 'Failed to load families. Please try again.');
      setFamilies([]);
    } finally {
      setLoading(false);
    }
  };

  const openMapFamilyModal = async () => {
    try {
      setMapFamilyModalVisible(true);
      // Load all voters for selection
      const boothId = userData?.booth_id || '';
      const aciId = userData?.aci_id || '';
      if (aciId && boothId) {
        const aciIdStr = String(aciId);
        const boothIdStr = String(boothId);
        const response = await voterAPI.getVotersByBoothId(aciIdStr, boothIdStr, { page: 1, limit: 5000 });
        if (response?.success && Array.isArray(response.voters)) {
          setAllVoters(response.voters);
        }
      }
    } catch (error) {
      console.error('Failed to load voters:', error);
      Alert.alert('Error', 'Failed to load voters');
    }
  };

  const closeMapFamilyModal = () => {
    setMapFamilyModalVisible(false);
    // Reset modal state
    setFamilyIdInput('');
    setSelectedVoters([]);
    setVoterSearchQuery('');
  };

  const toggleVoterSelection = (voterId: string) => {
    setSelectedVoters(prev => {
      if (prev.includes(voterId)) {
        return prev.filter(id => id !== voterId);
      } else {
        return [...prev, voterId];
      }
    });
  };

  const handleMapFamily = async () => {
    if (!familyIdInput.trim()) {
      Alert.alert('Error', 'Please enter a Family ID');
      return;
    }

    if (selectedVoters.length < 2) {
      Alert.alert('Error', 'Please select at least 2 voters to create a family');
      return;
    }

    try {
      setMappingFamily(true);
      
      // Update each selected voter with the familyId
      const updatePromises = selectedVoters.map(voterId =>
        voterAPI.updateVoterInfo(voterId, { familyId: familyIdInput.trim() })
      );

      await Promise.all(updatePromises);

      Alert.alert('Success', `Family ${familyIdInput} has been created with ${selectedVoters.length} members`);
      
      // Close modal and reset state
      closeMapFamilyModal();
      
      // Reload families to show the new family
      loadFamilies();
    } catch (error) {
      console.error('Failed to map family:', error);
      Alert.alert('Error', 'Failed to create family. Please try again.');
    } finally {
      setMappingFamily(false);
    }
  };

  const filteredVotersForMapping = allVoters.filter(voter =>
    voter.Name?.toLowerCase().includes(voterSearchQuery.toLowerCase()) ||
    voter['EPIC No']?.toLowerCase().includes(voterSearchQuery.toLowerCase()) ||
    voter.Door_No?.toString().includes(voterSearchQuery)
  );

  // Filter families based on search query
  let filteredFamilies = families.filter(family => {
    const headName = (family.headOfFamily || '').toLowerCase();
    const address = (family.address || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return headName.includes(query) || address.includes(query);
  });

  // Apply selected filter
  if (selectedFilter === 'survey_completed') {
    filteredFamilies = filteredFamilies.filter(family => family.surveyCompleted === true);
  } else if (selectedFilter === 'survey_pending') {
    filteredFamilies = filteredFamilies.filter(family => !family.surveyCompleted);
  }
  // 'all' filter shows everything, no additional filtering needed

  if (loading) {
    return (
      <ScreenWrapper userRole="booth_agent">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Loading families...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper userRole="booth_agent">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(boothAgent)/dashboard')}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Family Manager</Text>
          <TouchableOpacity 
            style={styles.mapFamilyButton}
            onPress={openMapFamilyModal}
          >
            <Icon name="people" size={18} color="#fff" />
            <Text style={styles.mapFamilyButtonText}>Map Family</Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by family name or head..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setFilterOpen(!filterOpen)}
          >
            <Icon name="filter-list" size={20} color="#1976D2" />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {filterOpen && (
          <View style={styles.filterDropdown}>
            <TouchableOpacity 
              style={styles.filterOption}
              onPress={() => {
                setSelectedFilter('all');
                setFilterOpen(false);
              }}
            >
              <Text style={styles.filterOptionText}>All Families</Text>
              {selectedFilter === 'all' && <Icon name="check" size={20} color="#1976D2" />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.filterOption}
              onPress={() => {
                setSelectedFilter('survey_completed');
                setFilterOpen(false);
              }}
            >
              <Text style={styles.filterOptionText}>Survey Completed</Text>
              {selectedFilter === 'survey_completed' && <Icon name="check" size={20} color="#1976D2" />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.filterOption}
              onPress={() => {
                setSelectedFilter('survey_pending');
                setFilterOpen(false);
              }}
            >
              <Text style={styles.filterOptionText}>Survey Pending</Text>
              {selectedFilter === 'survey_pending' && <Icon name="check" size={20} color="#1976D2" />}
            </TouchableOpacity>
          </View>
        )}

        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Icon name="home" size={28} color="#1976D2" />
            <Text style={styles.summaryValue}>{families.length}</Text>
            <Text style={styles.summaryLabel}>Total Families</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Icon name="people" size={28} color="#4CAF50" />
            <Text style={styles.summaryValue}>
              {families.reduce((sum, f) => sum + f.totalMembers, 0)}
            </Text>
            <Text style={styles.summaryLabel}>Total Members</Text>
          </View>
        </View>

        {/* Family List */}
        <View style={styles.listSection}>
          {filteredFamilies.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="home" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No families found</Text>
            </View>
          ) : (
            filteredFamilies.map((family) => {
              const verificationPercentage = family.totalMembers > 0 
                ? (family.verifiedMembers / family.totalMembers) * 100 
                : 0;
              const isFullyVerified = family.verifiedMembers === family.totalMembers;

              return (
                <View key={family.id} style={styles.familyCard}>
                  <View style={styles.familyCardHeader}>
                    <View style={styles.familyIcon}>
                      <Icon name="home" size={24} color="#1976D2" />
                    </View>
                    <View style={styles.familyInfo}>
                      <Text style={styles.familyName}>{family.headOfFamily} Family</Text>
                      <Text style={styles.headOfFamily}>Head: {family.headOfFamily}</Text>
                    </View>
                  <TouchableOpacity style={styles.moreButton}>
                    <Icon name="more-vert" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.familyDetails}>
                  <View style={styles.detailRow}>
                    <Icon name="location-on" size={16} color="#666" />
                    <Text style={styles.detailText}>{family.address}</Text>
                  </View>

                  {family.phone && (
                    <View style={styles.detailRow}>
                      <Icon name="phone" size={16} color="#666" />
                      <Text style={styles.detailText}>{family.phone}</Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Icon name="people" size={16} color="#666" />
                    <Text style={styles.detailText}>{family.totalMembers} Members</Text>
                  </View>
                </View>

                {/* Verification Progress */}
                <View style={styles.verificationSection}>
                  <View style={styles.verificationHeader}>
                    <Text style={styles.verificationLabel}>Verification</Text>
                    <Text style={styles.verificationValue}>
                      {family.verifiedMembers}/{family.totalMembers} ({Math.round(verificationPercentage)}%)
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { 
                          width: `${verificationPercentage}%`,
                          backgroundColor: isFullyVerified ? '#4CAF50' : '#FFA726'
                        }
                      ]} 
                    />
                  </View>
                </View>

                {/* Status Badges */}
                <View style={styles.badgeRow}>
                  <View style={[
                    styles.badge,
                    isFullyVerified ? styles.badgeSuccess : styles.badgeWarning
                  ]}>
                    <Text style={[
                      styles.badgeText,
                      isFullyVerified ? styles.badgeTextSuccess : styles.badgeTextWarning
                    ]}>
                      {isFullyVerified ? '✓ Verified' : 'Pending Verification'}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      router.push({
                        pathname: '/(boothAgent)/family-detail',
                        params: { 
                          familyId: family.id,
                          address: family.address,
                          headOfFamily: family.headOfFamily,
                          totalMembers: family.totalMembers,
                          verifiedMembers: family.verifiedMembers,
                          phone: family.phone || ''
                        }
                      });
                    }}
                  >
                    <Icon name="visibility" size={18} color="#1976D2" />
                    <Text style={styles.actionButtonText}>View Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    onPress={() => {
                      router.push('/(boothAgent)/surveys');
                    }}
                  >
                    <Icon name="assignment" size={18} color="#fff" />
                    <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
                      Start Survey
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Map Family Modal */}
      <Modal
        visible={mapFamilyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeMapFamilyModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeMapFamilyModal}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'flex-end' }}
          >
            <TouchableOpacity 
              style={styles.modalContainer}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Icon name="people" size={24} color="#1976D2" />
                  <Text style={styles.modalTitle}>Map Family - Group Voters Together</Text>
                </View>
                <TouchableOpacity 
                  onPress={closeMapFamilyModal}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Family ID Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Family ID *</Text>
                <TextInput
                  style={styles.familyIdInput}
                  placeholder="e.g., FAM001"
                  placeholderTextColor="#999"
                  value={familyIdInput}
                  onChangeText={setFamilyIdInput}
                />
              </View>

              {/* Select Voters Section */}
              <View style={styles.selectVotersSection}>
                <Text style={styles.sectionTitle}>Select Voters to Map</Text>
                
                {/* Search Bar */}
                <View style={styles.modalSearchBar}>
                  <Icon name="search" size={20} color="#999" />
                  <TextInput
                    style={styles.modalSearchInput}
                    placeholder="Search voters by name, ID, or address..."
                    placeholderTextColor="#999"
                    value={voterSearchQuery}
                    onChangeText={setVoterSearchQuery}
                  />
                </View>

                {/* Voters List */}
                <ScrollView style={styles.votersListContainer} showsVerticalScrollIndicator={false}>
                  {filteredVotersForMapping.length === 0 ? (
                    <View style={styles.emptyVotersList}>
                      <Icon name="people-outline" size={48} color="#ccc" />
                      <Text style={styles.emptyVotersText}>
                        {voterSearchQuery ? 'No voters found' : 'Loading voters...'}
                      </Text>
                    </View>
                  ) : (
                    filteredVotersForMapping.map((voter) => (
                      <TouchableOpacity
                        key={voter._id}
                        style={styles.voterItem}
                        onPress={() => toggleVoterSelection(voter._id)}
                      >
                        <View style={styles.radioButton}>
                          {selectedVoters.includes(voter._id) && (
                            <View style={styles.radioButtonInner} />
                          )}
                        </View>
                        <View style={styles.voterItemInfo}>
                          <Text style={styles.voterName}>{voter.Name}</Text>
                          <Text style={styles.voterDetails}>
                            {voter['EPIC No'] || voter.Number} • {voter.Age || voter.age}y • {voter.sex}
                          </Text>
                          <Text style={styles.voterAddress}>
                            {voter.Door_No}, {voter.Anubhag_name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeMapFamilyModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.mapFamilyActionButton,
                    (mappingFamily || selectedVoters.length < 2 || !familyIdInput.trim()) && styles.mapFamilyActionButtonDisabled
                  ]}
                  onPress={handleMapFamily}
                  disabled={mappingFamily || selectedVoters.length < 2 || !familyIdInput.trim()}
                >
                  {mappingFamily ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.mapFamilyActionButtonText}>
                      Map Family ({selectedVoters.length})
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
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
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#000',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
  filterDropdown: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  summarySection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  listSection: {
    paddingHorizontal: 20,
  },
  familyCard: {
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
  familyCardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  familyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  familyInfo: {
    flex: 1,
  },
  familyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  headOfFamily: {
    fontSize: 14,
    color: '#666',
  },
  moreButton: {
    padding: 4,
  },
  familyDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  verificationSection: {
    marginBottom: 12,
  },
  verificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  verificationLabel: {
    fontSize: 14,
    color: '#666',
  },
  verificationValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: '#E8F5E9',
  },
  badgeWarning: {
    backgroundColor: '#FFF3E0',
  },
  badgePending: {
    backgroundColor: '#E3F2FD',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextSuccess: {
    color: '#388E3C',
  },
  badgeTextWarning: {
    color: '#F57C00',
  },
  badgeTextPending: {
    color: '#1976D2',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    gap: 6,
  },
  actionButtonPrimary: {
    backgroundColor: '#1976D2',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
  actionButtonTextPrimary: {
    color: '#fff',
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
  // Map Family Button Styles
  mapFamilyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  mapFamilyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    paddingBottom: 20,
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  familyIdInput: {
    borderWidth: 1,
    borderColor: '#1976D2',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  selectVotersSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  votersListContainer: {
    flex: 1,
    marginBottom: 8,
  },
  voterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1976D2',
  },
  voterItemInfo: {
    flex: 1,
  },
  voterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  voterDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  voterAddress: {
    fontSize: 12,
    color: '#999',
  },
  emptyVotersList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyVotersText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  mapFamilyActionButton: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#1976D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapFamilyActionButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  mapFamilyActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});