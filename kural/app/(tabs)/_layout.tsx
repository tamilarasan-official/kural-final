// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  const tabItems = [
    { id: 'report', label: 'Report', iconName: 'assessment', route: '/(tabs)/report' },
    { id: 'catalogue', label: 'Catalogue', iconName: 'description', route: '/(tabs)/catalogue' },
    { id: 'home', label: '', iconName: 'home', route: '/(tabs)/' },
    { id: 'slip', label: 'Slip', iconName: 'receipt', route: '/(tabs)/slip' },
    { id: 'poll', label: 'Poll', iconName: 'how-to-vote', route: '/(tabs)/poll' },
  ];

  const isActive = (route: string) => {
    if (route === '/(tabs)/') {
      return pathname === '/(tabs)/' || pathname === '/';
    }
    return pathname === route;
  };

  return (
    <View style={styles.container}>
      <Tabs 
        screenOptions={{ 
          headerShown: false,
          tabBarStyle: { display: 'none' }
        }} 
      />
      <View style={styles.footer}>
        {tabItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.tabItem}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              isActive(item.route) && styles.activeIconContainer
            ]}>
              <Icon 
                name={item.iconName} 
                size={isActive(item.route) ? 32 : 24} 
                color={isActive(item.route) ? '#FFFFFF' : '#666666'} 
              />
            </View>
            {item.label && (
              <Text style={[
                styles.label,
                isActive(item.route) && styles.activeLabel
              ]}>
                {item.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  activeIconContainer: {
    backgroundColor: '#1976D2',
    borderRadius: 32,
    width: 64,
    height: 64,
  },
  label: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#1976D2',
    fontWeight: '600',
  },
});
