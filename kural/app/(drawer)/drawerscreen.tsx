import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

export const options = {
  headerShown: false,
};


const { width } = Dimensions.get('window');

export default function DrawerScreen() {
  const router = useRouter();

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
            <Text style={styles.username}>thamizh TVK</Text>
            <Text style={styles.userType}>User</Text>
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
          onPress={() => router.replace('/(auth)/index')}
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

