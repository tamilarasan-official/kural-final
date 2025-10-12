import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useBanner } from '../../../contexts/BannerContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function AppBannerScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { banners } = useBanner();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBanners, setFilteredBanners] = useState(banners);

  // Filter banners based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = banners.filter(banner =>
        banner.filename.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBanners(filtered);
    } else {
      setFilteredBanners(banners);
    }
  }, [searchQuery, banners]);

  // Adding and deleting banners disabled per requirement

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('banner.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('banner.searchPlaceholder')}
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchIcon}>
            <Icon name="search" size={18} color="#666666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Banner Button removed */}

      {/* Existing Banners Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{t('banner.existingBanners')}</Text>
        
        <ScrollView style={styles.bannersList} showsVerticalScrollIndicator={false}>
          {filteredBanners.map((banner) => (
            <View key={banner.id} style={styles.bannerCard}>
              <View style={styles.bannerImageContainer}>
                <Image
                  source={{ uri: banner.localUri || banner.imageUri }}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.bannerFilename}>{banner.filename}</Text>
            </View>
          ))}
          
          {filteredBanners.length === 0 && null}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#E3F2FD',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    paddingVertical: 5,
  },
  searchIcon: {
    padding: 5,
  },
  searchIconText: {
    fontSize: 18,
    color: '#666666',
  },
  addBannerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  addBannerButton: {
    backgroundColor: '#1976D2',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addBannerIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  addBannerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
  },
  bannersList: {
    flex: 1,
  },
  bannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  bannerImageContainer: {
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: 150,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 16,
  },
  bannerFilename: {
    fontSize: 14,
    color: '#666666',
    padding: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999999',
  },
});
