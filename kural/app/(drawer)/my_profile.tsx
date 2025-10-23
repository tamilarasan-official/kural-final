import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getUserSession } from '../../services/api/userSession';
import { API_CONFIG } from '../../services/api/config';
import { useLanguage } from '../../contexts/LanguageContext';
import HeaderBack from '../components/HeaderBack';

export default function MyProfileScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    role: 'User',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [userId, setUserId] = useState('');
  const [userMobile, setUserMobile] = useState('');

  // Get user session and set up user data
  const initializeUser = async () => {
    try {
      const session = await getUserSession();
      if (session) {
        setUserId(session.userId);
        setUserMobile(session.mobileNumber);
        setFormData(prev => ({
          ...prev,
          mobileNumber: session.mobileNumber
        }));
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

  // Fetch profile data from API
  const fetchProfile = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/profile/${userId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFormData({
            firstName: result.data.firstName || '',
            lastName: result.data.lastName || '',
            email: result.data.email || '',
            mobileNumber: result.data.mobileNumber || userMobile,
            role: result.data.role || 'User',
          });
          setOriginalData(result.data);
        } else {
          // If profile doesn't exist, create default one
          createDefaultProfile();
        }
      } else {
        // If profile doesn't exist, create default one
        createDefaultProfile();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
        Alert.alert(t('profile.error'), t('profile.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  // Create default profile
  const createDefaultProfile = async () => {
    const defaultData = {
      firstName: 'User',
      lastName: 'Name',
      email: `user${userId}@example.com`,
      mobileNumber: userMobile,
      role: 'User',
    };
    
    setFormData(defaultData);
    setOriginalData(defaultData);
  };

  // Load profile data on component mount
  useEffect(() => {
    initializeUser();
  }, []);

  // Fetch profile when userId is available
  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setSaving(true);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          mobileNumber: formData.mobileNumber,
          role: formData.role,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setOriginalData(formData);
        setIsEditing(false);
        Alert.alert(t('profile.success'), t('profile.updatedSuccessfully'));
      } else {
        Alert.alert(t('profile.error'), result.message || t('profile.failedToUpdate'));
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert(t('profile.error'), t('profile.failedToSave'));
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
        firstName: originalData.firstName || '',
        lastName: originalData.lastName || '',
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
        {/* First Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>{t('profile.firstName')}</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={formData.firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
            editable={isEditing}
            placeholder={t('profile.enterFirstName')}
          />
        </View>

        {/* Last Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>{t('profile.lastName')}</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={formData.lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
            editable={isEditing}
            placeholder={t('profile.enterLastName')}
          />
        </View>

        {/* Email */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>{t('profile.email')}</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            editable={isEditing}
            placeholder={t('profile.enterEmail')}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Mobile Number */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>{t('profile.mobileNumber')}</Text>
          <TextInput
            style={[styles.input, styles.inputReadOnly]}
            value={formData.mobileNumber}
            editable={false}
            placeholder={t('profile.enterMobile')}
            keyboardType="phone-pad"
          />
          <Text style={styles.readOnlyText}>{t('profile.mobileCannotChange')}</Text>
        </View>

        {/* Role */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>{t('profile.role')}</Text>
          <TextInput
            style={[styles.input, styles.inputReadOnly]}
            value={formData.role}
            editable={false}
            placeholder={t('profile.selectRole')}
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

