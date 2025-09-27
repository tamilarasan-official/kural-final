import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations = {
  en: {
    // Common
    'app.title': 'TEAM',
    'app.subtitle': 'The Election Analytics Manager',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.update': 'Update',
    'common.delete': 'Delete',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    
    // Navigation
    'nav.home': 'Home',
    'nav.profile': 'Profile',
    'nav.elections': 'Elections',
    'nav.settings': 'Settings',
    'nav.language': 'Language',
    'nav.logout': 'Logout',
    'nav.report': 'Report',
    'nav.catalogue': 'Catalogue',
    'nav.slip': 'Slip',
    'nav.poll': 'Poll',
    'nav.history': 'History',
    
    // Language Selection
    'language.title': 'Choose Language',
    'language.english': 'English',
    'language.hindi': 'Hindi',
    'language.tamil': 'Tamil',
    'language.telugu': 'Telugu',
    'language.kannada': 'Kannada',
    'language.malayalam': 'Malayalam',
    
    // Profile
    'profile.title': 'Profile Details',
    'profile.firstName': 'First Name',
    'profile.lastName': 'Last Name',
    'profile.email': 'Email',
    'profile.mobileNumber': 'Mobile Number',
    'profile.role': 'Role',
    
    // Elections
    'elections.title': 'Your Elections',
    'elections.details': 'Election Details',
    'elections.electionId': 'Election ID',
    'elections.electionName': 'Election Name',
    'elections.constituency': 'Constituency',
    'elections.category': 'Category',
    'elections.voterName': 'Voter Name',
    'elections.age': 'Age',
    'elections.gender': 'Gender',
    'elections.address': 'Address',
    'elections.photo': 'Photo',
    
    // History
    'history.title': 'History',
    'history.search': 'Search Voting History',
    'history.edit': 'Edit',
    'history.delete': 'Delete',
    'history.selectImage': 'Select Image',
    'history.enterImageUrl': 'Enter image URL',
    'history.save': 'Save',
    'history.cancel': 'Cancel',
    'history.deleteConfirm': 'Delete Entry',
    'history.deleteMessage': 'Are you sure you want to delete this entry?',
    'history.imageUrlError': 'Please enter a valid image URL',
    
    // Voter Category
    'voterCategory.title': 'Voter Category',
    'voterCategory.search': 'Search Voter Category',
    'voterCategory.edit': 'Edit',
    'voterCategory.editTitle': 'Edit Voter Category',
    'voterCategory.categoryName': 'Category Name',
    'voterCategory.description': 'Description',
    'voterCategory.enterName': 'Enter category name',
    'voterCategory.enterDescription': 'Enter description',
    'voterCategory.save': 'Save',
    'voterCategory.cancel': 'Cancel',
    'voterCategory.nameError': 'Please enter a valid category name',
    
    // Voter Slip
    'voterSlip.title': 'Voter Slip',
    'voterSlip.searchPlaceholder': 'Enter Voter Slip Name',
    'voterSlip.prin': 'Prin',
    'voterSlip.candidate': 'Candidate',
    
    // Parties
    'parties.title': 'Parties',
    'parties.searchPlaceholder': 'Search Political Party',
    'parties.edit': 'Edit',
    'parties.editTitle': 'Edit Party',
    'parties.partyName': 'Party Name',
    'parties.partyShortName': 'Party Short Name',
    'parties.enterTamilName': 'Enter Tamil name',
    'parties.enterEnglishName': 'Enter English name',
    'parties.save': 'Save',
    'parties.cancel': 'Cancel',
    'parties.nameError': 'Please enter valid party names',
    
    // Religions
    'religions.title': 'Religions',
    'religions.searchPlaceholder': 'Search Religion',
    'religions.edit': 'Edit',
    'religions.editTitle': 'Edit Religion',
    'religions.religionName': 'Religion Name',
    'religions.enterReligionName': 'Enter religion name',
    'religions.save': 'Save',
    'religions.cancel': 'Cancel',
    'religions.nameError': 'Please enter a valid religion name',
    
    // Caste Category
    'casteCategory.title': 'Caste Category',
    'casteCategory.searchPlaceholder': 'Search Caste',
    'casteCategory.edit': 'Edit',
    'casteCategory.editTitle': 'Edit Caste',
    'casteCategory.casteName': 'Caste Name',
    'casteCategory.enterCasteName': 'Enter caste name',
    'casteCategory.save': 'Save',
    'casteCategory.cancel': 'Cancel',
    'casteCategory.nameError': 'Please enter a valid caste abbreviation',
    
    // Castes
    'castes.title': 'Castes',
    'castes.searchPlaceholder': 'Search Caste',
    'castes.edit': 'Edit',
    'castes.editTitle': 'Edit Caste',
    'castes.englishName': 'English Name',
    'castes.tamilName': 'Tamil Name',
    'castes.enterEnglishName': 'Enter English name',
    'castes.enterTamilName': 'Enter Tamil name',
    'castes.save': 'Save',
    'castes.cancel': 'Cancel',
    'castes.nameError': 'Please enter valid caste names',
    
    // Sub-Castes
    'subCastes.title': 'Sub-Castes',
    'subCastes.searchPlaceholder': 'Search Sub caste',
    'subCastes.edit': 'Edit',
    'subCastes.editTitle': 'Edit Sub-Caste',
    'subCastes.subCasteName': 'Sub-Caste Name',
    'subCastes.enterSubCasteName': 'Enter sub-caste name (English (Tamil))',
    'subCastes.save': 'Save',
    'subCastes.cancel': 'Cancel',
    'subCastes.nameError': 'Please enter valid sub-caste name',
    
    // Voter Language
    'voterLanguage.title': 'Voter Language',
    'voterLanguage.searchPlaceholder': 'Search Voter Language',
    'voterLanguage.edit': 'Edit',
    'voterLanguage.editTitle': 'Edit Voter Language',
    'voterLanguage.languageName': 'Language Name',
    'voterLanguage.enterLanguageName': 'Enter language name (English (Native))',
    'voterLanguage.save': 'Save',
    'voterLanguage.cancel': 'Cancel',
    'voterLanguage.nameError': 'Please enter valid language name',
    
    // Schemes
    'schemes.title': 'Schemes',
    'schemes.searchPlaceholder': 'Search Benefit Schemes',
    'schemes.edit': 'Edit',
    'schemes.editTitle': 'Edit Scheme',
    'schemes.schemeName': 'Scheme Name',
    'schemes.schemeBy': 'Scheme By',
    'schemes.enterSchemeName': 'Enter scheme name',
    'schemes.enterSchemeBy': 'Enter scheme provider',
    'schemes.save': 'Save',
    'schemes.cancel': 'Cancel',
    'schemes.nameError': 'Please enter valid scheme details',
    
    // Feedback
    'feedback.title': 'Feedback',
    'feedback.searchPlaceholder': 'Search Feedback',
    'feedback.edit': 'Edit',
    'feedback.editTitle': 'Feedback Title',
    'feedback.feedbackIssueName': 'Feedback issue Name',
    'feedback.enterFeedbackTitle': 'Enter feedback title',
    'feedback.save': 'Save',
    'feedback.cancel': 'Cancel',
    'feedback.nameError': 'Please enter valid feedback title',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'App Language',
    'settings.voterSlip': 'Voter Slip',
    'settings.setElection': 'Set Election',
    'settings.appBanner': 'App Banner',
    'settings.caste': 'Caste Category',
  },
  hi: {
    // Common
    'app.title': 'टीम',
    'app.subtitle': 'चुनाव विश्लेषण प्रबंधक',
    'common.submit': 'जमा करें',
    'common.cancel': 'रद्द करें',
    'common.save': 'सहेजें',
    'common.edit': 'संपादित करें',
    'common.update': 'अपडेट करें',
    'common.delete': 'हटाएं',
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    
    // Navigation
    'nav.home': 'होम',
    'nav.profile': 'प्रोफाइल',
    'nav.elections': 'चुनाव',
    'nav.settings': 'सेटिंग्स',
    'nav.language': 'भाषा',
    'nav.logout': 'लॉगआउट',
    'nav.report': 'रिपोर्ट',
    'nav.catalogue': 'कैटलॉग',
    'nav.slip': 'स्लिप',
    'nav.poll': 'पोल',
    'nav.history': 'इतिहास',
    
    // Language Selection
    'language.title': 'भाषा चुनें',
    'language.english': 'अंग्रेजी',
    'language.hindi': 'हिंदी',
    'language.tamil': 'तमिल',
    'language.telugu': 'तेलुगु',
    'language.kannada': 'कन्नड़',
    'language.malayalam': 'मलयालम',
    
    // Profile
    'profile.title': 'प्रोफाइल विवरण',
    'profile.firstName': 'पहला नाम',
    'profile.lastName': 'अंतिम नाम',
    'profile.email': 'ईमेल',
    'profile.mobileNumber': 'मोबाइल नंबर',
    'profile.role': 'भूमिका',
    
    // Elections
    'elections.title': 'आपके चुनाव',
    'elections.details': 'चुनाव विवरण',
    'elections.electionId': 'चुनाव आईडी',
    'elections.electionName': 'चुनाव नाम',
    'elections.constituency': 'निर्वाचन क्षेत्र',
    'elections.category': 'श्रेणी',
    'elections.voterName': 'मतदाता नाम',
    'elections.age': 'आयु',
    'elections.gender': 'लिंग',
    'elections.address': 'पता',
    'elections.photo': 'फोटो',
    
    // History
    'history.title': 'इतिहास',
    'history.search': 'मतदान इतिहास खोजें',
    'history.edit': 'संपादित करें',
    'history.delete': 'हटाएं',
    'history.selectImage': 'छवि चुनें',
    'history.enterImageUrl': 'छवि URL दर्ज करें',
    'history.save': 'सहेजें',
    'history.cancel': 'रद्द करें',
    'history.deleteConfirm': 'प्रविष्टि हटाएं',
    'history.deleteMessage': 'क्या आप वाकई इस प्रविष्टि को हटाना चाहते हैं?',
    'history.imageUrlError': 'कृपया एक वैध छवि URL दर्ज करें',
    
    // Voter Category
    'voterCategory.title': 'मतदाता श्रेणी',
    'voterCategory.search': 'मतदाता श्रेणी खोजें',
    'voterCategory.edit': 'संपादित करें',
    'voterCategory.editTitle': 'मतदाता श्रेणी संपादित करें',
    'voterCategory.categoryName': 'श्रेणी नाम',
    'voterCategory.description': 'विवरण',
    'voterCategory.enterName': 'श्रेणी नाम दर्ज करें',
    'voterCategory.enterDescription': 'विवरण दर्ज करें',
    'voterCategory.save': 'सहेजें',
    'voterCategory.cancel': 'रद्द करें',
    'voterCategory.nameError': 'कृपया एक वैध श्रेणी नाम दर्ज करें',
    
    // Voter Slip
    'voterSlip.title': 'मतदाता पर्ची',
    'voterSlip.searchPlaceholder': 'मतदाता पर्ची नाम दर्ज करें',
    'voterSlip.prin': 'प्रिंसिपल',
    'voterSlip.candidate': 'उम्मीदवार',
    
    // Parties
    'parties.title': 'दल',
    'parties.searchPlaceholder': 'राजनीतिक दल खोजें',
    'parties.edit': 'संपादित करें',
    'parties.editTitle': 'दल संपादित करें',
    'parties.partyName': 'दल का नाम',
    'parties.partyShortName': 'दल का छोटा नाम',
    'parties.enterTamilName': 'तमिल नाम दर्ज करें',
    'parties.enterEnglishName': 'अंग्रेजी नाम दर्ज करें',
    'parties.save': 'सहेजें',
    'parties.cancel': 'रद्द करें',
    'parties.nameError': 'कृपया वैध दल नाम दर्ज करें',
    
    // Religions
    'religions.title': 'धर्म',
    'religions.searchPlaceholder': 'धर्म खोजें',
    'religions.edit': 'संपादित करें',
    'religions.editTitle': 'धर्म संपादित करें',
    'religions.religionName': 'धर्म का नाम',
    'religions.enterReligionName': 'धर्म का नाम दर्ज करें',
    'religions.save': 'सहेजें',
    'religions.cancel': 'रद्द करें',
    'religions.nameError': 'कृपया वैध धर्म नाम दर्ज करें',
    
    // Caste Category
    'casteCategory.title': 'जाति श्रेणी',
    'casteCategory.searchPlaceholder': 'जाति खोजें',
    'casteCategory.edit': 'संपादित करें',
    'casteCategory.editTitle': 'जाति संपादित करें',
    'casteCategory.casteName': 'जाति का नाम',
    'casteCategory.enterCasteName': 'जाति का नाम दर्ज करें',
    'casteCategory.save': 'सहेजें',
    'casteCategory.cancel': 'रद्द करें',
    'casteCategory.nameError': 'कृपया वैध जाति संक्षिप्त नाम दर्ज करें',
    
    // Castes
    'castes.title': 'जातियां',
    'castes.searchPlaceholder': 'जाति खोजें',
    'castes.edit': 'संपादित करें',
    'castes.editTitle': 'जाति संपादित करें',
    'castes.englishName': 'अंग्रेजी नाम',
    'castes.tamilName': 'तमिल नाम',
    'castes.enterEnglishName': 'अंग्रेजी नाम दर्ज करें',
    'castes.enterTamilName': 'तमिल नाम दर्ज करें',
    'castes.save': 'सहेजें',
    'castes.cancel': 'रद्द करें',
    'castes.nameError': 'कृपया वैध जाति नाम दर्ज करें',
    
    // Sub-Castes
    'subCastes.title': 'उप-जातियां',
    'subCastes.searchPlaceholder': 'उप-जाति खोजें',
    'subCastes.edit': 'संपादित करें',
    'subCastes.editTitle': 'उप-जाति संपादित करें',
    'subCastes.subCasteName': 'उप-जाति का नाम',
    'subCastes.enterSubCasteName': 'उप-जाति का नाम दर्ज करें (अंग्रेजी (तमिल))',
    'subCastes.save': 'सहेजें',
    'subCastes.cancel': 'रद्द करें',
    'subCastes.nameError': 'कृपया वैध उप-जाति नाम दर्ज करें',
    
    // Voter Language
    'voterLanguage.title': 'मतदाता भाषा',
    'voterLanguage.searchPlaceholder': 'मतदाता भाषा खोजें',
    'voterLanguage.edit': 'संपादित करें',
    'voterLanguage.editTitle': 'मतदाता भाषा संपादित करें',
    'voterLanguage.languageName': 'भाषा का नाम',
    'voterLanguage.enterLanguageName': 'भाषा का नाम दर्ज करें (अंग्रेजी (मूल))',
    'voterLanguage.save': 'सहेजें',
    'voterLanguage.cancel': 'रद्द करें',
    'voterLanguage.nameError': 'कृपया वैध भाषा नाम दर्ज करें',
    
    // Schemes
    'schemes.title': 'योजनाएं',
    'schemes.searchPlaceholder': 'लाभ योजनाएं खोजें',
    'schemes.edit': 'संपादित करें',
    'schemes.editTitle': 'योजना संपादित करें',
    'schemes.schemeName': 'योजना का नाम',
    'schemes.schemeBy': 'योजना द्वारा',
    'schemes.enterSchemeName': 'योजना का नाम दर्ज करें',
    'schemes.enterSchemeBy': 'योजना प्रदाता दर्ज करें',
    'schemes.save': 'सहेजें',
    'schemes.cancel': 'रद्द करें',
    'schemes.nameError': 'कृपया वैध योजना विवरण दर्ज करें',
    
    // Feedback
    'feedback.title': 'फीडबैक',
    'feedback.searchPlaceholder': 'फीडबैक खोजें',
    'feedback.edit': 'संपादित करें',
    'feedback.editTitle': 'फीडबैक शीर्षक',
    'feedback.feedbackIssueName': 'फीडबैक समस्या का नाम',
    'feedback.enterFeedbackTitle': 'फीडबैक शीर्षक दर्ज करें',
    'feedback.save': 'सहेजें',
    'feedback.cancel': 'रद्द करें',
    'feedback.nameError': 'कृपया वैध फीडबैक शीर्षक दर्ज करें',
    
    // Settings
    'settings.title': 'सेटिंग्स',
    'settings.language': 'ऐप भाषा',
    'settings.voterSlip': 'मतदाता पर्ची',
    'settings.setElection': 'चुनाव सेट करें',
    'settings.appBanner': 'ऐप बैनर',
    'settings.caste': 'जाति श्रेणी',
  },
  ta: {
    // Common
    'app.title': 'டீம்',
    'app.subtitle': 'தேர்தல் பகுப்பாய்வு மேலாளர்',
    'common.submit': 'சமர்ப்பி',
    'common.cancel': 'ரத்து',
    'common.save': 'சேமி',
    'common.edit': 'திருத்து',
    'common.update': 'புதுப்பி',
    'common.delete': 'நீக்கு',
    'common.loading': 'ஏற்றுகிறது...',
    'common.error': 'பிழை',
    'common.success': 'வெற்றி',
    
    // Navigation
    'nav.home': 'முகப்பு',
    'nav.profile': 'சுயவிவரம்',
    'nav.elections': 'தேர்தல்கள்',
    'nav.settings': 'அமைப்புகள்',
    'nav.language': 'மொழி',
    'nav.logout': 'வெளியேறு',
    'nav.report': 'அறிக்கை',
    'nav.catalogue': 'பட்டியல்',
    'nav.slip': 'சீட்டு',
    'nav.poll': 'வாக்கெடுப்பு',
    
    // Language Selection
    'language.title': 'மொழியைத் தேர்ந்தெடுக்கவும்',
    'language.english': 'ஆங்கிலம்',
    'language.hindi': 'இந்தி',
    'language.tamil': 'தமிழ்',
    'language.telugu': 'தெலுங்கு',
    'language.kannada': 'கன்னடம்',
    'language.malayalam': 'மலையாளம்',
    
    // Profile
    'profile.title': 'சுயவிவர விவரங்கள்',
    'profile.firstName': 'முதல் பெயர்',
    'profile.lastName': 'கடைசி பெயர்',
    'profile.email': 'மின்னஞ்சல்',
    'profile.mobileNumber': 'மொபைல் எண்',
    'profile.role': 'பங்கு',
    
    // Elections
    'elections.title': 'உங்கள் தேர்தல்கள்',
    'elections.details': 'தேர்தல் விவரங்கள்',
    'elections.electionId': 'தேர்தல் ஐடி',
    'elections.electionName': 'தேர்தல் பெயர்',
    'elections.constituency': 'தொகுதி',
    'elections.category': 'வகை',
    'elections.voterName': 'வாக்காளர் பெயர்',
    'elections.age': 'வயது',
    'elections.gender': 'பாலினம்',
    'elections.address': 'முகவரி',
    'elections.photo': 'புகைப்படம்',
    
    // History
    'history.title': 'வரலாறு',
    'history.search': 'வாக்களிப்பு வரலாறு தேடு',
    'history.edit': 'திருத்து',
    'history.delete': 'நீக்கு',
    'history.selectImage': 'படத்தைத் தேர்ந்தெடு',
    'history.enterImageUrl': 'பட URL ஐ உள்ளிடு',
    'history.save': 'சேமி',
    'history.cancel': 'ரத்து செய்',
    'history.deleteConfirm': 'பதிவை நீக்கு',
    'history.deleteMessage': 'இந்த பதிவை நீக்க விரும்புகிறீர்களா?',
    'history.imageUrlError': 'சரியான பட URL ஐ உள்ளிடவும்',
    
    // Voter Category
    'voterCategory.title': 'வாக்காளர் வகை',
    'voterCategory.search': 'வாக்காளர் வகையைத் தேடு',
    'voterCategory.edit': 'திருத்து',
    'voterCategory.editTitle': 'வாக்காளர் வகையைத் திருத்து',
    'voterCategory.categoryName': 'வகை பெயர்',
    'voterCategory.description': 'விளக்கம்',
    'voterCategory.enterName': 'வகை பெயரை உள்ளிடு',
    'voterCategory.enterDescription': 'விளக்கத்தை உள்ளிடு',
    'voterCategory.save': 'சேமி',
    'voterCategory.cancel': 'ரத்து செய்',
    'voterCategory.nameError': 'சரியான வகை பெயரை உள்ளிடவும்',
    
    // Voter Slip
    'voterSlip.title': 'வாக்காளர் சீட்டு',
    'voterSlip.searchPlaceholder': 'வாக்காளர் சீட்டு பெயரை உள்ளிடு',
    'voterSlip.prin': 'முதன்மை',
    'voterSlip.candidate': 'வேட்பாளர்',
    
    // Parties
    'parties.title': 'கட்சிகள்',
    'parties.searchPlaceholder': 'அரசியல் கட்சியைத் தேடு',
    'parties.edit': 'திருத்து',
    'parties.editTitle': 'கட்சியைத் திருத்து',
    'parties.partyName': 'கட்சி பெயர்',
    'parties.partyShortName': 'கட்சி சுருக்கப் பெயர்',
    'parties.enterTamilName': 'தமிழ் பெயரை உள்ளிடு',
    'parties.enterEnglishName': 'ஆங்கில பெயரை உள்ளிடு',
    'parties.save': 'சேமி',
    'parties.cancel': 'ரத்து செய்',
    'parties.nameError': 'சரியான கட்சி பெயர்களை உள்ளிடவும்',
    
    // Religions
    'religions.title': 'மதங்கள்',
    'religions.searchPlaceholder': 'மதத்தைத் தேடு',
    'religions.edit': 'திருத்து',
    'religions.editTitle': 'மதத்தைத் திருத்து',
    'religions.religionName': 'மதப் பெயர்',
    'religions.enterReligionName': 'மதப் பெயரை உள்ளிடு',
    'religions.save': 'சேமி',
    'religions.cancel': 'ரத்து செய்',
    'religions.nameError': 'சரியான மதப் பெயரை உள்ளிடவும்',
    
    // Caste Category
    'casteCategory.title': 'சாதி வகை',
    'casteCategory.searchPlaceholder': 'சாதியைத் தேடு',
    'casteCategory.edit': 'திருத்து',
    'casteCategory.editTitle': 'சாதியைத் திருத்து',
    'casteCategory.casteName': 'சாதி பெயர்',
    'casteCategory.enterCasteName': 'சாதி பெயரை உள்ளிடு',
    'casteCategory.save': 'சேமி',
    'casteCategory.cancel': 'ரத்து செய்',
    'casteCategory.nameError': 'சரியான சாதி சுருக்கப் பெயரை உள்ளிடவும்',
    
    // Castes
    'castes.title': 'சாதிகள்',
    'castes.searchPlaceholder': 'சாதியைத் தேடு',
    'castes.edit': 'திருத்து',
    'castes.editTitle': 'சாதியைத் திருத்து',
    'castes.englishName': 'ஆங்கிலப் பெயர்',
    'castes.tamilName': 'தமிழ்ப் பெயர்',
    'castes.enterEnglishName': 'ஆங்கிலப் பெயரை உள்ளிடு',
    'castes.enterTamilName': 'தமிழ்ப் பெயரை உள்ளிடு',
    'castes.save': 'சேமி',
    'castes.cancel': 'ரத்து செய்',
    'castes.nameError': 'சரியான சாதி பெயர்களை உள்ளிடவும்',
    
    // Sub-Castes
    'subCastes.title': 'துணை-சாதிகள்',
    'subCastes.searchPlaceholder': 'துணை-சாதியைத் தேடு',
    'subCastes.edit': 'திருத்து',
    'subCastes.editTitle': 'துணை-சாதியைத் திருத்து',
    'subCastes.subCasteName': 'துணை-சாதி பெயர்',
    'subCastes.enterSubCasteName': 'துணை-சாதி பெயரை உள்ளிடு (ஆங்கிலம் (தமிழ்))',
    'subCastes.save': 'சேமி',
    'subCastes.cancel': 'ரத்து செய்',
    'subCastes.nameError': 'சரியான துணை-சாதி பெயரை உள்ளிடவும்',
    
    // Voter Language
    'voterLanguage.title': 'வாக்காளர் மொழி',
    'voterLanguage.searchPlaceholder': 'வாக்காளர் மொழியைத் தேடு',
    'voterLanguage.edit': 'திருத்து',
    'voterLanguage.editTitle': 'வாக்காளர் மொழியைத் திருத்து',
    'voterLanguage.languageName': 'மொழி பெயர்',
    'voterLanguage.enterLanguageName': 'மொழி பெயரை உள்ளிடு (ஆங்கிலம் (மூல))',
    'voterLanguage.save': 'சேமி',
    'voterLanguage.cancel': 'ரத்து செய்',
    'voterLanguage.nameError': 'சரியான மொழி பெயரை உள்ளிடவும்',
    
    // Schemes
    'schemes.title': 'திட்டங்கள்',
    'schemes.searchPlaceholder': 'நன்மை திட்டங்களைத் தேடு',
    'schemes.edit': 'திருத்து',
    'schemes.editTitle': 'திட்டத்தைத் திருத்து',
    'schemes.schemeName': 'திட்டப் பெயர்',
    'schemes.schemeBy': 'திட்டம் மூலம்',
    'schemes.enterSchemeName': 'திட்டப் பெயரை உள்ளிடு',
    'schemes.enterSchemeBy': 'திட்ட வழங்குநரை உள்ளிடு',
    'schemes.save': 'சேமி',
    'schemes.cancel': 'ரத்து செய்',
    'schemes.nameError': 'சரியான திட்ட விவரங்களை உள்ளிடவும்',
    
    // Feedback
    'feedback.title': 'கருத்து',
    'feedback.searchPlaceholder': 'கருத்தைத் தேடு',
    'feedback.edit': 'திருத்து',
    'feedback.editTitle': 'கருத்து தலைப்பு',
    'feedback.feedbackIssueName': 'கருத்து பிரச்சனை பெயர்',
    'feedback.enterFeedbackTitle': 'கருத்து தலைப்பை உள்ளிடு',
    'feedback.save': 'சேமி',
    'feedback.cancel': 'ரத்து செய்',
    'feedback.nameError': 'சரியான கருத்து தலைப்பை உள்ளிடவும்',
    
    // Settings
    'settings.title': 'அமைப்புகள்',
    'settings.language': 'ஆப் மொழி',
    'settings.voterSlip': 'வாக்காளர் சீட்டு',
    'settings.setElection': 'தேர்தலை அமை',
    'settings.appBanner': 'ஆப் பேனர்',
    'settings.caste': 'சாதி வகை',
  },
  te: {
    // Common
    'app.title': 'టీమ్',
    'app.subtitle': 'ఎన్నికల విశ్లేషణ మేనేజర్',
    'common.submit': 'సమర్పించు',
    'common.cancel': 'రద్దు',
    'common.save': 'సేవ్',
    'common.edit': 'సవరించు',
    'common.update': 'నవీకరించు',
    'common.delete': 'తొలగించు',
    'common.loading': 'లోడ్ అవుతోంది...',
    'common.error': 'లోపం',
    'common.success': 'విజయం',
    
    // Navigation
    'nav.home': 'హోమ్',
    'nav.profile': 'ప్రొఫైల్',
    'nav.elections': 'ఎన్నికలు',
    'nav.settings': 'సెట్టింగ్స్',
    'nav.language': 'భాష',
    'nav.logout': 'లాగౌట్',
    'nav.report': 'రిపోర్ట్',
    'nav.catalogue': 'కేటలాగ్',
    'nav.slip': 'స్లిప్',
    'nav.poll': 'పోల్',
    
    // Language Selection
    'language.title': 'భాషను ఎంచుకోండి',
    'language.english': 'ఇంగ్లీష్',
    'language.hindi': 'హిందీ',
    'language.tamil': 'తమిళం',
    'language.telugu': 'తెలుగు',
    'language.kannada': 'కన్నడ',
    'language.malayalam': 'మలయాళం',
    
    // Profile
    'profile.title': 'ప్రొఫైల్ వివరాలు',
    'profile.firstName': 'మొదటి పేరు',
    'profile.lastName': 'చివరి పేరు',
    'profile.email': 'ఇమెయిల్',
    'profile.mobileNumber': 'మొబైల్ నంబర్',
    'profile.role': 'పాత్ర',
    
    // Elections
    'elections.title': 'మీ ఎన్నికలు',
    'elections.details': 'ఎన్నికల వివరాలు',
    'elections.electionId': 'ఎన్నికల ఐడి',
    'elections.electionName': 'ఎన్నికల పేరు',
    'elections.constituency': 'నియోజకవర్గం',
    'elections.category': 'వర్గం',
    'elections.voterName': 'ఓటరు పేరు',
    'elections.age': 'వయస్సు',
    'elections.gender': 'లింగం',
    'elections.address': 'చిరునామా',
    'elections.photo': 'ఫోటో',
    
    // History
    'history.title': 'చరిత్ర',
    'history.search': 'వోటింగ్ చరిత్రను వెతకండి',
    'history.edit': 'సవరించు',
    'history.delete': 'తొలగించు',
    'history.selectImage': 'చిత్రాన్ని ఎంచుకోండి',
    'history.enterImageUrl': 'చిత్ర URL ను నమోదు చేయండి',
    'history.save': 'సేవ్ చేయండి',
    'history.cancel': 'రద్దు చేయండి',
    'history.deleteConfirm': 'ఎంట్రీని తొలగించు',
    'history.deleteMessage': 'మీరు ఖచ్చితంగా ఈ ఎంట్రీని తొలగించాలనుకుంటున్నారా?',
    'history.imageUrlError': 'దయచేసి చెల్లుబాటు అయ్యే చిత్ర URL ను నమోదు చేయండి',
    
    // Voter Category
    'voterCategory.title': 'ఓటరు వర్గం',
    'voterCategory.search': 'ఓటరు వర్గాన్ని వెతకండి',
    'voterCategory.edit': 'సవరించు',
    'voterCategory.editTitle': 'ఓటరు వర్గాన్ని సవరించు',
    'voterCategory.categoryName': 'వర్గం పేరు',
    'voterCategory.description': 'వివరణ',
    'voterCategory.enterName': 'వర్గం పేరును నమోదు చేయండి',
    'voterCategory.enterDescription': 'వివరణను నమోదు చేయండి',
    'voterCategory.save': 'సేవ్ చేయండి',
    'voterCategory.cancel': 'రద్దు చేయండి',
    'voterCategory.nameError': 'దయచేసి చెల్లుబాటు అయ్యే వర్గం పేరును నమోదు చేయండి',
    
    // Voter Slip
    'voterSlip.title': 'ఓటరు స్లిప్',
    'voterSlip.searchPlaceholder': 'ఓటరు స్లిప్ పేరును నమోదు చేయండి',
    'voterSlip.prin': 'ప్రధాన',
    'voterSlip.candidate': 'అభ్యర్థి',
    
    // Parties
    'parties.title': 'పార్టీలు',
    'parties.searchPlaceholder': 'రాజకీయ పార్టీని వెతకండి',
    'parties.edit': 'సవరించు',
    'parties.editTitle': 'పార్టీని సవరించు',
    'parties.partyName': 'పార్టీ పేరు',
    'parties.partyShortName': 'పార్టీ చిన్న పేరు',
    'parties.enterTamilName': 'తమిళ పేరును నమోదు చేయండి',
    'parties.enterEnglishName': 'ఆంగ్ల పేరును నమోదు చేయండి',
    'parties.save': 'సేవ్ చేయండి',
    'parties.cancel': 'రద్దు చేయండి',
    'parties.nameError': 'దయచేసి చెల్లుబాటు అయ్యే పార్టీ పేర్లను నమోదు చేయండి',
    
    // Religions
    'religions.title': 'మతాలు',
    'religions.searchPlaceholder': 'మతాన్ని వెతకండి',
    'religions.edit': 'సవరించు',
    'religions.editTitle': 'మతాన్ని సవరించు',
    'religions.religionName': 'మతం పేరు',
    'religions.enterReligionName': 'మతం పేరును నమోదు చేయండి',
    'religions.save': 'సేవ్ చేయండి',
    'religions.cancel': 'రద్దు చేయండి',
    'religions.nameError': 'దయచేసి చెల్లుబాటు అయ్యే మతం పేరును నమోదు చేయండి',
    
    // Caste Category
    'casteCategory.title': 'కుల వర్గం',
    'casteCategory.searchPlaceholder': 'కులాన్ని వెతకండి',
    'casteCategory.edit': 'సవరించు',
    'casteCategory.editTitle': 'కులాన్ని సవరించు',
    'casteCategory.casteName': 'కులం పేరు',
    'casteCategory.enterCasteName': 'కులం పేరును నమోదు చేయండి',
    'casteCategory.save': 'సేవ్ చేయండి',
    'casteCategory.cancel': 'రద్దు చేయండి',
    'casteCategory.nameError': 'దయచేసి చెల్లుబాటు అయ్యే కులం సంక్షిప్త పేరును నమోదు చేయండి',
    
    // Castes
    'castes.title': 'కులాలు',
    'castes.searchPlaceholder': 'కులాన్ని వెతకండి',
    'castes.edit': 'సవరించు',
    'castes.editTitle': 'కులాన్ని సవరించు',
    'castes.englishName': 'ఆంగ్ల పేరు',
    'castes.tamilName': 'తమిళ పేరు',
    'castes.enterEnglishName': 'ఆంగ్ల పేరును నమోదు చేయండి',
    'castes.enterTamilName': 'తమిళ పేరును నమోదు చేయండి',
    'castes.save': 'సేవ్ చేయండి',
    'castes.cancel': 'రద్దు చేయండి',
    'castes.nameError': 'దయచేసి చెల్లుబాటు అయ్యే కులం పేర్లను నమోదు చేయండి',
    
    // Sub-Castes
    'subCastes.title': 'ఉప-కులాలు',
    'subCastes.searchPlaceholder': 'ఉప-కులాన్ని వెతకండి',
    'subCastes.edit': 'సవరించు',
    'subCastes.editTitle': 'ఉప-కులాన్ని సవరించు',
    'subCastes.subCasteName': 'ఉప-కులం పేరు',
    'subCastes.enterSubCasteName': 'ఉప-కులం పేరును నమోదు చేయండి (ఆంగ్లం (తమిళం))',
    'subCastes.save': 'సేవ్ చేయండి',
    'subCastes.cancel': 'రద్దు చేయండి',
    'subCastes.nameError': 'దయచేసి చెల్లుబాటు అయ్యే ఉప-కులం పేరును నమోదు చేయండి',
    
    // Voter Language
    'voterLanguage.title': 'వోటర్ భాష',
    'voterLanguage.searchPlaceholder': 'వోటర్ భాషను వెతకండి',
    'voterLanguage.edit': 'సవరించు',
    'voterLanguage.editTitle': 'వోటర్ భాషను సవరించు',
    'voterLanguage.languageName': 'భాష పేరు',
    'voterLanguage.enterLanguageName': 'భాష పేరును నమోదు చేయండి (ఆంగ్లం (మూల))',
    'voterLanguage.save': 'సేవ్ చేయండి',
    'voterLanguage.cancel': 'రద్దు చేయండి',
    'voterLanguage.nameError': 'దయచేసి చెల్లుబాటు అయ్యే భాష పేరును నమోదు చేయండి',
    
    // Schemes
    'schemes.title': 'పథకాలు',
    'schemes.searchPlaceholder': 'లాభ పథకాలను వెతకండి',
    'schemes.edit': 'సవరించు',
    'schemes.editTitle': 'పథకాన్ని సవరించు',
    'schemes.schemeName': 'పథకం పేరు',
    'schemes.schemeBy': 'పథకం ద్వారా',
    'schemes.enterSchemeName': 'పథకం పేరును నమోదు చేయండి',
    'schemes.enterSchemeBy': 'పథకం అందించేవారిని నమోదు చేయండి',
    'schemes.save': 'సేవ్ చేయండి',
    'schemes.cancel': 'రద్దు చేయండి',
    'schemes.nameError': 'దయచేసి చెల్లుబాటు అయ్యే పథక వివరాలను నమోదు చేయండి',
    
    // Feedback
    'feedback.title': 'ఫీడ్‌బ్యాక్',
    'feedback.searchPlaceholder': 'ఫీడ్‌బ్యాక్ వెతకండి',
    'feedback.edit': 'సవరించు',
    'feedback.editTitle': 'ఫీడ్‌బ్యాక్ శీర్షిక',
    'feedback.feedbackIssueName': 'ఫీడ్‌బ్యాక్ సమస్య పేరు',
    'feedback.enterFeedbackTitle': 'ఫీడ్‌బ్యాక్ శీర్షికను నమోదు చేయండి',
    'feedback.save': 'సేవ్ చేయండి',
    'feedback.cancel': 'రద్దు చేయండి',
    'feedback.nameError': 'దయచేసి చెల్లుబాటు అయ్యే ఫీడ్‌బ్యాక్ శీర్షికను నమోదు చేయండి',
    
    // Settings
    'settings.title': 'సెట్టింగ్స్',
    'settings.language': 'అనువర్తన భాష',
    'settings.voterSlip': 'ఓటరు స్లిప్',
    'settings.setElection': 'ఎన్నికలను సెట్ చేయండి',
    'settings.appBanner': 'అనువర్తన బ్యానర్',
    'settings.caste': 'కుల వర్గం',
  },
  kn: {
    // Common
    'app.title': 'ಟೀಮ್',
    'app.subtitle': 'ಚುನಾವಣೆ ವಿಶ್ಲೇಷಣೆ ಮ್ಯಾನೇಜರ್',
    'common.submit': 'ಸಲ್ಲಿಸಿ',
    'common.cancel': 'ರದ್ದು',
    'common.save': 'ಉಳಿಸಿ',
    'common.edit': 'ಸಂಪಾದಿಸಿ',
    'common.update': 'ನವೀಕರಿಸಿ',
    'common.delete': 'ಅಳಿಸಿ',
    'common.loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    'common.error': 'ದೋಷ',
    'common.success': 'ಯಶಸ್ಸು',
    
    // Navigation
    'nav.home': 'ಮುಖಪುಟ',
    'nav.profile': 'ಪ್ರೊಫೈಲ್',
    'nav.elections': 'ಚುನಾವಣೆಗಳು',
    'nav.settings': 'ಸೆಟ್ಟಿಂಗ್ಸ್',
    'nav.language': 'ಭಾಷೆ',
    'nav.logout': 'ಲಾಗ್ ಔಟ್',
    'nav.report': 'ವರದಿ',
    'nav.catalogue': 'ಕ್ಯಾಟಲಾಗ್',
    'nav.slip': 'ಸ್ಲಿಪ್',
    'nav.poll': 'ಪೋಲ್',
    
    // Language Selection
    'language.title': 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'language.english': 'ಇಂಗ್ಲಿಷ್',
    'language.hindi': 'ಹಿಂದಿ',
    'language.tamil': 'ತಮಿಳು',
    'language.telugu': 'ತೆಲುಗು',
    'language.kannada': 'ಕನ್ನಡ',
    'language.malayalam': 'ಮಲಯಾಳಂ',
    
    // Profile
    'profile.title': 'ಪ್ರೊಫೈಲ್ ವಿವರಗಳು',
    'profile.firstName': 'ಮೊದಲ ಹೆಸರು',
    'profile.lastName': 'ಕೊನೆಯ ಹೆಸರು',
    'profile.email': 'ಇಮೇಲ್',
    'profile.mobileNumber': 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    'profile.role': 'ಪಾತ್ರ',
    
    // Elections
    'elections.title': 'ನಿಮ್ಮ ಚುನಾವಣೆಗಳು',
    'elections.details': 'ಚುನಾವಣೆ ವಿವರಗಳು',
    'elections.electionId': 'ಚುನಾವಣೆ ಐಡಿ',
    'elections.electionName': 'ಚುನಾವಣೆ ಹೆಸರು',
    'elections.constituency': 'ನಿರ್ವಾಚಕ ಕ್ಷೇತ್ರ',
    'elections.category': 'ವರ್ಗ',
    'elections.voterName': 'ಮತದಾರ ಹೆಸರು',
    'elections.age': 'ವಯಸ್ಸು',
    'elections.gender': 'ಲಿಂಗ',
    'elections.address': 'ವಿಳಾಸ',
    'elections.photo': 'ಫೋಟೋ',
    
    // History
    'history.title': 'ಇತಿಹಾಸ',
    'history.search': 'ಮತದಾನ ಇತಿಹಾಸವನ್ನು ಹುಡುಕಿ',
    'history.edit': 'ಸಂಪಾದಿಸಿ',
    'history.delete': 'ಅಳಿಸಿ',
    'history.selectImage': 'ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'history.enterImageUrl': 'ಚಿತ್ರ URL ಅನ್ನು ನಮೂದಿಸಿ',
    'history.save': 'ಉಳಿಸಿ',
    'history.cancel': 'ರದ್ದುಗೊಳಿಸಿ',
    'history.deleteConfirm': 'ಪ್ರವೇಶವನ್ನು ಅಳಿಸಿ',
    'history.deleteMessage': 'ಈ ಪ್ರವೇಶವನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುತ್ತೀರಾ?',
    'history.imageUrlError': 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಚಿತ್ರ URL ಅನ್ನು ನಮೂದಿಸಿ',
    
    // Voter Category
    'voterCategory.title': 'ಮತದಾರ ವರ್ಗ',
    'voterCategory.search': 'ಮತದಾರ ವರ್ಗವನ್ನು ಹುಡುಕಿ',
    'voterCategory.edit': 'ಸಂಪಾದಿಸಿ',
    'voterCategory.editTitle': 'ಮತದಾರ ವರ್ಗವನ್ನು ಸಂಪಾದಿಸಿ',
    'voterCategory.categoryName': 'ವರ್ಗದ ಹೆಸರು',
    'voterCategory.description': 'ವಿವರಣೆ',
    'voterCategory.enterName': 'ವರ್ಗದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    'voterCategory.enterDescription': 'ವಿವರಣೆಯನ್ನು ನಮೂದಿಸಿ',
    'voterCategory.save': 'ಉಳಿಸಿ',
    'voterCategory.cancel': 'ರದ್ದುಗೊಳಿಸಿ',
    'voterCategory.nameError': 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ವರ್ಗದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    
    // Voter Slip
    'voterSlip.title': 'ಮತದಾರ ಸ್ಲಿಪ್',
    'voterSlip.searchPlaceholder': 'ಮತದಾರ ಸ್ಲಿಪ್ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    'voterSlip.prin': 'ಪ್ರಧಾನ',
    'voterSlip.candidate': 'ಅಭ್ಯರ್ಥಿ',
    
    // Parties
    'parties.title': 'ಪಕ್ಷಗಳು',
    'parties.searchPlaceholder': 'ರಾಜಕೀಯ ಪಕ್ಷವನ್ನು ಹುಡುಕಿ',
    'parties.edit': 'ಸಂಪಾದಿಸಿ',
    'parties.editTitle': 'ಪಕ್ಷವನ್ನು ಸಂಪಾದಿಸಿ',
    'parties.partyName': 'ಪಕ್ಷದ ಹೆಸರು',
    'parties.partyShortName': 'ಪಕ್ಷದ ಸಂಕ್ಷಿಪ್ತ ಹೆಸರು',
    'parties.enterTamilName': 'ತಮಿಳು ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    'parties.enterEnglishName': 'ಇಂಗ್ಲಿಷ್ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    'parties.save': 'ಉಳಿಸಿ',
    'parties.cancel': 'ರದ್ದುಗೊಳಿಸಿ',
    'parties.nameError': 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಪಕ್ಷದ ಹೆಸರುಗಳನ್ನು ನಮೂದಿಸಿ',
    
    // Religions
    'religions.title': 'ಧರ್ಮಗಳು',
    'religions.searchPlaceholder': 'ಧರ್ಮವನ್ನು ಹುಡುಕಿ',
    'religions.edit': 'ಸಂಪಾದಿಸಿ',
    'religions.editTitle': 'ಧರ್ಮವನ್ನು ಸಂಪಾದಿಸಿ',
    'religions.religionName': 'ಧರ್ಮದ ಹೆಸರು',
    'religions.enterReligionName': 'ಧರ್ಮದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    'religions.save': 'ಉಳಿಸಿ',
    'religions.cancel': 'ರದ್ದುಗೊಳಿಸಿ',
    'religions.nameError': 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಧರ್ಮದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    
    // Caste Category
    'casteCategory.title': 'ಜಾತಿ ವರ್ಗ',
    'casteCategory.searchPlaceholder': 'ಜಾತಿಯನ್ನು ಹುಡುಕಿ',
    'casteCategory.edit': 'ಸಂಪಾದಿಸಿ',
    'casteCategory.editTitle': 'ಜಾತಿಯನ್ನು ಸಂಪಾದಿಸಿ',
    'casteCategory.casteName': 'ಜಾತಿಯ ಹೆಸರು',
    'casteCategory.enterCasteName': 'ಜಾತಿಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    'casteCategory.save': 'ಉಳಿಸಿ',
    'casteCategory.cancel': 'ರದ್ದುಗೊಳಿಸಿ',
    'casteCategory.nameError': 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಜಾತಿ ಸಂಕ್ಷಿಪ್ತ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    
    // Castes
    'castes.title': 'ಜಾತಿಗಳು',
    'castes.searchPlaceholder': 'ಜಾತಿಯನ್ನು ಹುಡುಕಿ',
    'castes.edit': 'ಸಂಪಾದಿಸಿ',
    'castes.editTitle': 'ಜಾತಿಯನ್ನು ಸಂಪಾದಿಸಿ',
    'castes.englishName': 'ಇಂಗ್ಲಿಷ್ ಹೆಸರು',
    'castes.tamilName': 'ತಮಿಳು ಹೆಸರು',
    'castes.enterEnglishName': 'ಇಂಗ್ಲಿಷ್ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    'castes.enterTamilName': 'ತಮಿಳು ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    'castes.save': 'ಉಳಿಸಿ',
    'castes.cancel': 'ರದ್ದುಗೊಳಿಸಿ',
    'castes.nameError': 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಜಾತಿ ಹೆಸರುಗಳನ್ನು ನಮೂದಿಸಿ',
    
    // Sub-Castes
    'subCastes.title': 'ಉಪ-ಜಾತಿಗಳು',
    'subCastes.searchPlaceholder': 'ಉಪ-ಜಾತಿಯನ್ನು ಹುಡುಕಿ',
    'subCastes.edit': 'ಸಂಪಾದಿಸಿ',
    'subCastes.editTitle': 'ಉಪ-ಜಾತಿಯನ್ನು ಸಂಪಾದಿಸಿ',
    'subCastes.subCasteName': 'ಉಪ-ಜಾತಿಯ ಹೆಸರು',
    'subCastes.enterSubCasteName': 'ಉಪ-ಜಾತಿಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (ಇಂಗ್ಲಿಷ್ (ತಮಿಳು))',
    'subCastes.save': 'ಉಳಿಸಿ',
    'subCastes.cancel': 'ರದ್ದುಗೊಳಿಸಿ',
    'subCastes.nameError': 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಉಪ-ಜಾತಿ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    
    // Voter Language
    'voterLanguage.title': 'ಮತದಾರ ಭಾಷೆ',
    'voterLanguage.searchPlaceholder': 'ಮತದಾರ ಭಾಷೆಯನ್ನು ಹುಡುಕಿ',
    'voterLanguage.edit': 'ಸಂಪಾದಿಸಿ',
    'voterLanguage.editTitle': 'ಮತದಾರ ಭಾಷೆಯನ್ನು ಸಂಪಾದಿಸಿ',
    'voterLanguage.languageName': 'ಭಾಷೆಯ ಹೆಸರು',
    'voterLanguage.enterLanguageName': 'ಭಾಷೆಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (ಇಂಗ್ಲಿಷ್ (ಮೂಲ))',
    'voterLanguage.save': 'ಉಳಿಸಿ',
    'voterLanguage.cancel': 'ರದ್ದುಗೊಳಿಸಿ',
    'voterLanguage.nameError': 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಭಾಷೆಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    
    // Schemes
    'schemes.title': 'ಯೋಜನೆಗಳು',
    'schemes.searchPlaceholder': 'ಲಾಭ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ',
    'schemes.edit': 'ಸಂಪಾದಿಸಿ',
    'schemes.editTitle': 'ಯೋಜನೆಯನ್ನು ಸಂಪಾದಿಸಿ',
    'schemes.schemeName': 'ಯೋಜನೆಯ ಹೆಸರು',
    'schemes.schemeBy': 'ಯೋಜನೆ ಮೂಲಕ',
    'schemes.enterSchemeName': 'ಯೋಜನೆಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    'schemes.enterSchemeBy': 'ಯೋಜನೆ ಒದಗಿಸುವವರನ್ನು ನಮೂದಿಸಿ',
    'schemes.save': 'ಉಳಿಸಿ',
    'schemes.cancel': 'ರದ್ದುಗೊಳಿಸಿ',
    'schemes.nameError': 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಯೋಜನೆ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ',
    
    // Feedback
    'feedback.title': 'ಪ್ರತಿಕ್ರಿಯೆ',
    'feedback.searchPlaceholder': 'ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಹುಡುಕಿ',
    'feedback.edit': 'ಸಂಪಾದಿಸಿ',
    'feedback.editTitle': 'ಪ್ರತಿಕ್ರಿಯೆ ಶೀರ್ಷಿಕೆ',
    'feedback.feedbackIssueName': 'ಪ್ರತಿಕ್ರಿಯೆ ಸಮಸ್ಯೆಯ ಹೆಸರು',
    'feedback.enterFeedbackTitle': 'ಪ್ರತಿಕ್ರಿಯೆ ಶೀರ್ಷಿಕೆಯನ್ನು ನಮೂದಿಸಿ',
    'feedback.save': 'ಉಳಿಸಿ',
    'feedback.cancel': 'ರದ್ದುಗೊಳಿಸಿ',
    'feedback.nameError': 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಪ್ರತಿಕ್ರಿಯೆ ಶೀರ್ಷಿಕೆಯನ್ನು ನಮೂದಿಸಿ',
    
    // Settings
    'settings.title': 'ಸೆಟ್ಟಿಂಗ್ಸ್',
    'settings.language': 'ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆ',
    'settings.voterSlip': 'ಮತದಾರ ಸ್ಲಿಪ್',
    'settings.setElection': 'ಚುನಾವಣೆಯನ್ನು ಹೊಂದಿಸಿ',
    'settings.appBanner': 'ಅಪ್ಲಿಕೇಶನ್ ಬ್ಯಾನರ್',
    'settings.caste': 'ಜಾತಿ ವರ್ಗ',
  },
  ml: {
    // Common
    'app.title': 'ടീം',
    'app.subtitle': 'തെരഞ്ഞെടുപ്പ് വിശകലന മാനേജർ',
    'common.submit': 'സമർപ്പിക്കുക',
    'common.cancel': 'റദ്ദാക്കുക',
    'common.save': 'സേവ്',
    'common.edit': 'എഡിറ്റ്',
    'common.update': 'അപ്ഡേറ്റ്',
    'common.delete': 'ഇല്ലാതാക്കുക',
    'common.loading': 'ലോഡ് ചെയ്യുന്നു...',
    'common.error': 'പിശക്',
    'common.success': 'വിജയം',
    
    // Navigation
    'nav.home': 'ഹോം',
    'nav.profile': 'പ്രൊഫൈൽ',
    'nav.elections': 'തെരഞ്ഞെടുപ്പുകൾ',
    'nav.settings': 'സെറ്റിംഗുകൾ',
    'nav.language': 'ഭാഷ',
    'nav.logout': 'ലോഗ് ഔട്ട്',
    'nav.report': 'റിപോർട്ട്',
    'nav.catalogue': 'കാറ്റലോഗ്',
    'nav.slip': 'സ്ലിപ്പ്',
    'nav.poll': 'പോൾ',
    
    // Language Selection
    'language.title': 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    'language.english': 'ഇംഗ്ലീഷ്',
    'language.hindi': 'ഹിന്ദി',
    'language.tamil': 'തമിഴ്',
    'language.telugu': 'തെലുഗു',
    'language.kannada': 'കന്നഡ',
    'language.malayalam': 'മലയാളം',
    
    // Profile
    'profile.title': 'പ്രൊഫൈൽ വിവരങ്ങൾ',
    'profile.firstName': 'ആദ്യ പേര്',
    'profile.lastName': 'അവസാന പേര്',
    'profile.email': 'ഇമെയിൽ',
    'profile.mobileNumber': 'മൊബൈൽ നമ്പർ',
    'profile.role': 'റോൾ',
    
    // Elections
    'elections.title': 'നിങ്ങളുടെ തെരഞ്ഞെടുപ്പുകൾ',
    'elections.details': 'തെരഞ്ഞെടുപ്പ് വിവരങ്ങൾ',
    'elections.electionId': 'തെരഞ്ഞെടുപ്പ് ഐഡി',
    'elections.electionName': 'തെരഞ്ഞെടുപ്പ് പേര്',
    'elections.constituency': 'നിയോജകമണ്ഡലം',
    'elections.category': 'വിഭാഗം',
    'elections.voterName': 'വോട്ടർ പേര്',
    'elections.age': 'പ്രായം',
    'elections.gender': 'ലിംഗം',
    'elections.address': 'വിലാസം',
    'elections.photo': 'ഫോട്ടോ',
    
    // History
    'history.title': 'ചരിത്രം',
    'history.search': 'വോട്ടിംഗ് ചരിത്രം തിരയുക',
    'history.edit': 'തിരുത്തുക',
    'history.delete': 'ഇല്ലാതാക്കുക',
    'history.selectImage': 'ചിത്രം തിരഞ്ഞെടുക്കുക',
    'history.enterImageUrl': 'ചിത്ര URL നൽകുക',
    'history.save': 'സേവ് ചെയ്യുക',
    'history.cancel': 'റദ്ദാക്കുക',
    'history.deleteConfirm': 'എൻട്രി ഇല്ലാതാക്കുക',
    'history.deleteMessage': 'ഈ എൻട്രി ഇല്ലാതാക്കാൻ നിങ്ങൾക്ക് തീർച്ചയാണോ?',
    'history.imageUrlError': 'ദയവായി സാധുവായ ചിത്ര URL നൽകുക',
    
    // Voter Category
    'voterCategory.title': 'വോട്ടർ വിഭാഗം',
    'voterCategory.search': 'വോട്ടർ വിഭാഗം തിരയുക',
    'voterCategory.edit': 'തിരുത്തുക',
    'voterCategory.editTitle': 'വോട്ടർ വിഭാഗം തിരുത്തുക',
    'voterCategory.categoryName': 'വിഭാഗത്തിന്റെ പേര്',
    'voterCategory.description': 'വിവരണം',
    'voterCategory.enterName': 'വിഭാഗത്തിന്റെ പേര് നൽകുക',
    'voterCategory.enterDescription': 'വിവരണം നൽകുക',
    'voterCategory.save': 'സേവ് ചെയ്യുക',
    'voterCategory.cancel': 'റദ്ദാക്കുക',
    'voterCategory.nameError': 'ദയവായി സാധുവായ വിഭാഗത്തിന്റെ പേര് നൽകുക',
    
    // Voter Slip
    'voterSlip.title': 'വോട്ടർ സ്ലിപ്പ്',
    'voterSlip.searchPlaceholder': 'വോട്ടർ സ്ലിപ്പ് പേര് നൽകുക',
    'voterSlip.prin': 'പ്രധാന',
    'voterSlip.candidate': 'അഭ്യർത്ഥി',
    
    // Parties
    'parties.title': 'കക്ഷികൾ',
    'parties.searchPlaceholder': 'രാഷ്ട്രീയ കക്ഷിയെ തിരയുക',
    'parties.edit': 'തിരുത്തുക',
    'parties.editTitle': 'കക്ഷി തിരുത്തുക',
    'parties.partyName': 'കക്ഷിയുടെ പേര്',
    'parties.partyShortName': 'കക്ഷിയുടെ ചുരുക്കപ്പേര്',
    'parties.enterTamilName': 'തമിഴ് പേര് നൽകുക',
    'parties.enterEnglishName': 'ഇംഗ്ലീഷ് പേര് നൽകുക',
    'parties.save': 'സേവ് ചെയ്യുക',
    'parties.cancel': 'റദ്ദാക്കുക',
    'parties.nameError': 'ദയവായി സാധുവായ കക്ഷി പേരുകൾ നൽകുക',
    
    // Religions
    'religions.title': 'മതങ്ങൾ',
    'religions.searchPlaceholder': 'മതത്തെ തിരയുക',
    'religions.edit': 'തിരുത്തുക',
    'religions.editTitle': 'മതത്തെ തിരുത്തുക',
    'religions.religionName': 'മതത്തിന്റെ പേര്',
    'religions.enterReligionName': 'മതത്തിന്റെ പേര് നൽകുക',
    'religions.save': 'സേവ് ചെയ്യുക',
    'religions.cancel': 'റദ്ദാക്കുക',
    'religions.nameError': 'ദയവായി സാധുവായ മതത്തിന്റെ പേര് നൽകുക',
    
    // Caste Category
    'casteCategory.title': 'ജാതി വിഭാഗം',
    'casteCategory.searchPlaceholder': 'ജാതിയെ തിരയുക',
    'casteCategory.edit': 'തിരുത്തുക',
    'casteCategory.editTitle': 'ജാതിയെ തിരുത്തുക',
    'casteCategory.casteName': 'ജാതിയുടെ പേര്',
    'casteCategory.enterCasteName': 'ജാതിയുടെ പേര് നൽകുക',
    'casteCategory.save': 'സേവ് ചെയ്യുക',
    'casteCategory.cancel': 'റദ്ദാക്കുക',
    'casteCategory.nameError': 'ദയവായി സാധുവായ ജാതി ചുരുക്കപ്പേര് നൽകുക',
    
    // Castes
    'castes.title': 'ജാതികൾ',
    'castes.searchPlaceholder': 'ജാതിയെ തിരയുക',
    'castes.edit': 'തിരുത്തുക',
    'castes.editTitle': 'ജാതിയെ തിരുത്തുക',
    'castes.englishName': 'ഇംഗ്ലീഷ് പേര്',
    'castes.tamilName': 'തമിഴ് പേര്',
    'castes.enterEnglishName': 'ഇംഗ്ലീഷ് പേര് നൽകുക',
    'castes.enterTamilName': 'തമിഴ് പേര് നൽകുക',
    'castes.save': 'സേവ് ചെയ്യുക',
    'castes.cancel': 'റദ്ദാക്കുക',
    'castes.nameError': 'ദയവായി സാധുവായ ജാതി പേരുകൾ നൽകുക',
    
    // Sub-Castes
    'subCastes.title': 'ഉപ-ജാതികൾ',
    'subCastes.searchPlaceholder': 'ഉപ-ജാതിയെ തിരയുക',
    'subCastes.edit': 'തിരുത്തുക',
    'subCastes.editTitle': 'ഉപ-ജാതിയെ തിരുത്തുക',
    'subCastes.subCasteName': 'ഉപ-ജാതിയുടെ പേര്',
    'subCastes.enterSubCasteName': 'ഉപ-ജാതിയുടെ പേര് നൽകുക (ഇംഗ്ലീഷ് (തമിഴ്))',
    'subCastes.save': 'സേവ് ചെയ്യുക',
    'subCastes.cancel': 'റദ്ദാക്കുക',
    'subCastes.nameError': 'ദയവായി സാധുവായ ഉപ-ജാതി പേര് നൽകുക',
    
    // Voter Language
    'voterLanguage.title': 'വോട്ടർ ഭാഷ',
    'voterLanguage.searchPlaceholder': 'വോട്ടർ ഭാഷ തിരയുക',
    'voterLanguage.edit': 'തിരുത്തുക',
    'voterLanguage.editTitle': 'വോട്ടർ ഭാഷ തിരുത്തുക',
    'voterLanguage.languageName': 'ഭാഷയുടെ പേര്',
    'voterLanguage.enterLanguageName': 'ഭാഷയുടെ പേര് നൽകുക (ഇംഗ്ലീഷ് (മൂല))',
    'voterLanguage.save': 'സേവ് ചെയ്യുക',
    'voterLanguage.cancel': 'റദ്ദാക്കുക',
    'voterLanguage.nameError': 'ദയവായി സാധുവായ ഭാഷയുടെ പേര് നൽകുക',
    
    // Schemes
    'schemes.title': 'പദ്ധതികൾ',
    'schemes.searchPlaceholder': 'നേട്ട പദ്ധതികൾ തിരയുക',
    'schemes.edit': 'തിരുത്തുക',
    'schemes.editTitle': 'പദ്ധതി തിരുത്തുക',
    'schemes.schemeName': 'പദ്ധതിയുടെ പേര്',
    'schemes.schemeBy': 'പദ്ധതി വഴി',
    'schemes.enterSchemeName': 'പദ്ധതിയുടെ പേര് നൽകുക',
    'schemes.enterSchemeBy': 'പദ്ധതി നൽകുന്നവരെ നൽകുക',
    'schemes.save': 'സേവ് ചെയ്യുക',
    'schemes.cancel': 'റദ്ദാക്കുക',
    'schemes.nameError': 'ദയവായി സാധുവായ പദ്ധതി വിവരങ്ങൾ നൽകുക',
    
    // Feedback
    'feedback.title': 'ഫീഡ്‌ബാക്ക്',
    'feedback.searchPlaceholder': 'ഫീഡ്‌ബാക്ക് തിരയുക',
    'feedback.edit': 'തിരുത്തുക',
    'feedback.editTitle': 'ഫീഡ്‌ബാക്ക് ശീർഷകം',
    'feedback.feedbackIssueName': 'ഫീഡ്‌ബാക്ക് പ്രശ്നത്തിന്റെ പേര്',
    'feedback.enterFeedbackTitle': 'ഫീഡ്‌ബാക്ക് ശീർഷകം നൽകുക',
    'feedback.save': 'സേവ് ചെയ്യുക',
    'feedback.cancel': 'റദ്ദാക്കുക',
    'feedback.nameError': 'ദയവായി സാധുവായ ഫീഡ്‌ബാക്ക് ശീർഷകം നൽകുക',
    
    // Settings
    'settings.title': 'സെറ്റിംഗുകൾ',
    'settings.language': 'ആപ്പ് ഭാഷ',
    'settings.voterSlip': 'വോട്ടർ സ്ലിപ്പ്',
    'settings.setElection': 'തെരഞ്ഞെടുപ്പ് സെറ്റ് ചെയ്യുക',
    'settings.appBanner': 'ആപ്പ് ബാനർ',
    'settings.caste': 'ജാതി വിഭാഗം',
  },
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load saved language on app start
  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (savedLanguage && ['en', 'hi', 'ta', 'te', 'kn', 'ml'].includes(savedLanguage)) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      setLanguageState(newLanguage);
      await AsyncStorage.setItem('selectedLanguage', newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
