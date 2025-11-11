import { useLanguage } from '../../contexts/LanguageContext';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../services/api/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { saveUserSession } from '../../services/api/userSession';
import { MaterialIcons } from '@expo/vector-icons';
import { boothAPI } from '../../services/api/booth';
import { authAPI } from '../../services/api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const { t } = useLanguage();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    const trimmedMobile = mobile.trim();
    const trimmedPassword = password.trim();

    console.log('Login attempt with:', trimmedMobile);

    if (!trimmedMobile || !trimmedPassword) {
      Alert.alert('Missing info', 'Please enter mobile number and password.');
      return;
    }

    try {
      // Try Assembly CI / Admin login first (using phone)
      try {
        console.log('Attempting Assembly CI login...');
        const authResponse = await authAPI.login(trimmedMobile, trimmedPassword);
        
        console.log('Assembly CI response:', authResponse);
        
        if (authResponse?.success && authResponse?.token) {
          // Save token and user data
          await AsyncStorage.setItem('userToken', authResponse.token);
          await AsyncStorage.setItem('userData', JSON.stringify(authResponse.data));
          await AsyncStorage.setItem('userRole', authResponse.data.role);
          
          // Save user session with complete info
          await saveUserSession(
            trimmedMobile, 
            authResponse.data._id || authResponse.data.id,
            authResponse.data.name,
            authResponse.data.role,
            authResponse.data.aci_id,
            authResponse.data.aci_name
          );
          
          console.log('Assembly CI/Admin logged in successfully:', authResponse.data);
          
          // Navigate based on role
          if (authResponse.data.role === 'Assembly CI' || authResponse.data.role === 'AssemblyIncharge') {
            router.replace('/(tabs)'); // Assembly CI dashboard is at (tabs)/index.tsx
          } else if (authResponse.data.role === 'admin') {
            router.replace('/(tabs)'); // Admin also goes to Assembly CI dashboard
          } else {
            router.replace('/(tabs)');
          }
          return;
        }
      } catch (authError: any) {
        console.log('Assembly CI login failed, trying Booth Agent login...', authError.message);
        // If Assembly CI login fails, try Booth Agent login
      }

      // Try Booth Agent login
      try {
        console.log('Attempting Booth Agent login...');
        const boothResponse = await boothAPI.login(trimmedMobile, trimmedPassword);
        
        console.log('Booth Agent response:', boothResponse);
        
        if (boothResponse?.success && boothResponse?.token) {
          // Save token and user data
          await AsyncStorage.setItem('userToken', boothResponse.token);
          await AsyncStorage.setItem('userData', JSON.stringify(boothResponse.data));
          await AsyncStorage.setItem('userRole', boothResponse.data.role);
          
          console.log('✅ Booth agent logged in successfully:', boothResponse.data);
          console.log('✅ Saved to AsyncStorage - booth_id:', boothResponse.data.booth_id);
          
          // Verify what was saved
          const savedData = await AsyncStorage.getItem('userData');
          console.log('✅ Verification - Data in AsyncStorage:', savedData);
          
          // Navigate to Booth Agent dashboard
          router.replace('/(boothAgent)/dashboard');
          return;
        }
      } catch (boothError: any) {
        console.log('Booth agent login failed, trying Firebase...', boothError.message);
        // If booth agent login fails, continue to try Firebase login
      }

      // If booth agent login fails, try Firebase (regular user)
      // First try with mobile as Number (if Firestore stored as number)
      let q = query(
        collection(db, 'kural app'),
        where('Mobile number', '==', Number(trimmedMobile)),
        where('Password', '==', trimmedPassword)
      );
      let querySnapshot = await getDocs(q);

      // If nothing found, try with mobile as String (if stored as string)
      if (querySnapshot.empty) {
        q = query(
          collection(db, 'kural app'),
          where('Mobile number', '==', trimmedMobile),
          where('Password', '==', trimmedPassword)
        );
        querySnapshot = await getDocs(q);
      }

      if (!querySnapshot.empty) {
        // Auth success → save user session and go to tabs
        await saveUserSession(trimmedMobile);
        // Use push instead of replace to ensure proper navigation
        router.push('/(tabs)');
      } else {
        Alert.alert('Login Failed', 'Invalid mobile number or password');
      }
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Error', (error as Error).message ?? 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{ flex: 1 }}>
          {/* LSI Image Section - Top 50% */}
          <View style={styles.lsiImageSection}>
            <Image
              source={require('../../assets/images/LSI.png')}
              style={styles.lsiImage}
              resizeMode="cover"
            />
          </View>

          {/* Curved Modal Section - Bottom 50% */}
          <View style={styles.modalSection}>
            <View style={styles.curvedModal}>
              {/* Title */}
              <Text style={styles.modalTitle}>Sign In to your{'\n'}account</Text>

              {/* Mobile Input Field */}
              <TextInput
                style={styles.inputField}
                placeholder={t('auth.mobileNumber')}
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
                returnKeyType="next"
                onSubmitEditing={() => {
                  // move focus to password if needed
                  // keep simple as we don't have refs here
                }}
              />

              {/* Password Input Field */}
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              {/* Recover Password Link */}
              <View style={styles.recoverWrapper}>
                <TouchableOpacity
                  style={styles.recoverContainer}
                  onPress={() => router.push('/(auth)/recover')}
                >
                  <Text style={styles.recoverText}>Recover Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={styles.modalLoginButton}
                onPress={handleLogin}
              >
                <Text style={styles.modalLoginText}>{t('auth.login')}</Text>
              </TouchableOpacity>

              {/* Or Text */}
              <Text style={styles.orText}>{t('auth.orSignInWithMobile')}</Text>

              {/* OTP Button */}
              <TouchableOpacity
                style={styles.otpButton}
                onPress={() => router.push('/(auth)/otp')}
              >
                <Text style={styles.otpText}>{t('auth.loginWithOtp')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  lsiImageSection: {
    flex: 0.45,
    backgroundColor: '#E6F0FA',
  },
  lsiImage: {
    width: '100%',
    height: '100%',
  },
  modalSection: {
    flex: 0.55,
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-end',
  },
  curvedModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 400,
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 40,
  },
  inputField: {
    backgroundColor: '#424242',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 20,
    fontSize: 16,
    color: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#424242',
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 18,
  },
  eyeButton: {
    padding: 4,
  },
  recoverWrapper: {
    width: '100%',
    marginBottom: 30,
  },
  recoverContainer: {
    alignSelf: 'flex-end',
    paddingHorizontal: 4,
  },
  recoverText: {
    color: '#1976D2',
    fontSize: 14,
    textAlign: 'right',
    fontWeight: '500',
  },
  modalLoginButton: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modalLoginText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orText: {
    color: '#666',
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  otpButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  otpText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});