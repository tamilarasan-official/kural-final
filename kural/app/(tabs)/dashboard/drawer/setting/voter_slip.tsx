import React, { useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch, Alert, Dimensions, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import HeaderBack from '../../../../components/HeaderBack';

const { width } = Dimensions.get('window');

export default function VoterSlipScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  
  // Voter slip configuration data
  const [voterSlipData, setVoterSlipData] = useState([
    {
      id: '1',
      name: 'Default',
      prinEnabled: true,
      candidateEnabled: false
    },
    {
      id: '2',
      name: 'Thondamuthur4',
      prinEnabled: false,
      candidateEnabled: false
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const handleTogglePrin = (id: string) => {
    setVoterSlipData(prev => prev.map(item => 
      item.id === id 
        ? { ...item, prinEnabled: !item.prinEnabled }
        : item
    ));
  };

  const handleToggleCandidate = (id: string) => {
    setVoterSlipData(prev => prev.map(item => 
      item.id === id 
        ? { ...item, candidateEnabled: !item.candidateEnabled }
        : item
    ));
  };

  const filteredData = voterSlipData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderVoterSlipItem = (item: any) => (
    <View key={item.id} style={styles.slipCard}>
      <Text style={styles.slipTitle}>{item.name}</Text>
      
      <View style={styles.toggleContainer}>
        {/* Prin Toggle */}
        <View style={styles.toggleCard}>
          <Text style={styles.toggleLabel}>{t('voterSlip.prin')}</Text>
          <Switch
            value={item.prinEnabled}
            onValueChange={() => handleTogglePrin(item.id)}
            trackColor={{ false: '#FF6B6B', true: '#4ECDC4' }}
            thumbColor={item.prinEnabled ? '#FFFFFF' : '#FFFFFF'}
            ios_backgroundColor="#FF6B6B"
            style={styles.switch}
          />
        </View>

        {/* Candidate Toggle */}
        <View style={styles.toggleCard}>
          <Text style={styles.toggleLabel}>{t('voterSlip.candidate')}</Text>
          <Switch
            value={item.candidateEnabled}
            onValueChange={() => handleToggleCandidate(item.id)}
            trackColor={{ false: '#FF6B6B', true: '#4ECDC4' }}
            thumbColor={item.candidateEnabled ? '#FFFFFF' : '#FFFFFF'}
            ios_backgroundColor="#FF6B6B"
            style={styles.switch}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#E8F3FF' }]} edges={['top', 'bottom']}>
      <StatusBar translucent={false} backgroundColor="#E8F3FF" barStyle="dark-content" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <HeaderBack onPress={() => router.back()} />
        <Text style={styles.headerTitle}>{t('voterSlip.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('voterSlip.searchPlaceholder')}
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Voter Slip List */}
      <ScrollView style={styles.slipList} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        {filteredData.map(renderVoterSlipItem)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#E8F3FF',
    paddingTop: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  searchIcon: {
    fontSize: 18,
    color: '#6B7280',
  },
  slipList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  slipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  slipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  toggleCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
});
