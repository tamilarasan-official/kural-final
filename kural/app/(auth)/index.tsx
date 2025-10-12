import { useLanguage } from '../../contexts/LanguageContext';
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export const options = {
  headerShown: false,
};

export default function IndexScreen() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* LSI Image Section - Top 50% */}
      <View style={styles.lsiImageSection}>
        <Image
          source={require('@/assets/images/LSI.png')}
          style={styles.lsiImage}
          resizeMode="cover"
        />
      </View>

      {/* Curved Modal Section - Bottom 50% */}
      <View style={styles.modalSection}>
        <View style={styles.curvedModal}>
          {/* Title */}
          <Text style={styles.modalTitle}>Thedal Election Analytics Manager</Text>

          {/* Subtitle */}
          <Text style={styles.modalSubtitle}>
            The first-ever SaaS-based comprehensive election campaign management tool for all candidates
          </Text>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.modalLoginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.modalLoginText}>{t('auth.login')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  lsiImageSection: {
    flex: 0.5,
    backgroundColor: '#E6F0FA',
  },
  lsiImage: {
    width: '100%',
    height: '100%',
  },
  modalSection: {
    flex: 0.5,
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-end',
  },
  curvedModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 50,
    paddingBottom: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 350,
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 40,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 50,
    paddingHorizontal: 10,
  },
  modalLoginButton: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modalLoginText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
