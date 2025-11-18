import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRole } from '../contexts/RoleContext';
import ScreenWrapper from '../components/ScreenWrapper';
import { voterAPI } from '../../services/api/voter';
import { surveyAPI } from '../../services/api/survey';

export default function ReportsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { userData } = useRole();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVoters: 0,
    totalFamilies: 0,
    verifiedVoters: 0,
    activeSurveys: 0,
    completedSurveys: 0,
    maleVoters: 0,
    femaleVoters: 0,
    othersVoters: 0,
    age60Plus: 0,
    age80Plus: 0,
  });
  const [activityStats, setActivityStats] = useState({
    verifiedToday: 0,
    surveysThisWeek: 0,
    activeSurveys: 0
  });

  useEffect(() => {
    loadReportData();
  }, [userData]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      let boothId = userData?.booth_id || '';
      let aciId = userData?.aci_id || '';
      
      // Fallback: Load from AsyncStorage if userData not ready
      if (!boothId || !aciId) {
        const savedUserData = await AsyncStorage.getItem('userData');
        if (savedUserData) {
          const parsedData = JSON.parse(savedUserData);
          boothId = parsedData?.booth_id || '';
          aciId = parsedData?.aci_id || '';
          console.log('📦 Reports - Loaded from AsyncStorage:', { aciId, boothId });
        }
      }
      
      console.log('Reports - Loading for:', { aciId, boothId });
      
      let voters: any[] = [];
      let totalVoters = 0;
      let totalFamilies = 0;
      
      if (aciId && boothId) {
        try {
          // Convert aci_id to number (same as dashboard logic)
          const aciIdNum = Number(aciId);
          const boothIdStr = String(boothId);
          
          console.log('Reports - Fetching voters for:', { aciIdNum, boothIdStr });
          
          // First, get the total count from pagination
          const initialResponse = await voterAPI.getVotersByBoothId(String(aciIdNum), boothIdStr, { page: 1, limit: 50 });
          
          console.log('Reports - Initial response:', {
            success: initialResponse?.success,
            totalVoters: initialResponse?.pagination?.totalVoters,
            hasVoters: initialResponse?.voters?.length
          });
          
          if (initialResponse?.success && initialResponse.pagination) {
            totalVoters = initialResponse.pagination.totalVoters || initialResponse.pagination.total || 0;
            
            // Now fetch all voters with the correct limit
            const votersResponse = await voterAPI.getVotersByBoothId(String(aciIdNum), boothIdStr, { 
              page: 1, 
              limit: totalVoters || 5000 // Use total or a high number as fallback
            });
            
            console.log('Reports - Full response:', votersResponse);
            
            if (votersResponse?.success && Array.isArray(votersResponse.voters)) {
              voters = votersResponse.voters;
              
              console.log('Reports - Total voters loaded:', voters.length);
              
              // Calculate families using both familyId and address-based grouping
              const familyIds = new Set();
              const addressBasedFamilies = new Set();
              
              voters.forEach((voter: any) => {
                // Check if voter has a manually assigned familyId
                if (voter.familyId) {
                  familyIds.add(voter.familyId);
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
                  const address = `${houseNo}-${street}`.trim();
                  if (address && address !== '-') {
                    addressBasedFamilies.add(address);
                  }
                }
              });
              
              totalFamilies = familyIds.size + addressBasedFamilies.size || Math.ceil(totalVoters / 3);
              console.log('Reports - Families:', familyIds.size, 'manually mapped +', addressBasedFamilies.size, 'address-based =', totalFamilies);
            }
          }
        } catch (error) {
          console.warn('Failed to fetch voters:', error);
        }
      } else {
        console.warn('Reports - No aci_id or booth_id found in userData');
      }

      // Calculate voter categories (using the voters array we fetched)
      console.log('Reports - Calculating categories from voters array, length:', voters.length);
      const verifiedVoters = voters.filter(v => v.verified === true || v.status === 'verified').length;
      
      // Calculate activity stats based on actual verification dates
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      let verifiedToday = 0;
      
      voters.forEach((voter: any) => {
        if (voter.verified === true || voter.status === 'verified') {
          if (voter.verifiedAt) {
            const verifiedDate = new Date(voter.verifiedAt);
            if (verifiedDate >= todayStart) {
              verifiedToday++;
            }
          }
        }
      });
      
      const maleVoters = voters.filter(v => {
        const gender = (v.gender || v.Gender || v.Sex || v.sex || '').toLowerCase();
        return gender === 'male' || gender === 'm';
      }).length;
      const femaleVoters = voters.filter(v => {
        const gender = (v.gender || v.Gender || v.Sex || v.sex || '').toLowerCase();
        return gender === 'female' || gender === 'f';
      }).length;
      const othersVoters = voters.filter(v => {
        const gender = (v.gender || v.Gender || v.Sex || v.sex || '').toLowerCase();
        return gender !== 'male' && gender !== 'm' && gender !== 'female' && gender !== 'f' && gender !== '';
      }).length;
      const age60Plus = voters.filter(v => {
        const age = parseInt(v.age || v.Age || '0');
        return age >= 60 && age < 80;
      }).length;
      const age80Plus = voters.filter(v => {
        const age = parseInt(v.age || v.Age || '0');
        return age >= 80;
      }).length;

      console.log('Reports - Stats calculated:', {
        total: voters.length,
        totalVoters,
        totalFamilies,
        verified: verifiedVoters,
        male: maleVoters,
        female: femaleVoters,
        others: othersVoters,
        age60Plus,
        age80Plus
      });

      // Fetch surveys - get total survey responses across all surveys
      let activeSurveys = 0;
      let completedSurveys = 0;
      let surveysThisWeek = 0;
      
      try {
        if (aciId && boothId) {
          // Get booth survey statistics from new API
          const surveyStatsResponse = await surveyAPI.getBoothStats(String(aciId), String(boothId));
          console.log('Reports - Survey stats response:', surveyStatsResponse);
          
          if (surveyStatsResponse?.success) {
            activeSurveys = surveyStatsResponse.data?.activeSurveys || 0;
            completedSurveys = surveyStatsResponse.data?.totalResponses || 0;
            surveysThisWeek = completedSurveys; // TODO: Add date filtering to API
            
            console.log('Reports - Survey stats:', {
              activeSurveys,
              totalResponses: completedSurveys,
              surveys: surveyStatsResponse.data?.surveys
            });
          }
        }
      } catch (error) {
        console.warn('Failed to fetch surveys:', error);
      }

      // Update activity stats
      setActivityStats({
        verifiedToday: verifiedToday || 0,
        surveysThisWeek: surveysThisWeek || completedSurveys,
        activeSurveys: activeSurveys
      });

      setStats({
        totalVoters,
        totalFamilies,
        verifiedVoters,
        activeSurveys,
        completedSurveys,
        maleVoters,
        femaleVoters,
        othersVoters,
        age60Plus,
        age80Plus,
      });
    } catch (error) {
      console.error('Failed to load report data:', error);
      Alert.alert('Error', 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper userRole="booth_agent">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Loading report...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const verificationPercentage = stats.totalVoters > 0 
    ? Math.round((stats.verifiedVoters / stats.totalVoters) * 100) 
    : 0;
  
  // Calculate total survey responses needed
  const totalResponsesNeeded = stats.totalVoters * stats.activeSurveys;
  const surveyPercentage = totalResponsesNeeded > 0 
    ? Math.round((stats.completedSurveys / totalResponsesNeeded) * 100) 
    : 0;

  return (
    <ScreenWrapper userRole="booth_agent">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(boothAgent)/dashboard')}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Reports</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>Performance and progress tracking</Text>
        </View>

        {/* Overview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.miniStatCard}>
              <Icon name="people" size={32} color="#1976D2" />
              <Text style={styles.miniStatValue}>{stats.totalVoters}</Text>
              <Text style={styles.miniStatLabel}>Total Voters</Text>
            </View>

            <View style={styles.miniStatCard}>
              <Icon name="home" size={32} color="#7B1FA2" />
              <Text style={styles.miniStatValue}>{stats.totalFamilies}</Text>
              <Text style={styles.miniStatLabel}>Total Families</Text>
            </View>

            <View style={styles.miniStatCard}>
              <Icon name="check-circle" size={32} color="#388E3C" />
              <Text style={styles.miniStatValue}>{stats.verifiedVoters}</Text>
              <Text style={styles.miniStatLabel}>Verified Voters</Text>
            </View>

            <View style={styles.miniStatCard}>
              <Icon name="trending-up" size={32} color="#1976D2" />
              <Text style={styles.miniStatValue}>{stats.activeSurveys}</Text>
              <Text style={styles.miniStatLabel}>Active Survey</Text>
            </View>
          </View>
        </View>

        {/* Verification Progress */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Voter Verification Progress</Text>
            
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Verified Voters</Text>
              <Text style={styles.progressValue}>
                {stats.verifiedVoters} / {stats.totalVoters} ({verificationPercentage}%)
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[
                styles.progressBar, 
                { width: `${verificationPercentage}%`, backgroundColor: '#2196F3' }
              ]} />
            </View>

            <View style={styles.statsFooter}>
              <Text style={styles.statsSuccess}>✓ {stats.verifiedVoters} verified</Text>
              <Text style={styles.statsError}>{stats.totalVoters - stats.verifiedVoters} pending</Text>
            </View>
          </View>
        </View>

        {/* Survey Completion */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Survey Completion Progress</Text>
            
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Survey Responses</Text>
              <Text style={styles.progressValue}>
                {stats.completedSurveys} / {totalResponsesNeeded} ({surveyPercentage}%)
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[
                styles.progressBar, 
                { width: `${surveyPercentage}%`, backgroundColor: '#4CAF50' }
              ]} />
            </View>

            <View style={styles.statsFooter}>
              <Text style={styles.statsSuccess}>✓ {stats.completedSurveys} completed</Text>
              <Text style={styles.statsError}>{Math.max(0, totalResponsesNeeded - stats.completedSurveys)} pending</Text>
            </View>
            
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E0E0E0' }}>
              <Text style={[styles.statsLabel, { fontSize: 12, color: '#666' }]}>
                {stats.activeSurveys} active survey form{stats.activeSurveys !== 1 ? 's' : ''} × {stats.totalVoters} voters = {totalResponsesNeeded} total responses needed
              </Text>
            </View>
          </View>
        </View>

        {/* Voter Categories */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Voter Categories</Text>
            
            {/* Age Categories */}
            <Text style={styles.categorySubtitle}>By Age</Text>
            <View style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>Age 80+</Text>
              <Text style={styles.categoryValue}>{stats.age80Plus}</Text>
            </View>

            <View style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>Age 60+</Text>
              <Text style={styles.categoryValue}>{stats.age60Plus}</Text>
            </View>

            <View style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>Age Below 60</Text>
              <Text style={styles.categoryValue}>{stats.totalVoters - stats.age60Plus - stats.age80Plus}</Text>
            </View>

            {/* Gender Categories */}
            <Text style={[styles.categorySubtitle, { marginTop: 16 }]}>By Gender</Text>
            <View style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>Male</Text>
              <Text style={styles.categoryValue}>{stats.maleVoters}</Text>
            </View>

            <View style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>Female</Text>
              <Text style={styles.categoryValue}>{stats.femaleVoters}</Text>
            </View>

            <View style={[styles.categoryRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.categoryLabel}>Others</Text>
              <Text style={styles.categoryValue}>{stats.othersVoters}</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recent Activity</Text>
            
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#4CAF50' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>
                  {activityStats.verifiedToday} voter{activityStats.verifiedToday !== 1 ? 's' : ''} verified
                </Text>
                <Text style={styles.activityTime}>Today</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#4CAF50' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>
                  {activityStats.surveysThisWeek} survey{activityStats.surveysThisWeek !== 1 ? 's' : ''} completed
                </Text>
                <Text style={styles.activityTime}>This week</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#2196F3' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>
                  {activityStats.activeSurveys} active survey{activityStats.activeSurveys !== 1 ? 's' : ''}
                </Text>
                <Text style={styles.activityTime}>Ongoing</Text>
              </View>
            </View>
          </View>
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
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
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
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  miniStatCard: {
    width: '48%',
    margin: '1%',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 130,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  miniStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
  },
  miniStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
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
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  statsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsSuccess: {
    fontSize: 14,
    color: '#4CAF50',
  },
  statsError: {
    fontSize: 14,
    color: '#F44336',
  },
  statsLabel: {
    fontSize: 13,
    color: '#666',
  },
  categorySubtitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryLabel: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  categoryValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
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
});