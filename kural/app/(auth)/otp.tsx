// app/(auth)/otp.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function OTP() {
  const router = useRouter();
  async function onVerify() {
    await SecureStore.setItemAsync('userToken', 'otp_token_123');
    router.replace('/(tabs)/index');
  }
  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <Text>OTP screen (stub)</Text>
      <TouchableOpacity onPress={onVerify}>
        <Text style={{color:'#06f', marginTop:16}}>Simulate Verify</Text>
      </TouchableOpacity>
    </View>
  );
}