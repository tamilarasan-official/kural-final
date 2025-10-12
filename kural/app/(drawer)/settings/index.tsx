import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { width } = Dimensions.get('window');
  const cardWidth = (width - 60) / 3; // 3 columns with margins

  const settingsOptions = [
    {
      id: 'set-election',
      title: t('settings.setElection'),
      icon: require('../../../assets/images/set election.png'),
      disabled: false,
    },
    {
      id: 'app-banner',
      title: t('settings.appBanner'),
      icon: require('../../../assets/images/App banner.png'),
      disabled: false,
    },
    {
      id: 'history',
      title: t('settings.history'),
      icon: require('../../../assets/images/History.png'),
      disabled: false,
    },
    {
      id: 'category',
      title: t('settings.category'),
      icon: require('../../../assets/images/Category.png'),
      disabled: false,
    },
    {
      id: 'voter-slip',
      title: t('settings.voterSlip'),
      icon: require('../../../assets/images/voter slip.png'),
      disabled: false,
    },
    {
      id: 'party',
      title: t('settings.party'),
      icon: require('../../../assets/images/party.png'),
      disabled: false,
    },
    {
      id: 'religion',
      title: t('settings.religion'),
      icon: require('../../../assets/images/religion.png'),
      disabled: false,
    },
    {
      id: 'caste-category',
      title: t('settings.caste'),
      icon: require('../../../assets/images/caste.png'),
      disabled: false,
    },
    {
      id: 'caste',
      title: t('castes.title'),
      icon: require('../../../assets/images/caste.png'),
      disabled: false,
    },
    {
      id: 'sub-caste',
      title: t('subCastes.title'),
      icon: require('../../../assets/images/sub caste.png'),
      disabled: false,
    },
    {
      id: 'language',
      title: t('voterLanguage.title'),
      icon: require('../../../assets/images/language.png'),
      disabled: false,
    },
    {
      id: 'schemes',
      title: t('schemes.title'),
      icon: require('../../../assets/images/schemes.png'),
      disabled: false,
    },
    {
      id: 'feedback',
      title: t('feedback.title'),
      icon: require('../../../assets/images/feedback.png'),
      disabled: false,
    },
  ];

  const handleOptionPress = (option: any) => {
    if (option.disabled) return;
    
    // Handle navigation based on option
    switch (option.id) {
      case 'set-election':
        // Navigate to dashboard with parameter to open election modal
        router.push('/(tabs)/?openElectionModal=true');
        break;
      case 'app-banner':
        // Navigate to app banner settings
        router.push('/(drawer)/settings/app_banner');
        break;
      case 'history':
        // Navigate to history
        router.push('/(drawer)/settings/history');
        break;
      case 'category':
        // Navigate to category settings
        router.push('/(drawer)/settings/voter_category');
        break;
      case 'voter-slip':
        // Navigate to voter slip
        router.push('/(drawer)/settings/voter_slip');
        break;
      case 'party':
        // Navigate to party settings
        router.push('/(drawer)/settings/parties');
        break;
      case 'religion':
        // Navigate to religion settings
        router.push('/(drawer)/settings/religions');
        break;
      case 'caste-category':
        // Navigate to caste category settings
        router.push('/(drawer)/settings/caste_category');
        break;
      case 'caste':
        // Navigate to caste settings
        router.push('/(drawer)/settings/castes');
        break;
      case 'sub-caste':
        // Navigate to sub-caste settings
        router.push('/(drawer)/settings/sub_castes');
        break;
      case 'language':
        // Navigate to language settings
        router.push('/(drawer)/settings/voter_language');
        break;
      case 'schemes':
        // Navigate to schemes settings
        router.push('/(drawer)/settings/schemes');
        break;
      case 'feedback':
        // Navigate to feedback
        router.push('/(drawer)/settings/feedback');
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                { width: cardWidth },
                option.disabled && styles.disabledCard
              ]}
              onPress={() => handleOptionPress(option)}
              disabled={option.disabled}
              activeOpacity={option.disabled ? 1 : 0.7}
            >
              <Image 
                source={option.icon} 
                style={[
                  styles.icon,
                  option.disabled && styles.disabledIcon
                ]}
                resizeMode="contain"
              />
              <Text style={[
                styles.optionTitle,
                option.disabled && styles.disabledText
              ]}>
                {option.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#E3F2FD',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 100,
    justifyContent: 'center',
  },
  disabledCard: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 12,
  },
  disabledIcon: {
    opacity: 0.5,
  },
  optionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 16,
  },
  disabledText: {
    color: '#9E9E9E',
  },
});
