import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Dimensions, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useLanguage } from '../../../contexts/LanguageContext';
import HeaderBack from '../../components/HeaderBack';
import { schemeAPI } from '../../../services/api/settings';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

export default function SchemesScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  
  // State for schemes data
  const [schemesData, setSchemesData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedScheme, setSelectedScheme] = useState<any | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Load data from API
  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await schemeAPI.getAll();
      if (response.success) {
        setSchemesData(response.data);
      } else {
        setError(t('schemes.error'));
      }
    } catch (err) {
      console.error('Error loading schemes:', err);
      setError(t('schemes.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (scheme: any) => {
    setSelectedScheme(scheme);
    setEditName(scheme.name);
    setEditDescription(scheme.description);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (selectedScheme && editName.trim()) {
      try {
        setSaving(true);
        const response = await schemeAPI.update(selectedScheme._id, {
          name: editName.trim(),
          description: editDescription.trim()
        });
        
        if (response.success) {
          // Update local state
          setSchemesData(prev => prev.map(item => 
            item._id === selectedScheme._id 
              ? { ...item, name: editName.trim(), description: editDescription.trim() }
              : item
          ));
          setShowEditModal(false);
          setEditName('');
          setEditDescription('');
          setSelectedScheme(null);
          Alert.alert(t('schemes.success'), t('schemes.updatedSuccessfully'));
        } else {
          Alert.alert(t('common.error'), t('schemes.updateError'));
        }
      } catch (err) {
        console.error('Error updating scheme:', err);
        Alert.alert(t('common.error'), t('schemes.updateError'));
      } finally {
        setSaving(false);
      }
    } else {
      Alert.alert(t('common.error'), t('schemes.validationError'));
    }
  };

  const handleCancel = () => {
    setShowEditModal(false);
    setEditName('');
    setEditDescription('');
    setSelectedScheme(null);
  };

  const filteredSchemes = schemesData.filter(scheme =>
    scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scheme.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSchemeIcon = (icon: string, color: string) => (
    <View style={[styles.iconCircle, { backgroundColor: color }]}>
      <Text style={styles.iconText}>{icon}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#E8F3FF' }]} edges={['top', 'bottom']}>
  <StatusBar translucent={false} backgroundColor="#E8F3FF" barStyle="dark-content" />
        <View style={[styles.header, { paddingTop: insets.top + 4 }] }>
          <HeaderBack onPress={() => router.back()} />
          <Text style={styles.headerTitle}>{t('schemes.title')}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>{t('schemes.loading')}</Text>
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
          <Text style={styles.headerTitle}>{t('schemes.title')}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSchemes}>
            <Text style={styles.retryButtonText}>{t('schemes.retry')}</Text>
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
        <Text style={styles.headerTitle}>{t('schemes.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('schemes.searchPlaceholder')}
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Icon name="search" size={18} color="#666666" style={{ marginLeft: 10 }} />
      </View>

      {/* Schemes List */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        {filteredSchemes.map(scheme => (
          <View key={scheme._id} style={styles.schemeCard}>
            {renderSchemeIcon(scheme.icon, '#1976D2')}
            <View style={styles.schemeInfo}>
              <Text style={styles.schemeName}>{scheme.name}</Text>
              <Text style={styles.schemeProvider}>{scheme.provider}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(scheme)}>
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
              <Text style={styles.modalTitle}>{t('schemes.editTitle')}</Text>
              <TouchableOpacity onPress={handleCancel}>
                <Icon name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalIconContainer}>
              {selectedScheme && renderSchemeIcon(selectedScheme.icon, '#1976D2')}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('schemes.schemeName')}</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder={t('schemes.enterSchemeName')}
                placeholderTextColor="#999999"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('schemes.description')}</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder={t('schemes.enterDescription')}
                placeholderTextColor="#999999"
                multiline
                numberOfLines={3}
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
                  <Text style={styles.saveButtonText}>{t('schemes.save')}</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>{t('schemes.cancel')}</Text>
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
    paddingTop: 50,
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
  schemeCard: {
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
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: { fontSize: 24, color: '#FFFFFF' },
  schemeInfo: { flex: 1 },
  schemeName: { fontSize: 16, fontWeight: '600', color: '#333333', marginBottom: 4 },
  schemeProvider: { fontSize: 14, color: '#1976D2', fontWeight: '500' },
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
  modalIconContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
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
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
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