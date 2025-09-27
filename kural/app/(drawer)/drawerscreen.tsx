import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import { getUserSession, clearUserSession } from '../../services/api/userSession';
import { API_CONFIG } from '../../services/api/config';
import { useLanguage } from '../../contexts/LanguageContext';
import { modalContentAPI } from '../../services/api/modalContent';

export const options = {
  headerShown: false,
};


const { width } = Dimensions.get('window');

export default function DrawerScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    role: 'User',
    mobileNumber: '' // Will be fetched from database
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
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
          setProfileData({
            firstName: result.data.firstName || '',
            lastName: result.data.lastName || '',
            role: result.data.role || 'User',
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
    { id: 'profile', title: t('nav.profile'), icon: '👤', route: '/(drawer)/my_profile' },
    { id: 'elections', title: t('nav.elections'), icon: '🗳️', route: '/(drawer)/your_election' },
    { id: 'settings', title: t('nav.settings'), icon: '⚙️', route: '/(drawer)/settings' },
    { id: 'language', title: t('nav.language'), icon: '🌐', route: '/(drawer)/app_language' },
    { id: 'password', title: 'Change Password', icon: '🔒', route: '/(drawer)/change_password' },
    { id: 'privacy', title: 'Privacy Policy', icon: '🛡️', route: '/(drawer)/privacy_policy' },
    { id: 'terms', title: 'Terms & Conditions', icon: '📄', route: '/(drawer)/terms_condition' },
    { id: 'help', title: 'Help', icon: '❓', route: '/(drawer)/help' },
    { id: 'about', title: 'About', icon: 'ℹ️', route: '/(drawer)/about' },
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
    } else {
      router.push(route as any);
    }
  };

  const handleSendOTP = () => {
    // Here you would typically send OTP to the user's phone
    const phoneNumber = profileData.mobileNumber || 'your registered mobile number';
    Alert.alert(
      'OTP Sent',
      `OTP has been sent to ${phoneNumber}`,
      [
        {
          text: 'OK',
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
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearUserSession();
              // Try using a different navigation approach
              setTimeout(() => {
                router.replace('/(auth)/index' as any);
              }, 100);
            } catch (error) {
              console.error('Error during logout:', error);
              // Fallback to push
              setTimeout(() => {
                router.push('/(auth)/index' as any);
              }, 100);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with gradient background */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Text style={styles.profileIcon}>👤</Text>
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Text style={styles.cameraIcon}>📷</Text>
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
                <Text style={styles.userType}>{profileData.role}</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Menu List */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => (
          <View key={item.id}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => handleMenuPress(item.route, item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
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
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={[styles.menuTitle, { color: '#D32F2F', fontWeight: '700' }]}>{t('nav.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.changePasswordModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.otpTitle}>Send OTP</Text>
              <Text style={styles.otpDescription}>
                OTP will be sent to {profileData.mobileNumber || 'your registered mobile number'}
              </Text>
            </View>
            
            <TouchableOpacity style={styles.sendOTPButton} onPress={handleSendOTP}>
              <Text style={styles.sendOTPButtonText}>Send OTP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.aboutModal}>
            <View style={styles.aboutHeader}>
              <Text style={styles.aboutTitle}>About</Text>
              <TouchableOpacity onPress={() => setShowAboutModal(false)}>
                <Text style={styles.aboutCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.aboutContent} showsVerticalScrollIndicator={false}>
              {contentLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1976D2" />
                  <Text style={styles.loadingText}>Loading content...</Text>
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

      {/* Help Modal */}
      <Modal
        visible={showHelpModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.helpModal}>
            <View style={styles.helpHeader}>
              <Text style={styles.helpTitle}>Help</Text>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <Text style={styles.helpCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.helpContent} showsVerticalScrollIndicator={false}>
              {contentLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1976D2" />
                  <Text style={styles.loadingText}>Loading content...</Text>
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

      {/* Terms & Conditions Modal */}
      <Modal
        visible={showTermsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.termsModal}>
            <View style={styles.termsHeader}>
              <Text style={styles.termsTitle}>Terms & Conditions</Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <Text style={styles.termsCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.termsContent} showsVerticalScrollIndicator={false}>
              {contentLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1976D2" />
                  <Text style={styles.loadingText}>Loading content...</Text>
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

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.privacyModal}>
            <View style={styles.privacyHeader}>
              <Text style={styles.privacyTitle}>Privacy Policy</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                <Text style={styles.privacyCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.privacyContent} showsVerticalScrollIndicator={false}>
              {contentLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1976D2" />
                  <Text style={styles.loadingText}>Loading content...</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#E3F2FD',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 40,
    color: '#FFFFFF',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cameraIcon: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  userType: {
    fontSize: 16,
    color: '#666666',
  },
  menuContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 30,
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
    marginLeft: 46,
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
  aboutCloseIcon: {
    fontSize: 18,
    color: '#1976D2',
    fontWeight: 'bold',
  },
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
  helpCloseIcon: {
    fontSize: 18,
    color: '#1976D2',
    fontWeight: 'bold',
  },
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
  termsCloseIcon: {
    fontSize: 18,
    color: '#1976D2',
    fontWeight: 'bold',
  },
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
  privacyCloseIcon: {
    fontSize: 18,
    color: '#1976D2',
    fontWeight: 'bold',
  },
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

