import React, { useState, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Dimensions, ActivityIndicator, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useLanguage } from '../../../contexts/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeaderBack from '../../components/HeaderBack';
import { religionAPI } from '../../../services/api/settings';

const { width } = Dimensions.get('window');

export default function ReligionsScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  
  // State for religions data
  const [religionsData, setReligionsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReligion, setSelectedReligion] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  // Load data from API
  useEffect(() => {
    loadReligions();
  }, []);

  const loadReligions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await religionAPI.getAll();
      if (response.success) {
        setReligionsData(response.data);
      } else {
        setError(t('religions.error'));
      }
    } catch (err) {
      console.error('Error loading religions:', err);
      setError(t('religions.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (religion: any) => {
    setSelectedReligion(religion);
    setEditName(religion.name);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (selectedReligion && editName.trim()) {
      try {
        setSaving(true);
        const response = await religionAPI.update(selectedReligion._id, {
          name: editName.trim()
        });
        
        if (response.success) {
          // Update local state
          setReligionsData(prev => prev.map(item => 
            item._id === selectedReligion._id 
              ? { ...item, name: editName.trim() }
              : item
          ));
          setShowEditModal(false);
          setEditName('');
          setSelectedReligion(null);
          Alert.alert(t('religions.success'), t('religions.updatedSuccessfully'));
        } else {
          Alert.alert(t('common.error'), t('religions.updateError'));
        }
      } catch (err) {
        console.error('Error updating religion:', err);
        Alert.alert(t('common.error'), t('religions.updateError'));
      } finally {
        setSaving(false);
      }
    } else {
      Alert.alert(t('common.error'), t('religions.validationError'));
    }
  };

  const handleCancel = () => {
    setShowEditModal(false);
    setEditName('');
    setSelectedReligion(null);
  };

  const filteredReligions = religionsData.filter(religion =>
    religion.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderReligionSymbol = (symbol: string, color: string) => (
    <View style={[styles.symbolCircle, { backgroundColor: color }]}>
      <Text style={styles.symbolText}>{symbol}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#E8F3FF' }]} edges={['top', 'bottom']}>
        <StatusBar translucent={false} backgroundColor="#E8F3FF" barStyle="dark-content" />
        <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
          <HeaderBack onPress={() => router.back()} />
          <Text style={styles.headerTitle}>{t('religions.title')}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>{t('religions.loading')}</Text>
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
          <Text style={styles.headerTitle}>{t('religions.title')}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadReligions}>
            <Text style={styles.retryButtonText}>{t('religions.retry')}</Text>
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
        <Text style={styles.headerTitle}>{t('religions.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('religions.searchPlaceholder')}
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Icon name="search" size={18} color="#666666" style={{ marginLeft: 10 }} />
      </View>

      {/* Religion List */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        {filteredReligions.map(religion => (
          <View key={religion._id} style={styles.religionCard}>
            {renderReligionSymbol(religion.symbol, religion.color)}
            <Text style={styles.religionName}>{religion.name}</Text>
            <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(religion)}>
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
              <Text style={styles.modalTitle}>{t('religions.editTitle')}</Text>
              <TouchableOpacity onPress={handleCancel}>
                <Icon name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalSymbolContainer}>
              {selectedReligion && renderReligionSymbol(selectedReligion.symbol, selectedReligion.color)}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('religions.religionName')}</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder={t('religions.enterReligionName')}
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
                  <Text style={styles.saveButtonText}>{t('religions.save')}</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>{t('religions.cancel')}</Text>
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
  religionCard: {
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
  symbolCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  symbolText: { fontSize: 24, color: '#FFFFFF' },
  religionName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#333333' },
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
  modalSymbolContainer: {
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