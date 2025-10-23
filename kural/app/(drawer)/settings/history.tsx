import React, { useEffect, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Image, Alert, Dimensions, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useLanguage } from '../../../contexts/LanguageContext';
import * as ImagePicker from 'expo-image-picker';
import { settingsAPI } from '../../../services/api/settings';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeaderBack from '../../components/HeaderBack';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  
  // History items loaded from backend
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');

  const colorForTag = (tag: string) => {
    switch ((tag || '').toUpperCase()) {
      case 'MP':
        return '#1E40AF';
      case 'ULB':
        return '#DC2626';
      case 'AC':
        return '#059669';
      default:
        return '#7C2D12';
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await settingsAPI.getHistory();
      const items = (res?.data || []).map((doc: any) => ({
        _id: doc._id,
        id: doc.id || doc._id,
        year: doc.year || '',
        type: doc.tag || '',
        title: doc.title,
        color: colorForTag(doc.tag || ''),
        voted: doc.title !== 'Not Voted',
      }));
      setHistoryData(items);
    } catch (e) {
      console.error('Failed to load history', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setImageUrl('');
    setSelectedImage(null);
    setCustomText(item?.title || '');
    setShowImageModal(true);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('common.error'), t('history.failedToPickImage'));
    }
  };

  const handleDelete = (item: any) => {
    Alert.alert(
      t('history.deleteConfirm'),
      `${t('history.deleteMessage')} "${item.title}"?`,
      [
        { text: t('history.cancel'), style: 'cancel' },
        {
          text: t('history.delete'),
          style: 'destructive',
          onPress: () => {
            setHistoryData(prev => prev.filter(entry => entry.id !== item.id));
          }
        }
      ]
    );
  };

  const handleSaveImage = async () => {
    if (!selectedItem) {
      return;
    }
    try {
      const newTitle = customText.trim();
      if (!newTitle && !selectedImage) {
        Alert.alert(t('common.error'), t('history.editTitle'));
        return;
      }

      // Persist title (and optionally tag/year later) in backend
      await settingsAPI.updateHistory(selectedItem._id, {
        title: newTitle || selectedItem.title,
        year: selectedItem.year,
        tag: selectedItem.type,
      });

      // Refresh list
      await loadHistory();

      setShowImageModal(false);
      setImageUrl('');
      setSelectedImage(null);
      setCustomText('');
      setSelectedItem(null);
    } catch (err) {
      console.error('Error saving history item:', err);
      Alert.alert(t('common.error'), t('history.failedToSave'));
    }
  };

  const handleCancel = () => {
    setShowImageModal(false);
    setImageUrl('');
    setSelectedImage(null);
    setCustomText('');
    setSelectedItem(null);
  };

  const filteredData = historyData.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderHistoryItem = (item: any) => (
    <View key={item._id || item.id} style={styles.historyCard}>
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          {item.customImage ? (
            <Image source={{ uri: item.customImage }} style={styles.listImage} />
          ) : item.voted ? (
            <>
              <Text style={styles.iconYear}>{item.year}</Text>
              <Text style={styles.iconType}>{item.type}</Text>
            </>
          ) : (
            <View style={styles.notVotedIcon}>
              <Text style={styles.ballotIcon}>🗳️</Text>
              <Text style={styles.noVoteIcon}>🚫</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.itemTitle}>{item.customText || item.title}</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleEdit(item)}
          >
            <Icon name="edit" size={18} color="#1976D2" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={() => handleDelete(item)}
          >
            <Icon name="delete" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#E8F3FF' }]} edges={['top', 'bottom']}>
      <StatusBar translucent={false} backgroundColor="#E8F3FF" barStyle="dark-content" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }] }>
        <HeaderBack onPress={() => router.back()} />
        <Text style={styles.headerTitle}>{t('history.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('history.search')}
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Icon name="search" size={18} color="#666666" />
      </View>

      {/* History List */}
      <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
        {filteredData.map(renderHistoryItem)}
      </ScrollView>

      {/* Image Selection Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              <Text style={styles.imagePickerText}>{t('history.selectImage')}</Text>
            </TouchableOpacity>
            
            <TextInput
              style={styles.customTextInput}
              placeholder=""
              placeholderTextColor="#999999"
              value={customText}
              onChangeText={setCustomText}
            />
            
            <Text style={styles.selectImageLabel}>{t('history.selectImage')}</Text>
            
            <View style={styles.imagePreview}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              ) : selectedItem && (
                <View style={[styles.previewIcon, { backgroundColor: selectedItem.color }]}>
                  {customText ? (
                    <Text style={styles.customTextPreview}>{customText}</Text>
                  ) : selectedItem.voted ? (
                    <>
                      <Text style={styles.previewYear}>{selectedItem.year}</Text>
                      <Text style={styles.previewType}>{selectedItem.type}</Text>
                    </>
                  ) : (
                    <View style={styles.previewNotVoted}>
                      <Text style={styles.previewBallot}>🗳️</Text>
                      <Text style={styles.previewNoVote}>🚫</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveImage}>
                <Text style={styles.saveButtonText}>{t('history.save')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>{t('history.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#E8F3FF',
    paddingTop: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#374151',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  searchIcon: {
    fontSize: 18,
    color: '#6B7280',
  },
  historyList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  iconYear: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  iconType: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notVotedIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballotIcon: {
    fontSize: 20,
  },
  noVoteIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 12,
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: width * 0.85,
    maxWidth: 400,
  },
  imagePickerButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  customTextInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
    minHeight: 40,
  },
  selectImageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 15,
  },
  imagePreview: {
    alignItems: 'center',
    marginBottom: 24,
  },
  previewIcon: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewYear: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewType: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  previewNotVoted: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBallot: {
    fontSize: 32,
  },
  previewNoVote: {
    position: 'absolute',
    top: -8,
    right: -8,
    fontSize: 16,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  customTextPreview: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1E40AF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#1E40AF',
    fontSize: 16,
    fontWeight: '600',
  },
});
