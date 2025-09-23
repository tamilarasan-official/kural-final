// app/(auth)/recover.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Recover() {
  const router = useRouter();
  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <Text>Recover Password (stub)</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{color:'#06f', marginTop:16}}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}