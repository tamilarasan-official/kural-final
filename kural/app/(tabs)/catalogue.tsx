import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';

export default function CatalogueScreen() {
  const { t } = useLanguage();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('nav.catalogue')}</Text>
      <Text style={styles.subtitle}>{t('nav.catalogue')} and Inventory</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingBottom: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
});
