import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect, router } from 'expo-router';
import { getUserSession, clearUserSession } from '../../services/api/userSession';

export const options = {
  headerShown: false,
};


const { width } = Dimensions.get('window');

export default function DrawerScreen() {
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    role: 'User'
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

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
      const response = await fetch(`http://192.168.31.31:5000/api/v1/profile/${userId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProfileData({
            firstName: result.data.firstName || '',
            lastName: result.data.lastName || '',
            role: result.data.role || 'User'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Set default values if fetch fails
      setProfileData({
        firstName: 'User',
        lastName: 'Name',
        role: 'User'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load profile data when component mounts
  useEffect(() => {
    initializeUser();
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
    { id: 'profile', title: 'My Profile', icon: '👤', route: '/(drawer)/my_profile' },
    { id: 'elections', title: 'Your Elections', icon: '🗳️', route: '/(drawer)/your_election' },
    { id: 'settings', title: 'Settings', icon: '⚙️', route: '/(drawer)/setting' },
    { id: 'language', title: 'App Language', icon: '🌐', route: '/(drawer)/app_language' },
    { id: 'password', title: 'Change Password', icon: '🔒', route: '/(drawer)/change_password' },
    { id: 'privacy', title: 'Privacy Policy', icon: '🛡️', route: '/(drawer)/privacy_policy' },
    { id: 'terms', title: 'Terms & Conditions', icon: '📄', route: '/(drawer)/terms_condition' },
    { id: 'help', title: 'Help', icon: '❓', route: '/(drawer)/help' },
  ];

  const handleMenuPress = (route: string) => {
    router.push(route as any);
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
              onPress={() => handleMenuPress(item.route)}
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
          <Text style={[styles.menuTitle, { color: '#D32F2F', fontWeight: '700' }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
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
});

