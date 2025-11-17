import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRole } from '../contexts/RoleContext';
import ScreenWrapper from '../components/ScreenWrapper';
import { voterAPI } from '../../services/api/voter';
import { surveyAPI } from '../../services/api/survey';
import * as Location from 'expo-location';
import { activityAPI } from '../../services/api/activity';

export default function BoothAgentDashboard() {
  const router = useRouter();
  const { userData, setUserData } = useRole();
  const [stats, setStats] = useState({
    totalVoters: 0,
    totalFamilies: 0,
    surveysCompleted: 0,
    visitsPending: 0,
    verifiedVoters: 0
  });
  const [headerData, setHeaderData] = useState<{booth_id?: string, aci_id?: number, aci_name?: string}>({});

  // Force refresh userData from AsyncStorage on mount to ensure latest data
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        const savedUserData = await AsyncStorage.getItem('userData');
        if (savedUserData) {
          const parsedData = JSON.parse(savedUserData);
          console.log('🔄 DASHBOARD - Force refreshing userData from AsyncStorage:', parsedData);
          await setUserData(parsedData);
        }
      } catch (error) {
        console.error('Failed to refresh userData:', error);
      }
    };
    refreshUserData();
  }, []);

  const loadBoothStats = useCallback(async () => {
    try {
      console.log('📊 DASHBOARD - loadBoothStats called');
      console.log('📊 DASHBOARD - userData from context:', JSON.stringify(userData, null, 2));
      
      // Wait a moment for userData to load if it's not available yet
      let booth_id = userData?.booth_id || '';
      let aci_id = userData?.aci_id || '';
      
      if (!booth_id || !aci_id) {
        console.log('⚠️ DASHBOARD - booth_id or aci_id missing from context, checking AsyncStorage...');
        // Try to load from AsyncStorage directly as fallback
        const savedUserData = await AsyncStorage.getItem('userData');
        console.log('📦 DASHBOARD - Raw AsyncStorage userData:', savedUserData);
        
        if (savedUserData) {
          const parsedData = JSON.parse(savedUserData);
          console.log('📦 DASHBOARD - Parsed AsyncStorage userData:', JSON.stringify(parsedData, null, 2));
          
          booth_id = parsedData?.booth_id || '';
          aci_id = parsedData?.aci_id || '';
          console.log('📦 DASHBOARD - Loaded from AsyncStorage:', { aci_id, booth_id });
        }
      }
      
      console.log('🔍 DASHBOARD - Final values for loading stats:', { aci_id, booth_id });
      console.log('🔍 DASHBOARD - Full userData:', JSON.stringify(userData, null, 2));
      
      let totalVoters = 0;
      let totalFamilies = 0;
      let verifiedVoters = 0;
      let votersData: any[] = []; // Declare at higher scope for use in survey section
      
      if (aci_id && booth_id) {
        try {
          // Convert aci_id to number if it's stored as number in DB
          const aciIdNum = Number(aci_id);
          const boothIdStr = String(booth_id);

          console.log('🔍 Dashboard - Calling API with:', { aciIdNum, boothIdStr });

          // First get the total count using aci_id and booth_id
          const initialResponse = await voterAPI.getVotersByBoothId(String(aciIdNum), boothIdStr, { page: 1, limit: 50 });
          console.log('📊 Dashboard - Initial Voters API Response:', JSON.stringify(initialResponse, null, 2));
          
          if (initialResponse?.success) {
            // Use pagination.totalVoters for accurate total count
            totalVoters = initialResponse.pagination?.totalVoters || 0;
            
            // Now fetch all voters to calculate families accurately
            const allVotersResponse = await voterAPI.getVotersByBoothId(String(aciIdNum), boothIdStr, { 
              page: 1, 
              limit: totalVoters || 5000 
            });
            
            if (allVotersResponse?.success) {
              votersData = allVotersResponse.voters || [];
              console.log('✅ Dashboard - Voters loaded:', votersData.length, 'voters');
              console.log('📊 Dashboard - Sample voter surveyed field:', votersData.slice(0, 3).map((v: any) => ({
                name: v.name?.english || v.Name,
                surveyed: v.surveyed
              })));
              
              // Calculate verified voters count (same as reports screen)
              verifiedVoters = votersData.filter((voter: any) => 
                voter.verified === true || voter.status === 'verified'
              ).length;
              
              // Calculate families using EXACT same logic as reports screen
              // Use both familyId and address-based grouping
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
              
              totalFamilies = familyIds.size + addressBasedFamilies.size || Math.ceil(totalVoters / 3);
              console.log('Dashboard - Families:', familyIds.size, 'manually mapped +', addressBasedFamilies.size, 'address-based =', totalFamilies);
            } else {
              // Fallback if we can't get all voters
              totalFamilies = Math.ceil(totalVoters / 3);
            }
          }
        } catch (voterError) {
          console.warn('Failed to fetch voters:', voterError);
          // Fallback: estimate families
          totalFamilies = Math.ceil(totalVoters / 3);
        }
      } else {
        console.warn('⚠️ Dashboard - No aci_id or booth_id found in userData!');
        console.warn('⚠️ Dashboard - userData:', userData);
      }

      // Fetch surveys - count surveyed voters from voters collection
      let surveysCompleted = 0;
      let activeSurveyFormsCount = 0;
      
      console.log('🔍 Dashboard - Before survey section, votersData:', {
        isArray: Array.isArray(votersData),
        length: votersData?.length,
        hasSurveyedField: votersData?.[0]?.hasOwnProperty('surveyed')
      });
      
      try {
        // Get surveys assigned to this ACI
        const surveysResponse = await surveyAPI.getAll({ limit: 100, aci_id: String(aci_id) });
        if (surveysResponse?.success && Array.isArray(surveysResponse.data)) {
          console.log('Dashboard - All survey forms:', surveysResponse.data.map((s: any) => ({
            _id: s._id,
            title: s.title,
            responseCount: s.responseCount,
            assignedACs: s.assignedACs,
            status: s.status
          })));
          
          // Count only active survey forms assigned to this ACI
          const activeSurveys = surveysResponse.data.filter((s: any) => {
            const status = (s.status || '').toLowerCase();
            return status === 'active';
          });
          activeSurveyFormsCount = activeSurveys.length;
          
          console.log('Dashboard - Active survey forms:', activeSurveyFormsCount);
          
          // Count surveyed voters from the voters we already fetched
          console.log('Dashboard - votersData available:', Array.isArray(votersData), 'length:', votersData?.length);
          if (Array.isArray(votersData) && votersData.length > 0) {
            surveysCompleted = votersData.filter((v: any) => v.surveyed === true).length;
            console.log('Dashboard - Surveyed voters found:', surveysCompleted);
          } else {
            console.warn('Dashboard - votersData not available for counting surveyed');
          }
          
          console.log('Dashboard - Total surveyed voters:', surveysCompleted);
        }
      } catch (surveyError) {
        console.warn('Failed to fetch surveys:', surveyError);
      }

      // Calculate visits pending using Option 2 logic:
      // Total survey responses needed = (Total voters × Number of active survey forms) - Completed responses
      const totalResponsesNeeded = totalVoters * activeSurveyFormsCount;
      const visitsPending = Math.max(0, totalResponsesNeeded - surveysCompleted);
      
      console.log('Dashboard - Calculation:');
      console.log('  Total voters:', totalVoters);
      console.log('  Active survey forms:', activeSurveyFormsCount);
      console.log('  Total responses needed:', totalResponsesNeeded);
      console.log('  Surveys completed:', surveysCompleted);
      console.log('  Visits pending:', visitsPending);

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
    }
  }, []); // Empty deps - fetch userData from AsyncStorage inside the function

  // Debug: Log userData when it changes
  useEffect(() => {
    console.log('📋 Dashboard - userData updated:', {
      aci_id: userData?.aci_id,
      aci_name: userData?.aci_name,
      booth_id: userData?.booth_id,
      full: JSON.stringify(userData, null, 2)
    });
    
    // Update header data from userData or AsyncStorage
    const updateHeaderData = async () => {
      console.log('📊 Dashboard - updateHeaderData called');
      console.log('📊 Dashboard - userData from context:', JSON.stringify(userData, null, 2));
      
      if (userData?.booth_id && userData?.aci_id) {
        console.log('📊 Dashboard - Using userData from context');
        setHeaderData({
          booth_id: userData.booth_id,
          aci_id: userData.aci_id,
          aci_name: userData.aci_name
        });
      } else {
        console.log('📊 Dashboard - Loading from AsyncStorage...');
        // Fallback: Load from AsyncStorage if userData not ready
        const savedUserData = await AsyncStorage.getItem('userData');
        console.log('📊 Dashboard - Raw AsyncStorage data:', savedUserData);
        
        if (savedUserData) {
          const parsed = JSON.parse(savedUserData);
          console.log('📊 Dashboard - Parsed AsyncStorage data:', JSON.stringify(parsed, null, 2));
          console.log('📊 Dashboard - booth_id from AsyncStorage:', parsed.booth_id);
          console.log('📊 Dashboard - aci_id from AsyncStorage:', parsed.aci_id);
          
          setHeaderData({
            booth_id: parsed.booth_id,
            aci_id: parsed.aci_id,
            // Handle typo in saved data: check both aci_name and aci_namee
            aci_name: parsed.aci_name || (parsed as any).aci_namee
          });
        }
      }
    };
    
    updateHeaderData();
  }, [userData]);

  useEffect(() => {
    const initializeDashboard = async () => {
      // Add a small delay to ensure AsyncStorage is loaded
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Load booth stats first - this should work even if userData isn't fully loaded yet
      await loadBoothStats();
      
      // Load userData from AsyncStorage if not available from context
      let currentUserData = userData;
      if (!currentUserData?._id) {
        const savedUserData = await AsyncStorage.getItem('userData');
        if (savedUserData) {
          currentUserData = JSON.parse(savedUserData);
        }
      }
      
      if (currentUserData?._id && currentUserData.aci_id && currentUserData.booth_id) {
        // Start activity tracking
        try {
          await activityAPI.login(currentUserData._id, String(currentUserData.aci_id), currentUserData.booth_id);
        } catch (error: any) {
          console.error('Failed to record login activity:', error);
        }

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location permission is required to track your activity.');
        } else {
          const locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 60000, // 1 minute
              distanceInterval: 10, // 10 meters
            },
            (location) => {
              const { latitude, longitude } = location.coords;
              activityAPI.updateLocation(currentUserData._id, { latitude, longitude })
                .catch((error: any) => console.error('Failed to update location:', error));
            }
          );

          // Cleanup on component unmount
          return () => {
            locationSubscription.remove();
            activityAPI.logout(currentUserData._id)
              .catch((error: any) => console.error('Failed to record logout activity:', error));
          };
        }
      }
    };

    initializeDashboard();
  }, []); // Run once on mount
  
  // Reload stats when booth or assembly changes (e.g., when switching booths)
  useEffect(() => {
    if (userData?.aci_id && userData?.booth_id) {
      console.log('🔄 Dashboard - userData changed, reloading stats...');
      loadBoothStats();
    }
  }, [userData?.aci_id, userData?.booth_id, loadBoothStats]);

  return (
    <ScreenWrapper userRole="booth_agent">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => router.push('/(boothAgent)/drawer/drawerscreen')}
            >
              <Icon name="menu" size={24} color="#000" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>
                {headerData?.booth_id || userData?.booth_id || 'Loading...'}
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1} ellipsizeMode="tail">
                {(() => {
                  const aciId = headerData?.aci_id || userData?.aci_id;
                  const aciName = headerData?.aci_name || userData?.aci_name;
                  const displayText = (() => {
                    if (!aciId) return 'Loading...';
                    if (aciName && aciName.trim()) return `${aciId} - ${aciName}`;
                    return String(aciId);
                  })();
                  console.log('🏷️ Header rendering:', { 
                    aciId, 
                    aciName, 
                    displayText,
                    headerData, 
                    userData: userData?.aci_name 
                  });
                  return displayText;
                })()}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push('/(boothAgent)/notifications')}
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
    fontSize: 8,
    color: '#6B7280',
    marginTop: 2,
    flexShrink: 1,
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