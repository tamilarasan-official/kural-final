import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
  const router = useRouter();
  const { voterData, partNumber } = useLocalSearchParams();
  const [voter, setVoter] = useState<Voter | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
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

  // Generic picker modal state (replaces Alert with more than 3 options)
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerField, setPickerField] = useState<string>('');
  const [pickerTitle, setPickerTitle] = useState<string>('Select');
  const [pickerOptions, setPickerOptions] = useState<any[]>([]);
  const [pickerSearch, setPickerSearch] = useState<string>('');

  useEffect(() => {
    if (voterData) {
      try {
        const parsedVoter = JSON.parse(voterData as string);
        console.log('Parsed voter data:', parsedVoter);
        setVoter(parsedVoter);
        // Fetch Part & Section Info when voter data is loaded
        if (parsedVoter['Part Name']) {
          fetchPartSectionInfo(parsedVoter['Part Name'], parsedVoter);
        }
        // Load existing voter info and dropdown options
        loadVoterAdditionalInfo(parsedVoter._id);
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
          english: `Part ${voterData?.Part_no || voter?.Part_no} - ${partName}`,
          tamil: `பகுதி ${voterData?.Part_no || voter?.Part_no} - ${partName}`
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
        Alert.alert('Success', 'Voter information saved successfully');
        console.log('Voter info saved successfully:', response.data);
      } else {
        Alert.alert('Error', 'Failed to save voter information');
      }
    } catch (error) {
      console.error('Error saving voter info:', error);
      Alert.alert('Error', 'Failed to save voter information');
    }
  };

  const showDropdown = (field: string, options: any[]) => {
    console.log(`showDropdown called for ${field} with ${options?.length || 0} options`);
    if (!options || options.length === 0) {
      Alert.alert('No Options', `No options available for ${field} field`);
      return;
    }

    setPickerField(field);
    const titleMap: any = {
      religion: 'Select Religion',
      caste: 'Select Caste',
      subCaste: 'Select Sub-Caste',
      category: 'Select Category',
      casteCategory: 'Caste Category',
      party: 'Select Party',
      schemes: 'Select Schemes',
      history: 'Select History',
      feedback: 'Select Feedback',
      language: 'Select Language'
    };
    setPickerTitle(titleMap[field] || 'Select');
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
    const message = `Voter Info:\nName: ${voter.Name}\nEPIC: ${voter.Number}\nPart: ${voter.Part_no}`;
    
    // Check if mobile number is available for WhatsApp, SMS, and Share
    if ((type === 'whatsapp' || type === 'sms' || type === 'share') && (!mobileNumber || mobileNumber.trim() === '')) {
      Alert.alert('No Mobile Number', 'No mobile number is there for this voter');
      return;
    }
    
    switch (type) {
      case 'whatsapp':
        if (mobileNumber) {
          // Open WhatsApp with the voter's mobile number
          const whatsappUrl = `whatsapp://send?phone=${mobileNumber}&text=${encodeURIComponent(message)}`;
          // In a real app, you would use Linking.openURL(whatsappUrl)
          Alert.alert('WhatsApp', `Opening WhatsApp for ${mobileNumber}`);
        }
        break;
      case 'sms':
        if (mobileNumber) {
          // Open SMS with the voter's mobile number
          const smsUrl = `sms:${mobileNumber}?body=${encodeURIComponent(message)}`;
          // In a real app, you would use Linking.openURL(smsUrl)
          Alert.alert('SMS', `Opening SMS for ${mobileNumber}`);
        }
        break;
      case 'general':
        if (mobileNumber) {
          // General sharing functionality
          Alert.alert('Share', `Sharing voter info for ${mobileNumber}`);
        }
        break;
      case 'print':
        Alert.alert('Print', 'Print functionality');
        break;
    }
  };

  // removed emoji-based gender icon; using vector icons inline

  const getGenderColor = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'male':
        return '#4CAF50';
      case 'female':
        return '#E91E63';
      default:
        return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Loading voter details...</Text>
      </View>
    );
  }

  if (!voter) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={48} color="#f44336" />
        <Text style={styles.errorText}>Voter not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderBasicTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <View style={styles.inputRow}>
          <Icon name="calendar-today" size={20} color="#666" />
          <TouchableOpacity
            style={[styles.dropdownButton, { borderWidth: 1, borderColor: '#E0E0E0' }]}
            onPress={() => setShowDobPicker(true)}
          >
            <Text style={styles.dropdownText}>
              {selectedValues.dob ? selectedValues.dob : 'Select Date of Birth'}
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
            placeholder="Enter Mobile Number"
            placeholderTextColor="#999"
            value={voter['Mobile No'] || ''}
            editable={false}
          />
        </View>

        <View style={styles.inputRow}>
          <Icon name="message" size={20} color="#25D366" />
          <TextInput
            style={styles.textInput}
            placeholder="Enter Whatsapp Number"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputRow}>
          <Icon name="email" size={20} color="#666" />
          <TextInput
            style={styles.textInput}
            placeholder="Enter Email"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputRow}>
          <Icon name="location-on" size={20} color="#666" />
          <View style={styles.locationContainer}>
            <TouchableOpacity style={styles.locationButton}>
              <Text style={styles.locationButtonText}>No location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fetchLocationButton}>
              <Text style={styles.fetchLocationButtonText}>Fetch Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        
        <View style={styles.inputRow}>
          <Icon name="fingerprint" size={20} color="#666" />
          <TextInput
            style={styles.textInput}
            placeholder="Enter Aadhar Number"
            placeholderTextColor="#999"
            value={selectedValues.aadhar}
            onChangeText={(text) => setSelectedValues(prev => ({ ...prev, aadhar: text }))}
          />
        </View>

        <View style={styles.inputRow}>
          <Icon name="account-balance" size={20} color="#666" />
          <TextInput
            style={styles.textInput}
            placeholder="Enter Pan Number"
            placeholderTextColor="#999"
            value={selectedValues.pan}
            onChangeText={(text) => setSelectedValues(prev => ({ ...prev, pan: text }))}
          />
        </View>

        <View style={styles.inputRow}>
          <Icon name="card-membership" size={20} color="#666" />
          <TextInput
            style={styles.textInput}
            placeholder="Enter Membership Number"
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
              {selectedValues.religion || 'Select Religion'}
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
              {selectedValues.caste || 'Select Caste'}
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
              {selectedValues.subCaste || 'Select Sub-Caste'}
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
              {selectedValues.category || 'Select Category'}
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
              {selectedValues.casteCategory || 'Select Caste Category'}
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
              {selectedValues.party || 'Select Party'}
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
              {selectedValues.schemes || 'Select Schemes'}
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
              {selectedValues.history || 'Select History'}
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
              {selectedValues.feedback || 'Select Feedback'}
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
              {selectedValues.language || 'Select Language'}
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <Icon name="note" size={20} color="#666" />
          <TextInput
            style={[styles.textInput, styles.remarksInput]}
            placeholder="Enter Remarks"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            value={selectedValues.remarks}
            onChangeText={(text) => setSelectedValues(prev => ({ ...prev, remarks: text }))}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderFamilyTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by EPIC number or name"
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
        <Text style={styles.emptyStateTitle}>No family members found</Text>
        <Text style={styles.emptyStateSubtitle}>Search by EPIC number to add family</Text>
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
            placeholder="Search by EPIC number or name"
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
        <Text style={styles.emptyStateTitle}>No friends Found</Text>
        <Text style={styles.emptyStateSubtitle}>Search by EPIC number or</Text>
      </View>
    </View>
  );

  const renderShareTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.shareContainer}>
        <Text style={styles.sectionTitle}>Share Voter Information</Text>
        
        <View style={styles.shareButtons}>
          <TouchableOpacity 
            style={styles.shareButton} 
            onPress={() => handleShare('whatsapp')}
          >
            <Icon name="chat" size={24} color="#25D366" />
            <Text style={styles.shareButtonText}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shareButton} 
            onPress={() => handleShare('sms')}
          >
            <Icon name="message" size={24} color="#2196F3" />
            <Text style={styles.shareButtonText}>SMS</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shareButton} 
            onPress={() => handleShare('general')}
          >
            <Icon name="share" size={24} color="#2196F3" />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shareButton} 
            onPress={() => handleShare('print')}
          >
            <Icon name="print" size={24} color="#666" />
            <Text style={styles.shareButtonText}>Take Print</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.partSectionContainer}>
          <Text style={styles.partSectionTitle}>Part & Section Info</Text>
          
          {partSectionInfo ? (
            <>
              <View style={styles.locationCard}>
                <Icon name="location-on" size={20} color="#666" />
                <View style={styles.locationDetails}>
                  <Text style={styles.locationTitle}>Polling Station</Text>
                  <Text style={styles.locationText}>{partSectionInfo.pollingStation.english}</Text>
                  <Text style={styles.locationTextTamil}>{partSectionInfo.pollingStation.tamil}</Text>
                </View>
              </View>

              <View style={styles.locationCard}>
                <Icon name="home" size={20} color="#666" />
                <View style={styles.locationDetails}>
                  <Text style={styles.locationTitle}>Address/Ward</Text>
                  <Text style={styles.locationText}>{partSectionInfo.address.english}</Text>
                  <Text style={styles.locationTextTamil}>{partSectionInfo.address.tamil}</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.loadingInfo}>
              <Text style={styles.loadingInfoText}>Loading Part & Section Info...</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#1976D2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voter Info</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Voter Details Card */}
      <View style={styles.voterCard}>
        <View style={styles.voterHeader}>
          <Icon name="star" size={16} color="#E91E63" />
          <Text style={styles.serialText}>Serial : {voter.sr}</Text>
          <Text style={styles.sectionText}>Section : 1</Text>
          <Text style={styles.partText}>Part : {voter.Part_no}</Text>
        </View>

        <View style={styles.voterContent}>
          <View style={styles.imageContainer}>
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
            <Text style={styles.voterNameTamil}>பாப்பாத்தி வரதராஜன்</Text>
            <Text style={styles.relationName}>{voter['Father Name']}</Text>
            <Text style={styles.relationNameTamil}>காளப்பகவுடர்</Text>
            <Text style={styles.address}>Door No {voter.Door_No}</Text>
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

      {/* Navigation Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'basic' && styles.activeTab]} 
          onPress={() => handleTabPress('basic')}
        >
          <Icon 
            name="person" 
            size={20} 
            color={activeTab === 'basic' ? '#fff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'basic' && styles.activeTabText]}>
            Basic
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'family' && styles.activeTab]} 
          onPress={() => handleTabPress('family')}
        >
          <Icon 
            name="family-restroom" 
            size={20} 
            color={activeTab === 'family' ? '#fff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'family' && styles.activeTabText]}>
            Family
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]} 
          onPress={() => handleTabPress('friends')}
        >
          <Icon 
            name="people" 
            size={20} 
            color={activeTab === 'friends' ? '#fff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'share' && styles.activeTab]} 
          onPress={() => handleTabPress('share')}
        >
          <Icon 
            name="share" 
            size={20} 
            color={activeTab === 'share' ? '#fff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'share' && styles.activeTabText]}>
            Share
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
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
                placeholder={pickerTitle.replace('Select', 'Search').trim()}
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

      {/* Bottom Action Button */}
      {!pickerVisible && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={saveVoterInfo}>
            <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    marginVertical: 20,
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
  headerBackButton: {
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
    margin: 20,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  voterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  serialText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 5,
  },
  sectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 10,
  },
  partText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 10,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#1976D2',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
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
    paddingVertical: 10,
  },
  shareButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  shareButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    minWidth: 80,
  },
  shareButtonText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  locationInfo: {
    marginTop: 10,
  },
  partSectionContainer: {
    marginTop: 20,
  },
  partSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
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
  },
  locationDetails: {
    flex: 1,
    marginLeft: 10,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
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
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
