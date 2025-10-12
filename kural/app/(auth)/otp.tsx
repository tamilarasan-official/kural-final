import { useLanguage } from '../../contexts/LanguageContext';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');

export default function OTP() {
  const { t } = useLanguage();
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState('');

  const handleSendOTP = async () => {
    // Validate mobile number
    if (!mobileNumber.trim()) {
      alert('Please fill mobile number first');
      return;
    }

    // Basic mobile number validation (10 digits)
    if (mobileNumber.trim().length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      // Handle OTP sending logic here
      console.log('Sending OTP to:', mobileNumber);
      await SecureStore.setItemAsync('userToken', 'otp_token_123');
      router.replace('/(tabs)/index');
    } catch (error) {
      console.error('Error sending OTP:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* LSI Image Background - Top */}
      <View style={styles.topBackgroundSection}>
        <Image
          source={require('../../assets/images/LSI.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>

      {/* Login with OTP Modal - Center */}
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{t('auth.loginWithOtp')}</Text>
          
          <TextInput
            style={styles.input}
            placeholder={t('auth.mobileNumber')}
            placeholderTextColor="#999999"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
          />
          
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Note:</Text>
            <Text style={styles.noteText}>You will be verified only if your superior registered you.</Text>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              !mobileNumber.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSendOTP}
            disabled={!mobileNumber.trim()}
          >
            <Text style={[
              styles.sendButtonText,
              !mobileNumber.trim() && styles.sendButtonTextDisabled
            ]}>{t('auth.sendOtp')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LSI Image Background - Bottom */}
      <View style={styles.bottomBackgroundSection}>
        <Image
          source={require('../../assets/images/LSI.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBackgroundSection: {
    flex: 0.3,
    backgroundColor: '#E6F0FA',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 0.4,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomBackgroundSection: {
    flex: 0.3,
    backgroundColor: '#E6F0FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  noteContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  noteLabel: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
    marginRight: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  sendButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sendButtonTextDisabled: {
    color: '#999999',
  },
});