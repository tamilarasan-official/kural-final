import React, { useState, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Dimensions, ActivityIndicator, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useLanguage } from '../../../contexts/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeaderBack from '../../components/HeaderBack';
import { casteCategoryAPI } from '../../../services/api/settings';

const { width } = Dimensions.get('window');

export default function CasteCategoryScreen() {
  const { t } = useLanguage();
  
  // State for caste category data
  const insets = useSafeAreaInsets();
  const [casteData, setCasteData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedCaste, setSelectedCaste] = useState<any | null>(null);
  const [editAbbreviation, setEditAbbreviation] = useState<string>('');
  const [editNumber, setEditNumber] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Load data from API
  useEffect(() => {
    loadCasteCategories();
  }, []);

  const loadCasteCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await casteCategoryAPI.getAll();
      if (response.success) {
        setCasteData(response.data);
      } else {
        setError(t('casteCategory.error'));
      }
    } catch (err) {
      console.error('Error loading caste categories:', err);
      setError(t('casteCategory.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (caste: any) => {
    setSelectedCaste(caste);
    setEditAbbreviation(caste.abbreviation);
    setEditNumber(caste.number);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (selectedCaste && editAbbreviation.trim() && editNumber.trim()) {
      try {
        setSaving(true);
        const response = await casteCategoryAPI.update(selectedCaste._id, {
          abbreviation: editAbbreviation.trim(),
          number: editNumber.trim()
        });
        
        if (response.success) {
          // Update local state
          setCasteData(prev => prev.map(item => 
            item._id === selectedCaste._id 
              ? { ...item, abbreviation: editAbbreviation.trim(), number: editNumber.trim() }
              : item
          ));
          setShowEditModal(false);
          setEditAbbreviation('');
          setEditNumber('');
          setSelectedCaste(null);
          Alert.alert(t('casteCategory.success'), t('casteCategory.updatedSuccessfully'));
        } else {
          Alert.alert(t('common.error'), t('casteCategory.updateError'));
        }
      } catch (err) {
        console.error('Error updating caste category:', err);
        Alert.alert(t('common.error'), t('casteCategory.updateError'));
      } finally {
        setSaving(false);
      }
    } else {
      Alert.alert(t('common.error'), t('casteCategory.validationError'));
    }
  };

  const handleCancel = () => {
    setShowEditModal(false);
    setEditAbbreviation('');
    setEditNumber('');
    setSelectedCaste(null);
  };

  const filteredCasteData = casteData.filter(caste =>
    caste.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCasteCard = (item: any) => (
    <View key={item._id} style={styles.casteCard}>
      <View style={styles.casteInfo}>
        <Text style={styles.casteAbbreviation}>{item.abbreviation}</Text>
        <Text style={styles.casteNumber}>{item.number}</Text>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
        <Icon name="edit" size={18} color="#1976D2" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#E8F3FF' }]} edges={['top', 'bottom']}>
  <StatusBar translucent={false} backgroundColor="#E8F3FF" barStyle="dark-content" />
        <View style={[styles.header, { paddingTop: insets.top + 4 }] }>
          <HeaderBack onPress={() => router.back()} />
          <Text style={styles.headerTitle}>{t('casteCategory.title')}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>{t('casteCategory.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#E8F3FF' }]} edges={['top', 'bottom']}>
  <StatusBar translucent={false} backgroundColor="#E8F3FF" barStyle="dark-content" />
        <View style={[styles.header, { paddingTop: insets.top + 4 }] }>
          <HeaderBack onPress={() => router.back()} />
          <Text style={styles.headerTitle}>{t('casteCategory.title')}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCasteCategories}>
            <Text style={styles.retryButtonText}>{t('casteCategory.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#E8F3FF' }]} edges={['top', 'bottom']}>
  <StatusBar translucent={false} backgroundColor="#E8F3FF" barStyle="dark-content" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }] }>
        <HeaderBack onPress={() => router.back()} />
        <Text style={styles.headerTitle}>{t('casteCategory.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('casteCategory.searchPlaceholder')}
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Icon name="search" size={18} color="#666666" style={{ marginLeft: 10 }} />
      </View>

      {/* Caste List */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        {filteredCasteData.map(renderCasteCard)}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showEditModal}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('casteCategory.editTitle')}</Text>
              <TouchableOpacity onPress={handleCancel}>
                <Icon name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('casteCategory.casteName')}</Text>
              <TextInput
                style={styles.textInput}
                value={editAbbreviation}
                onChangeText={setEditAbbreviation}
                placeholder={t('casteCategory.enterCasteName')}
                placeholderTextColor="#999999"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('casteCategory.number')}</Text>
              <TextInput
                style={styles.textInput}
                value={editNumber}
                onChangeText={setEditNumber}
                placeholder={t('casteCategory.enterNumber')}
                placeholderTextColor="#999999"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.disabledButton]} 
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>{t('casteCategory.save')}</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>{t('casteCategory.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  header: {
    backgroundColor: '#E3F2FD',
  paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
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
  backIcon: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000000', flex: 1, textAlign: 'center' },
  headerRight: { width: 40 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: { flex: 1, height: 45, fontSize: 16, color: '#333333' },
  content: { flex: 1, paddingHorizontal: 20 },
  casteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  casteInfo: { flex: 1 },
  casteAbbreviation: { fontSize: 18, fontWeight: 'bold', color: '#333333', marginBottom: 4 },
  casteNumber: { fontSize: 16, color: '#666666' },
  editButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    elevation: 3,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  editIcon: { fontSize: 18 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333333' },
  inputGroup: { marginBottom: 15 },
  inputLabel: { fontSize: 14, color: '#666666', marginBottom: 5 },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 45,
    fontSize: 16,
    color: '#333333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  cancelButton: {
    borderColor: '#1976D2',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#1976D2', fontSize: 16, fontWeight: 'bold' },
});