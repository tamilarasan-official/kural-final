import React, { useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { BannerProvider } from '@/contexts/BannerContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { RoleProvider } from './contexts/RoleContext';
import AuthWrapper from '@/components/AuthWrapper';
import IntroAnimation from '@/components/IntroAnimation';

export const unstable_settings = {
  initialRouteName: '(auth)/index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showIntro, setShowIntro] = useState(true);

  const handleAnimationFinish = () => {
    // Animation finished, show main app
    setShowIntro(false);
  };

  // Show intro animation on every app launch
  if (showIntro) {
    return <IntroAnimation onFinish={handleAnimationFinish} />;
  }

  // Main app content
  return (
    <LanguageProvider>
      <RoleProvider>
        <BannerProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AuthWrapper>
              <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(boothAgent)" options={{ headerShown: false }} />
                <Stack.Screen name="(assemblyIncharge)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style="auto" />
            </AuthWrapper>
          </ThemeProvider>
        </BannerProvider>
      </RoleProvider>
    </LanguageProvider>
  );
}
