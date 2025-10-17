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
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');

  const tabItems = [
    { id: 'report', label: t('nav.report'), iconName: 'assessment', route: '/(tabs)/report' },
    { id: 'catalogue', label: t('nav.catalogue'), iconName: 'description', route: '/(tabs)/catalogue' },
    { id: 'home', label: '', iconName: 'home', route: '/(tabs)/' },
    { id: 'slip', label: t('nav.slip'), iconName: 'receipt', route: '/(tabs)/slip' },
    { id: 'poll', label: t('nav.poll'), iconName: 'how-to-vote', route: '/(tabs)/poll' },
  ];

  const isActive = (route: string) => {
    if (route === '/(tabs)/') {
      return pathname === '/(tabs)/' || pathname === '/';
    }
    return pathname === route;
  };

  const handleTabPress = (item: { id: string; route: string }) => {
    if (item.id === 'report') {
      // Show a dashboard toast and keep user on home
      setToastMessage(t('nav.reportUnavailable'));
      setShowToast(true);
      // Auto hide after 3.5s
      setTimeout(() => setShowToast(false), 3500);
      // Navigate to home dashboard instead of report page
      if (pathname !== '/(tabs)/' && pathname !== '/') {
        router.push('/(tabs)/');
      }
      return;
    }
    router.push(item.route as any);
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
            onPress={() => handleTabPress(item as any)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              // Keep the center HOME as a persistent FAB-style button
              item.id === 'home' ? styles.activeIconContainer : undefined
            ]}>
              <Icon 
                name={item.iconName} 
                size={item.id === 'home' ? 32 : 24}
                color={item.id === 'home' ? '#FFFFFF' : (isActive(item.route) ? '#1976D2' : '#666666')} 
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
      {showToast && (
        <View style={styles.toastContainer} pointerEvents="none">
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
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
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 90,
    backgroundColor: 'rgba(33,33,33,0.95)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
