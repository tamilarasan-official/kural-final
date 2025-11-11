import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getUserSession, saveUserSession } from '../../../../services/api/userSession';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../../../services/api/config';
import { useLanguage } from '../../../../contexts/LanguageContext';
import HeaderBack from '../../../components/HeaderBack';

export default function MyProfileScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState({
    constituency: '',
    name: '',
    email: '',
    mobileNumber: '',
    role: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  // Get user session and set up user data
  const initializeUser = async () => {
    try {
      const session = await getUserSession();
      console.log('Session data in profile:', session);
      
      // Also get userData from AsyncStorage (which has aci_id and aci_name)
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      console.log('UserData from AsyncStorage:', userData);
      
      if (session || userData) {
        // Format constituency as "aci_id - aci_name" from userData
        const constituency = userData?.aci_id && userData?.aci_name 
          ? `${userData.aci_id} - ${userData.aci_name}`
          : '';
        
        const name = session?.name || userData?.name || 'User';
        const role = session?.role || userData?.role || 'User';
        const mobileNumber = session?.mobileNumber || userData?.phone || '';
        
        console.log('Formatted constituency:', constituency);
        
        // Set data from session
        setFormData({
          constituency: constituency,
          name: name,
          email: '', // Email initially blank, user can edit
          mobileNumber: mobileNumber,
          role: role,
        });
        setOriginalData({
          constituency: constituency,
          name: name,
          email: '',
          mobileNumber: mobileNumber,
          role: role,
        });
        setLoading(false);
      } else {
        // If no session, redirect to login
        console.log('No session found, redirecting to login');
        router.replace('/(auth)/index');
        return;
      }
    } catch (error) {
      console.error('Error getting user session:', error);
      router.replace('/(auth)/index');
    }
  };

  // Load profile data on component mount
  useEffect(() => {
    initializeUser();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Basic validation - only email is required if entered
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }
    }

    try {
      setSaving(true);
      
      // Get token and userId from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?._id || userData?.id;
      
      if (!token || !userId) {
        Alert.alert('Error', 'Session expired. Please login again.');
        return;
      }
      
      // Update user via API
      const response = await fetch(`http://10.19.146.109:5000/api/v1/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: formData.email.trim() || undefined, // Only send if not empty
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        // Update session with new email if changed
        const session = await getUserSession();
        if (session) {
          await saveUserSession(
            session.mobileNumber,
            session.userId,
            session.name,
            session.role,
            session.aci_id,
            session.aci_name
          );
        }
        
        setOriginalData(formData);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (originalData) {
      setFormData({
        constituency: originalData.constituency || '',
        name: originalData.name || '',
        email: originalData.email || '',
        mobileNumber: originalData.mobileNumber || '',
        role: originalData.role || 'User',
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>{t('profile.loadingData')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#E8F3FF' }]} edges={['top', 'bottom']}>
      <StatusBar translucent={false} backgroundColor="#E8F3FF" barStyle="dark-content" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: 12 }]}>
        <HeaderBack onPress={() => router.back()} />
        <Text style={styles.title}>{t('profile.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* Constituency */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Constituency</Text>
          <TextInput
            style={[styles.input, styles.inputReadOnly]}
            value={formData.constituency}
            editable={false}
            placeholder="Constituency"
          />
        </View>

        {/* Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={[styles.input, styles.inputReadOnly]}
            value={formData.name}
            editable={false}
            placeholder="Enter name"
          />
        </View>

        {/* Email */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            editable={isEditing}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Mobile Number */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={[styles.input, styles.inputReadOnly]}
            value={formData.mobileNumber}
            editable={false}
            placeholder="Enter mobile"
            keyboardType="phone-pad"
          />
          <Text style={styles.readOnlyText}>Mobile number cannot be changed</Text>
        </View>

        {/* Role */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Role</Text>
          <TextInput
            style={[styles.input, styles.inputReadOnly]}
            value={formData.role}
            editable={false}
            placeholder="Select role"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {!isEditing ? (
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>{t('profile.editProfile')}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancel}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#E8F3FF',
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fieldContainer: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
    color: '#000000',
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#666666',
  },
  inputReadOnly: {
    backgroundColor: '#F0F0F0',
    color: '#666666',
  },
  readOnlyText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#424242',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  saveButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
});

