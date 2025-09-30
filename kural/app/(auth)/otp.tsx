import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');

export default function OTP() {
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

  const renderBackgroundPattern = () => {
    const icons = [
      '📢', '👆', '🗳️', '💬', '✊', '✏️', '✅', '📊', '📋', '📝',
      '🎯', '📈', '📉', '📊', '📋', '📝', '🎯', '📈', '📉', '📊'
    ];
    
    const rows = Math.ceil(height / 80);
    const cols = Math.ceil(width / 80);
    
    return (
      <View style={styles.patternContainer}>
        {Array.from({ length: rows * cols }).map((_, index) => (
          <View key={index} style={[
            styles.patternItem,
            { backgroundColor: index % 2 === 0 ? '#E3F2FD' : '#FFFFFF' }
          ]}>
            <Text style={styles.patternIcon}>
              {icons[index % icons.length]}
            </Text>
            {index % 8 === 0 && (
              <Text style={styles.teamText}>TEAM</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Pattern */}
      {renderBackgroundPattern()}
      
      {/* Login with OTP Modal */}
      <View style={styles.modal}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Login with OTP</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Mobile number"
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
            ]}>Send OTP</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  patternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0.3,
  },
  patternItem: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    borderRadius: 8,
    position: 'relative',
  },
  patternIcon: {
    fontSize: 20,
    color: '#1976D2',
  },
  teamText: {
    position: 'absolute',
    bottom: 4,
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
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
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    color: '#1976D2',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});