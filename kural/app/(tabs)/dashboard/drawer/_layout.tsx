// app/(drawer)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function DrawerLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}


