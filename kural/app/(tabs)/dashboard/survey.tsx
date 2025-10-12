import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../../contexts/LanguageContext';
import { surveyAPI } from '../../../services/api/survey';

const { width } = Dimensions.get('window');

export default function SurveyScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await surveyAPI.getAll({ limit: 50 });
      
      if (response.success) {
        setSurveys(response.data);
      } else {
        setError('Failed to load surveys');
      }
    } catch (err: any) {
      console.error('Error loading surveys:', err);
      setError(err.message || 'Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };


  const handleFormClick = (surveyId: string) => {
    router.push(`/(tabs)/dashboard/survey-form?surveyId=${surveyId}`);
  };

  const handleStatusToggle = async (surveyId: string, currentStatus: string) => {
    try {
      setUpdating(surveyId);
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      
      const response = await surveyAPI.updateStatus(surveyId, newStatus);
      
      if (response.success) {
        // Update local state
        setSurveys(prev => prev.map(survey => 
          survey._id === surveyId 
            ? { ...survey, status: newStatus }
            : survey
        ));
        
        // Show toast message
        Alert.alert('Success', `Status updated to ${newStatus}`);
      } else {
        Alert.alert('Error', response.message || 'Failed to update status');
      }
    } catch (err: any) {
      console.error('Error updating survey status:', err);
      Alert.alert('Error', err.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const renderSurveyFormCard = (survey: any) => (
    <TouchableOpacity 
      key={survey._id} 
      style={styles.surveyFormCard}
      onPress={() => handleFormClick(survey._id)}
      activeOpacity={0.8}
    >
      <View style={styles.surveyFormHeader}>
        <View style={styles.formNumberContainer}>
          <Text style={styles.formNumber}>{t('survey.form')} : {survey.formNumber}</Text>
        </View>
        <View 
          onStartShouldSetResponder={() => true}
          onResponderGrant={() => handleStatusToggle(survey._id, survey.status)}
        >
          <Switch
            value={survey.status === 'Active'}
            onValueChange={() => handleStatusToggle(survey._id, survey.status)}
            disabled={updating === survey._id}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={survey.status === 'Active' ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>
      
      <View style={styles.surveyFormContent}>
        <Text style={styles.tamilTitle}>{survey.tamilTitle}</Text>
        {survey.title && (
          <Text style={styles.englishTitle}>{survey.title}</Text>
        )}
        {survey.description && (
          <Text style={styles.description}>{survey.description}</Text>
        )}
      </View>
      
      <View style={styles.surveyFormFooter}>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: survey.status === 'Active' ? '#4CAF50' : '#F44336' }
          ]} />
          <Text style={[
            styles.statusText,
            { color: survey.status === 'Active' ? '#4CAF50' : '#F44336' }
          ]}>
            {survey.status}
          </Text>
        </View>
        
        <Text style={styles.responseCount}>
          {survey.responseCount || 0} {t('survey.responses')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSurveyCard = (survey: any) => (
    <View key={survey._id} style={styles.surveyCard}>
      <View style={styles.surveyHeader}>
        <View style={styles.formNumberContainer}>
          <Text style={styles.formNumber}>{t('survey.form')} : {survey.formNumber}</Text>
        </View>
        <Switch
          value={survey.status === 'Active'}
          onValueChange={() => handleStatusToggle(survey._id, survey.status)}
          disabled={updating === survey._id}
          trackColor={{ false: '#E0E0E0', true: '#FF5722' }}
          thumbColor={survey.status === 'Active' ? '#FFFFFF' : '#FFFFFF'}
        />
      </View>
      
      <View style={styles.surveyContent}>
        <Text style={styles.tamilTitle}>{survey.tamilTitle}</Text>
        {survey.title && (
          <Text style={styles.englishTitle}>{survey.title}</Text>
        )}
        {survey.description && (
          <Text style={styles.description}>{survey.description}</Text>
        )}
      </View>
      
      <View style={styles.surveyFooter}>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: survey.status === 'Active' ? '#4CAF50' : '#F44336' }
          ]} />
          <Text style={[
            styles.statusText,
            { color: survey.status === 'Active' ? '#4CAF50' : '#F44336' }
          ]}>
            {survey.status}
          </Text>
        </View>
        
        <Text style={styles.responseCount}>
          {survey.responseCount || 0} {t('survey.responses')}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('survey.title')}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>{t('survey.loading')}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('survey.title')}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSurveys}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.timeText}>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</Text>
        <View style={styles.statusIcons}>
          <Text style={styles.statusText}>5G+</Text>
          <Text style={styles.batteryText}>100%</Text>
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('survey.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {surveys.length > 0 ? (
          surveys.map(renderSurveyFormCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('survey.noSurveys')}</Text>
            <Text style={styles.emptySubtext}>{t('survey.createFirst')}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#000000',
  },
  batteryText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#E3F2FD',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  surveyFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  surveyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  surveyFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  surveyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  formNumberContainer: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  formNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  surveyFormContent: {
    marginBottom: 12,
  },
  surveyContent: {
    marginBottom: 12,
  },
  tamilTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
    lineHeight: 22,
  },
  englishTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
  surveyFormFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  surveyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  responseCount: {
    fontSize: 12,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999999',
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
});
