import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRole } from '../contexts/RoleContext';
import { voterAPI } from '../../services/api/voter';
import { surveyAPI } from '../../services/api/survey';

export default function SurveyVoterSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userData } = useRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [voters, setVoters] = useState<any[]>([]);
  const [completedVoters, setCompletedVoters] = useState<Set<string>>(new Set());

  const surveyId = params.surveyId as string;
  const surveyTitle = params.surveyTitle as string;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      console.log('Survey Voter Selection - userData:', userData);
      console.log('Survey Voter Selection - surveyId:', surveyId);
      console.log('Survey Voter Selection - surveyTitle:', surveyTitle);
      
      // Load voters
      const boothId = userData?.booth_id || '';
      console.log('Survey Voter Selection - booth_id:', boothId);
      
      if (boothId) {
        const response = await voterAPI.getVotersByBoothId(boothId, { page: 1, limit: 5000 });
        console.log('Survey Voter Selection - Voters Response:', response);
        
        if (response?.success) {
          const votersData = response.voters || response.data || [];
          console.log('Survey Voter Selection - Voters loaded:', votersData.length);
          setVoters(Array.isArray(votersData) ? votersData : []);
        }
      } else {
        console.error('Survey Voter Selection - No booth_id found!');
        Alert.alert('Error', 'No booth assigned to your account');
      }

      // Load completed voter IDs for this survey
      if (surveyId) {
        try {
          const completedResponse = await surveyAPI.getCompletedVoters(surveyId);
          console.log('Survey Voter Selection - Completed voters response:', completedResponse);
          if (completedResponse?.success && completedResponse.data) {
            const voterIds = completedResponse.data.completedVoterIds || [];
            console.log('Survey Voter Selection - Completed voter IDs:', voterIds);
            setCompletedVoters(new Set(voterIds));
          }
        } catch (error) {
          console.warn('Failed to load completed voters:', error);
        }
      }
      
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load voters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredVoters = voters.filter(voter => {
    const voterName = voter.name?.english || voter.Name || '';
    const voterId = voter.voterID || voter.Number || voter['EPIC No'] || '';
    const mobile = voter.mobile || voter['Mobile No'] || '';
    
    return voterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           voterId.includes(searchQuery) ||
           mobile.includes(searchQuery);
  });

  const handleSelectVoter = (voter: any) => {
    const voterId = voter.voterID || voter.Number || voter['EPIC No'] || voter._id;
    const voterName = voter.name?.english || voter.Name || 'Unknown';
    const voterAge = voter.age || voter.Age || '';
    const voterMobile = voter.mobile || voter['Mobile No'] || '';
    
    // Check if voter has already completed this survey
    if (completedVoters.has(voterId)) {
      Alert.alert(
        'Survey Already Completed',
        `${voterName} has already completed this survey.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    console.log('Survey Voter Selection - Selected voter:', {
      voterId,
      voterName,
      voterAge,
      voterMobile
    });
    
    router.push({
      pathname: '/(boothAgent)/survey-questions',
      params: {
        surveyId: surveyId,
        surveyTitle: surveyTitle,
        voterId: voterId,
        voterName: voterName,
        voterAge: voterAge?.toString() || '',
        voterMobile: voterMobile,
      },
    });
  };

  const completedCount = completedVoters.size;
  const totalCount = voters.length;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading voters...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{surveyTitle || 'Survey'}</Text>
          <Text style={styles.headerSubtitle}>{completedCount} of {totalCount} voters completed</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search voters..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
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
            const voterId = voter.voterID || voter.Number || voter['EPIC No'] || '';
            const isCompleted = completedVoters.has(voterId || voter._id);
            const voterName = voter.name?.english || voter.Name || 'Unknown';
            const age = voter.age || voter.Age || '';
            const gender = voter.gender || voter.sex || voter.Sex || '';
            const mobile = voter.mobile || voter['Mobile No'] || '';
            const houseNo = voter['Address-House no'] || voter.HouseNo || voter.Door_No || '';
            const street = voter['Address-Street'] || voter.Street || '';
            const locality = voter['Address-Locality'] || voter.Anubhag_name || '';
            
            return (
              <TouchableOpacity
                key={voter._id || index}
                style={styles.voterCard}
                onPress={() => handleSelectVoter(voter)}
                disabled={isCompleted}
              >
                <View style={styles.voterIcon}>
                  {isCompleted ? (
                    <Icon name="check-circle" size={24} color="#4CAF50" />
                  ) : (
                    <Icon name="radio-button-unchecked" size={24} color="#ccc" />
                  )}
                </View>

                <View style={styles.voterInfo}>
                  <Text style={styles.voterName}>{voterName}</Text>
                  <Text style={styles.voterDetails}>
                    {voterId} • {age}y • {gender}
                  </Text>
                  {(houseNo || street || locality) && (
                    <Text style={styles.voterAddress}>
                      {houseNo}{street ? ', ' + street : ''}{locality ? ', ' + locality : ''}
                    </Text>
                  )}
                  {mobile && (
                    <Text style={styles.voterMobile}>📱 {mobile}</Text>
                  )}
                </View>

                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    padding: 0,
  },
  votersList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  voterCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  voterIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  voterInfo: {
    flex: 1,
  },
  voterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  voterDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  voterAddress: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  voterMobile: {
    fontSize: 13,
    color: '#2196F3',
  },
  completedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  completedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
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
