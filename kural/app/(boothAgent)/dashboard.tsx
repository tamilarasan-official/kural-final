import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRole } from '../contexts/RoleContext';
import ScreenWrapper from '../components/ScreenWrapper';
import { voterAPI } from '../../services/api/voter';
import { surveyAPI } from '../../services/api/survey';

export default function BoothAgentDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const { userData } = useRole();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVoters: 0,
    totalFamilies: 0,
    surveysCompleted: 0,
    visitsPending: 0,
    verifiedVoters: 0
  });

  useEffect(() => {
    loadBoothStats();
  }, [userData]);

  const loadBoothStats = async () => {
    try {
      setLoading(true);
      
      // Get booth allocation from user data
      const boothNumber = userData?.boothAllocation || userData?.activeElection || '';
      
      let totalVoters = 0;
      let totalFamilies = 0;
      let verifiedVoters = 0;
      
      if (boothNumber) {
        try {
          // First get the total count
          const initialResponse = await voterAPI.getVotersByPart(boothNumber, { page: 1, limit: 50 });
          console.log('Initial Voters API Response:', initialResponse);
          
          if (initialResponse?.success) {
            // Use pagination.total for accurate total count
            totalVoters = initialResponse.pagination?.total || 0;
            
            // Now fetch all voters to calculate families accurately
            const allVotersResponse = await voterAPI.getVotersByPart(boothNumber, { 
              page: 1, 
              limit: totalVoters || 5000 
            });
            
            if (allVotersResponse?.success) {
              const votersData = allVotersResponse.data || allVotersResponse.voters || [];
              
              // Calculate verified voters count
              verifiedVoters = votersData.filter((voter: any) => 
                voter.verified === true || voter.status === 'verified'
              ).length;
              
              // Calculate unique families based on:
              // 1. Manually mapped families (familyId field)
              // 2. Address-based grouping
              const familyIds = new Set();
              const addressBasedFamilies = new Set();
              
              votersData.forEach((voter: any) => {
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
              
              // Total families = manually mapped families + address-based families
              totalFamilies = familyIds.size + addressBasedFamilies.size || Math.ceil(totalVoters / 3);
            } else {
              // Fallback if we can't get all voters
              totalFamilies = Math.ceil(totalVoters / 3);
            }
          }
        } catch (voterError) {
          console.warn('Failed to fetch voters:', voterError);
          // Fallback to stats endpoint
          try {
            const statsResponse = await voterAPI.getVoterStats(boothNumber);
            if (statsResponse?.success) {
              totalVoters = statsResponse.data?.total || 0;
              totalFamilies = Math.ceil(totalVoters / 3);
            }
          } catch (statsError) {
            console.warn('Failed to fetch voter stats:', statsError);
          }
        }
      }

      // Fetch surveys - count total responses submitted across all survey forms
      let surveysCompleted = 0;
      try {
        const surveysResponse = await surveyAPI.getAll({ limit: 100 });
        if (surveysResponse?.success && Array.isArray(surveysResponse.data)) {
          console.log('Dashboard - Survey forms:', surveysResponse.data.map((s: any) => ({
            formId: s.formId,
            title: s.title,
            responseCount: s.responseCount
          })));
          
          // Sum up all responseCount from all surveys
          surveysCompleted = surveysResponse.data.reduce((total: number, survey: any) => {
            const count = survey.responseCount || 0;
            console.log(`Survey ${survey.formId}: responseCount = ${count}`);
            return total + count;
          }, 0);
          
          console.log('Dashboard - Total surveysCompleted:', surveysCompleted);
        }
      } catch (surveyError) {
        console.warn('Failed to fetch surveys:', surveyError);
      }

      // Calculate visits pending
      const visitsPending = Math.max(0, totalFamilies - surveysCompleted);

      setStats({
        totalVoters,
        totalFamilies,
        surveysCompleted,
        visitsPending,
        verifiedVoters
      });
      
    } catch (error) {
      console.error('Error loading booth stats:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper userRole="booth_agent">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => router.push('/(drawer)/drawerscreen')}
            >
              <Icon name="menu" size={24} color="#000" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>
                Booth 119-001
              </Text>
              <Text style={styles.headerSubtitle}>
                119-Thondamuthur
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push('/(tabs)/dashboard/notifications')}
          >
            <Icon name="notifications" size={24} color="#000" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Booth Overview Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booth Overview</Text>
          
          <View style={styles.statsGrid}>
            {/* Total Voters */}
            <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
              <Icon name="people" size={32} color="#1976D2" />
              <Text style={styles.statLabel}>Total Voters</Text>
              <Text style={styles.statValue}>{stats.totalVoters}</Text>
            </View>

            {/* Total Families */}
            <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
              <Icon name="home" size={32} color="#7B1FA2" />
              <Text style={styles.statLabel}>Total Families</Text>
              <Text style={styles.statValue}>{stats.totalFamilies}</Text>
            </View>

            {/* Surveys Completed */}
            <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
              <Icon name="assignment-turned-in" size={32} color="#388E3C" />
              <Text style={styles.statLabel}>Surveys Completed</Text>
              <Text style={styles.statValue}>{stats.surveysCompleted}</Text>
            </View>

            {/* Visits Pending */}
            <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
              <Icon name="trending-up" size={32} color="#D32F2F" />
              <Text style={styles.statLabel}>Visits Pending</Text>
              <Text style={styles.statValue}>{stats.visitsPending}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            {/* Voter Manager */}
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(boothAgent)/voters')}
            >
              <Icon name="people" size={40} color="#1976D2" />
              <Text style={styles.actionTitle}>Voter Manager</Text>
              <Text style={styles.actionSubtitle}>View & update voters</Text>
            </TouchableOpacity>

            {/* Family Manager */}
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(boothAgent)/families')}
            >
              <Icon name="home" size={40} color="#F57C00" />
              <Text style={styles.actionTitle}>Family Manager</Text>
              <Text style={styles.actionSubtitle}>Manage families</Text>
            </TouchableOpacity>

            {/* Survey Manager */}
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(boothAgent)/surveys')}
            >
              <Icon name="assignment" size={40} color="#388E3C" />
              <Text style={styles.actionTitle}>Survey Manager</Text>
              <Text style={styles.actionSubtitle}>Complete surveys</Text>
            </TouchableOpacity>

            {/* Reports */}
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(boothAgent)/reports')}
            >
              <Icon name="bar-chart" size={40} color="#7B1FA2" />
              <Text style={styles.actionTitle}>Reports</Text>
              <Text style={styles.actionSubtitle}>View progress</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{stats.verifiedVoters} voters verified</Text>
                <Text style={styles.activityTime}>Today</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{stats.surveysCompleted} surveys completed</Text>
                <Text style={styles.activityTime}>This week</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{stats.visitsPending} visits pending</Text>
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
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EBF0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statCard: {
    width: '47%',
    margin: '1.5%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  actionCard: {
    width: '47%',
    margin: '1.5%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 12,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1976D2',
    marginTop: 5,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 4,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});