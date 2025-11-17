import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRole } from '../contexts/RoleContext';
import ScreenWrapper from '../components/ScreenWrapper';
import { voterAPI } from '../../services/api/voter';

// Cache for voter data to avoid re-fetching
let voterDataCache: any[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface FamilyMember {
  _id?: string;
  name?: {
    english?: string;
    tamil?: string;
  };
  Name?: string;
  age?: number;
  Age?: number;
  gender?: string;
  sex?: string;
  Sex?: string;
  Gender?: string;
  voterID?: string;
  'EPIC No'?: string;
  Number?: string;
  mobile?: string;
  'Mobile No'?: string;
  Mobile?: string;
  verified?: boolean;
  Verified?: boolean;
  status?: string;
  Relation?: string;
  'Father Name'?: string;
}

export default function FamilyDetailScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { userData } = useRole();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  
  // Extract family info from params
  const familyInfo = {
    id: params.familyId as string,
    address: params.address as string,
    headOfFamily: params.headOfFamily as string,
    totalMembers: parseInt(params.totalMembers as string) || 0,
    verifiedMembers: parseInt(params.verifiedMembers as string) || 0,
    phone: params.phone as string || '',
  };

  useEffect(() => {
    loadFamilyMembers();
  }, [params.address]);

  const loadFamilyMembers = async () => {
    try {
      setLoading(true);
      const boothId = userData?.booth_id || '';
      const aciId = userData?.aci_id || '';
      
      if (boothId && aciId && params.address) {
        let allVoters = [];
        const now = Date.now();
        
        // Check if cache is valid
        if (voterDataCache.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
          console.log('Using cached voter data');
          allVoters = voterDataCache;
        } else {
          console.log('Fetching fresh voter data');
          const aciIdStr = String(aciId);
          const boothIdStr = String(boothId);
          // Fetch all voters for this booth
          const initialResponse = await voterAPI.getVotersByBoothId(aciIdStr, boothIdStr, { page: 1, limit: 50 });
          
          if (initialResponse?.success) {
            const totalVoters = initialResponse.pagination?.total || initialResponse.pagination?.totalVoters || 0;
            
            const response = await voterAPI.getVotersByBoothId(aciIdStr, boothIdStr, { 
              page: 1, 
              limit: totalVoters || 5000 
            });
            
            if (response?.success && Array.isArray(response.voters)) {
              allVoters = response.voters;
              // Update cache
              voterDataCache = allVoters;
              cacheTimestamp = now;
            }
          }
        }
        
        // Filter members for this specific address
        const familyMembers = allVoters.filter((voter: any) => {
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
          const voterAddress = `${houseNo}-${street}`.trim();
          return voterAddress === params.address;
        });

        // Sort by age (oldest first)
        const sortedMembers = familyMembers.sort((a: any, b: any) => {
          const ageA = parseInt(a.Age || a.age) || 0;
          const ageB = parseInt(b.Age || b.age) || 0;
          return ageB - ageA;
        });

        setMembers(sortedMembers);
      }
    } catch (error) {
      console.error('Failed to load family members:', error);
      Alert.alert('Error', 'Failed to load family members');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper userRole="booth_agent">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Loading family details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (members.length === 0) {
    return (
      <ScreenWrapper userRole="booth_agent">
        <View style={styles.loadingContainer}>
          <Icon name="error-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No family members found</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const verificationPercentage = familyInfo.totalMembers > 0 
    ? Math.round((familyInfo.verifiedMembers / familyInfo.totalMembers) * 100) 
    : 0;

  const isFullyVerified = familyInfo.verifiedMembers === familyInfo.totalMembers;

  return (
    <ScreenWrapper userRole="booth_agent">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.push('/(boothAgent)/families')}
          >
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Family Details</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Family Overview Card */}
        <View style={styles.section}>
          <View style={styles.overviewCard}>
            <View style={styles.familyIconLarge}>
              <Icon name="home" size={40} color="#1976D2" />
            </View>
            
            <Text style={styles.familyNameLarge}>
              {familyInfo.headOfFamily} Family
            </Text>
            
            <View style={styles.addressRow}>
              <Icon name="location-on" size={18} color="#666" />
              <Text style={styles.addressText}>{familyInfo.address}</Text>
            </View>

            {familyInfo.phone && (
              <View style={styles.addressRow}>
                <Icon name="phone" size={18} color="#666" />
                <Text style={styles.addressText}>{familyInfo.phone}</Text>
              </View>
            )}

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{familyInfo.totalMembers}</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{familyInfo.verifiedMembers}</Text>
                <Text style={styles.statLabel}>Verified</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{verificationPercentage}%</Text>
                <Text style={styles.statLabel}>Complete</Text>
              </View>
            </View>

            {/* Verification Progress */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Verification Progress</Text>
                <Text style={styles.progressValue}>
                  {familyInfo.verifiedMembers}/{familyInfo.totalMembers}
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

            {/* Status Badge */}
            <View style={[
              styles.statusBadge,
              isFullyVerified ? styles.statusBadgeSuccess : styles.statusBadgeWarning
            ]}>
              <Icon 
                name={isFullyVerified ? 'check-circle' : 'schedule'} 
                size={16} 
                color={isFullyVerified ? '#388E3C' : '#F57C00'} 
              />
              <Text style={[
                styles.statusBadgeText,
                isFullyVerified ? styles.statusBadgeTextSuccess : styles.statusBadgeTextWarning
              ]}>
                {isFullyVerified ? 'Fully Verified' : 'Verification Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Family Members List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Family Members ({members.length})</Text>
            <Text style={styles.sectionSubtitle}>Complete list of all family members</Text>
          </View>

          {members.map((member: FamilyMember, index: number) => {
            const memberName = member.name?.english || member.Name || 'Unknown';
            const age = member.age || member.Age || 0;
            const gender = member.gender || member.sex || member.Sex || member.Gender || 'N/A';
            const voterId = member.voterID || member['EPIC No'] || member.Number || 'N/A';
            const phone = member.mobile || member['Mobile No'] || member.Mobile || '';
            const isVerified = member.verified === true || member.status === 'verified';
            const relation = member.Relation || '';
            const fatherName = member['Father Name'] || '';

            return (
              <TouchableOpacity 
                key={index} 
                style={styles.memberCard}
                onPress={() => {
                  const voterIdParam = member._id ? `_id:${member._id}` : voterId;
                  router.push({
                    pathname: '/(boothAgent)/voter-detail',
                    params: { voterId: voterIdParam }
                  });
                }}
              >
                {/* Member Header */}
                <View style={styles.memberHeader}>
                  <View style={styles.memberIconContainer}>
                    <Icon 
                      name={gender.toLowerCase() === 'male' || gender.toLowerCase() === 'm' ? 'person' : 'person-outline'} 
                      size={28} 
                      color={isVerified ? '#4CAF50' : '#999'}
                    />
                  </View>
                  
                  <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                      <Text style={styles.memberName}>{memberName}</Text>
                      {index === 0 && (
                        <View style={styles.headBadge}>
                          <Text style={styles.headBadgeText}>Head</Text>
                        </View>
                      )}
                    </View>
                    
                    {relation && (
                      <Text style={styles.memberRelation}>{relation}</Text>
                    )}
                  </View>

                  {isVerified && (
                    <View style={styles.verifiedIcon}>
                      <Icon name="check-circle" size={24} color="#4CAF50" />
                    </View>
                  )}
                </View>

                {/* Member Details */}
                <View style={styles.memberDetails}>
                  <View style={styles.detailRow}>
                    <Icon name="badge" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Voter ID:</Text>
                    <Text style={styles.detailValue}>{voterId}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Icon name="cake" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Age:</Text>
                    <Text style={styles.detailValue}>{age} years</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Icon name={gender.toLowerCase() === 'male' || gender.toLowerCase() === 'm' ? 'male' : 'female'} size={16} color="#666" />
                    <Text style={styles.detailLabel}>Gender:</Text>
                    <Text style={styles.detailValue}>{gender}</Text>
                  </View>

                  {fatherName && (
                    <View style={styles.detailRow}>
                      <Icon name="person" size={16} color="#666" />
                      <Text style={styles.detailLabel}>Father:</Text>
                      <Text style={styles.detailValue}>{fatherName}</Text>
                    </View>
                  )}

                  {phone && (
                    <View style={styles.detailRow}>
                      <Icon name="phone" size={16} color="#666" />
                      <Text style={styles.detailLabel}>Phone:</Text>
                      <Text style={styles.detailValue}>{phone}</Text>
                    </View>
                  )}
                </View>

                {/* Status Footer */}
                <View style={styles.memberFooter}>
                  <View style={[
                    styles.statusTag,
                    isVerified ? styles.statusTagVerified : styles.statusTagPending
                  ]}>
                    <Text style={[
                      styles.statusTagText,
                      isVerified ? styles.statusTagTextVerified : styles.statusTagTextPending
                    ]}>
                      {isVerified ? '✓ Verified' : 'Pending Verification'}
                    </Text>
                  </View>
                  
                  <View style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View Details</Text>
                    <Icon name="chevron-right" size={16} color="#1976D2" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButtonPrimary}>
            <Icon name="assignment" size={20} color="#fff" />
            <Text style={styles.actionButtonPrimaryText}>Start Family Survey</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButtonSecondary}>
            <Icon name="edit" size={20} color="#1976D2" />
            <Text style={styles.actionButtonSecondaryText}>Edit Family Details</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
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
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  familyIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  familyNameLarge: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  progressSection: {
    width: '100%',
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    gap: 6,
  },
  statusBadgeSuccess: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeWarning: {
    backgroundColor: '#FFF3E0',
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadgeTextSuccess: {
    color: '#388E3C',
  },
  statusBadgeTextWarning: {
    color: '#F57C00',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  memberHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  memberIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  headBadge: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  headBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  memberRelation: {
    fontSize: 13,
    color: '#666',
  },
  verifiedIcon: {
    marginLeft: 8,
  },
  memberDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    minWidth: 70,
  },
  detailValue: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
    flex: 1,
  },
  memberFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusTagVerified: {
    backgroundColor: '#E8F5E9',
  },
  statusTagPending: {
    backgroundColor: '#FFF3E0',
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTagTextVerified: {
    color: '#388E3C',
  },
  statusTagTextPending: {
    color: '#F57C00',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '600',
  },
  actionButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1976D2',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
    gap: 8,
  },
  actionButtonPrimaryText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#1976D2',
    gap: 8,
  },
  actionButtonSecondaryText: {
    fontSize: 16,
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
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
});
