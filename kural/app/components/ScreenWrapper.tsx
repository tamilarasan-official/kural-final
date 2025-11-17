import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter, usePathname } from 'expo-router';
import { useLanguage } from '../../contexts/LanguageContext';

interface ScreenWrapperProps {
  children: React.ReactNode;
  userRole: 'booth_agent' | 'moderator' | 'user';
}

export default function ScreenWrapper({ children, userRole }: ScreenWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');

  // Define tab items based on user role
  const getTabItems = () => {
    const baseRoute = userRole === 'booth_agent' ? '/(boothAgent)' : 
                     userRole === 'moderator' ? '/(assemblyIncharge)' : '/(tabs)';
    
    if (userRole === 'booth_agent') {
      return [
        { id: 'home', label: 'Home', iconName: 'home', route: `${baseRoute}/dashboard` },
        { id: 'slip', label: 'Slip', iconName: 'receipt', route: `${baseRoute}/slip_box` },
        { id: 'poll', label: 'Poll', iconName: 'how-to-vote', route: `${baseRoute}/poll` },
        { id: 'reports', label: 'Reports', iconName: 'bar-chart', route: `${baseRoute}/reports` },
      ];
    }
    
    return [
      { id: 'report', label: t('nav.report'), iconName: 'assessment', route: `${baseRoute}/report` },
      { id: 'catalogue', label: t('nav.catalogue'), iconName: 'description', route: `${baseRoute}/catalogue` },
      { id: 'home', label: '', iconName: 'home', route: `${baseRoute}/dashboard` },
      { id: 'slip', label: t('nav.slip'), iconName: 'receipt', route: `${baseRoute}/slip` },
      { id: 'poll', label: t('nav.poll'), iconName: 'how-to-vote', route: `${baseRoute}/poll` },
    ];
  };

  const tabItems = getTabItems();

  const isActive = (route: string) => {
    if (route.includes('/dashboard')) {
      return pathname.includes('/dashboard') || pathname.endsWith('/');
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
      // Navigate to appropriate dashboard
      const dashboardRoute = userRole === 'booth_agent' ? '/(boothAgent)/dashboard' : 
                            userRole === 'moderator' ? '/(assemblyIncharge)/dashboard' : '/(tabs)/';
      if (!pathname.includes('dashboard')) {
        router.push(dashboardRoute as any);
      }
      return;
    }
    router.push(item.route as any);
  };

  return (
    <SafeAreaProvider>
      <StatusBar translucent={false} backgroundColor="#E8F3FF" barStyle="dark-content" />
      <SafeAreaView style={styles.topSafe} edges={['top', 'left', 'right']}>
        <View style={styles.content}>
          {children}
        </View>
      </SafeAreaView>
      <SafeAreaView edges={['bottom']} style={styles.footerWrapper}>
        <View style={styles.footer}>
        {tabItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.tabItem}
            onPress={() => handleTabPress(item as any)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Icon 
                name={item.iconName} 
                size={24}
                color={isActive(item.route) ? '#1976D2' : '#666666'} 
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
      </SafeAreaView>
      {showToast && (
        <View style={styles.toastContainer} pointerEvents="none">
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  topSafe: {
    flex: 1,
    backgroundColor: '#E8F3FF',
  },
  content: {
    flex: 1,
  },
  footerWrapper: {
    backgroundColor: 'transparent',
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
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
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