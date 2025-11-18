import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRole } from '../contexts/RoleContext';
import ScreenWrapper from '../components/ScreenWrapper';
import { voterAPI } from '../../services/api/voter';
import { voterFieldAPI } from '../../services/api/voterField';

export default function VotersScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { userData } = useRole();
  
  // Helper to safely extract value from objects or primitives
  const safeValue = (field: any): string | number => {
    if (!field) return '';
    
    // Handle {english, tamil} structure
    if (typeof field === 'object' && field.english !== undefined) {
      return field.english || field.tamil || '';
    }
    
    // Handle {value, visible} structure
    if (typeof field === 'object' && field.value !== undefined) {
      // If value is an object with english/tamil, extract it
      if (typeof field.value === 'object') {
        return field.value.english || field.value.tamil || '';
      }
      return field.value || '';
    }
    
    // Handle plain objects by returning empty string
    if (typeof field === 'object') {
      return '';
    }
    
    return String(field || '');
  };
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [voters, setVoters] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPageModal, setShowPageModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All Voters');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVoters, setTotalVoters] = useState(0);
  const ITEMS_PER_PAGE = 50;
  const [newVoter, setNewVoter] = useState({
    voterId: '',
    nameEnglish: '',
    nameTamil: '',
    dob: '',
    address: '',
    fatherName: '',
    doorNumber: '',
    fatherless: false,
    guardian: '',
    age: '',
    gender: '',
    mobile: '',
    email: '',
    aadhar: '',
    pan: '',
    religion: '',
    caste: '',
    subcaste: '',
  });
  
  // Dynamic voter fields state
  const [voterFields, setVoterFields] = useState<any[]>([]);
  const [voterFieldsLoading, setVoterFieldsLoading] = useState(false);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, any>>({});

  const loadVoters = useCallback(async (page: number = 1) => {
      try {
        setLoading(true);
        let boothId = userData?.booth_id || '';
        let aciId = userData?.aci_id || '';
        
        // Fallback: Load from AsyncStorage if userData not available
        if (!boothId || !aciId) {
          const savedUserData = await AsyncStorage.getItem('userData');
          if (savedUserData) {
            const parsed = JSON.parse(savedUserData);
            boothId = parsed.booth_id || '';
            aciId = parsed.aci_id || '';
          }
        }
        
        console.log('🔍 Voters Screen - Loading voters for:', { aciId, boothId }, 'Page:', page);
        console.log('🔍 Voters Screen - userData:', JSON.stringify(userData, null, 2));
        
        if (aciId && boothId) {
          const aciIdStr = String(aciId);
          const boothIdStr = String(boothId);
          // Load voters by booth ID with server-side pagination
          const response = await voterAPI.getVotersByBoothId(aciIdStr, boothIdStr, { 
            page: page,
            limit: ITEMS_PER_PAGE 
          });
          console.log('📊 Voters Screen - API Response:', response);
          
          if (response?.success) {
            // Handle 'voters' response format
            const votersArray = Array.isArray(response.voters) ? response.voters : [];
            
            // Debug: Log first voter to see data structure
            if (votersArray.length > 0) {
              console.log('🔍 First voter data:', JSON.stringify(votersArray[0], null, 2));
              console.log('🔍 First voter name type:', typeof votersArray[0].name);
              console.log('🔍 First voter name value:', votersArray[0].name);
            }
            
            // Set voters for current page
            setVoters(votersArray);
            
            // Update pagination info from server response
            if (response.pagination) {
              setTotalPages(response.pagination.totalPages || 1);
              setTotalVoters(response.pagination.totalVoters || 0);
              setCurrentPage(response.pagination.currentPage || page);
            }
          } else {
            setVoters([]);
            setTotalPages(1);
            setTotalVoters(0);
          }
        }
      } catch (error) {
        console.error('Failed to load voters:', error);
        Alert.alert('Error', 'Failed to load voters. Please try again.');
        setVoters([]);
        setTotalPages(1);
        setTotalVoters(0);
      } finally {
        setLoading(false);
      }
    }, [userData]);

  useEffect(() => {
    loadVoters(1);
  }, [loadVoters]);

  /**
   * Load dynamic voter fields from backend
   * Only fetches fields where visible === true
   */
  const loadVoterFields = async () => {
    try {
      setVoterFieldsLoading(true);
      const response = await voterFieldAPI.getAllVisibleFields();
      
      if (response.success && Array.isArray(response.data)) {
        console.log('✅ Loaded voter fields:', response.data);
        setVoterFields(response.data);
        
        // Initialize dynamic field values
        const initialValues: Record<string, any> = {};
        response.data.forEach((field: any) => {
          initialValues[field.name] = '';
        });
        setDynamicFieldValues(initialValues);
      } else {
        console.log('⚠️ No voter fields returned or invalid response:', response);
        setVoterFields([]);
      }
    } catch (error) {
      console.error('Error loading voter fields:', error);
      setVoterFields([]);
    } finally {
      setVoterFieldsLoading(false);
    }
  };

  // Load voter fields when add modal opens
  useEffect(() => {
    if (showAddModal) {
      loadVoterFields();
    }
  }, [showAddModal]);

  // Reload voters when screen comes into focus (e.g., after navigating back from detail screen)
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Screen focused - Reloading voters for page:', currentPage);
      loadVoters(currentPage);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage])
  );

  // Filter voters based on search query and selected filter
  const filteredVoters = voters.filter(voter => {
    // Apply search filter - support both old and new field names
    const voterName = voter.name?.english || voter.name?.tamil || voter.Name || '';
    const voterNumber = voter.voterID || voter.Number || voter['EPIC No'] || '';
    const voterMobile = String(voter.mobile || voter.phoneNumber || '');
    
    const matchesSearch = searchQuery.trim() === '' || 
      voterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voterNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voterMobile.includes(searchQuery);
    
    if (!matchesSearch) return false;

    // Apply dropdown filter
    const age = parseInt(voter.age || voter.Age) || 0;
    const voterGender = voter.gender || voter.sex || '';
    
    switch (selectedFilter) {
      case 'All Voters':
        return true;
      case 'Verified':
        return voter.verified === true || voter.status === 'verified';
      case 'Pending':
        return voter.verified === false || voter.status === 'pending' || !voter.verified;
      case 'Age 60+':
        return age >= 60 && age < 80;
      case 'Age 80+':
        return age >= 80;
      case 'Transgender':
        return voterGender.toLowerCase() === 'transgender' || voterGender.toLowerCase() === 'others' || voter.specialCategories?.includes('Transgender');
      case 'Fatherless':
        return voter.specialCategories?.includes('Fatherless') || false;
      case 'Overseas':
        return voter.specialCategories?.includes('Overseas') || false;
      case 'Other':
        return voter.specialCategories?.includes('Other') || false;
      default:
        return true;
    }
  });
  
  console.log(`🔍 Voters Screen - Total voters: ${voters.length}, Filtered: ${filteredVoters.length}, Search: "${searchQuery}", Filter: ${selectedFilter}`);

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setShowDropdown(false);
  };

  const loadPage = async (pageNumber: number) => {
    setShowPageModal(false);
    await loadVoters(pageNumber);
  };

  // Helper function to clear the add voter form
  const clearAddVoterForm = () => {
    setNewVoter({
      voterId: '',
      nameEnglish: '',
      nameTamil: '',
      dob: '',
      address: '',
      fatherName: '',
      doorNumber: '',
      fatherless: false,
      guardian: '',
      age: '',
      gender: '',
      mobile: '',
      email: '',
      aadhar: '',
      pan: '',
      religion: '',
      caste: '',
      subcaste: '',
    });
    // Clear dynamic field values
    setDynamicFieldValues({});
  };

  // Helper function to close modal and clear form
  const closeAddModal = () => {
    setShowAddModal(false);
    clearAddVoterForm();
  };

  // Helper function to convert DD/MM/YYYY to ISO format YYYY-MM-DD
  const convertToISO = (dob: string): string | undefined => {
    if (!dob || dob.trim() === '') return undefined;
    try {
      const [day, month, year] = dob.split('/');
      if (!day || !month || !year) return undefined;
      // Return ISO format
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch (error) {
      console.error('Error converting DOB:', error);
      return undefined;
    }
  };

  const handleAddVoter = async () => {
    // Validate required fields
    if (!newVoter.voterId || !newVoter.nameEnglish || !newVoter.age || !newVoter.gender || !newVoter.address) {
      Alert.alert('Validation Error', 'Please fill all required fields (Voter ID, Name, Age, Gender, Address)');
      return;
    }

    try {
      // Get booth details from userData
      const boothId = userData?.booth_id || '';
      const aciId = userData?.aci_id || '';
      const aciName = userData?.aci_name || '';
      
      // Extract booth name - if boothId already has BOOTH prefix, don't add it again
      const boothName = userData?.boothname || userData?.boothAllocation || 
        (boothId.startsWith('BOOTH') ? boothId : `BOOTH${boothId}`);
      
      // Extract numeric booth number from boothId (e.g., "BOOTH001" -> 1)
      const numericPart = boothId.replace(/[^0-9]/g, '');
      const boothNumber = numericPart ? parseInt(numericPart, 10) : 1;
      
      if (!boothId || !aciId) {
        Alert.alert('Error', 'Booth allocation not found. Please contact administrator.');
        return;
      }

      console.log('Adding voter with data:', {
        voterId: newVoter.voterId,
        boothId,
        boothNumber,
        aciId,
        boothName,
        aciName
      });

      const voterPayload = {
        voterId: newVoter.voterId,
        nameEnglish: newVoter.nameEnglish,
        nameTamil: newVoter.nameTamil,
        dob: convertToISO(newVoter.dob),
        address: newVoter.address,
        fatherName: newVoter.fatherName,
        doorNumber: newVoter.doorNumber,
        fatherless: newVoter.fatherless,
        guardian: newVoter.guardian,
        age: newVoter.age,
        gender: newVoter.gender,
        mobile: newVoter.mobile,
        email: newVoter.email,
        aadhar: newVoter.aadhar,
        pan: newVoter.pan,
        religion: newVoter.religion,
        caste: newVoter.caste,
        subcaste: newVoter.subcaste,
        booth_id: boothId,
        boothname: boothName,
        boothno: boothNumber,
        aci_id: String(aciId),
        aci_name: aciName,
        // Merge dynamic field values
        ...dynamicFieldValues,
      };

      console.log('📤 Full voter payload:', JSON.stringify(voterPayload, null, 2));

      // Call API to create voter with all fields
      const response = await voterAPI.createVoter(voterPayload);

      if (response.success) {
        Alert.alert('Success', 'Voter added successfully');
        closeAddModal();  // Close modal and clear form
        
        // Reload voters
        loadVoters(currentPage);
      } else {
        Alert.alert('Error', response.message || 'Failed to add voter');
      }
    } catch (error: any) {
      console.error('Error adding voter:', error);
      const errorMessage = error?.message || 'Failed to add voter. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  // English to Tamil transliteration
  const transliterateToTamil = (englishText: string): string => {
    if (!englishText) return '';
    
    const text = englishText.toLowerCase();
    let result = '';
    let i = 0;
    
    // Consonant + vowel combinations
    const consonantVowelMap: { [key: string]: string } = {
      // க (ka/ga) combinations
      'ka': 'க', 'ki': 'கி', 'ku': 'கு', 'ke': 'கெ', 'ko': 'கொ',
      'kaa': 'கா', 'kee': 'கீ', 'koo': 'கூ', 'kai': 'கை', 'kau': 'கௌ',
      'ga': 'க', 'gi': 'கி', 'gu': 'கு', 'ge': 'கெ', 'go': 'கொ',
      'gaa': 'கா', 'gee': 'கீ', 'goo': 'கூ', 'gai': 'கை', 'gau': 'கௌ',
      // ங (nga) combinations
      'nga': 'ங', 'ngi': 'ஙி', 'ngu': 'ஙு', 'nge': 'ஙெ', 'ngo': 'ஙொ',
      // ச (cha/sa) combinations
      'cha': 'ச', 'chi': 'சி', 'chu': 'சு', 'che': 'செ', 'cho': 'சொ',
      'chaa': 'சா', 'chee': 'சீ', 'choo': 'சூ', 'chai': 'சை', 'chau': 'சௌ',
      'sa': 'ச', 'si': 'சி', 'su': 'சு', 'se': 'செ', 'so': 'சொ',
      'saa': 'சா', 'see': 'சீ', 'soo': 'சூ', 'sai': 'சை', 'sau': 'சௌ',
      'sha': 'ஷ', 'shi': 'ஷி', 'shu': 'ஷு', 'she': 'ஷெ', 'sho': 'ஷொ',
      'shaa': 'ஷா', 'shee': 'ஷீ', 'shoo': 'ஷூ', 'shai': 'ஷை', 'shau': 'ஷௌ',
      // ஜ (ja) combinations
      'ja': 'ஜ', 'ji': 'ஜி', 'ju': 'ஜு', 'je': 'ஜெ', 'jo': 'ஜொ',
      'jaa': 'ஜா', 'jee': 'ஜீ', 'joo': 'ஜூ', 'jai': 'ஜை', 'jau': 'ஜௌ',
      // ஞ (nja/gna) combinations
      'nja': 'ஞ', 'nji': 'ஞி', 'nju': 'ஞு', 'nje': 'ஞெ', 'njo': 'ஞொ',
      'gna': 'ஞ', 'gni': 'ஞி', 'gnu': 'ஞு', 'gne': 'ஞெ', 'gno': 'ஞொ',
      // ட (ta/da) combinations
      'ta': 'த', 'ti': 'தி', 'tu': 'து', 'te': 'தெ', 'to': 'தொ',
      'taa': 'தா', 'tee': 'தீ', 'too': 'தூ', 'tai': 'தை', 'tau': 'தௌ',
      'da': 'த', 'di': 'தி', 'du': 'து', 'de': 'தெ', 'do': 'தொ',
      'daa': 'தா', 'dee': 'தீ', 'doo': 'தூ', 'dai': 'தை', 'dau': 'தௌ',
      // ண (na) combinations
      'na': 'ந', 'ni': 'நி', 'nu': 'நு', 'ne': 'நெ', 'no': 'நொ',
      'naa': 'நா', 'nee': 'நீ', 'noo': 'நூ', 'nai': 'நை', 'nau': 'நௌ',
      // த (tha) combinations
      'tha': 'த', 'thi': 'தி', 'thu': 'து', 'the': 'தெ', 'tho': 'தொ',
      'thaa': 'தா', 'thee': 'தீ', 'thoo': 'தூ', 'thai': 'தை', 'thau': 'தௌ',
      'dha': 'த', 'dhi': 'தி', 'dhu': 'து', 'dhe': 'தெ', 'dho': 'தொ',
      'dhaa': 'தா', 'dhee': 'தீ', 'dhoo': 'தூ', 'dhai': 'தை', 'dhau': 'தௌ',
      // ப (pa/ba) combinations
      'pa': 'ப', 'pi': 'பி', 'pu': 'பு', 'pe': 'பெ', 'po': 'பொ',
      'paa': 'பா', 'pee': 'பீ', 'poo': 'பூ', 'pai': 'பை', 'pau': 'பௌ',
      'ba': 'ப', 'bi': 'பி', 'bu': 'பு', 'be': 'பெ', 'bo': 'பொ',
      'baa': 'பா', 'bee': 'பீ', 'boo': 'பூ', 'bai': 'பை', 'bau': 'பௌ',
      'pha': 'ஃப', 'phi': 'ஃபி', 'phu': 'ஃபு', 'phe': 'ஃபெ', 'pho': 'ஃபொ',
      'fa': 'ஃப', 'fi': 'ஃபி', 'fu': 'ஃபு', 'fe': 'ஃபெ', 'fo': 'ஃபொ',
      // ம (ma) combinations
      'ma': 'ம', 'mi': 'மி', 'mu': 'மு', 'me': 'மெ', 'mo': 'மொ',
      'maa': 'மா', 'mee': 'மீ', 'moo': 'மூ', 'mai': 'மை', 'mau': 'மௌ',
      // ய (ya) combinations
      'ya': 'ய', 'yi': 'யி', 'yu': 'யு', 'ye': 'யெ', 'yo': 'யொ',
      'yaa': 'யா', 'yee': 'யீ', 'yoo': 'யூ', 'yai': 'யை', 'yau': 'யௌ',
      // ர (ra) combinations
      'ra': 'ர', 'ri': 'ரி', 'ru': 'ரு', 're': 'ரெ', 'ro': 'ரொ',
      'raa': 'ரா', 'ree': 'ரீ', 'roo': 'ரூ', 'rai': 'ரை', 'rau': 'ரௌ',
      // ல (la) combinations
      'la': 'ல', 'li': 'லி', 'lu': 'லு', 'le': 'லெ', 'lo': 'லொ',
      'laa': 'லா', 'lee': 'லீ', 'loo': 'லூ', 'lai': 'லை', 'lau': 'லௌ',
      // வ (va/wa) combinations
      'va': 'வ', 'vi': 'வி', 'vu': 'வு', 've': 'வெ', 'vo': 'வொ',
      'vaa': 'வா', 'vee': 'வீ', 'voo': 'வூ', 'vai': 'வை', 'vau': 'வௌ',
      'wa': 'வ', 'wi': 'வி', 'wu': 'வு', 'we': 'வெ', 'wo': 'வொ',
      'waa': 'வா', 'wee': 'வீ', 'woo': 'வூ', 'wai': 'வை', 'wau': 'வௌ',
      // ழ (zha) combinations
      'zha': 'ழ', 'zhi': 'ழி', 'zhu': 'ழு', 'zhe': 'ழெ', 'zho': 'ழொ',
      'zhaa': 'ழா', 'zhee': 'ழீ', 'zhoo': 'ழூ', 'zhai': 'ழை', 'zhau': 'ழௌ',
      'za': 'ழ', 'zi': 'ழி', 'zu': 'ழு', 'ze': 'ழெ', 'zo': 'ழொ',
      // ள (lla) combinations
      'lla': 'ள', 'lli': 'ளி', 'llu': 'ளு', 'lle': 'ளெ', 'llo': 'ளொ',
      'llaa': 'ளா', 'llee': 'ளீ', 'lloo': 'ளூ', 'llai': 'ளை', 'llau': 'ளௌ',
      // ற (rra) combinations
      'rra': 'ற', 'rri': 'றி', 'rru': 'று', 'rre': 'றெ', 'rro': 'றொ',
      'rraa': 'றா', 'rree': 'றீ', 'rroo': 'றூ', 'rrai': 'றை', 'rrau': 'றௌ',
      // ன (nna) combinations
      'nna': 'ன', 'nni': 'னி', 'nnu': 'னு', 'nne': 'னெ', 'nno': 'னொ',
      'nnaa': 'னா', 'nnee': 'னீ', 'nnoo': 'னூ', 'nnai': 'னை', 'nnau': 'னௌ',
      // ஹ (ha) combinations
      'ha': 'ஹ', 'hi': 'ஹி', 'hu': 'ஹு', 'he': 'ஹெ', 'ho': 'ஹொ',
      'haa': 'ஹா', 'hee': 'ஹீ', 'hoo': 'ஹூ', 'hai': 'ஹை', 'hau': 'ஹௌ',
      // க்ஷ (ksha) combinations
      'ksha': 'க்ஷ', 'kshi': 'க்ஷி', 'kshu': 'க்ஷு', 'kshe': 'க்ஷெ', 'ksho': 'க்ஷொ',
    };
    
    // Standalone vowels
    const vowelMap: { [key: string]: string } = {
      'a': 'அ', 'aa': 'ஆ', 'i': 'இ', 'ee': 'ஈ', 'u': 'உ', 'oo': 'ஊ',
      'e': 'எ', 'ae': 'ஏ', 'ai': 'ஐ', 'o': 'ஒ', 'oa': 'ஓ', 'au': 'ஔ',
    };
    
    // Standalone consonants
    const consonantMap: { [key: string]: string } = {
      'ksh': 'க்ஷ்', 'k': 'க்', 'g': 'க்', 'ng': 'ங்', 'ch': 'ச்', 'j': 'ஜ்', 
      's': 'ச்', 'sh': 'ஷ்', 'nj': 'ஞ்', 'gn': 'ஞ்', 't': 'த்', 'd': 'த்',
      'th': 'த்', 'dh': 'த்', 'n': 'ன்', 'p': 'ப்', 'b': 'ப்', 'ph': 'ஃப்', 'f': 'ஃப்',
      'm': 'ம்', 'y': 'ய்', 'r': 'ர்', 'l': 'ல்', 'v': 'வ்', 'w': 'வ்',
      'zh': 'ழ்', 'z': 'ழ்', 'll': 'ள்', 'rr': 'ற்', 'nn': 'ன்', 'h': 'ஹ்',
    };
    
    while (i < text.length) {
      let matched = false;
      
      // Try 5-character matches first (kshaa, etc.)
      if (i + 4 < text.length) {
        const fiveChar = text.substring(i, i + 5);
        if (consonantVowelMap[fiveChar]) {
          result += consonantVowelMap[fiveChar];
          i += 5;
          matched = true;
        }
      }
      
      // Try 4-character matches (ksha, zhaa, etc.)
      if (!matched && i + 3 < text.length) {
        const fourChar = text.substring(i, i + 4);
        if (consonantVowelMap[fourChar]) {
          result += consonantVowelMap[fourChar];
          i += 4;
          matched = true;
        }
      }
      
      // Try 3-character matches (sha, cha, nga, etc.)
      if (!matched && i + 2 < text.length) {
        const threeChar = text.substring(i, i + 3);
        if (consonantVowelMap[threeChar] || consonantMap[threeChar]) {
          result += consonantVowelMap[threeChar] || consonantMap[threeChar];
          i += 3;
          matched = true;
        }
      }
      
      // Try 2-character matches
      if (!matched && i + 1 < text.length) {
        const twoChar = text.substring(i, i + 2);
        if (consonantVowelMap[twoChar] || vowelMap[twoChar] || consonantMap[twoChar]) {
          result += consonantVowelMap[twoChar] || vowelMap[twoChar] || consonantMap[twoChar];
          i += 2;
          matched = true;
        }
      }
      
      // Try single character
      if (!matched) {
        const oneChar = text[i];
        if (vowelMap[oneChar]) {
          result += vowelMap[oneChar];
        } else if (consonantMap[oneChar]) {
          result += consonantMap[oneChar];
        } else if (oneChar === ' ') {
          result += ' ';
        } else {
          // Unknown character, skip it
          result += '';
        }
        i += 1;
      }
    }
    
    return result;
  };

  const handleEnglishNameChange = (text: string) => {
    setNewVoter(prev => ({
      ...prev,
      nameEnglish: text,
      nameTamil: transliterateToTamil(text)
    }));
  };

  return (
    <ScreenWrapper userRole="booth_agent">
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Loading voters...</Text>
        </View>
      ) : (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(boothAgent)/dashboard')}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Voter Manager</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Icon name="person-add" size={24} color="#1976D2" />
          </TouchableOpacity>
        </View>

        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>
            Booth {String(userData?.boothAllocation || userData?.booth_id || 'N/A')} - {String(totalVoters)} total voters
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

        {/* Filter Dropdown */}
        {showDropdown && (
          <TouchableOpacity 
            style={styles.dropdownBackdrop}
            activeOpacity={1}
            onPress={() => setShowDropdown(false)}
          />
        )}
        
        <View style={styles.filterContainer}>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Text style={styles.filterText}>{selectedFilter}</Text>
              <Icon name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>
            
            {/* Dropdown Options */}
            {showDropdown && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity 
                  style={styles.dropdownOption}
                  onPress={() => handleFilterSelect('All Voters')}
                >
                  <View style={styles.checkmark}>
                    {selectedFilter === 'All Voters' && (
                      <Icon name="check" size={16} color="#2196F3" />
                    )}
                  </View>
                  <Text style={styles.dropdownOptionText}>All Voters</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dropdownOption}
                  onPress={() => handleFilterSelect('Verified')}
                >
                  <View style={styles.checkmark}>
                    {selectedFilter === 'Verified' && (
                      <Icon name="check" size={16} color="#2196F3" />
                    )}
                  </View>
                  <Text style={styles.dropdownOptionText}>Verified</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dropdownOption}
                  onPress={() => handleFilterSelect('Pending')}
                >
                  <View style={styles.checkmark}>
                    {selectedFilter === 'Pending' && (
                      <Icon name="check" size={16} color="#2196F3" />
                    )}
                  </View>
                  <Text style={styles.dropdownOptionText}>Pending</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dropdownOption}
                  onPress={() => handleFilterSelect('Age 60+')}
                >
                  <View style={styles.checkmark}>
                    {selectedFilter === 'Age 60+' && (
                      <Icon name="check" size={16} color="#2196F3" />
                    )}
                  </View>
                  <Text style={styles.dropdownOptionText}>Age 60+</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dropdownOption}
                  onPress={() => handleFilterSelect('Age 80+')}
                >
                  <View style={styles.checkmark}>
                    {selectedFilter === 'Age 80+' && (
                      <Icon name="check" size={16} color="#2196F3" />
                    )}
                  </View>
                  <Text style={styles.dropdownOptionText}>Age 80+</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dropdownOption}
                  onPress={() => handleFilterSelect('Transgender')}
                >
                  <View style={styles.checkmark}>
                    {selectedFilter === 'Transgender' && (
                      <Icon name="check" size={16} color="#2196F3" />
                    )}
                  </View>
                  <Text style={styles.dropdownOptionText}>Transgender</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dropdownOption}
                  onPress={() => handleFilterSelect('Fatherless')}
                >
                  <View style={styles.checkmark}>
                    {selectedFilter === 'Fatherless' && (
                      <Icon name="check" size={16} color="#2196F3" />
                    )}
                  </View>
                  <Text style={styles.dropdownOptionText}>Fatherless</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dropdownOption}
                  onPress={() => handleFilterSelect('Overseas')}
                >
                  <View style={styles.checkmark}>
                    {selectedFilter === 'Overseas' && (
                      <Icon name="check" size={16} color="#2196F3" />
                    )}
                  </View>
                  <Text style={styles.dropdownOptionText}>Overseas</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dropdownOption}
                  onPress={() => handleFilterSelect('Other')}
                >
                  <View style={styles.checkmark}>
                    {selectedFilter === 'Other' && (
                      <Icon name="check" size={16} color="#2196F3" />
                    )}
                  </View>
                  <Text style={styles.dropdownOptionText}>Other</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.filterIconButton}
            onPress={() => setShowPageModal(true)}
          >
            <Icon name="filter-list" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Voters List with Page Info */}
        <View style={styles.pageInfo}>
          <Text style={styles.pageInfoText}>
            Page {String(currentPage)} of {String(totalPages)} (Showing {String(voters.length)} of {String(totalVoters)} voters)
          </Text>
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
              const age = parseInt(String(safeValue(voter.age) || safeValue(voter.Age))) || 0;
              const isSenior60 = age >= 60 && age < 80;
              const isSenior80 = age >= 80;
              const hasPhone = safeValue(voter.mobile) || safeValue(voter['Mobile No']) || safeValue(voter.Mobile) || safeValue(voter['Mobile Number']);
              const isVerified = voter.verified === true || voter.status === 'verified';
              const specialCategories = voter.specialCategories || [];
              const hasSpecialCategories = specialCategories.length > 0 || isSenior60 || isSenior80;
              
              return (
                <TouchableOpacity 
                  key={String(voter._id || voter.Number || index)} 
                  style={styles.voterCard}
                  onPress={() => {
                    const voterId = voter._id ? `_id:${voter._id}` : String(voter['EPIC No'] || voter.Number || '');
                    router.push({
                      pathname: '/(boothAgent)/voter-detail',
                      params: { voterId: String(voterId) }
                    });
                  }}
                >
                  {/* Voter Name and Status Badge */}
                  <View style={styles.voterHeader}>
                    <View style={styles.nameContainer}>
                      <Text style={styles.voterName}>
                        {String(safeValue(voter.name) || safeValue(voter.Name) || 'Unknown')}
                      </Text>
                      {voter.name?.tamil && (
                        <Text style={styles.voterNameTamil}>
                          {String(voter.name.tamil)}
                        </Text>
                      )}
                    </View>
                    {isVerified ? (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    ) : (
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingText}>Pending</Text>
                      </View>
                    )}
                  </View>

                  {/* Voter ID */}
                  <Text style={styles.voterId}>ID: {String(safeValue(voter.voterID) || safeValue(voter['EPIC No']) || safeValue(voter.Number) || 'N/A')}</Text>

                  {/* Age and Gender */}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Age: </Text>
                    <Text style={styles.infoValue}>{String(safeValue(voter.age) || safeValue(voter.Age) || 'N/A')}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Gender: </Text>
                    <Text style={styles.infoValue}>{String(safeValue(voter.gender) || safeValue(voter.sex) || safeValue(voter.Sex) || safeValue(voter.Gender) || 'N/A')}</Text>
                  </View>

                  {/* Phone Number */}
                  {hasPhone && (
                    <View style={styles.phoneRow}>
                      <Icon name="phone" size={16} color="#333" />
                      <Text style={styles.phoneText}>{String(hasPhone)}</Text>
                    </View>
                  )}

                  {/* Special Categories Tags */}
                  {hasSpecialCategories && (
                    <View style={styles.tagContainer}>
                      {isSenior60 && (
                        <View style={styles.ageTag}>
                          <Text style={styles.ageTagText}>Age 60+</Text>
                        </View>
                      )}
                      {isSenior80 && (
                        <View style={styles.ageTag}>
                          <Text style={styles.ageTagText}>Age 80+</Text>
                        </View>
                      )}
                      {specialCategories.includes('Transgender') && (
                        <View style={[styles.ageTag, { backgroundColor: '#E1BEE7' }]}>
                          <Text style={styles.ageTagText}>Transgender</Text>
                        </View>
                      )}
                      {specialCategories.includes('Fatherless') && (
                        <View style={[styles.ageTag, { backgroundColor: '#FFCCBC' }]}>
                          <Text style={styles.ageTagText}>Fatherless</Text>
                        </View>
                      )}
                      {specialCategories.includes('Overseas') && (
                        <View style={[styles.ageTag, { backgroundColor: '#B2DFDB' }]}>
                          <Text style={styles.ageTagText}>Overseas</Text>
                        </View>
                      )}
                      {specialCategories.includes('Other') && (
                        <View style={[styles.ageTag, { backgroundColor: '#CFD8DC' }]}>
                          <Text style={styles.ageTagText}>Other</Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* Add Voter Modal */}
        <Modal
          visible={showAddModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={closeAddModal}
          >
            <TouchableOpacity 
              style={styles.modalContainer}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Voter</Text>
                <TouchableOpacity onPress={closeAddModal}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.subtitleContainer}>
                <Text style={styles.modalSubtitle}>
                  Enter the voter&apos;s details to register them in the booth
                </Text>
              </View>

              <ScrollView 
                style={{ flex: 1 }}
                contentContainerStyle={styles.modalContent} 
                showsVerticalScrollIndicator={false}
              >
                {/* Voter ID */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Voter ID <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., TND1190007"
                    placeholderTextColor="#999"
                    value={newVoter.voterId}
                    onChangeText={(text) => setNewVoter({ ...newVoter, voterId: text })}
                  />
                </View>

                {/* Name English */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Name (English) <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter name in English"
                    placeholderTextColor="#999"
                    value={newVoter.nameEnglish}
                    onChangeText={handleEnglishNameChange}
                  />
                </View>

                {/* Name Tamil - Auto-generated */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name (Tamil)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Auto-generated from English name"
                    placeholderTextColor="#999"
                    value={newVoter.nameTamil}
                    onChangeText={(text) => setNewVoter({ ...newVoter, nameTamil: text })}
                  />
                  <Text style={styles.helperText}>Edit if needed</Text>
                </View>

                {/* Date of Birth */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Date of Birth</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#999"
                    value={newVoter.dob}
                    onChangeText={(text) => setNewVoter({ ...newVoter, dob: text })}
                  />
                </View>

                {/* Age */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Age <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter age"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={newVoter.age}
                    onChangeText={(text) => setNewVoter({ ...newVoter, age: text })}
                  />
                </View>

                {/* Gender */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Gender <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity 
                    style={styles.selectInput}
                    onPress={() => {
                      Alert.alert(
                        'Select Gender',
                        '',
                        [
                          { text: 'Male', onPress: () => setNewVoter({ ...newVoter, gender: 'Male' }) },
                          { text: 'Female', onPress: () => setNewVoter({ ...newVoter, gender: 'Female' }) },
                          { text: 'Transgender', onPress: () => setNewVoter({ ...newVoter, gender: 'Transgender' }) },
                          { text: 'Cancel', style: 'cancel' }
                        ]
                      );
                    }}
                  >
                    <Text style={newVoter.gender ? styles.selectInputTextFilled : styles.selectInputText}>
                      {newVoter.gender || 'Select gender'}
                    </Text>
                    <Icon name="arrow-drop-down" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Father Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Father Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter father's name"
                    placeholderTextColor="#999"
                    value={newVoter.fatherName}
                    onChangeText={(text) => setNewVoter({ ...newVoter, fatherName: text })}
                    editable={!newVoter.fatherless}
                  />
                </View>

                {/* Fatherless Checkbox */}
                <TouchableOpacity 
                  style={styles.checkboxItem}
                  onPress={() => setNewVoter(prev => ({ 
                    ...prev, 
                    fatherless: !prev.fatherless,
                    fatherName: !prev.fatherless ? '' : prev.fatherName 
                  }))}
                >
                  <View style={[
                    styles.checkbox,
                    newVoter.fatherless && styles.checkboxChecked
                  ]}>
                    {newVoter.fatherless && (
                      <Icon name="check" size={16} color="#2196F3" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>Fatherless</Text>
                </TouchableOpacity>

                {/* Guardian (if fatherless) */}
                {newVoter.fatherless && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Guardian Name</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter guardian's name"
                      placeholderTextColor="#999"
                      value={newVoter.guardian}
                      onChangeText={(text) => setNewVoter({ ...newVoter, guardian: text })}
                    />
                  </View>
                )}

                {/* Door Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Door Number</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter door number"
                    placeholderTextColor="#999"
                    value={newVoter.doorNumber}
                    onChangeText={(text) => setNewVoter({ ...newVoter, doorNumber: text })}
                  />
                </View>

                {/* Address */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Address <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Enter complete address"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                    value={newVoter.address}
                    onChangeText={(text) => setNewVoter({ ...newVoter, address: text })}
                  />
                </View>

                {/* Mobile Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mobile Number</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="+91 9876543210"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    value={newVoter.mobile}
                    onChangeText={(text) => setNewVoter({ ...newVoter, mobile: text })}
                  />
                </View>

                {/* Email ID */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email ID</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="example@email.com"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={newVoter.email}
                    onChangeText={(text) => setNewVoter({ ...newVoter, email: text })}
                  />
                </View>

                {/* Aadhar Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Aadhar Number</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="1234 5678 9012"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={12}
                    value={newVoter.aadhar}
                    onChangeText={(text) => setNewVoter({ ...newVoter, aadhar: text })}
                  />
                </View>

                {/* PAN Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PAN Number</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="ABCDE1234F"
                    placeholderTextColor="#999"
                    autoCapitalize="characters"
                    maxLength={10}
                    value={newVoter.pan}
                    onChangeText={(text) => setNewVoter({ ...newVoter, pan: text.toUpperCase() })}
                  />
                </View>

                {/* Religion */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Religion</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter religion"
                    placeholderTextColor="#999"
                    value={newVoter.religion}
                    onChangeText={(text) => setNewVoter({ ...newVoter, religion: text })}
                  />
                </View>

                {/* Caste */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Caste</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter caste"
                    placeholderTextColor="#999"
                    value={newVoter.caste}
                    onChangeText={(text) => setNewVoter({ ...newVoter, caste: text })}
                  />
                </View>

                {/* Sub Caste */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Sub Caste</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter sub caste"
                    placeholderTextColor="#999"
                    value={newVoter.subcaste}
                    onChangeText={(text) => setNewVoter({ ...newVoter, subcaste: text })}
                  />
                </View>

                {/* Dynamic Fields Section */}
                {voterFieldsLoading ? (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Loading additional fields...</Text>
                  </View>
                ) : voterFields.length > 0 ? (
                  <>
                    <View style={styles.sectionDivider}>
                      <Text style={styles.sectionTitle}>Additional Fields</Text>
                    </View>
                    {voterFields
                      .filter(field => {
                        // Only render fields with required properties
                        if (!field.name || !field._id) return false;
                        
                        // Only show visible fields
                        if (field.visible === false) return false;
                        
                        // Exclude fields that are already displayed as hardcoded inputs above
                        const hardcodedFields = [
                          'voterId', 'nameEnglish', 'nameTamil', 'age', 'gender', 'dob',
                          'fatherName', 'fatherless', 'guardian', 'mobile', 'email',
                          'doorNumber', 'address', 'aadhar', 'pan', 'PAN', 'TAN',
                          'religion', 'caste', 'subcaste', 'Number', 'Name', 'sex'
                        ];
                        
                        return !hardcodedFields.includes(field.name);
                      })
                      .map((field) => {
                      if (field.type === 'Boolean') {
                        return (
                          <View key={field._id} style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{field.label || field.name}</Text>
                            <View style={styles.chipContainer}>
                              <TouchableOpacity
                                style={[
                                  styles.chip,
                                  dynamicFieldValues[field.name] === true && styles.chipSelected
                                ]}
                                onPress={() => setDynamicFieldValues(prev => ({ ...prev, [field.name]: true }))}
                              >
                                <Text style={[
                                  styles.chipText,
                                  dynamicFieldValues[field.name] === true && styles.chipTextSelected
                                ]}>Yes</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[
                                  styles.chip,
                                  dynamicFieldValues[field.name] === false && styles.chipSelected
                                ]}
                                onPress={() => setDynamicFieldValues(prev => ({ ...prev, [field.name]: false }))}
                              >
                                <Text style={[
                                  styles.chipText,
                                  dynamicFieldValues[field.name] === false && styles.chipTextSelected
                                ]}>No</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      } else {
                        return (
                          <View key={field._id} style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{field.label || field.name}</Text>
                            <TextInput
                              style={styles.textInput}
                              placeholder={`Enter ${(field.label || field.name || 'value').toLowerCase()}`}
                              placeholderTextColor="#999"
                              value={dynamicFieldValues[field.name] || ''}
                              onChangeText={(text) => setDynamicFieldValues(prev => ({ ...prev, [field.name]: text }))}
                            />
                          </View>
                        );
                      }
                    })}
                  </>
                ) : null}

                {/* Auto-populated Booth Information - Display Only */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Booth Information (Auto-filled)</Text>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoBoxText}>
                      Booth ID: {String(userData?.booth_id || 'N/A')}
                    </Text>
                    <Text style={styles.infoBoxText}>
                      Booth Name: {String(userData?.boothname || (userData?.booth_id?.startsWith?.('BOOTH') ? userData.booth_id : (userData?.booth_id ? `BOOTH${userData.booth_id}` : 'N/A')))}
                    </Text>
                    <Text style={styles.infoBoxText}>
                      ACI ID: {String(userData?.aci_id || 'N/A')}
                    </Text>
                    <Text style={styles.infoBoxText}>
                      ACI Name: {String(userData?.aci_name || 'N/A')}
                    </Text>
                  </View>
                </View>

                <View style={{ height: 20 }} />
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeAddModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.addVoterButton}
                  onPress={handleAddVoter}
                >
                  <Text style={styles.addVoterButtonText}>Add Voter</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Page Selection Modal */}
        <Modal
          visible={showPageModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPageModal(false)}
        >
          <TouchableOpacity 
            style={styles.pageModalOverlay}
            activeOpacity={1}
            onPress={() => setShowPageModal(false)}
          >
            <TouchableOpacity 
              style={styles.pageModalContainer}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <View style={styles.pageModalHeader}>
                <Text style={styles.pageModalTitle}>Select Page</Text>
                <TouchableOpacity onPress={() => setShowPageModal(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Page List */}
              <ScrollView style={styles.pageList} showsVerticalScrollIndicator={false}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  // Calculate voters per page
                  const isLastPage = pageNum === totalPages;
                  const votersCount = isLastPage 
                    ? totalVoters - ((totalPages - 1) * ITEMS_PER_PAGE)
                    : ITEMS_PER_PAGE;
                  
                  return (
                    <TouchableOpacity
                      key={pageNum}
                      style={[
                        styles.pageOption,
                        currentPage === pageNum && styles.pageOptionActive
                      ]}
                      onPress={() => loadPage(pageNum)}
                    >
                      <View>
                        <Text style={[
                          styles.pageOptionText,
                          currentPage === pageNum && styles.pageOptionTextActive
                        ]}>
                          Page {String(pageNum)}
                        </Text>
                        <Text style={styles.pageOptionSubtext}>
                          {String(votersCount)} voters
                        </Text>
                      </View>
                      {currentPage === pageNum && (
                        <Icon name="check" size={20} color="#2196F3" />
                      )}
                    </TouchableOpacity>
                  );
                })}
                <View style={{ height: 20 }} />
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
      )}
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
    margin: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dropdownContainer: {
    flex: 1,
    position: 'relative',
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkmark: {
    width: 20,
    height: 20,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    paddingRight: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  filterIconButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 1,
  },
  votersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  voterCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  voterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  voterName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  voterNameTamil: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  pendingText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  voterId: {
    fontSize: 13,
    color: '#1976D2',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  phoneText: {
    fontSize: 14,
    color: '#333',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  ageTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ageTagText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingBottom: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1A1A1A',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  selectInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectInputText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  selectInputTextFilled: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: '#2196F3',
    backgroundColor: '#EFF6FF',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    flexWrap: 'wrap',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  addVoterButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addVoterButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Page Info Styles
  pageInfo: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F0F4F8',
  },
  pageInfoText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  // Page Modal Styles
  pageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pageModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  pageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pageModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  pageList: {
    maxHeight: 400,
  },
  pageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pageOptionActive: {
    backgroundColor: '#E3F2FD',
  },
  pageOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  pageOptionTextActive: {
    color: '#2196F3',
    fontWeight: '700',
  },
  pageOptionSubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  // Info box styles for booth information
  infoBox: {
    backgroundColor: '#F0F4F8',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D0D7DE',
  },
  infoBoxText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  // Dynamic fields styles
  sectionDivider: {
    marginTop: 16,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  chipSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});