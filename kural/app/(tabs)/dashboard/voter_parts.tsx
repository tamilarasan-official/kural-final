import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../../contexts/LanguageContext';
import { voterAPI } from '../../../services/api/voter';
import { vulnerabilityAPI } from '../../../services/api/vulnerability';
import { partColorAPI } from '../../../services/api/partColor';

export const options = { headerShown: false };

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 4;

interface PartName {
  partNumber: number;
  partName: string;
  partNameTamil: string;
}

interface Vulnerability {
  _id: string;
  name: string;
  color: string;
  description: string;
}

interface PartColor {
  _id: string;
  partNumber: number;
  vulnerabilityId: string;
  color: string;
  vulnerability: Vulnerability;
}

export default function VoterPartsScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showPartsModal, setShowPartsModal] = useState(false);
  const [partNames, setPartNames] = useState<PartName[]>([]);
  const [partsSearchQuery, setPartsSearchQuery] = useState('');
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [partColors, setPartColors] = useState<Map<number, PartColor>>(new Map());
  const [isVulnerabilityMode, setIsVulnerabilityMode] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [selectedPartNumber, setSelectedPartNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePartNumbers = () => {
    const parts: number[] = [];
    for (let i = 1; i <= 312; i++) parts.push(i);
    return parts;
  };
  const allParts = generatePartNumbers();

  useEffect(() => { loadPartNames(); loadVulnerabilities(); loadPartColors(); }, []);

  const filteredParts = allParts.filter((p) => p.toString().includes(searchQuery));
  const filteredPartNames = partNames.filter((p) =>
    String(p.partNumber ?? '').includes(partsSearchQuery) ||
    (p.partName ? p.partName.toLowerCase() : '').includes(partsSearchQuery.toLowerCase()) ||
    (p.partNameTamil || '').includes(partsSearchQuery)
  );

  const loadPartNames = async () => {
    try {
      const response = await voterAPI.getPartNames();
      if (response.success) setPartNames(response.data);
    } catch (e) {
      // silent
    }
  };

  const loadVulnerabilities = async () => {
    try {
      const response = await vulnerabilityAPI.getVulnerabilities();
      if (response.success) setVulnerabilities(response.vulnerabilities);
    } catch (e) {}
  };

  const loadPartColors = async () => {
    try {
      const response = await partColorAPI.getPartColors();
      if (response.success) {
        const colorMap = new Map<number, PartColor>();
        response.partColors.forEach((pc: PartColor) => colorMap.set(pc.partNumber, pc));
        setPartColors(colorMap);
      }
    } catch (e) {}
  };

  const handlePartNavigation = (partNumber: number) => {
    if (isVulnerabilityMode) {
      setSelectedPartNumber(partNumber);
      setShowColorModal(true);
      return;
    }
    router.push({ pathname: '/(tabs)/dashboard/voters_map', params: { partNumber: String(partNumber) } });
  };

  const handleToggleVulnerability = () => {
    if (isVulnerabilityMode) setIsVulnerabilityMode(false); else setIsVulnerabilityMode(true);
  };

  const handleColorSelect = async (vul: Vulnerability) => {
    if (!selectedPartNumber) return;
    try {
      setLoading(true);
      const res = await partColorAPI.updatePartColor(selectedPartNumber, vul._id, vul.color);
      if (res.success) {
        const newPc: PartColor = {
          _id: res.partColor._id,
          partNumber: selectedPartNumber,
          vulnerabilityId: vul._id,
          color: vul.color,
          vulnerability: vul,
        };
        setPartColors(prev => new Map(prev.set(selectedPartNumber, newPc)));
        setShowColorModal(false);
        setSelectedPartNumber(null);
      }
    } finally { setLoading(false); }
  };

  const getPartColor = (partNumber: number) => {
    if (!isVulnerabilityMode) return '#FFFFFF';
    const pc = partColors.get(partNumber);
    return pc ? pc.color : '#FFFFFF';
  };
  const getPartBorderColor = (partNumber: number) => {
    if (!isVulnerabilityMode) return '#1976D2';
    const pc = partColors.get(partNumber);
    return pc ? pc.color : '#1976D2';
  };

  const handleMenuPress = () => setShowPartsModal(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            try {
              router.back();
            } catch (e) {
              router.replace('/(tabs)/' as any);
            }
          }}
        >
          <Icon name="arrow-back" size={24} color="#1976D2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('partNumbers.title')}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={handleMenuPress}>
            <Icon name="menu" size={24} color="#1976D2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={handleToggleVulnerability}>
            <Icon name="warning" size={24} color={isVulnerabilityMode ? '#FFFFFF' : '#1976D2'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#999999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('partNumbers.searchByPart')}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {filteredParts.map((partNumber) => (
            <TouchableOpacity
              key={partNumber}
              style={[
                styles.partCard,
                { width: cardWidth, backgroundColor: getPartColor(partNumber), borderColor: getPartBorderColor(partNumber) }
              ]}
              onPress={() => handlePartNavigation(partNumber)}
              activeOpacity={0.7}
            >
              <Text style={[styles.partNumber, { color: getPartColor(partNumber) === '#FFFFFF' ? '#1976D2' : '#FFFFFF' }]}>{partNumber}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Color Selection Modal */}
      <Modal
        visible={showColorModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowColorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.colorModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('partNumbers.selectVulnerability')}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowColorModal(false)}>
                <Icon name="close" size={20} color="#666666" />
              </TouchableOpacity>
            </View>
            <View style={styles.colorRow}>
              {vulnerabilities.map(v => (
                <TouchableOpacity key={v._id} style={[styles.colorChip, { backgroundColor: v.color }]} onPress={() => handleColorSelect(v)} disabled={loading} />
              ))}
              <TouchableOpacity style={[styles.colorChip, { backgroundColor: '#FFFFFF', borderColor: '#1976D2', borderWidth: 2 }]} onPress={() => handleColorSelect({ _id: 'none', name: 'None', color: '#FFFFFF', description: '' }) as any} disabled={loading} />
            </View>
            <TouchableOpacity style={[styles.colorSubmitButton, loading && styles.submitButtonDisabled]} onPress={() => setShowColorModal(false)} disabled={loading}>
              <Text style={styles.colorSubmitText}>{loading ? 'Updating...' : 'Submit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPartsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPartsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.partsModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('partNumbers.partsListTitle')}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowPartsModal(false)}>
                <Icon name="close" size={20} color="#666666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <View style={styles.modalSearchBar}>
                <Icon name="search" size={20} color="#999999" style={styles.searchIcon} />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder={t('partNumbers.partsSearchPlaceholder')}
                  placeholderTextColor="#999"
                  value={partsSearchQuery}
                  onChangeText={setPartsSearchQuery}
                />
              </View>
            </View>

            <ScrollView style={styles.partsList} showsVerticalScrollIndicator={false}>
              {filteredPartNames.map((part) => (
                <TouchableOpacity
                  key={part.partNumber}
                  style={styles.partItem}
                  onPress={() => {
                    setShowPartsModal(false);
                    handlePartNavigation(part.partNumber);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.partItemLeft}>
                    <Text style={styles.partItemNumber}>{part.partNumber}</Text>
                    <Icon name="keyboard-arrow-down" size={20} color="#1976D2" />
                  </View>
                  <View style={styles.partItemRight}>
                    <Text style={styles.partItemName}>{part.partName}</Text>
                    <Text style={styles.partItemNameTamil}>{part.partNameTamil}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
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
  },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000000', flex: 1, textAlign: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  searchContainer: { paddingHorizontal: 20, paddingVertical: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#000' },
  content: { flex: 1, paddingHorizontal: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 20 },
  partCard: { backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 20, paddingHorizontal: 10, marginBottom: 15, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, borderWidth: 1, borderColor: '#1976D2', minHeight: 60 },
  partNumber: { fontSize: 18, fontWeight: 'bold', color: '#1976D2', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  partsModalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, width: '95%', height: '80%', maxWidth: 500 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333333' },
  closeButton: { padding: 5 },
  modalSearchContainer: { marginBottom: 15 },
  modalSearchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12 },
  modalSearchInput: { flex: 1, fontSize: 16, color: '#000', marginLeft: 10 },
  partsList: { flex: 1 },
  partItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', borderRadius: 12, padding: 15, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  partItemLeft: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
  partItemNumber: { fontSize: 24, fontWeight: 'bold', color: '#1976D2', marginRight: 10 },
  partItemRight: { flex: 1 },
  partItemName: { fontSize: 16, fontWeight: '600', color: '#333333', marginBottom: 4 },
  partItemNameTamil: { fontSize: 14, color: '#666666' },
  // Color modal specific
  colorModalCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, width: '90%', maxWidth: 420, alignItems: 'center' },
  colorRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 20 },
  colorChip: { width: 44, height: 44, borderRadius: 22, borderColor: '#E0E0E0', borderWidth: 2, marginHorizontal: 6 },
  colorSubmitButton: { backgroundColor: '#0D6EFD', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 16, alignItems: 'center', minWidth: 160 },
  colorSubmitText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
