import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect, router as globalRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getUserSession, clearUserSession } from '../../services/api/userSession';
import { API_CONFIG } from '../../services/api/config';
import { useLanguage } from '../../contexts/LanguageContext';
import { modalContentAPI } from '../../services/api/modalContent';

export const options = {
  headerShown: false,
};

export default function DrawerScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    role: 'User',
    mobileNumber: '' // Will be fetched from database
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    about: { title: '', content: '' },
    help: { title: '', content: '' },
    terms: { title: '', content: '' },
    privacy: { title: '', content: '' }
  });
  const [contentLoading, setContentLoading] = useState(false);

  // Get user session
  const initializeUser = async () => {
    try {
      const session = await getUserSession();
      if (session) {
        setUserId(session.userId);
      } else {
        // If no session, redirect to login
        router.replace('/(auth)/index');
        return;
      }
    } catch (error) {
      console.error('Error getting user session:', error);
      router.replace('/(auth)/index');
    }
  };

  // Fetch profile data
  const fetchProfile = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/profile/${userId}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Profile API Response:', result); // Debug log
        if (result.success) {
          console.log('Role from API:', result.data.role); // Debug log
          setProfileData({
            firstName: result.data.firstName || '',
            lastName: result.data.lastName || '',
            role: result.data.role || 'Admin',
            mobileNumber: result.data.mobileNumber || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Set default values if fetch fails
      setProfileData({
        firstName: 'User',
        lastName: 'Name',
        role: 'User',
        mobileNumber: ''
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch modal content from database
  const fetchModalContent = async () => {
    try {
      setContentLoading(true);
      const response = await modalContentAPI.getAll();
      
      if (response.success) {
        const contentMap = {};
        response.data.forEach((item: any) => {
          contentMap[item.modalType] = {
            title: item.title,
            content: item.content
          };
        });
        setModalContent(contentMap);
      }
    } catch (error) {
      console.error('Error fetching modal content:', error);
    } finally {
      setContentLoading(false);
    }
  };

  // Load profile data when component mounts
  useEffect(() => {
    initializeUser();
    fetchModalContent();
  }, []);

  // Fetch profile when userId is available
  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  // Refresh profile data when screen comes into focus (Expo Router way)
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        fetchProfile();
      }
    }, [userId])
  );


  const menuItems = [
    { id: 'profile', title: t('nav.profile'), iconName: 'person', route: '/(drawer)/my_profile' },
    { id: 'elections', title: t('elections.title'), iconName: 'how-to-vote', route: '/(drawer)/your_election' },
    { id: 'settings', title: t('settings.title'), iconName: 'settings', route: '/(drawer)/settings' },
    { id: 'language', title: t('settings.language'), iconName: 'language', route: '/(drawer)/app_language' },
    { id: 'password', title: t('drawer.changePassword'), iconName: 'lock', route: '/(drawer)/change_password' },
    { id: 'privacy', title: t('drawer.privacy'), iconName: 'security', route: '/(drawer)/privacy_policy' },
    { id: 'terms', title: t('drawer.terms'), iconName: 'description', route: '/(drawer)/terms_condition' },
    { id: 'help', title: t('drawer.help'), iconName: 'help', route: '/(drawer)/help' },
    { id: 'about', title: t('drawer.about'), iconName: 'info', route: '/(drawer)/about' },
  ];

  const handleMenuPress = (route: string, id: string) => {
    if (id === 'password') {
      setShowChangePasswordModal(true);
    } else if (id === 'about') {
      setShowAboutModal(true);
    } else if (id === 'help') {
      setShowHelpModal(true);
    } else if (id === 'terms') {
      setShowTermsModal(true);
    } else if (id === 'privacy') {
      setShowPrivacyModal(true);
    } else if (id === 'profile') {
      router.push('/(drawer)/my_profile');
    } else if (id === 'elections') {
      router.push('/(drawer)/your_election');
    } else {
      router.push(route as any);
    }
  };

  const handleSendOTP = () => {
    // Here you would typically send OTP to the user's phone
    const phoneNumber = profileData.mobileNumber || 'your registered mobile number';
    Alert.alert(
      t('drawer.otpSent'),
      `${t('drawer.otpSentMessage')} ${phoneNumber}`,
      [
        {
          text: t('common.ok'),
          onPress: () => {
            setShowChangePasswordModal(false);
            // Navigate to OTP verification screen or show next step
            router.push('/(drawer)/change_password');
          }
        }
      ]
    );
  };

  const handleCloseModal = () => {
    setShowChangePasswordModal(false);
  };

  // Helper function to render content with proper formatting
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.trim() === '') return <Text key={index} style={styles.contentSpacing}></Text>;
      
      // Check if line is a title (starts with number or bullet)
      if (/^\d+\.|^•|^Key Highlights:|^About|^Our Mission:|^Data We Collect:|^How We Use This Data:|^Prohibited Activities:|^Contact Information:|^Website:|^Email:|^Mobile:|^Linkedin:/.test(line.trim())) {
        return <Text key={index} style={styles.contentTitle}>{line}</Text>;
      }
      
      // Check if line is a bullet point
      if (/^•|^1\.|^2\.|^3\.|^4\.|^5\.|^6\.|^7\.|^8\.|^9\.|^10\.|^11\.|^12\.|^13\.|^14\.|^15\.|^16\.|^17\./.test(line.trim())) {
        return <Text key={index} style={styles.contentBullet}>{line}</Text>;
      }
      
      // Regular content
      return <Text key={index} style={styles.contentText}>{line}</Text>;
    });
  };

  const handleLogout = () => {
    Alert.alert(
      t('drawer.logout'),
      t('drawer.logoutConfirm'),
      [
        {
          text: t('drawer.cancel'),
          style: 'cancel',
        },
        {
          text: t('drawer.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await clearUserSession();
              // Navigate to auth screen
              router.replace('/(auth)');
            } catch (error) {
              console.error('Error during logout:', error);
              // Fallback navigation
              router.replace('/(auth)');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(t('drawer.permissionRequired'), t('drawer.cameraPermission'));
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('common.error'), t('drawer.imagePickError'));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#E8F3FF' }]} edges={['top', 'bottom']}>
      <StatusBar translucent={false} backgroundColor="#E8F3FF" barStyle="dark-content" />

      {/* Header with wave background */}
      <View style={[styles.headerContainer, { backgroundColor: '#E8F3FF' }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12, paddingBottom: 20 }]}> 
          <TouchableOpacity style={[styles.closeButton, { top: insets.top + 8 }]} onPress={() => router.back()}>
            <Icon name="arrow-back" size={22} color="#0D47A1" />
          </TouchableOpacity>

          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <TouchableOpacity style={styles.profileImage} onPress={pickImage}>
                {profileImage ? (
                  <Image 
                    source={{ uri: profileImage }} 
                    style={styles.profileImageActual}
                    resizeMode="cover"
                  />
                ) : (
                  <Icon name="person" size={60} color="#FFFFFF" />
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                <Icon name="camera-alt" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.userInfo}>
              {loading ? (
                <ActivityIndicator size="small" color="#1976D2" />
              ) : (
                <>
                  <Text style={styles.username}>
                    {profileData.firstName} {profileData.lastName}
                  </Text>
                  <Text style={styles.userType}>{profileData.role || 'Admin'}</Text>
                </>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Menu List */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {menuItems.map((item) => (
          <View key={item.id}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => handleMenuPress(item.route, item.id)}
              activeOpacity={0.7}
            >
              <Icon 
                name={item.iconName} 
                size={24} 
                color="#1976D2" 
                style={styles.menuIcon}
              />
              <Text style={styles.menuTitle}>{item.title}</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity 
          style={[styles.menuItem, { marginTop: 8, marginBottom: 24 }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Icon 
            name="logout" 
            size={24} 
            color="#D32F2F" 
            style={styles.menuIcon}
          />
          <Text style={[styles.menuTitle, { color: '#D32F2F', fontWeight: '700' }]}>{t('nav.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Version Number */}
      <View style={[styles.versionContainer, { paddingBottom: 20 + insets.bottom }]}>
        <Text style={styles.versionText}>{t('drawer.version')}</Text>
      </View>

      {/* Modals (unchanged) */}
      <Modal
        visible={showChangePasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.changePasswordModal, { paddingBottom: 40 + insets.bottom }]}> 
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('drawer.changePassword')}</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.otpTitle}>{t('drawer.sendOTP')}</Text>
              <Text style={styles.otpDescription}>
                {t('drawer.otpDescription')} {profileData.mobileNumber || t('drawer.registeredMobile')}
              </Text>
            </View>
            
            <TouchableOpacity style={styles.sendOTPButton} onPress={handleSendOTP}>
              <Text style={styles.sendOTPButtonText}>{t('drawer.sendOTP')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAboutModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.aboutModal, { paddingBottom: 40 + insets.bottom }]}> 
            <View style={styles.aboutHeader}>
              <Text style={styles.aboutTitle}>{t('drawer.about')}</Text>
              <TouchableOpacity onPress={() => setShowAboutModal(false)}>
                <Icon name="close" size={20} color="#666666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.aboutContent} showsVerticalScrollIndicator={false}>
              {contentLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1976D2" />
                  <Text style={styles.loadingText}>{t('drawer.loadingContent')}</Text>
                </View>
              ) : (
                <View style={styles.aboutSection}>
                  {renderContent(modalContent.about.content)}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showHelpModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.helpModal, { paddingBottom: 40 + insets.bottom }]}> 
            <View style={styles.helpHeader}>
              <Text style={styles.helpTitle}>{t('drawer.help')}</Text>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <Icon name="close" size={20} color="#666666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.helpContent} showsVerticalScrollIndicator={false}>
              {contentLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1976D2" />
                  <Text style={styles.loadingText}>{t('drawer.loadingContent')}</Text>
                </View>
              ) : (
                <View style={styles.helpSection}>
                  {renderContent(modalContent.help.content)}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTermsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.termsModal, { paddingBottom: 40 + insets.bottom }]}> 
            <View style={styles.termsHeader}>
              <Text style={styles.termsTitle}>{t('drawer.terms')}</Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <Icon name="close" size={20} color="#666666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.termsContent} showsVerticalScrollIndicator={false}>
              {contentLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1976D2" />
                  <Text style={styles.loadingText}>{t('drawer.loadingContent')}</Text>
                </View>
              ) : (
                <View style={styles.termsSection}>
                  {renderContent(modalContent.terms.content)}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPrivacyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.privacyModal, { paddingBottom: 40 + insets.bottom }]}> 
            <View style={styles.privacyHeader}>
              <Text style={styles.privacyTitle}>{t('drawer.privacy')}</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                <Icon name="close" size={20} color="#666666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.privacyContent} showsVerticalScrollIndicator={false}>
              {contentLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1976D2" />
                  <Text style={styles.loadingText}>{t('drawer.loadingContent')}</Text>
                </View>
              ) : (
                <View style={styles.privacySection}>
                  {renderContent(modalContent.privacy.content)}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    backgroundColor: '#E8F3FF',
  },
  header: {
    backgroundColor: '#E8F3FF',
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 34,
    left: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    // No shadow to match the flat arrow style in the screenshot
    elevation: 0,
  },
  // closeIcon removed - using vector icons now
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
    zIndex: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // profileIcon removed - using vector icons now
  profileImageActual: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  // cameraIcon removed - using vector icons now
  userInfo: {
    flex: 1,
    alignItems: 'flex-start',
    marginLeft: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  userType: {
    fontSize: 16,
    color: '#666666',
    flexWrap: 'wrap',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  versionText: {
    fontSize: 14,
    color: '#666666',
  },
  menuContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
    textAlign: 'center',
  },
  menuTitle: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 60,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  changePasswordModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    minHeight: 200,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  modalCloseIcon: {
    fontSize: 20,
    color: '#666666',
  },
  modalContent: {
    marginBottom: 30,
  },
  otpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  otpDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  sendOTPButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  sendOTPButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // About Modal Styles
  aboutModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    height: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  aboutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  // aboutCloseIcon removed - using vector icons now
  aboutContent: {
    flex: 1,
    paddingBottom: 20,
  },
  aboutSection: {
    marginBottom: 25,
  },
  aboutSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 15,
  },
  aboutDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    textAlign: 'left',
    marginBottom: 10,
  },
  highlightList: {
    marginTop: 10,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  highlightNumber: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: 'bold',
    marginRight: 10,
    minWidth: 20,
  },
  highlightText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    lineHeight: 22,
  },
  aboutDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  missionList: {
    marginTop: 10,
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  missionBullet: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: 'bold',
    marginRight: 10,
    minWidth: 20,
  },
  missionText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    lineHeight: 22,
  },
  contactInfo: {
    marginTop: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactLabel: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
    minWidth: 80,
  },
  contactValue: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '600',
    flex: 1,
  },
  // Help Modal Styles
  helpModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    height: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  helpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  // helpCloseIcon removed - using vector icons now
  helpContent: {
    flex: 1,
    paddingBottom: 20,
  },
  helpSection: {
    marginBottom: 25,
  },
  helpDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    textAlign: 'left',
    marginBottom: 10,
  },
  helpDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  // Terms & Conditions Modal Styles
  termsModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    height: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  termsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  termsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  // termsCloseIcon removed - using vector icons now
  termsContent: {
    flex: 1,
    paddingBottom: 20,
  },
  termsMainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 15,
    textAlign: 'center',
  },
  termsIntro: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    textAlign: 'left',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  termsSection: {
    marginBottom: 20,
  },
  termsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  termsSubTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginTop: 10,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
    textAlign: 'left',
    marginBottom: 5,
  },
  // Privacy Policy Modal Styles
  privacyModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    height: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  privacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  privacyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  // privacyCloseIcon removed - using vector icons now
  privacyContent: {
    flex: 1,
    paddingBottom: 20,
  },
  privacyMainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 15,
    textAlign: 'center',
  },
  privacyIntro: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    textAlign: 'left',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  privacySection: {
    marginBottom: 20,
  },
  privacySectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  privacySubTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginTop: 10,
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
    textAlign: 'left',
    marginBottom: 5,
  },
  // Content formatting styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  contentSpacing: {
    height: 10,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
    marginTop: 10,
  },
  contentBullet: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
    marginBottom: 5,
    marginLeft: 10,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
    marginBottom: 5,
  },
});

