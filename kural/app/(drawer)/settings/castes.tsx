import React, { useState, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Dimensions, ActivityIndicator, StatusBar } from 'react-native';
import { router } from 'expo-router';
import HeaderBack from '../../components/HeaderBack';
import { useLanguage } from '../../../contexts/LanguageContext';
import { casteAPI } from '../../../services/api/settings';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

export default function CastesScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  
  // State for castes data
  const [castesData, setCastesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCaste, setSelectedCaste] = useState<any>(null);
  const [editEnglishName, setEditEnglishName] = useState('');
  const [editTamilName, setEditTamilName] = useState('');
  const [saving, setSaving] = useState(false);

  // Load data from API
  useEffect(() => {
    loadCastes();
  }, []);

  const loadCastes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await casteAPI.getAll();
      if (response.success) {
        setCastesData(response.data);
      } else {
        setError(t('castes.error'));
      }
    } catch (err) {
      console.error('Error loading castes:', err);
      setError(t('castes.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (caste: any) => {
    setSelectedCaste(caste);
    setEditEnglishName(caste.englishName);
    setEditTamilName(caste.tamilName);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (selectedCaste && editEnglishName.trim() && editTamilName.trim()) {
      try {
        setSaving(true);
        const response = await casteAPI.update(selectedCaste._id, {
          englishName: editEnglishName.trim(),
          tamilName: editTamilName.trim()
        });
        
        if (response.success) {
          // Update local state
          setCastesData(prev => prev.map(item => 
            item._id === selectedCaste._id 
              ? { ...item, englishName: editEnglishName.trim(), tamilName: editTamilName.trim() }
              : item
          ));
          setShowEditModal(false);
          setEditEnglishName('');
          setEditTamilName('');
          setSelectedCaste(null);
          Alert.alert(t('castes.success'), t('castes.updatedSuccessfully'));
        } else {
          Alert.alert(t('common.error'), t('castes.updateError'));
        }
      } catch (err) {
        console.error('Error updating caste:', err);
        Alert.alert(t('common.error'), t('castes.updateError'));
      } finally {
        setSaving(false);
      }
    } else {
      Alert.alert(t('common.error'), t('castes.validationError'));
    }
  };

  const handleCancel = () => {
    setShowEditModal(false);
    setEditEnglishName('');
    setEditTamilName('');
    setSelectedCaste(null);
  };

  const filteredCastes = castesData.filter(caste =>
    caste.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    caste.tamilName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#E8F3FF' }]} edges={['top', 'bottom']}>
        <StatusBar translucent={false} backgroundColor="#E8F3FF" barStyle="dark-content" />
        <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
          <HeaderBack onPress={() => router.back()} />
          <Text style={styles.headerTitle}>{t('castes.title')}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>{t('castes.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#E8F3FF' }]} edges={['top', 'bottom']}>
        <StatusBar translucent={false} backgroundColor="#E8F3FF" barStyle="dark-content" />
        <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
          <HeaderBack onPress={() => router.back()} />
          <Text style={styles.headerTitle}>{t('castes.title')}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCastes}>
            <Text style={styles.retryButtonText}>{t('castes.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#E8F3FF' }]} edges={['top', 'bottom']}>
      <StatusBar translucent={false} backgroundColor="#E8F3FF" barStyle="dark-content" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <HeaderBack onPress={() => router.back()} />
        <Text style={styles.headerTitle}>{t('castes.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('castes.searchPlaceholder')}
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Icon name="search" size={18} color="#666666" style={{ marginLeft: 10 }} />
      </View>

      {/* Castes List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredCastes.map(caste => (
          <View key={caste._id} style={styles.casteCard}>
            <View style={styles.casteInfo}>
              <Text style={styles.englishName}>{caste.englishName}</Text>
              <Text style={styles.tamilName}>{caste.tamilName}</Text>
              <Text style={styles.religionLabel}>{caste.label}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(caste)}>
              <Icon name="edit" size={18} color="#1976D2" />
            </TouchableOpacity>
          </View>
        ))}
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
              <Text style={styles.modalTitle}>{t('castes.editTitle')}</Text>
              <TouchableOpacity onPress={handleCancel}>
                <Icon name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('castes.englishName')}</Text>
              <TextInput
                style={styles.textInput}
                value={editEnglishName}
                onChangeText={setEditEnglishName}
                placeholder={t('castes.enterEnglishName')}
                placeholderTextColor="#999999"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('castes.tamilName')}</Text>
              <TextInput
                style={styles.textInput}
                value={editTamilName}
                onChangeText={setEditTamilName}
                placeholder={t('castes.enterTamilName')}
                placeholderTextColor="#999999"
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
                  <Text style={styles.saveButtonText}>{t('castes.save')}</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>{t('castes.cancel')}</Text>
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
  englishName: { fontSize: 16, fontWeight: '600', color: '#333333', marginBottom: 4 },
  tamilName: { fontSize: 14, color: '#666666', marginBottom: 4 },
  religionLabel: { fontSize: 12, color: '#1976D2', fontWeight: '500' },
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