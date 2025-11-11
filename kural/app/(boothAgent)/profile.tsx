import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRole } from '../contexts/RoleContext';

export default function BoothAgentProfile() {
  const router = useRouter();
  const { userData, setRole, setUserData } = useRole();
  const [loading, setLoading] = useState(false);

  const menuItems = [
    { id: 'dashboard', title: 'Dashboard', iconName: 'dashboard', route: '/(boothAgent)/dashboard' },
    { id: 'voters', title: 'Voters', iconName: 'people', route: '/(boothAgent)/voters' },
    { id: 'families', title: 'Families', iconName: 'home', route: '/(boothAgent)/families' },
    { id: 'surveys', title: 'Surveys', iconName: 'assignment', route: '/(boothAgent)/surveys' },
    { id: 'reports', title: 'Reports', iconName: 'bar-chart', route: '/(boothAgent)/reports' },
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
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userData');
              await AsyncStorage.removeItem('userRole');
              setRole(null);
              setUserData(null);
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error during logout:', error);
              router.replace('/(auth)/login');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <Icon name="person" size={60} color="#FFFFFF" />
          </View>
        </View>
        
        <View style={styles.userInfo}>
          {loading ? (
            <ActivityIndicator size="small" color="#4FC3F7" />
          ) : (
            <>
              <Text style={styles.username}>
                {userData?.firstName || 'Booth Agent'} {userData?.lastName || ''}
              </Text>
              <Text style={styles.userRole}>{userData?.role || 'Booth Agent'}</Text>
              <Text style={styles.userBooth}>
                Booth: {userData?.boothAllocation || userData?.activeElection || 'N/A'}
              </Text>
              <Text style={styles.userMobile}>{userData?.mobileNumber || ''}</Text>
            </>
          )}
        </View>
      </View>

      {/* Menu List */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <View key={item.id}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => handleMenuPress(item.route)}
              activeOpacity={0.7}
            >
              <Icon 
                name={item.iconName} 
                size={24} 
                color="#4FC3F7" 
                style={styles.menuIcon}
              />
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Icon name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
            <View style={styles.separator} />
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity 
          style={[styles.menuItem, { marginTop: 20 }]}
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

      {/* Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4FC3F7',
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 34,
  },
  profileSection: {
    backgroundColor: '#fff',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userInfo: {
    alignItems: 'center',
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 5,
  },
  userBooth: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  userMobile: {
    fontSize: 14,
    color: '#666',
  },
  menuContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 60,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
});
