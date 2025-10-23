import React, { useEffect, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, Modal, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import HeaderBack from '../../components/HeaderBack';
import { useLanguage } from '../../../contexts/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_ELECTION_KEY, ELECTION_LOCATIONS } from '../../_config/electionLocations';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
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
        // Open election modal inline within Settings page (do not navigate away)
        setShowElectionModal(true);
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

  // Election modal state (open inside Settings)
  const [showElectionModal, setShowElectionModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState<string>(Object.keys(ELECTION_LOCATIONS)[0] || '');
  
  const electionOptions = Object.keys(ELECTION_LOCATIONS || {}) || [];

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(DEFAULT_ELECTION_KEY);
        if (saved) setSelectedElection(saved);
      } catch { /* ignore */ }
    })();
  }, []);

  const handleElectionUpdate = async () => {
    const key = (selectedElection || '').trim();
    if (ELECTION_LOCATIONS && ELECTION_LOCATIONS[key]) {
      try {
        await AsyncStorage.setItem(DEFAULT_ELECTION_KEY, key);
      } catch (err) { console.warn('Failed to persist default election', err); }
    }
    setShowElectionModal(false);
  };

  const handleElectionClose = () => {
    setShowElectionModal(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#E8F3FF' }]} edges={['top', 'bottom']}>
      <StatusBar translucent={false} backgroundColor="#E8F3FF" barStyle="dark-content" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }] }>
        <HeaderBack onPress={() => router.back()} />
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

      {/* Inline Election Modal for Settings */}
      <SettingsElectionModal
        visible={showElectionModal}
        onClose={handleElectionClose}
        selectedElection={selectedElection}
        setSelectedElection={setSelectedElection}
        options={electionOptions}
        onUpdate={handleElectionUpdate}
      />
    </SafeAreaView>
  );
}

// Insert election modal JSX at end of file (uses existing styles where possible)
/* Election Modal Inline */
export function SettingsElectionModal({ visible, onClose, selectedElection, setSelectedElection, options, onUpdate }: any) {
  const { t } = useLanguage();
  const [showElectionDropdown, setShowElectionDropdown] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.electionModalContainer}>
          <Text style={styles.electionModalTitle}>{t('dashboard.setDefaultElection')}</Text>

          <View style={styles.electionInputContainer}>
            <TouchableOpacity
              style={styles.electionDropdown}
              onPress={() => setShowElectionDropdown(!showElectionDropdown)}
            >
              <Text style={styles.electionDropdownText}>{selectedElection}</Text>
              <Icon name={showElectionDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={24} color="#666" />
            </TouchableOpacity>

            {showElectionDropdown && (
              <View style={styles.electionDropdownList}>
                <ScrollView style={styles.electionScrollView}>
                  {options.map((option: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.electionOption,
                        selectedElection === option && styles.electionOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedElection(option);
                        setShowElectionDropdown(false);
                      }}
                    >
                      <Text style={[
                        styles.electionOptionText,
                        selectedElection === option && styles.electionOptionTextSelected,
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.electionButtonContainer}>
            <TouchableOpacity style={styles.updateButton} onPress={onUpdate}>
              <Text style={styles.updateButtonText}>{t('dashboard.update')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.electionCloseButton} onPress={onClose}>
              <Text style={styles.electionCloseButtonText}>{t('dashboard.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 0,
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
  // Election modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  electionModalContainer: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    padding: 24,
    width: '100%',
    maxHeight: '60%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  electionModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  electionInputContainer: {
    marginBottom: 20,
  },
  electionDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  electionDropdownText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  electionButtonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  updateButton: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  electionCloseButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  electionCloseButtonText: {
    color: '#424242',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  // Missing styles for election dropdown list
  electionDropdownList: {
    maxHeight: 180,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  electionScrollView: {
    maxHeight: 160,
    paddingHorizontal: 4,
  },
  electionOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  electionOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  electionOptionText: {
    fontSize: 16,
    color: '#000000',
  },
  electionOptionTextSelected: {
    color: '#1976D2',
    fontWeight: '600',
  },
});
