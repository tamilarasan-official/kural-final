import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { isUserLoggedIn } from '../services/api/userSession';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const inAuthGroup = segments[0] === '(auth)';
      
      if (isAuthenticated && inAuthGroup) {
        // User is logged in but in auth group, redirect to dashboard
        router.replace('/(tabs)');
      } else if (!isAuthenticated && !inAuthGroup) {
        // User is not logged in but not in auth group, redirect to login
        router.replace('/(auth)');
      }
    }
  }, [isAuthenticated, isLoading]);


  const checkAuthStatus = async () => {
    try {
      const loggedIn = await isUserLoggedIn();
      setIsAuthenticated(loggedIn);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F6FB' }}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return <>{children}</>;
}
