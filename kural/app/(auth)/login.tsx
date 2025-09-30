import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../services/api/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { saveUserSession } from '../../services/api/userSession';

export default function LoginScreen() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    const trimmedMobile = mobile.trim();
    const trimmedPassword = password.trim();

    if (!trimmedMobile || !trimmedPassword) {
      Alert.alert('Missing info', 'Please enter mobile number and password.');
      return;
    }

    try {
      setSubmitting(true);

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
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', 'Invalid mobile number or password');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', (error as Error).message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.logo}
        />
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign In to your account</Text>
        <TextInput
          style={styles.input}
          placeholder="Mobile number"
          placeholderTextColor="#bdbdbd"
          keyboardType="phone-pad"
          value={mobile}
          onChangeText={setMobile}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#bdbdbd"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <View style={styles.recoverWrapper}>
          <TouchableOpacity 
            style={styles.recoverContainer}
            onPress={() => router.push('/(auth)/recover')}
          >
            <Text style={styles.recover}>Recover Password?</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
        style={styles.loginButton} onPress={handleLogin} disabled={submitting}>
          <Text style={styles.loginText}>{submitting ? 'Logging in…' : 'Login'}</Text>
        </TouchableOpacity>
        <Text style={styles.orText}>Or Sign in with your mobile number</Text>
        <TouchableOpacity 
          style={styles.otpButton}
          onPress={() => router.push('/(auth)/otp')}
        >
          <Text style={styles.otpText}>Login with OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  logoContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 40,
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logo: {
    width: 300,
    height: 280,
    resizeMode: 'contain',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#424242',
    color: '#fff',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  recoverWrapper: {
    width: '100%',
    marginBottom: 24,
  },
  recoverContainer: {
    alignSelf: 'flex-end',
    paddingHorizontal: 4,
  },
  recover: {
    color: '#1976D2',
    fontSize: 14,
    textAlign: 'right',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orText: {
    color: '#616161',
    fontSize: 15,
    marginBottom: 16,
    textAlign: 'center',
  },
  otpButton: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  otpText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});