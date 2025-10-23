import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../../contexts/LanguageContext';
import { voterAPI } from '../../../services/api/voter';
import DateTimePicker from '@react-native-community/datetimepicker';
import { settingsAPI } from '../../../services/api/settings';

export const options = {
  headerShown: false,
};

const { width } = Dimensions.get('window');

interface Voter {
  _id: string;
  sr: number;
  Name: string;
  Number: string;
  Relation: string;
  'Father Name': string;
  sex: string;
  Door_No: number;
  age: number;
  Part_no: number;
  'Part Name': string;
  Anubhag_number: number;
  Anubhag_name: string;
  vidhansabha: number;
  'Mobile No': string;
}

type TabType = 'basic' | 'family' | 'friends' | 'share';

export default function VoterInfoScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { voterData, partNumber } = useLocalSearchParams();
  const [voter, setVoter] = useState<Voter | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('share');
  const [searchQuery, setSearchQuery] = useState('');
  const [partSectionInfo, setPartSectionInfo] = useState<any>(null);

  // Dropdown options state
  const [religions, setReligions] = useState<any[]>([]);
  const [castes, setCastes] = useState<any[]>([]);
  const [subCastes, setSubCastes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [casteCategories, setCasteCategories] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [histories, setHistories] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);

  // Selected values state
  const [selectedValues, setSelectedValues] = useState({
    religion: '',
    caste: '',
    subCaste: '',
    category: '',
    casteCategory: '',
    party: '',
    schemes: '',
    history: '',
    feedback: '',
    language: '',
    aadhar: '',
    pan: '',
    membership: '',
    remarks: '',
    dob: ''
  });

  // DOB state
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // Check if all required fields are filled
  const isFormFilled = () => {
    return selectedValues.religion !== '' && 
           selectedValues.caste !== '' && 
           selectedValues.category !== '' && 
           selectedValues.party !== '';
  };

  // Generic picker modal state (replaces Alert with more than 3 options)
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerField, setPickerField] = useState<string>('');
  const [pickerTitle, setPickerTitle] = useState<string>('');
  const [pickerOptions, setPickerOptions] = useState<any[]>([]);
  const [pickerSearch, setPickerSearch] = useState<string>('');

  useEffect(() => {
    if (voterData) {
      try {
        const parsedVoter = JSON.parse(voterData as string);
        console.log('Parsed voter data:', parsedVoter);
        // Normalize commonly-used fields so UI always finds them. Support both backend and StarVoter shapes.
        const normalizedVoter = {
          ...parsedVoter,
          // id variants
          _id: parsedVoter._id ?? parsedVoter.id ?? parsedVoter.voterId ?? parsedVoter.Number ?? undefined,
          // serial
          sr: parsedVoter.sr ?? parsedVoter.Sr ?? parsedVoter.serial ?? parsedVoter.Serial ?? parsedVoter['S.No'] ?? parsedVoter['Serial'] ?? 1,
          // part number variants
          Part_no: parsedVoter.Part_no ?? parsedVoter.PartNo ?? parsedVoter.part_no ?? parsedVoter.part ?? parsedVoter.partNo ?? parsedVoter.Part ?? parsedVoter.PartNo ?? parsedVoter.Part_no ?? parsedVoter['Part No'] ?? parsedVoter['Part_no'] ?? parsedVoter['Part'] ?? parsedVoter.Part ?? 1,
          // canonical display fields expected by the UI
          Name: parsedVoter.Name ?? parsedVoter.name ?? parsedVoter.fullName ?? parsedVoter.displayName ?? '',
          Number: parsedVoter.Number ?? parsedVoter.voterId ?? parsedVoter.epic ?? parsedVoter.epicId ?? '',
          'Father Name': parsedVoter['Father Name'] ?? parsedVoter.guardianName ?? parsedVoter.fatherName ?? parsedVoter['Father'] ?? '',
          Relation: parsedVoter.Relation ?? parsedVoter.relationship ?? parsedVoter.relation ?? '',
          Door_No: parsedVoter.Door_No ?? parsedVoter.Door_no ?? parsedVoter.doorNo ?? parsedVoter.door_no ?? parsedVoter.DoorNo ?? parsedVoter.door ?? '',
          'Mobile No': parsedVoter['Mobile No'] ?? parsedVoter.mobile ?? parsedVoter.phone ?? parsedVoter.mobileNumber ?? '',
          age: parsedVoter.age ?? parsedVoter.Age ?? parsedVoter.years ?? undefined,
          // Ensure sex is present and normalized to avoid callers using toLowerCase on undefined
          sex: parsedVoter.sex ?? parsedVoter.Sex ?? parsedVoter.gender ?? parsedVoter.Gender ?? null,
        } as Voter;
        setVoter(normalizedVoter);
        // Fetch Part & Section Info when voter data is loaded
        if (normalizedVoter['Part Name'] || normalizedVoter['Part Name']) {
          fetchPartSectionInfo(normalizedVoter['Part Name'] || parsedVoter['Part Name'], normalizedVoter);
        }
        // Load existing voter info and dropdown options
        loadVoterAdditionalInfo(normalizedVoter._id || parsedVoter._id);
        loadDropdownOptions();
      } catch (error) {
        console.error('Error parsing voter data:', error);
        console.log('Raw voter data:', voterData);
        setVoter(null);
      }
    } else {
      console.log('No voter data provided');
      setVoter(null);
    }
  }, [voterData]);

  const fetchPartSectionInfo = async (partName: string, voterData?: Voter) => {
    try {
      if (!partName) {
        console.log('No part name provided');
        return;
      }

      // Use the actual voter data directly (removed failing API call)
      const voterPartSectionInfo = {
        pollingStation: {
          english: partName, // Use the actual Part Name from voter data
          tamil: partName    // For now, use the same text for Tamil
        },
        address: {
          english: `${t('dashboard.part')} ${voterData?.Part_no || voter?.Part_no} - ${partName}`,
          tamil: `${t('dashboard.part')} ${voterData?.Part_no || voter?.Part_no} - ${partName}`
        }
      };
      
      setPartSectionInfo(voterPartSectionInfo);
    } catch (error) {
      console.error('Error fetching part section info:', error);
    }
  };

  const loadDropdownOptions = async () => {
    try {
      // Helper to normalize API responses: supports raw arrays or {data: []}
      const normalize = (res: any) => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.data)) return res.data;
        if (res && Array.isArray(res.items)) return res.items;
        if (res && typeof res === 'object') {
          for (const key of Object.keys(res)) {
            const val = (res as any)[key];
            if (Array.isArray(val)) return val;
          }
        }
        return [];
      };

      // Fetch all dropdown options in parallel
      const results = await Promise.allSettled([
        settingsAPI.getReligions(),      // religions
        settingsAPI.getCastes(),         // castes
        settingsAPI.getSubCastes(),      // subcastes
        settingsAPI.getCategories(),     // votercategories
        settingsAPI.getCasteCategories(),// castecategories
        settingsAPI.getParties(),        // parties
        settingsAPI.getSchemes(),        // schemes
        settingsAPI.getLanguages(),      // voterlanguages
        settingsAPI.getFeedbacks?.(),    // feedbacks (optional)
        settingsAPI.getHistories?.()     // voterhistory (optional)
      ]);

      const get = (idx: number) => results[idx].status === 'fulfilled' ? normalize(results[idx].value) : [];

      setReligions(get(0));
      setCastes(get(1));
      setSubCastes(get(2));
      setCategories(get(3));
      setCasteCategories(get(4));
      setParties(get(5));
      setSchemes(get(6));
      setLanguages(get(7));
      setFeedbacks(get(8));
      setHistories(get(9));
      
      console.log('Dropdown options loaded:', {
        religions: get(0).length,
        castes: get(1).length,
        subCastes: get(2).length,
        categories: get(3).length,
        casteCategories: get(4).length,
        parties: get(5).length,
        schemes: get(6).length,
        languages: get(7).length,
        feedbacks: get(8).length,
        histories: get(9).length
      });

    } catch (error) {
      console.error('Error loading dropdown options:', error);
    }
  };

  const loadVoterAdditionalInfo = async (voterId: string) => {
    try {
      const response = await settingsAPI.getVoterInfo(voterId);
      if (response.success && response.data) {
        const voterInfo = response.data;
        setSelectedValues(prev => ({
          ...prev,
          religion: voterInfo.religion || '',
          caste: voterInfo.caste || '',
          subCaste: voterInfo.subCaste || '',
          category: voterInfo.category || '',
          casteCategory: voterInfo.casteCategory || '',
          party: voterInfo.party || '',
          schemes: voterInfo.schemes || '',
          history: voterInfo.history || '',
          feedback: voterInfo.feedback || '',
          language: voterInfo.language || '',
          aadhar: voterInfo.aadhar || '',
          pan: voterInfo.pan || '',
          membership: voterInfo.membership || '',
          remarks: voterInfo.remarks || '',
          dob: voterInfo.dob || ''
        }));
        
        // Set DOB date if available
        if (voterInfo.dob) {
          setDobDate(new Date(voterInfo.dob));
        }
        
        console.log('Voter info loaded successfully:', voterInfo);
      }
    } catch (error) {
      console.log('No existing voter info found, using defaults');
    }
  };

  const saveVoterInfo = async () => {
    if (!voter) return;
    
    try {
      const voterInfoData = {
        ...selectedValues,
        dob: selectedValues.dob || (dobDate ? dobDate.toISOString().split('T')[0] : '')
      };
      
      const response = await settingsAPI.saveVoterInfo(voter._id, voterInfoData);
      
      if (response.success) {
        Alert.alert(t('voterInfo.success'), t('voterInfo.savedSuccessfully'));
        console.log('Voter info saved successfully:', response.data);
      } else {
        Alert.alert(t('common.error'), t('voterInfo.saveFailed'));
      }
    } catch (error) {
      console.error('Error saving voter info:', error);
      Alert.alert('Error', 'Failed to save voter information');
    }
  };

  const showDropdown = (field: string, options: any[]) => {
    console.log(`showDropdown called for ${field} with ${options?.length || 0} options`);
    if (!options || options.length === 0) {
      Alert.alert(t('voterInfo.noOptions'), t('voterInfo.noOptionsAvailable'));
      return;
    }

    setPickerField(field);
    const titleMap: any = {
      religion: t('voterInfo.selectReligion'),
      caste: t('voterInfo.selectCaste'),
      subCaste: t('voterInfo.selectSubCaste'),
      category: t('voterInfo.selectCategory'),
      casteCategory: t('voterInfo.casteCategory'),
      party: t('voterInfo.selectParty'),
      schemes: t('voterInfo.selectSchemes'),
      history: t('voterInfo.selectHistory'),
      feedback: t('voterInfo.selectFeedback'),
      language: t('voterInfo.selectLanguage')
    };
    setPickerTitle(titleMap[field] || t('common.select'));
    setPickerOptions(options);
    setPickerSearch('');
    setPickerVisible(true);
  };

  const getOptionLabel = (field: string, option: any): string => {
    switch (field) {
      case 'caste':
      case 'subCaste':
      case 'category':
      case 'casteCategory':
      case 'party':
      case 'schemes':
      case 'religion':
      case 'language':
      case 'history':
      case 'feedback':
        return (
          (field === 'casteCategory' ? option.abbreviation : undefined) ||
          option.englishName ||
          option.name ||
          option.title ||
          option.label ||
          option.abbreviation ||
          `${option}`
        ).toString();
      default:
        return (option.name || option.title || option.label || `${option}`).toString();
    }
  };

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleShare = (type: 'whatsapp' | 'sms' | 'general' | 'print') => {
    if (!voter) return;
    
    const mobileNumber = voter['Mobile No'];
    const message = `${t('voterInfo.voterInfo')}:\n${t('voterInfo.name')}: ${voter.Name}\n${t('voterInfo.epic')}: ${voter.Number}\n${t('voterInfo.part')}: ${voter.Part_no}`;
    
    // Check if mobile number is available for WhatsApp, SMS, and Share
    if ((type === 'whatsapp' || type === 'sms' || type === 'general') && (!mobileNumber || mobileNumber.trim() === '')) {
      Alert.alert(t('voterInfo.noMobileNumber'), t('voterInfo.noMobileNumberMessage'));
      return;
    }
    
    switch (type) {
      case 'whatsapp':
        if (mobileNumber) {
          // Open WhatsApp with the voter's mobile number
          const whatsappUrl = `whatsapp://send?phone=${mobileNumber}&text=${encodeURIComponent(message)}`;
          // In a real app, you would use Linking.openURL(whatsappUrl)
          Alert.alert(t('voterInfo.whatsapp'), t('voterInfo.openingWhatsApp'));
        }
        break;
      case 'sms':
        if (mobileNumber) {
          // Open SMS with the voter's mobile number
          const smsUrl = `sms:${mobileNumber}?body=${encodeURIComponent(message)}`;
          // In a real app, you would use Linking.openURL(smsUrl)
          Alert.alert(t('voterInfo.sms'), t('voterInfo.openingSMS'));
        }
        break;
      case 'general':
        if (mobileNumber) {
          // General sharing functionality
          Alert.alert(t('voterInfo.share'), t('voterInfo.sharingVoterInfo'));
        }
        break;
      case 'print':
        Alert.alert(t('voterInfo.print'), t('voterInfo.printFunctionality'));
        break;
    }
  };

  const getGenderColor = (gender?: string | null) => {
    // Guard against undefined/null and handle common abbreviations
    if (!gender || typeof gender !== 'string') return '#9E9E9E';
    const g = gender.trim().toLowerCase();
    if (g === 'm' || g === 'male') return '#4CAF50';
    if (g === 'f' || g === 'female') return '#E91E63';
    // Support other common identifiers
    if (g === 'other' || g === 'o' || g === 'trans' || g === 'transgender') return '#9C27B0';
    return '#9E9E9E';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>{t('voterInfo.loadingVoterDetails')}</Text>
      </View>
    );
  }

  if (!voter) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={48} color="#f44336" />
        <Text style={styles.errorText}>{t('voterInfo.voterNotFound')}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            try {
              router.back();
            } catch (e) {
              router.replace('/(tabs)/dashboard' as any);
            }
          }}
        >
          <Text style={styles.backButtonText}>{t('common.goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderBasicTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('voterInfo.contactInformation')}</Text>
        
        <View style={styles.inputRow}>
          <Icon name="calendar-today" size={20} color="#666" />
          <TouchableOpacity
            style={[styles.dropdownButton, { borderWidth: 1, borderColor: '#E0E0E0' }]}
            onPress={() => setShowDobPicker(true)}
          >
            <Text style={styles.dropdownText}>
              {selectedValues.dob ? selectedValues.dob : t('voterInfo.selectDateOfBirth')}
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {showDobPicker && (
          <DateTimePicker
            value={dobDate || new Date(1990, 0, 1)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              if (Platform.OS !== 'ios') {
                setShowDobPicker(false);
              }
              if (date) {
                setDobDate(date);
                const formatted = formatDate(date);
                setSelectedValues(prev => ({ ...prev, dob: formatted }));
              }
            }}
            maximumDate={new Date()}
          />
        )}

        <View style={styles.inputRow}>
          <Icon name="phone" size={20} color="#666" />
          <TextInput
            style={styles.textInput}
            placeholder={t('voterInfo.enterMobileNumber')}
            placeholderTextColor="#999"
            value={voter['Mobile No'] || ''}
            editable={false}
          />
        </View>

        <View style={styles.inputRow}>
          <Icon name="message" size={20} color="#25D366" />
          <TextInput
            style={styles.textInput}
            placeholder={t('voterInfo.enterWhatsappNumber')}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputRow}>
          <Icon name="email" size={20} color="#666" />
          <TextInput
            style={styles.textInput}
            placeholder={t('voterInfo.enterEmail')}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputRow}>
          <Icon name="location-on" size={20} color="#666" />
          <View style={styles.locationContainer}>
            <TouchableOpacity style={styles.locationButton}>
              <Text style={styles.locationButtonText}>{t('voterInfo.noLocation')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fetchLocationButton}>
              <Text style={styles.fetchLocationButtonText}>{t('voterInfo.fetchLocation')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('voterInfo.additionalInformation')}</Text>
        
        <View style={styles.inputRow}>
          <Icon name="fingerprint" size={20} color="#666" />
          <TextInput
            style={styles.textInput}
            placeholder={t('voterInfo.enterAadharNumber')}
            placeholderTextColor="#999"
            value={selectedValues.aadhar}
            onChangeText={(text) => setSelectedValues(prev => ({ ...prev, aadhar: text }))}
          />
        </View>

        <View style={styles.inputRow}>
          <Icon name="account-balance" size={20} color="#666" />
          <TextInput
            style={styles.textInput}
            placeholder={t('voterInfo.enterPanNumber')}
            placeholderTextColor="#999"
            value={selectedValues.pan}
            onChangeText={(text) => setSelectedValues(prev => ({ ...prev, pan: text }))}
          />
        </View>

        <View style={styles.inputRow}>
          <Icon name="card-membership" size={20} color="#666" />
          <TextInput
            style={styles.textInput}
            placeholder={t('voterInfo.enterMembershipNumber')}
            placeholderTextColor="#999"
            value={selectedValues.membership}
            onChangeText={(text) => setSelectedValues(prev => ({ ...prev, membership: text }))}
          />
        </View>

        <View style={styles.inputRow}>
          <Icon name="temple-buddhist" size={20} color="#666" />
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => showDropdown('religion', religions)}
          >
            <Text style={[styles.dropdownText, selectedValues.religion && styles.selectedText]}>
              {selectedValues.religion || t('voterInfo.selectReligion')}
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <Icon name="category" size={20} color="#666" />
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => showDropdown('caste', castes)}
          >
            <Text style={[styles.dropdownText, selectedValues.caste && styles.selectedText]}>
              {selectedValues.caste || t('voterInfo.selectCaste')}
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <Icon name="add-circle" size={20} color="#666" />
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => showDropdown('subCaste', subCastes)}
          >
            <Text style={[styles.dropdownText, selectedValues.subCaste && styles.selectedText]}>
              {selectedValues.subCaste || t('voterInfo.selectSubCaste')}
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <Icon name="label" size={20} color="#666" />
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => showDropdown('category', categories)}
          >
            <Text style={[styles.dropdownText, selectedValues.category && styles.selectedText]}>
              {selectedValues.category || t('voterInfo.selectCategory')}
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <Icon name="category" size={20} color="#666" />
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => showDropdown('casteCategory', casteCategories)}
          >
            <Text style={[styles.dropdownText, selectedValues.casteCategory && styles.selectedText]}>
              {selectedValues.casteCategory || t('voterInfo.selectCasteCategory')}
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <Icon name="flag" size={20} color="#666" />
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => showDropdown('party', parties)}
          >
            <Text style={[styles.dropdownText, selectedValues.party && styles.selectedText]}>
              {selectedValues.party || t('voterInfo.selectParty')}
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <Icon name="eco" size={20} color="#666" />
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => showDropdown('schemes', schemes)}
          >
            <Text style={[styles.dropdownText, selectedValues.schemes && styles.selectedText]}>
              {selectedValues.schemes || t('voterInfo.selectSchemes')}
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <Icon name="history" size={20} color="#666" />
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => showDropdown('history', histories)}
          >
            <Text style={[styles.dropdownText, selectedValues.history && styles.selectedText]}>
              {selectedValues.history || t('voterInfo.selectHistory')}
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <Icon name="feedback" size={20} color="#666" />
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => showDropdown('feedback', feedbacks)}
          >
            <Text style={[styles.dropdownText, selectedValues.feedback && styles.selectedText]}>
              {selectedValues.feedback || t('voterInfo.selectFeedback')}
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <Icon name="language" size={20} color="#666" />
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => showDropdown('language', languages)}
          >
            <Text style={[styles.dropdownText, selectedValues.language && styles.selectedText]}>
              {selectedValues.language || t('voterInfo.selectLanguage')}   
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <Icon name="note" size={20} color="#666" />
          <TextInput
            style={[styles.textInput, styles.remarksInput]}
            placeholder={t('voterInfo.enterRemarks')}
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            value={selectedValues.remarks}
            onChangeText={(text) => setSelectedValues(prev => ({ ...prev, remarks: text }))}
          />
        </View>
      </View>
    </View>
  );

  const renderFamilyTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('voterInfo.searchByEpicOrName')}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchAction}>
            <Icon name="person-search" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.emptyState}>
        <Icon name="family-restroom" size={64} color="#ccc" />
        <Text style={styles.emptyStateTitle}>{t('voterInfo.noFamilyMembersFound')}</Text>
        <Text style={styles.emptyStateSubtitle}>{t('voterInfo.searchByEpicToAddFamily')}</Text>
      </View>
    </View>
  );

  const renderFriendsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('voterInfo.searchByEpicOrName')}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchAction}>
            <Icon name="person-search" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.emptyState}>
        <Icon name="people" size={64} color="#ccc" />
        <Text style={styles.emptyStateTitle}>{t('voterInfo.noFriendsFound')}</Text>
        <Text style={styles.emptyStateSubtitle}>{t('voterInfo.searchByEpicOr')}</Text>
      </View>
    </View>
  );

  const renderShareTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.shareContainer, { paddingBottom: 6 }]}>
        <Text style={styles.sectionTitle}>{t('voterInfo.shareVoterInformation')}</Text>

        <View style={[styles.shareCard, { paddingVertical: 8 }] }>
          <View style={[styles.horizontalShareButtons, { justifyContent: 'space-around' }]}>
            <TouchableOpacity 
              style={[styles.horizontalShareButton, { width: 84 }]} 
              onPress={() => handleShare('whatsapp')}
            >
              <View style={styles.shareIconCircle}>
                <Icon name="chat" size={20} color="#25D366" />
              </View>
              <Text style={styles.horizontalShareButtonText} numberOfLines={1} ellipsizeMode="tail">WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.horizontalShareButton, { width: 64 }]} 
              onPress={() => handleShare('sms')}
            >
              <View style={styles.shareIconCircle}>
                <Icon name="message" size={20} color="#2196F3" />
              </View>
              <Text style={styles.horizontalShareButtonText} numberOfLines={1} ellipsizeMode="tail">SMS</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.horizontalShareButton, { width: 72 }]} 
              onPress={() => handleShare('general')}
            >
              <View style={styles.shareIconCircle}>
                <Icon name="share" size={20} color="#2196F3" />
              </View>
              <Text style={styles.horizontalShareButtonText} numberOfLines={1} ellipsizeMode="tail">Share</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.horizontalShareButton, { width: 64 }]} 
              onPress={() => handleShare('print')}
            >
              <View style={styles.shareIconCircle}>
                <Icon name="print" size={18} color="#666" />
              </View>
              <Text style={styles.horizontalShareButtonText} numberOfLines={1} ellipsizeMode="tail">Print</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.partSectionContainer}>
          <Text style={styles.partSectionTitle}>{t('voterInfo.partSectionInfo')}</Text>
          
          {partSectionInfo ? (
            <View style={styles.locationInfo}>
              <View style={styles.locationCard}>
                <Icon name="location-on" size={20} color="#1976D2" />
                <View style={styles.locationDetails}>
                  <Text style={styles.locationTitle}>{t('voterInfo.pollingStation')}</Text>
                  <Text style={styles.locationText}>{partSectionInfo.pollingStation.english}</Text>
                  <Text style={styles.locationTextTamil}>{partSectionInfo.pollingStation.tamil}</Text>
                </View>
              </View>

              <View style={styles.locationCard}>
                <Icon name="home" size={20} color="#1976D2" />
                <View style={styles.locationDetails}>
                  <Text style={styles.locationTitle}>{t('voterInfo.addressWard')}</Text>
                  <Text style={styles.locationText}>{partSectionInfo.address.english}</Text>
                  <Text style={styles.locationTextTamil}>{partSectionInfo.address.tamil}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.loadingInfo}>
              <Text style={styles.loadingInfoText}>{t('voterInfo.loadingPartSectionInfo')}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with back arrow */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => {
            try {
              router.back();
            } catch (e) {
              router.replace('/(tabs)/dashboard' as any);
            }
          }}
        >
          <Icon name="arrow-back" size={24} color="#1976D2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('voterInfo.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Voter Details Card */}
      <View style={styles.voterCard}>
          <View style={styles.voterHeader}>
            <Text style={styles.serialText} numberOfLines={1} ellipsizeMode="tail">
              S.No: <Text style={styles.blueText}>{voter.sr ?? (voter as any).Sr ?? (voter as any).serial ?? (voter as any).Serial ?? 1}</Text>
            </Text>
            <Text style={styles.sectionText} numberOfLines={1} ellipsizeMode="tail">
              Section: <Text style={styles.blueText}>{voter.Anubhag_number ?? (voter as any).Anubhag_number ?? (voter as any).section ?? 1}</Text>
            </Text>
            <Text style={styles.partText} numberOfLines={1} ellipsizeMode="tail">
              Part: <Text style={styles.blueText}>{voter.Part_no ?? (voter as any).PartNo ?? (voter as any).part_no ?? 1}</Text>
            </Text>
          </View>

        <View style={styles.voterContent}>
          <View style={styles.imageContainer}>
            {/* Actual voter photo placeholder - in a real app this would show the actual photo */}
            <View style={styles.imagePlaceholder}>
              <Icon name="person" size={32} color="#1976D2" />
              <Icon name="camera-alt" size={16} color="#1976D2" style={styles.cameraIcon} />
            </View>
            <View style={styles.epicContainer}>
              <Text style={styles.epicId}>{voter.Number}</Text>
            </View>
          </View>

          <View style={styles.voterDetails}>
            <Text style={styles.voterName}>{voter.Name}</Text>
            <Text style={styles.voterNameTamil}>{voter.NameTamil || voter.Name}</Text>
            <Text style={styles.relationName}>{voter['Father Name']}</Text>
            <Text style={styles.relationNameTamil}>{voter.RelationNameTamil || voter['Father Name']}</Text>
            <Text style={styles.address}>{t('dashboard.doorNo')} {voter.Door_No}</Text>
          </View>
        </View>

        <View style={styles.voterFooter}>
          <View style={styles.ageContainer}>
            <Icon 
              name="person" 
              size={16} 
              color={getGenderColor(voter.sex)} 
            />
            <Text style={styles.ageText}>{voter.age}</Text>
            <Text style={styles.relationType}>{voter.Relation}</Text>
          </View>
        </View>
      </View>

      {/* Horizontal Tab Buttons */}
      <View style={styles.horizontalTabContainer}>
        <TouchableOpacity 
          style={[styles.horizontalTab, activeTab === 'basic' && styles.activeHorizontalTab]} 
          onPress={() => handleTabPress('basic')}
        >
          <Text style={[styles.horizontalTabText, activeTab === 'basic' && styles.activeHorizontalTabText]}>
            {t('voterInfo.basic')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.horizontalTab, activeTab === 'family' && styles.activeHorizontalTab]} 
          onPress={() => handleTabPress('family')}
        >
          <Text style={[styles.horizontalTabText, activeTab === 'family' && styles.activeHorizontalTabText]}>
            {t('voterInfo.family')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.horizontalTab, activeTab === 'friends' && styles.activeHorizontalTab]} 
          onPress={() => handleTabPress('friends')}
        >
          <Text style={[styles.horizontalTabText, activeTab === 'friends' && styles.activeHorizontalTabText]}>
            {t('voterInfo.friends')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.horizontalTab, activeTab === 'share' && styles.activeHorizontalTab]} 
          onPress={() => handleTabPress('share')}
        >
          <Text style={[styles.horizontalTabText, activeTab === 'share' && styles.activeHorizontalTabText]}>
            {t('voterInfo.share')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content (scrollable) */}
  <ScrollView style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'basic' && renderBasicTab()}
        {activeTab === 'family' && renderFamilyTab()}
        {activeTab === 'friends' && renderFriendsTab()}
        {activeTab === 'share' && renderShareTab()}

        {/* Picker Modal */}
        {pickerVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{pickerTitle}</Text>
                <TouchableOpacity onPress={() => setPickerVisible(false)}>
                  <Icon name="close" size={22} color="#000" />
                </TouchableOpacity>
              </View>
              <View style={styles.modalSearchRow}>
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder={pickerTitle.replace(t('common.select'), t('common.search')).trim()}
                  placeholderTextColor="#999"
                  value={pickerSearch}
                  onChangeText={setPickerSearch}
                />
              </View>
              <ScrollView style={{ maxHeight: 460 }}>
                {pickerOptions
                  .filter(opt => {
                    const label = getOptionLabel(pickerField, opt);
                    return label.toLowerCase().includes(pickerSearch.toLowerCase());
                  })
                  .map((opt, idx) => {
                    const label = getOptionLabel(pickerField, opt);
                    return (
                      <TouchableOpacity
                        key={`${label}-${idx}`}
                        style={styles.modalItem}
                        onPress={() => {
                          setSelectedValues(prev => ({ ...prev, [pickerField]: label }));
                          setPickerVisible(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{label}</Text>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Save Button - Show only on basic tab */}
      {!pickerVisible && activeTab === 'basic' && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              !isFormFilled() && styles.disabledButton
            ]} 
            onPress={saveVoterInfo}
            disabled={!isFormFilled()}
          >
            <Text style={styles.saveButtonText}>
              {t('voterInfo.saveChanges')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    marginVertical: 20,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
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
  backButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  voterCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  voterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  blueText: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  serialText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'left',
  },
  sectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  partText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'right',
  },
  voterContent: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  imageContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  cameraIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  epicContainer: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  epicId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  voterDetails: {
    flex: 1,
  },
  voterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  voterNameTamil: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  relationName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  relationNameTamil: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    color: '#999',
  },
  voterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 5,
    marginRight: 5,
  },
  relationType: {
    fontSize: 12,
    color: '#666',
  },
  horizontalTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 10,
  },
  horizontalTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeHorizontalTab: {
    backgroundColor: '#1976D2',
  },
  horizontalTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeHorizontalTabText: {
    color: '#FFFFFF',
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    minWidth: 100,
  },
  inputValue: {
    fontSize: 14,
    color: '#000',
    marginLeft: 10,
    flex: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    marginLeft: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  remarksInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 14,
    color: '#999',
    flex: 1,
  },
  locationContainer: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: 10,
  },
  locationButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginRight: 5,
  },
  locationButtonText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fetchLocationButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1976D2',
    borderRadius: 8,
    marginLeft: 5,
  },
  fetchLocationButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  searchContainer: {
    marginVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 10,
  },
  searchAction: {
    padding: 8,
    marginLeft: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  shareContainer: {
    paddingVertical: 8,
  },
  shareCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  horizontalShareButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  horizontalShareButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    flex: 1,
    maxWidth: 80,
  },
  shareIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    alignSelf: 'center',
  },
  horizontalShareButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    flexWrap: 'wrap',
    maxWidth: 64,
  },
  partSectionContainer: {
    marginTop: 20,
  },
  partSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 15,
    textAlign: 'left',
  },
  locationInfo: {
    marginTop: 10,
  },
  loadingInfo: {
    padding: 20,
    alignItems: 'center',
  },
  loadingInfoText: {
    fontSize: 14,
    color: '#666',
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  locationDetails: {
    flex: 1,
    marginLeft: 10,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 5,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  locationTextTamil: {
    fontSize: 12,
    color: '#999',
  },
  contentContainer: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  bottomContainer: {
    padding: 20,
  },
  noChangesButton: {
    backgroundColor: '#9E9E9E',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  noChangesButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9E9E9E',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 35,
  },
  selectedText: {
    color: '#000',
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  modalSearchRow: {
    marginBottom: 10,
  },
  modalSearchInput: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    color: '#000',
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#000',
  },
});