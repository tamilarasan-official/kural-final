// app/(auth)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
export const unstable_settings = { initialRouteName: 'login', tabBarVisible: false };
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
