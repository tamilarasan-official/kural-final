import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Image, ActivityIndicator, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_CONFIG } from '../../services/api/config';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ElectionDetailsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [electionData, setElectionData] = useState(null);
  
  // Dropdown states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showElectionTypeDropdown, setShowElectionTypeDropdown] = useState(false);
  const [showElectionBodyDropdown, setShowElectionBodyDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState('');
  
  // Dropdown options
  const categoryOptions = [t('Political'), t('Non-Political')];
  const electionTypeOptions = [t('General'), t('By-election')];
  const electionBodyOptions = [t('Union Body (MP)'), t('State Body (MLA)'), t('Urban Body'), t('Rural Body')];
  const statusOptions = [t('Yet to Start'), t('In-Progress'), t('Completed'), t('Cancelled')];
  
  // Indian states
  const indianStates = [
    t('Andhra Pradesh'), t('Arunachal Pradesh'), t('Assam'), t('Bihar'), t('Chhattisgarh'),
    t('Goa'), t('Gujarat'), t('Haryana'), t('Himachal Pradesh'), t('Jharkhand'), t('Karnataka'),
    t('Kerala'), t('Madhya Pradesh'), t('Maharashtra'), t('Manipur'), t('Meghalaya'), t('Mizoram'),
    t('Nagaland'), t('Odisha'), t('Punjab'), t('Rajasthan'), t('Sikkim'), t('Tamil Nadu'),
    t('Telangana'), t('Tripura'), t('Uttar Pradesh'), t('Uttarakhand'), t('West Bengal'),
    t('Andaman and Nicobar Islands'), t('Chandigarh'), t('Dadra and Nagar Haveli'),
    t('Daman and Diu'), t('Delhi'), t('Jammu and Kashmir'), t('Ladakh'), t('Lakshadweep'), t('Puducherry')
  ];
  
  // Form data state - using database field names (camelCase)
  const [formData, setFormData] = useState({
  electionId: '118',
  electionName: '118 - Thondamuthur',
  constituency: '118 - Thondamuthur',
    category: 'Political',
    electionType: 'General',
    electionBody: 'State Body (MLA)',
    country: 'India',
    state: 'Tamil Nadu',
    electionDate: '06-JAN-2025',
    status: 'In-Progress',
    completionDeadline: '',
    dateOfCounting: '',
    lastDateFillingNomination: '',
    lastDateWithdrawalNomination: '',
    partName: 'Part 1',
    anubhagName: 'Anubhag 1',
    anubhagNumber: '001',
    bhagNumber: '001',
    voterNumber: '12345',
    voterName: 'John Doe',
    fatherName: 'Robert Doe',
    relation: 'Son',
    age: '25',
    gender: 'Male',
    mobileNumber: '6379048464',
    address: '123 Main Street, Thondamuthur',
    photo: null,
    // Additional fields from database
    pcName: 'Pollachi',
    acName: 'Thondamuthur',
    urbanName: '',
    ruralName: '',
    electionDescription: '',
    gazetteNotification: '',
    scrutinyNomination: '',
    dateOfPoll: '',
    totalVoters: '',
    maleVoters: '',
    femaleVoters: '',
    transgenderVoters: '',
    totalBooths: '',
    totalAllBooths: '',
    pinkBooths: '',
    remarks: '',
  });

  // Load election data on component mount
  useEffect(() => {
    loadElectionData();
  }, []);

  // Helper functions
  const formatDate = (date: any) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  };

  const parseDate = (dateString: any) => {
    if (!dateString) return new Date();
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = new Date(parts[1] + ' 1, 2000').getMonth();
      const year = parseInt(parts[2]);
      return new Date(year, month, day);
    }
    return new Date();
  };

  const handleDropdownSelect = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Close all dropdowns
    setShowCategoryDropdown(false);
    setShowElectionTypeDropdown(false);
    setShowElectionBodyDropdown(false);
    setShowStateDropdown(false);
    setShowStatusDropdown(false);
  };

  const handleDateChange = (event: any, selectedDate: any) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      setFormData(prev => ({ ...prev, [currentDateField]: formattedDate }));
    }
  };

  const openDatePicker = (field: string) => {
    setCurrentDateField(field);
    setShowDatePicker(true);
  };

  // Load election data from API
  const loadElectionData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/elections`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const election = data.data[0]; // Get first election
          setElectionData(election);
          setFormData(prev => ({
            ...prev,
            electionId: election.electionId || '',
            electionName: election.electionName || '118 - Thondamuthur',
            constituency: election.constituency || '118 - Thondamuthur',
            category: election.category || 'Political',
            electionType: election.electionType || 'General',
            electionBody: election.electionBody || 'State Body (MLA)',
            country: election.country || 'India',
            state: election.state || 'Tamil Nadu',
            electionDate: election.electionDate || '06-JAN-2025',
            status: election.status || 'In-Progress',
            completionDeadline: election.completionDeadline || '',
            dateOfCounting: election.dateOfCounting || '',
            lastDateFillingNomination: election.lastDateFillingNomination || '',
            lastDateWithdrawalNomination: election.lastDateWithdrawalNomination || '',
            partName: election.partName || '',
            anubhagName: election.anubhagName || '',
            anubhagNumber: election.anubhagNumber || '',
            bhagNumber: election.bhagNumber || '',
            voterNumber: election.voterNumber || '',
            voterName: election.voterName || '',
            fatherName: election.fatherName || '',
            relation: election.relation || '',
            age: election.age?.toString() || '',
            gender: election.gender || '',
            mobileNumber: election.mobileNumber || '',
            address: election.address || '',
            photo: election.photo || null,
            pcName: election.pcName || 'Pollachi',
            acName: election.acName || 'Thondamuthur',
            urbanName: election.urbanName || '',
            ruralName: election.ruralName || '',
            electionDescription: election.electionDescription || '',
            gazetteNotification: election.gazetteNotification || '',
            scrutinyNomination: election.scrutinyNomination || '',
            dateOfPoll: election.dateOfPoll || '',
            totalVoters: election.totalVoters || '',
            maleVoters: election.maleVoters || '',
            femaleVoters: election.femaleVoters || '',
            transgenderVoters: election.transgenderVoters || '',
            totalBooths: election.totalBooths || '',
            totalAllBooths: election.totalAllBooths || '',
            pinkBooths: election.pinkBooths || '',
            remarks: election.remarks || '',
          }));
        }
      }
    } catch (error) {
      console.error('Error loading election data:', error);
      Alert.alert('Error', 'Failed to load election data');
    } finally {
      setLoading(false);
    }
  };

  // Save election data to API
  const saveElectionData = async () => {
    try {
      setLoading(true);
      const url = electionData ? 
        `${API_CONFIG.BASE_URL}/elections/${electionData._id}` : 
        `${API_CONFIG.BASE_URL}/elections`;
      
      const method = electionData ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age) || 0,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setElectionData(data.data);
        Alert.alert('Success', 'Election data saved successfully!');
        setIsEditing(false);
      } else {
        throw new Error('Failed to save election data');
      }
    } catch (error) {
      console.error('Error saving election data:', error);
      Alert.alert('Error', 'Failed to save election data');
    } finally {
      setLoading(false);
    }
  };

  // Handle image picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to upload photos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri as any);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle edit toggle
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Handle update
  const handleUpdate = () => {
    saveElectionData();
  };

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  if (loading && !electionData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>{t('election.loadingData')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('election.viewElection')}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Create Election */}
        <Text style={styles.stepTitle}>{t('election.step1Create')}</Text>

        {/* Election Picture Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('election.picture')}</Text>
          <View style={styles.imageSection}>
            <TouchableOpacity style={styles.profileImage} onPress={pickImage}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              ) : (
                <Text style={styles.profileIcon}>👤</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.uploadButtonText}>{t('election.uploadPhoto')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.uploadHint}>{t('election.uploadHint')}</Text>
        </View>

        {/* Category Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('election.category')}</Text>
          <TouchableOpacity 
            style={styles.inputField} 
            onPress={() => isEditing && setShowCategoryDropdown(true)}
            disabled={!isEditing}
          >
            <View style={styles.fieldTextContainer}>
              <Text style={formData.category ? styles.fieldValue : styles.placeholderText}>
                {formData.category || 'Select category'}
              </Text>
            </View>
            {isEditing && <Text style={styles.dropdownArrow}>▼</Text>}
          </TouchableOpacity>
        </View>

        {/* Election Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('election.information')}</Text>
          
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.type')}</Text>
            <TouchableOpacity 
              style={styles.inputField} 
              onPress={() => isEditing && setShowElectionTypeDropdown(true)}
              disabled={!isEditing}
            >
              <View style={styles.fieldTextContainer}>
                <Text style={formData.electionType ? styles.fieldValue : styles.placeholderText}>
                  {formData.electionType || 'Select election type'}
                </Text>
              </View>
              {isEditing && <Text style={styles.dropdownArrow}>▼</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.body')}</Text>
            <TouchableOpacity 
              style={styles.inputField} 
              onPress={() => isEditing && setShowElectionBodyDropdown(true)}
              disabled={!isEditing}
            >
              <View style={styles.fieldTextContainer}>
                <Text style={formData.electionBody ? styles.fieldValue : styles.placeholderText}>
                  {formData.electionBody || 'Select election body'}
                </Text>
              </View>
              {isEditing && <Text style={styles.dropdownArrow}>▼</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.country')}</Text>
            <View style={styles.inputField}>
              <View style={styles.fieldTextContainer}>
                <Text style={styles.fieldValue}>{formData.country}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Location Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('election.locationInfo')}</Text>
          
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.state')}</Text>
            <TouchableOpacity 
              style={styles.inputField} 
              onPress={() => isEditing && setShowStateDropdown(true)}
              disabled={!isEditing}
            >
              <View style={styles.fieldTextContainer}>
                <Text style={formData.state ? styles.fieldValue : styles.placeholderText}>
                  {formData.state || 'Select state'}
                </Text>
              </View>
              {isEditing && <Text style={styles.dropdownArrow}>▼</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.pcName')}</Text>
            <View style={styles.inputField}>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={formData.pcName}
                  onChangeText={(value: string) => handleInputChange('pcName', value)}
                  placeholder={t('election.enterPCName')}
                  placeholderTextColor="#999999"
                />
              ) : (
                <View style={styles.fieldTextContainer}>
                  <Text style={formData.pcName ? styles.fieldValue : styles.placeholderText}>
                    {formData.pcName || 'Enter PC name'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.acName')}</Text>
            <View style={styles.inputField}>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={formData.acName}
                  onChangeText={(value: string) => handleInputChange('acName', value)}
                  placeholder={t('election.enterACName')}
                  placeholderTextColor="#999999"
                />
              ) : (
                <View style={styles.fieldTextContainer}>
                  <Text style={formData.acName ? styles.fieldValue : styles.placeholderText}>
                    {formData.acName || 'Enter AC name'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.urbanName')}</Text>
            <View style={styles.inputField}>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={formData.urbanName}
                  onChangeText={(value: string) => handleInputChange('urbanName', value)}
                  placeholder={t('election.enterUrbanName')}
                  placeholderTextColor="#999999"
                />
              ) : (
                <View style={styles.fieldTextContainer}>
                  <Text style={formData.urbanName ? styles.fieldValue : styles.placeholderText}>
                    {formData.urbanName || 'Enter urban name'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.ruralName')}</Text>
            <View style={styles.inputField}>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={formData.ruralName}
                  onChangeText={(value: string) => handleInputChange('ruralName', value)}
                  placeholder={t('election.enterRuralName')}
                  placeholderTextColor="#999999"
                />
              ) : (
                <View style={styles.fieldTextContainer}>
                  <Text style={formData.ruralName ? styles.fieldValue : styles.placeholderText}>
                    {formData.ruralName || 'Enter rural name'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.name')}</Text>
            <View style={styles.inputField}>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={formData.electionName}
                  onChangeText={(value: string) => handleInputChange('electionName', value)}
                  placeholder={t('election.enterElectionName')}
                  placeholderTextColor="#999999"
                />
              ) : (
            <View style={styles.fieldTextContainer}>
              <Text style={formData.electionName ? styles.fieldValue : styles.placeholderText}>
                {formData.electionName || 'Enter election name'}
              </Text>
            </View>
              )}
            </View>
          </View>
        </View>

        {/* Election Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('election.details')}</Text>
          
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.description')}</Text>
            <View style={styles.inputField}>
              {isEditing ? (
                <TextInput
                  style={[styles.textInput, styles.textAreaField]}
                  value={formData.electionDescription}
                  onChangeText={(value: string) => handleInputChange('electionDescription', value)}
                  placeholder={t('election.enterDescription')}
                  placeholderTextColor="#999999"
                  multiline={true}
                  numberOfLines={3}
                />
              ) : (
                <View style={styles.fieldTextContainer}>
                  <Text style={formData.electionDescription ? styles.fieldValue : styles.placeholderText}>
                    {formData.electionDescription || 'Enter election description'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.date')}</Text>
            <TouchableOpacity 
              style={styles.inputField} 
              onPress={() => isEditing && openDatePicker('electionDate')}
              disabled={!isEditing}
            >
              <View style={styles.fieldTextContainer}>
                <Text style={formData.electionDate ? styles.fieldValue : styles.placeholderText}>
                  {formData.electionDate || 'Select election date'}
                </Text>
              </View>
              {isEditing && <Text style={styles.calendarIcon}>📅</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.status')}</Text>
            <TouchableOpacity 
              style={styles.inputField} 
              onPress={() => isEditing && setShowStatusDropdown(true)}
              disabled={!isEditing}
            >
              <View style={styles.fieldTextContainer}>
                <Text style={formData.status ? styles.fieldValue : styles.placeholderText}>
                  {formData.status || 'Select status'}
                </Text>
              </View>
              {isEditing && <Text style={styles.dropdownArrow}>▼</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Booth Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('election.boothInfo')}</Text>
          
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.totalBooths')}</Text>
            <View style={styles.inputField}>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={formData.totalBooths}
                  onChangeText={(value: string) => handleInputChange('totalBooths', value)}
                  placeholder={t('election.enterTotalBooths')}
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                />
              ) : (
                <View style={styles.fieldTextContainer}>
                  <Text style={formData.totalBooths ? styles.fieldValue : styles.placeholderText}>
                    {formData.totalBooths || 'Enter total booths'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.totalAllBooths')}</Text>
            <View style={styles.inputField}>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={formData.totalAllBooths}
                  onChangeText={(value: string) => handleInputChange('totalAllBooths', value)}
                  placeholder={t('election.enterTotalAllBooths')}
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                />
              ) : (
                <View style={styles.fieldTextContainer}>
                  <Text style={formData.totalAllBooths ? styles.fieldValue : styles.placeholderText}>
                    {formData.totalAllBooths || 'Enter total all booths'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.pinkBooths')}</Text>
            <View style={styles.inputField}>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={formData.pinkBooths}
                  onChangeText={(value: string) => handleInputChange('pinkBooths', value)}
                  placeholder={t('election.enterPinkBooths')}
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                />
              ) : (
                <View style={styles.fieldTextContainer}>
                  <Text style={formData.pinkBooths ? styles.fieldValue : styles.placeholderText}>
                    {formData.pinkBooths || 'Enter pink booths count'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Voter Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('election.voterInfo')}</Text>
          
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.totalVoters')}</Text>
            <View style={styles.inputField}>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={formData.totalVoters}
                  onChangeText={(value: string) => handleInputChange('totalVoters', value)}
                  placeholder={t('election.enterTotalVoters')}
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                />
              ) : (
                <View style={styles.fieldTextContainer}>
                  <Text style={formData.totalVoters ? styles.fieldValue : styles.placeholderText}>
                    {formData.totalVoters || 'Enter total voters'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.maleVoters')}</Text>
            <View style={styles.inputField}>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={formData.maleVoters}
                  onChangeText={(value: string) => handleInputChange('maleVoters', value)}
                  placeholder={t('election.enterMaleVoters')}
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                />
              ) : (
                <View style={styles.fieldTextContainer}>
                  <Text style={formData.maleVoters ? styles.fieldValue : styles.placeholderText}>
                    {formData.maleVoters || 'Enter male voters count'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.femaleVoters')}</Text>
            <View style={styles.inputField}>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={formData.femaleVoters}
                  onChangeText={(value: string) => handleInputChange('femaleVoters', value)}
                  placeholder={t('election.enterFemaleVoters')}
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                />
              ) : (
                <View style={styles.fieldTextContainer}>
                  <Text style={formData.femaleVoters ? styles.fieldValue : styles.placeholderText}>
                    {formData.femaleVoters || 'Enter female voters count'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.transgenderVoters')}</Text>
            <View style={styles.inputField}>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={formData.transgenderVoters}
                  onChangeText={(value: string) => handleInputChange('transgenderVoters', value)}
                  placeholder={t('election.enterTransgenderVoters')}
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                />
              ) : (
                <View style={styles.fieldTextContainer}>
                  <Text style={formData.transgenderVoters ? styles.fieldValue : styles.placeholderText}>
                    {formData.transgenderVoters || 'Enter transgender voters count'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Remarks Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('election.remarks')}</Text>
          
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.remarks')}</Text>
            <View style={[styles.inputField, styles.textAreaField]}>
              {isEditing ? (
                <TextInput
                  style={[styles.textInput, styles.textAreaField]}
                  value={formData.remarks}
                  onChangeText={(value: string) => handleInputChange('remarks', value)}
                  placeholder={t('election.enterRemarks')}
                  placeholderTextColor="#999999"
                  multiline={true}
                  numberOfLines={4}
                />
              ) : (
                <View style={styles.fieldTextContainer}>
                  <Text style={formData.remarks ? styles.fieldValue : styles.placeholderText}>
                    {formData.remarks || 'Enter remarks'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Calendar of Event Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('election.calendarOfEvent')}</Text>
          
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.gazetteNotification')}</Text>
            <TouchableOpacity 
              style={styles.inputField} 
              onPress={() => isEditing && openDatePicker('gazetteNotification')}
              disabled={!isEditing}
            >
              <View style={styles.fieldTextContainer}>
                <Text style={formData.gazetteNotification ? styles.fieldValue : styles.placeholderText}>
                  {formData.gazetteNotification || 'Select date'}
                </Text>
              </View>
              {isEditing && <Text style={styles.calendarIcon}>📅</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.lastDateFillingNomination')}</Text>
            <TouchableOpacity 
              style={styles.inputField} 
              onPress={() => isEditing && openDatePicker('lastDateFillingNomination')}
              disabled={!isEditing}
            >
              <View style={styles.fieldTextContainer}>
                <Text style={formData.lastDateFillingNomination ? styles.fieldValue : styles.placeholderText}>
                  {formData.lastDateFillingNomination || 'Select date'}
                </Text>
              </View>
              {isEditing && <Text style={styles.calendarIcon}>📅</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.scrutinyNomination')}</Text>
            <TouchableOpacity 
              style={styles.inputField} 
              onPress={() => isEditing && openDatePicker('scrutinyNomination')}
              disabled={!isEditing}
            >
              <View style={styles.fieldTextContainer}>
                <Text style={formData.scrutinyNomination ? styles.fieldValue : styles.placeholderText}>
                  {formData.scrutinyNomination || 'Select date'}
                </Text>
              </View>
              {isEditing && <Text style={styles.calendarIcon}>📅</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.lastDateWithdrawalNomination')}</Text>
            <TouchableOpacity 
              style={styles.inputField} 
              onPress={() => isEditing && openDatePicker('lastDateWithdrawalNomination')}
              disabled={!isEditing}
            >
              <View style={styles.fieldTextContainer}>
                <Text style={formData.lastDateWithdrawalNomination ? styles.fieldValue : styles.placeholderText}>
                  {formData.lastDateWithdrawalNomination || 'Select date'}
                </Text>
              </View>
              {isEditing && <Text style={styles.calendarIcon}>📅</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.dateOfPoll')}</Text>
            <TouchableOpacity 
              style={styles.inputField} 
              onPress={() => isEditing && openDatePicker('dateOfPoll')}
              disabled={!isEditing}
            >
              <View style={styles.fieldTextContainer}>
                <Text style={formData.dateOfPoll ? styles.fieldValue : styles.placeholderText}>
                  {formData.dateOfPoll || 'Select date'}
                </Text>
              </View>
              {isEditing && <Text style={styles.calendarIcon}>📅</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.dateOfCounting')}</Text>
            <TouchableOpacity 
              style={styles.inputField} 
              onPress={() => isEditing && openDatePicker('dateOfCounting')}
              disabled={!isEditing}
            >
              <View style={styles.fieldTextContainer}>
                <Text style={formData.dateOfCounting ? styles.fieldValue : styles.placeholderText}>
                  {formData.dateOfCounting || 'Select date'}
                </Text>
              </View>
              {isEditing && <Text style={styles.calendarIcon}>📅</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('election.completionDeadline')}</Text>
            <TouchableOpacity 
              style={styles.inputField} 
              onPress={() => isEditing && openDatePicker('completionDeadline')}
              disabled={!isEditing}
            >
              <View style={styles.fieldTextContainer}>
                <Text style={formData.completionDeadline ? styles.fieldValue : styles.placeholderText}>
                  {formData.completionDeadline || 'Select date'}
                </Text>
              </View>
              {isEditing && <Text style={styles.calendarIcon}>📅</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.bottomButton}>
        {!isEditing ? (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>{t('election.edit')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>{t('election.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
              <Text style={styles.updateButtonText}>{t('election.update')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Dropdown Modals */}
      {/* Category Dropdown */}
      <Modal visible={showCategoryDropdown} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          onPress={() => setShowCategoryDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownTitle}>{t('election.selectCategory')}</Text>
            <FlatList
              data={categoryOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleDropdownSelect('category', item)}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Election Type Dropdown */}
      <Modal visible={showElectionTypeDropdown} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          onPress={() => setShowElectionTypeDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownTitle}>{t('election.selectType')}</Text>
            <FlatList
              data={electionTypeOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleDropdownSelect('electionType', item)}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Election Body Dropdown */}
      <Modal visible={showElectionBodyDropdown} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          onPress={() => setShowElectionBodyDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownTitle}>{t('election.selectBody')}</Text>
            <FlatList
              data={electionBodyOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleDropdownSelect('electionBody', item)}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* State Dropdown */}
      <Modal visible={showStateDropdown} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          onPress={() => setShowStateDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownTitle}>{t('election.selectState')}</Text>
            <FlatList
              data={indianStates}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleDropdownSelect('state', item)}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Status Dropdown */}
      <Modal visible={showStatusDropdown} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          onPress={() => setShowStatusDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownTitle}>{t('election.selectStatus')}</Text>
            <FlatList
              data={statusOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleDropdownSelect('status', item)}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={parseDate(formData[currentDateField])}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    backgroundColor: '#1976D2',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  closeIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 15,
  },
  imageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 15,
  },
  profileIcon: {
    fontSize: 40,
    color: '#666666',
  },
  selectedImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  uploadButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadHint: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  fieldGroup: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  inputField: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textAreaField: {
    minHeight: 80,
    paddingTop: 12,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999999',
  },
  fieldValue: {
    fontSize: 14,
    color: '#333333',
  },
  textInput: {
    fontSize: 14,
    color: '#333333',
    padding: 0,
  },
  bottomButton: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  editButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#1976D2',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginLeft: 8,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Dropdown styles
  dropdownArrow: {
    fontSize: 12,
    color: '#666666',
  },
  calendarIcon: {
    fontSize: 16,
    color: '#666666',
  },
  fieldTextContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    maxHeight: 300,
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
    textAlign: 'center',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333333',
  },
});
