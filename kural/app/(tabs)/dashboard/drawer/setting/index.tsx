import React from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import HeaderBack from '../../../../components/HeaderBack';
import { useLanguage } from '../../../../../contexts/LanguageContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');
  const cardWidth = (width - 60) / 3; // 3 columns with margins

  const settingsOptions = [
    {
      id: 'voter-slip',
      title: t('settings.voterSlip'),
      icon: require('../../../../../assets/images/voter_slip.png'),
      disabled: false,
    },
    {
      id: 'language',
      title: t('voterLanguage.title'),
      icon: require('../../../../../assets/images/language.png'),
      disabled: false,
    },
  ];

  const handleOptionPress = (option: any) => {
    if (option.disabled) return;
    
    // Handle navigation based on option
    switch (option.id) {
      case 'voter-slip':
        // Navigate to voter slip
        router.push('/(tabs)/dashboard/drawer/setting/voter_slip');
        break;
      case 'language':
        // Navigate to language settings
        router.push('/(tabs)/dashboard/drawer/setting/voter_language');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#E8F3FF' }]} edges={['top', 'bottom']}>
      <StatusBar translucent={false} backgroundColor="#E8F3FF" barStyle="dark-content" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }] }>
        <HeaderBack onPress={() => router.back()} />
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                { width: cardWidth },
                option.disabled && styles.disabledCard
              ]}
              onPress={() => handleOptionPress(option)}
              disabled={option.disabled}
              activeOpacity={option.disabled ? 1 : 0.7}
            >
              <Image 
                source={option.icon} 
                style={[
                  styles.icon,
                  option.disabled && styles.disabledIcon
                ]}
                resizeMode="contain"
              />
              <Text style={[
                styles.optionTitle,
                option.disabled && styles.disabledText
              ]}>
                {option.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#E3F2FD',
  paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 100,
    justifyContent: 'center',
  },
  disabledCard: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 12,
  },
  disabledIcon: {
    opacity: 0.5,
  },
  optionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 16,
  },
  disabledText: {
    color: '#9E9E9E',
  },
});
