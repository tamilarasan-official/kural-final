import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRole } from '../../contexts/RoleContext';

export default function BoothAgentProfileScreen() {
  const router = useRouter();
  const { userData } = useRole();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    constituency: '',
    name: '',
    booth_id: '',
    booth_agent_id: '',
    mobile: '',
    role: 'Booth Agent'
  });

  const loadProfileData = async () => {
    try {
      let data = userData;
      
      if (!data || !data.booth_id) {
        const savedUserData = await AsyncStorage.getItem('userData');
        if (savedUserData) {
          data = JSON.parse(savedUserData);
        }
      }
      
      if (data) {
        const constituency = data.aci_id && data.aci_name 
          ? `${data.aci_id} - ${data.aci_name}` 
          : '';
        
        const boothAgentId = data.phone && data.booth_id 
          ? `${data.phone}-${data.booth_id.replace('BOOTH', '')}` 
          : '';

        setProfileData({
          constituency: constituency,
          name: data.name || '',
          booth_id: data.booth_id || '',
          booth_agent_id: boothAgentId,
          mobile: String(data.phone || ''),
          role: data.role || 'Booth Agent'
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [userData]);

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing feature will be available soon');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Constituency */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Constituency</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={profileData.constituency}
              editable={false}
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        {/* Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={profileData.name}
              editable={false}
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        {/* Booth ID */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Booth ID</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={profileData.booth_id}
              editable={false}
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        {/* Booth Agent ID */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Booth Agent ID</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={profileData.booth_agent_id}
              editable={false}
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        {/* Mobile Number */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={profileData.mobile}
              editable={false}
              placeholderTextColor="#999999"
              keyboardType="phone-pad"
            />
          </View>
          <Text style={styles.helperText}>Mobile number cannot be changed</Text>
        </View>

        {/* Role */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Role</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={profileData.role}
              editable={false}
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={handleEditProfile}
          activeOpacity={0.8}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#666666',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 6,
    fontStyle: 'italic',
  },
  editButton: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
