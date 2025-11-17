import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRole } from '../../contexts/RoleContext';
import { modalContentAPI } from '../../../services/api/modalContent';

export default function BoothAgentDrawerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userData } = useRole();
  const [profileData, setProfileData] = useState({
    name: '',
    role: 'Booth Agent',
    booth_id: '',
    aci_id: '',
    aci_name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
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
      let data = userData;
      
      if (!data || !data.booth_id) {
        const savedUserData = await AsyncStorage.getItem('userData');
        if (savedUserData) {
          data = JSON.parse(savedUserData);
        }
      }
      
      if (data) {
        setProfileData({
          name: data.name || '',
          role: data.role || 'Booth Agent',
          booth_id: data.booth_id || '',
          aci_id: data.aci_id || '',
          aci_name: data.aci_name || '',
          phone: data.phone || ''
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error getting user session:', error);
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

  useEffect(() => {
    initializeUser();
    fetchModalContent();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      initializeUser();
    }, [userData])
  );

  const menuItems = [
    { id: 'profile', title: 'Profile', iconName: 'person', route: '/(boothAgent)/drawer/my_profile' },
    { id: 'language', title: 'App Language', iconName: 'language', route: '/(boothAgent)/drawer/app_language' },
    { id: 'privacy', title: 'Privacy Policy', iconName: 'security', action: 'modal' },
    { id: 'terms', title: 'Terms & Conditions', iconName: 'description', action: 'modal' },
    { id: 'help', title: 'Help', iconName: 'help', action: 'modal' },
    { id: 'about', title: 'About', iconName: 'info', action: 'modal' },
  ];

  const handleMenuPress = (route: string, id: string, action?: string) => {
    if (action === 'modal') {
      if (id === 'about') {
        setShowAboutModal(true);
      } else if (id === 'help') {
        setShowHelpModal(true);
      } else if (id === 'terms') {
        setShowTermsModal(true);
      } else if (id === 'privacy') {
        setShowPrivacyModal(true);
      }
    } else {
      router.push(route as any);
    }
  };

  const renderContent = (content: string) => {
    if (!content) return <Text style={styles.contentText}>No content available</Text>;
    
    const formattedContent = content
      .replace(/\\n\\n/g, '\n\n')
      .replace(/\\n/g, '\n')
      .replace(/•/g, '• ');
    
    const lines = formattedContent.split('\n');
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '') {
        return <Text key={index} style={styles.contentSpacing}> </Text>;
      }
      
      if (/^(Key Highlights:|About|Our Mission:|Data We Collect:|How We Use This Data:|Prohibited Activities:|Contact Information:|Website:|Email:|Mobile:|Linkedin:|Privacy Policy|Terms & Conditions|Acceptance of Terms|Nature of Service|User Responsibilities|Scope of the Policy|Data Ownership and Control|Data Collection and Usage)/i.test(trimmedLine)) {
        return <Text key={index} style={styles.contentTitle}>{trimmedLine}</Text>;
      }
      
      if (/^(\d+\.|•|\*|-)\s/.test(trimmedLine)) {
        return <Text key={index} style={styles.contentBullet}>{trimmedLine}</Text>;
      }
      
      return <Text key={index} style={styles.contentText}>{trimmedLine}</Text>;
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
              await AsyncStorage.multiRemove(['userToken', 'userData', 'userRole']);
              router.replace('/(auth)');
            } catch (error) {
              console.error('Error during logout:', error);
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
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Camera permission is required to change profile picture');
        return;
      }

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
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#E3F2FD' }]} edges={['top', 'bottom']}>
      <StatusBar translucent={false} backgroundColor="#E3F2FD" barStyle="dark-content" />

      <TouchableOpacity style={[styles.closeButton, { top: insets.top + 12 }]} onPress={() => router.back()}>
        <Icon name="arrow-back" size={26} color="#1976D2" />
      </TouchableOpacity>

      <View style={[styles.headerContainer, { backgroundColor: '#E3F2FD' }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12, paddingBottom: 24 }]}>
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
                  <Icon name="person" size={50} color="#FFFFFF" />
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                <Icon name="camera-alt" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.userInfo}>
              {loading ? (
                <ActivityIndicator size="small" color="#333333" />
              ) : (
                <>
                  <Text style={styles.username}>{profileData.name}</Text>
                  <Text style={styles.userType}>{profileData.role}</Text>
                </>
              )}
            </View>
          </View>
        </View>
        <View style={styles.headerDivider} />
      </View>

      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {menuItems.map((item) => (
          <View key={item.id}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => handleMenuPress(item.route, item.id, item.action)}
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
          <Text style={[styles.menuTitle, { color: '#D32F2F', fontWeight: '700' }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.versionContainer, { paddingBottom: 20 + insets.bottom }]}>
        <Text style={styles.versionText}>V.3.1 |</Text>
      </View>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.aboutModal, { paddingBottom: 40 + insets.bottom }]}> 
            <View style={styles.aboutHeader}>
              <Text style={styles.aboutTitle}>About</Text>
              <TouchableOpacity onPress={() => setShowAboutModal(false)}>
                <Icon name="close" size={20} color="#666666" />
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
                  {renderContent(modalContent?.about?.content || '')}
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
          <View style={[styles.helpModal, { paddingBottom: 40 + insets.bottom }]}> 
            <View style={styles.helpHeader}>
              <Text style={styles.helpTitle}>Help</Text>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <Icon name="close" size={20} color="#666666" />
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
                  {renderContent(modalContent?.help?.content || '')}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Terms Modal */}
      <Modal
        visible={showTermsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.termsModal, { paddingBottom: 40 + insets.bottom }]}> 
            <View style={styles.termsHeader}>
              <Text style={styles.termsTitle}>Terms & Conditions</Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <Icon name="close" size={20} color="#666666" />
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
                  {renderContent(modalContent?.terms?.content || '')}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Privacy Modal */}
      <Modal
        visible={showPrivacyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.privacyModal, { paddingBottom: 40 + insets.bottom }]}> 
            <View style={styles.privacyHeader}>
              <Text style={styles.privacyTitle}>Privacy Policy</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                <Icon name="close" size={20} color="#666666" />
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
                  {renderContent(modalContent?.privacy?.content || '')}
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
    backgroundColor: '#E3F2FD',
  },
  header: {
    backgroundColor: '#E3F2FD',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#BBDEFB',
    marginHorizontal: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
    zIndex: 100,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 8,
  },
  profileImageContainer: {
    position: 'relative',
    zIndex: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  profileImageActual: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  userInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  userType: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  versionText: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  menuContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginRight: 20,
    textAlign: 'center',
  },
  menuTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  separator: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginLeft: 68,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  aboutModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    height: '90%',
  },
  aboutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  aboutContent: {
    flex: 1,
    paddingBottom: 20,
  },
  aboutSection: {
    marginBottom: 25,
  },
  helpModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    height: '90%',
  },
  helpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  helpContent: {
    flex: 1,
    paddingBottom: 20,
  },
  helpSection: {
    marginBottom: 25,
  },
  termsModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    height: '90%',
  },
  termsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  termsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  termsContent: {
    flex: 1,
    paddingBottom: 20,
  },
  termsSection: {
    marginBottom: 20,
  },
  privacyModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    height: '90%',
  },
  privacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  privacyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  privacyContent: {
    flex: 1,
    paddingBottom: 20,
  },
  privacySection: {
    marginBottom: 20,
  },
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
    height: 8,
    fontSize: 8,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 8,
    marginTop: 16,
    lineHeight: 24,
  },
  contentBullet: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333333',
    marginBottom: 6,
    marginLeft: 0,
    paddingLeft: 10,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444444',
    marginBottom: 6,
    textAlign: 'left',
  },
});
