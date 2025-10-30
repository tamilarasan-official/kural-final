import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
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

  useEffect(() => {
    loadVoters();
  }, [userData]);

  const loadVoters = async () => {
    try {
      setLoading(true);
      const boothNumber = userData?.boothAllocation || userData?.activeElection || '';
      
      if (boothNumber) {
        const response = await voterAPI.getVotersByPart(boothNumber, { limit: 1000 });
        if (response?.success && Array.isArray(response.data)) {
          setVoters(response.data);
        } else {
          setVoters([]);
        }
      }
    } catch (error) {
      console.error('Failed to load voters:', error);
      Alert.alert('Error', 'Failed to load voters');
      setVoters([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVoters = voters.filter(voter => 
    voter.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voter.Number?.includes(searchQuery) ||
    voter['EPIC No']?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateAge = (ageStr: string) => {
    const age = parseInt(ageStr || '0');
    return isNaN(age) ? 0 : age;
  };

  if (loading) {
    return (
      <ScreenWrapper userRole="booth_agent">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Loading voters...</Text>
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
          <Text style={styles.headerTitle}>Voter Manager</Text>
          <TouchableOpacity style={styles.addButton}>
            <Icon name="person-add" size={24} color="#1976D2" />
          </TouchableOpacity>
        </View>

        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>
            Booth {userData?.boothAllocation || '119 '} - {voters.length} voters
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

        {/* Voter List */}
        <ScrollView style={styles.voterList} showsVerticalScrollIndicator={false}>
          {filteredVoters.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="people-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No voters found' : 'No voters in this booth'}
              </Text>
            </View>
          ) : (
            filteredVoters.map((voter, index) => {
              const age = calculateAge(voter.Age);
              const isAge60Plus = age >= 60;
              
              return (
                <View key={voter._id || index} style={styles.voterCard}>
                  <View style={styles.voterHeader}>
                    <View style={styles.voterIcon}>
                      <Icon 
                        name={voter.Gender === 'M' || voter.Gender === 'Male' ? 'person' : 'person-outline'} 
                        size={24} 
                        color="#1976D2" 
                      />
                    </View>
                    <View style={styles.voterInfo}>
                      <Text style={styles.voterName}>{voter.Name || 'Unknown'}</Text>
                      <Text style={styles.voterDetails}>
                        ID: {voter['EPIC No'] || voter.Number || 'N/A'}
                      </Text>
                    </View>
                    {isAge60Plus && (
                      <View style={styles.ageBadge}>
                        <Text style={styles.ageBadgeText}>60+</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.voterMeta}>
                    <View style={styles.metaRow}>
                      <Icon name="cake" size={16} color="#666" />
                      <Text style={styles.metaText}>{age} years</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Icon name={voter.Gender === 'F' || voter.Gender === 'Female' ? 'woman' : 'man'} size={16} color="#666" />
                      <Text style={styles.metaText}>
                        {voter.Gender === 'M' ? 'Male' : voter.Gender === 'F' ? 'Female' : voter.Gender}
                      </Text>
                    </View>
                    {voter['Mobile No'] && (
                      <View style={styles.metaRow}>
                        <Icon name="phone" size={16} color="#666" />
                        <Text style={styles.metaText}>{voter['Mobile No']}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.voterFooter}>
                    <View style={[styles.statusBadge, styles.verifiedBadge]}>
                      <Icon name="check-circle" size={14} color="#4CAF50" />
                      <Text style={styles.statusText}>Verified</Text>
                    </View>
                    <TouchableOpacity style={styles.detailsButton}>
                      <Text style={styles.detailsButtonText}>View Details</Text>
                      <Icon name="chevron-right" size={16} color="#1976D2" />
                    </TouchableOpacity>
                  </View>
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
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    height: 44,
    marginLeft: 8,
    fontSize: 14,
    color: '#000',
  },
  voterList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  voterCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  voterHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  voterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  },
  ageBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ageBadgeText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: 'bold',
  },
  voterMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  voterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
});
