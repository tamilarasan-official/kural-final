import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRole } from '../contexts/RoleContext';
import ScreenWrapper from '../components/ScreenWrapper';
import { surveyAPI } from '../../services/api/survey';
import { voterAPI } from '../../services/api/voter';

export default function SurveysScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { userData } = useRole();
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [totalVoters, setTotalVoters] = useState(0);
  const [surveyedVotersCount, setSurveyedVotersCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadSurveys();
    }, [userData])
  );

  const loadSurveys = async () => {
    try {
      setLoading(true);
      
      // Fetch total voters count for the booth
      console.log('Surveys - Full userData:', JSON.stringify(userData, null, 2));
      let booth_id = userData?.booth_id || '';
      let aci_id = userData?.aci_id || '';
      
      // Fallback: Load from AsyncStorage if userData not available
      if (!booth_id || !aci_id) {
        const savedUserData = await AsyncStorage.getItem('userData');
        if (savedUserData) {
          const parsed = JSON.parse(savedUserData);
          booth_id = parsed.booth_id || '';
          aci_id = parsed.aci_id || '';
        }
      }
      
      console.log('Surveys - Loading for:', { aci_id, booth_id });
      
      if (!booth_id || !aci_id) {
        console.error('❌ Surveys - No aci_id or booth_id found! userData keys:', Object.keys(userData || {}));
        Alert.alert('Error', 'No booth or assembly assigned to your account. Please contact admin.');
        setLoading(false);
        return;
      }
      
      if (aci_id && booth_id) {
        try {
          const aciIdStr = String(aci_id);
          const boothIdStr = String(booth_id);
          
          // First get total count
          const votersResponse = await voterAPI.getVotersByBoothId(aciIdStr, boothIdStr, { page: 1, limit: 1 });
          console.log('Surveys - Voters response:', votersResponse);
          
          if (votersResponse?.success && votersResponse.pagination) {
            const total = votersResponse.pagination.totalVoters || votersResponse.pagination.total || 0;
            setTotalVoters(total);
            console.log('Surveys - Total voters in booth:', total);
            
            // Fetch all voters to count surveyed ones for this booth
            const allVotersResponse = await voterAPI.getVotersByBoothId(aciIdStr, boothIdStr, { 
              page: 1, 
              limit: total || 5000 
            });
            
            if (allVotersResponse?.success && Array.isArray(allVotersResponse.voters)) {
              const surveyedCount = allVotersResponse.voters.filter((v: any) => v.surveyed === true).length;
              setSurveyedVotersCount(surveyedCount);
              console.log('Surveys - Surveyed voters in booth:', surveyedCount, 'out of', total);
            }
          }
        } catch (error) {
          console.warn('Failed to fetch voter count:', error);
        }
      }
      
      // Fetch surveys filtered by aci_id
      console.log('Surveys - Fetching surveys for aci_id:', aci_id);
      const response = await surveyAPI.getAll({ limit: 100, aci_id: String(aci_id) });
      console.log('Surveys - API response:', response);
      
      if (response?.success && Array.isArray(response.data)) {
        console.log('Surveys - Found surveys:', response.data.length);
        console.log('Surveys - All surveys:', response.data.map((s: any) => ({
          _id: s._id,
          title: s.title,
          titleEnglish: s.title?.english,
          titleTamil: s.title?.tamil,
          status: s.status,
          responseCount: s.responseCount,
          assignedACs: s.assignedACs,
          formId: s.formId
        })));
        
        // Filter only Active surveys
        const activeSurveys = response.data.filter((s: any) => s.status === 'Active');
        
        console.log(`\n✅ Active surveys for ACI ${aci_id}: ${activeSurveys.length} of ${response.data.length} total surveys\n`);
        setSurveys(activeSurveys);
      } else {
        console.log('Surveys - No surveys found');
        setSurveys([]);
      }
    } catch (error) {
      console.error('Failed to load surveys:', error);
      Alert.alert('Error', 'Failed to load surveys. Please try again.');
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (progress: number, total: number) => {
    if (!total || total === 0) return 0;
    return Math.round((progress / total) * 100);
  };

  if (loading) {
    return (
      <ScreenWrapper userRole="booth_agent">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Loading surveys...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper userRole="booth_agent">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(boothAgent)/dashboard')}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Survey Manager</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>Assigned surveys and progress</Text>
        </View>

        {/* Surveys List */}
        <ScrollView style={styles.surveysList} showsVerticalScrollIndicator={false}>
          {surveys.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="assignment" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No surveys assigned</Text>
            </View>
          ) : (
            surveys.map((survey) => {
              // Use survey-specific response count from backend (already provided in survey.responseCount)
              // Each survey tracks its own completion via SurveyResponse collection
              const progress = survey.responseCount || 0;
              // Use actual booth voters count instead of hardcoded value
              const total = totalVoters || survey.targetCount || survey.total || 0;
              const percentage = getProgressPercentage(progress, total);
              const isCompleted = survey.status === 'completed' || survey.status === 'closed';
              const isActive = survey.status === 'Active' || survey.status === 'active' || survey.status === 'ongoing';
              
              // Handle title - can be Object with english/tamil or String
              let surveyTitle = 'Unnamed Survey';
              let surveyTitleTamil = '';
              
              if (survey.title) {
                if (typeof survey.title === 'object' && survey.title !== null) {
                  // Title is an object with english and tamil properties
                  surveyTitle = survey.title.english || survey.title.tamil || 'Unnamed Survey';
                  surveyTitleTamil = survey.title.tamil || '';
                } else {
                  // Title is a string
                  surveyTitle = survey.title || survey.name || 'Unnamed Survey';
                }
              } else if (survey.tamilTitle) {
                surveyTitle = survey.tamilTitle;
              }
              
              const surveyDescription = survey.description || 'No description available';
              const questionsCount = survey.questionA?.length || survey.questions?.length || survey.questionsCount || 0;

              return (
                <View key={survey._id || survey.id} style={styles.surveyCard}>
                  <View style={styles.surveyHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.surveyTitle}>{surveyTitle}</Text>
                      {surveyTitleTamil ? (
                        <Text style={[styles.surveyTitle, { fontSize: 14, color: '#666', marginTop: 2 }]}>
                          {surveyTitleTamil}
                        </Text>
                      ) : null}
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: isCompleted ? '#4CAF50' : isActive ? '#2196F3' : '#FF9800' }
                    ]}>
                      <Text style={styles.statusText}>
                        {isCompleted ? 'Completed' : isActive ? 'Active' : survey.status || 'Pending'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.surveyDescription}>
                    {surveyDescription}
                  </Text>

                  <View style={styles.surveyMeta}>
                    <View style={styles.metaItem}>
                      <Icon name="assignment" size={16} color="#666" />
                      <Text style={styles.metaText}>
                        {questionsCount} questions
                      </Text>
                    </View>
                    {survey.deadline && (
                      <View style={styles.metaItem}>
                        <Icon name="event" size={16} color="#666" />
                        <Text style={styles.metaText}>
                          Deadline: {new Date(survey.deadline).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={styles.progressValue}>{progress} / {total} voters</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View style={[
                        styles.progressBar, 
                        { 
                          width: `${percentage}%`,
                          backgroundColor: isCompleted ? '#4CAF50' : '#2196F3'
                        }
                      ]} />
                    </View>
                  </View>

                  {!isCompleted && (
                    <TouchableOpacity 
                      style={styles.continueButton}
                      onPress={() => {
                        const surveyIdToUse = survey.formId || survey._id || survey.id;
                        console.log('=== NAVIGATING TO SURVEY ===');
                        console.log('Survey object:', JSON.stringify(survey, null, 2));
                        console.log('Using survey ID:', surveyIdToUse);
                        console.log('Survey title:', surveyTitle);
                        console.log('===========================');
                        
                        router.push({
                          pathname: '/(boothAgent)/survey-voter-selection',
                          params: {
                            surveyId: surveyIdToUse,
                            surveyTitle: surveyTitle,
                          },
                        });
                      }}
                    >
                      <Text style={styles.continueButtonText}>Select Voter & Continue</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
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
  subtitleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#E3F2FD',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  surveysList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  surveyCard: {
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
  surveyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  surveyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  surveyDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  surveyMeta: {
    gap: 8,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  progressValue: {
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
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  continueButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
});