import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { vulnerabilityAPI } from '../../../services/api/vulnerability';
import { partColorAPI } from '../../../services/api/partColor';
import { voterAPI } from '../../../services/api/voter';

export const options = {
  headerShown: false,
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 4; // 4 columns with margins

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

interface PartName {
  partNumber: number;
  partName: string;
  partNameTamil: string;
}

export default function PartNumbersScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showVulnerabilityModal, setShowVulnerabilityModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [selectedPartNumber, setSelectedPartNumber] = useState<number | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [partColors, setPartColors] = useState<Map<number, PartColor>>(new Map());
  const [loading, setLoading] = useState(false);
  const [isVulnerabilityMode, setIsVulnerabilityMode] = useState(false);
  const [showPartsModal, setShowPartsModal] = useState(false);
  const [partNames, setPartNames] = useState<PartName[]>([]);
  const [partsSearchQuery, setPartsSearchQuery] = useState('');

  // Generate all 312 part numbers
  const generatePartNumbers = () => {
    const parts = [];
    for (let i = 1; i <= 312; i++) {
      parts.push(i);
    }
    return parts;
  };

  const allParts = generatePartNumbers();

  // Load vulnerabilities and part colors on component mount
  useEffect(() => {
    loadVulnerabilities();
    loadPartColors();
    loadPartNames();
  }, []);

  // Filter parts based on search query
  const filteredParts = allParts.filter(part => 
    part.toString().includes(searchQuery)
  );

  // Filter part names based on search query
  const filteredPartNames = partNames.filter(part => 
    part.partNumber.toString().includes(partsSearchQuery) ||
    part.partName.toLowerCase().includes(partsSearchQuery.toLowerCase()) ||
    part.partNameTamil.includes(partsSearchQuery)
  );

  const loadVulnerabilities = async () => {
    try {
      const response = await vulnerabilityAPI.getVulnerabilities();
      if (response.success) {
        setVulnerabilities(response.vulnerabilities);
      }
    } catch (error) {
      console.error('Error loading vulnerabilities:', error);
    }
  };

  const loadPartColors = async () => {
    try {
      const response = await partColorAPI.getPartColors();
      if (response.success) {
        const colorMap = new Map<number, PartColor>();
        response.partColors.forEach((partColor: PartColor) => {
          colorMap.set(partColor.partNumber, partColor);
        });
        setPartColors(colorMap);
      }
    } catch (error) {
      console.error('Error loading part colors:', error);
    }
  };

  const loadPartNames = async () => {
    try {
      const response = await voterAPI.getPartNames();
      if (response.success) {
        setPartNames(response.data);
      }
    } catch (error) {
      console.error('Error loading part names:', error);
    }
  };

  const handlePartPress = (partNumber: number) => {
    if (isVulnerabilityMode) {
      // In vulnerability mode - open color selection modal
      setSelectedPartNumber(partNumber);
      setShowColorModal(true);
    } else {
      // Normal mode - navigate to voter data
      handlePartNavigation(partNumber);
    }
  };

  const handleVulnerabilityPress = () => {
    if (isVulnerabilityMode) {
      // Exit vulnerability mode
      setIsVulnerabilityMode(false);
      Alert.alert('Vulnerability Mode Disabled', 'Returned to normal mode. Click part numbers to view voter data.');
    } else {
      // Enter vulnerability mode
      setShowVulnerabilityModal(true);
    }
  };

  const handleMenuPress = () => {
    setShowPartsModal(true);
  };

  const handleColorSelect = async (vulnerability: Vulnerability) => {
    if (!selectedPartNumber) return;

    try {
      setLoading(true);
      const response = await partColorAPI.updatePartColor(
        selectedPartNumber,
        vulnerability._id,
        vulnerability.color
      );

      if (response.success) {
        // Update local state
        const newPartColor: PartColor = {
          _id: response.partColor._id,
          partNumber: selectedPartNumber,
          vulnerabilityId: vulnerability._id,
          color: vulnerability.color,
          vulnerability: vulnerability
        };
        
        setPartColors(prev => new Map(prev.set(selectedPartNumber, newPartColor)));
        setShowColorModal(false);
        setSelectedPartNumber(null);
        setIsVulnerabilityMode(false); // Exit vulnerability mode
        Alert.alert('Success', `Part ${selectedPartNumber} color updated to ${vulnerability.name}`);
      }
    } catch (error) {
      console.error('Error updating part color:', error);
      Alert.alert('Error', 'Failed to update part color');
    } finally {
      setLoading(false);
    }
  };

  const getPartColor = (partNumber: number) => {
    const partColor = partColors.get(partNumber);
    return partColor ? partColor.color : '#FFFFFF'; // Default white
  };

  const getPartBorderColor = (partNumber: number) => {
    const partColor = partColors.get(partNumber);
    return partColor ? partColor.color : '#1976D2'; // Default blue
  };

  const handlePartNavigation = (partNumber: number) => {
    // Navigate to voters map for this part number
    router.push({
      pathname: '/(tabs)/dashboard/voters_map',
      params: { partNumber: partNumber.toString() }
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#1976D2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Part Numbers {isVulnerabilityMode && '(Vulnerability Mode)'}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={handleMenuPress}>
            <Icon name="menu" size={24} color="#1976D2" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.headerIcon, 
              isVulnerabilityMode && styles.headerIconActive
            ]} 
            onPress={handleVulnerabilityPress}
          >
            <Icon 
              name="warning" 
              size={24} 
              color={isVulnerabilityMode ? "#FFFFFF" : "#1976D2"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#999999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by part number"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Part Numbers Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {filteredParts.map((partNumber) => (
            <TouchableOpacity
              key={partNumber}
              style={[
                styles.partCard, 
                { 
                  width: cardWidth,
                  backgroundColor: getPartColor(partNumber),
                  borderColor: getPartBorderColor(partNumber)
                }
              ]}
              onPress={() => handlePartPress(partNumber)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.partNumber,
                { color: getPartColor(partNumber) === '#FFFFFF' ? '#1976D2' : '#FFFFFF' }
              ]}>
                {partNumber}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Vulnerability Selection Modal */}
      <Modal
        visible={showVulnerabilityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVulnerabilityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Vulnerability</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowVulnerabilityModal(false)}
              >
                <Icon name="close" size={20} color="#666666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.colorOptions}>
              {vulnerabilities.map((vulnerability) => (
                <TouchableOpacity
                  key={vulnerability._id}
                  style={[
                    styles.colorOption,
                    { backgroundColor: vulnerability.color }
                  ]}
                  onPress={() => {
                    setShowVulnerabilityModal(false);
                    setIsVulnerabilityMode(true);
                    Alert.alert(
                      'Vulnerability Mode Enabled', 
                      'Now click on any part number to assign a vulnerability color to it.',
                      [{ text: 'OK' }]
                    );
                  }}
                />
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={() => setShowVulnerabilityModal(false)}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Color Selection Modal */}
      <Modal
        visible={showColorModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowColorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Vulnerability</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowColorModal(false)}
              >
                <Icon name="close" size={20} color="#666666" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.selectedPartText}>Part {selectedPartNumber}</Text>
            
            <View style={styles.colorOptions}>
              {vulnerabilities.map((vulnerability) => (
                <TouchableOpacity
                  key={vulnerability._id}
                  style={[
                    styles.colorOption,
                    { backgroundColor: vulnerability.color }
                  ]}
                  onPress={() => handleColorSelect(vulnerability)}
                  disabled={loading}
                />
              ))}
            </View>
            
            <View style={styles.modalButtonRow}>
              <TouchableOpacity 
                style={[styles.cancelButton]}
                onPress={() => {
                  setShowColorModal(false);
                  setSelectedPartNumber(null);
                }}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={() => setShowColorModal(false)}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Updating...' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Parts List Modal */}
      <Modal
        visible={showPartsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPartsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.partsModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Part Numbers</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowPartsModal(false)}
              >
                <Icon name="close" size={20} color="#666666" />
              </TouchableOpacity>
            </View>
            
            {/* Search Bar in Modal */}
            <View style={styles.modalSearchContainer}>
              <View style={styles.modalSearchBar}>
                <Icon name="search" size={20} color="#999999" style={styles.searchIcon} />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Search by part number or name"
                  placeholderTextColor="#999"
                  value={partsSearchQuery}
                  onChangeText={setPartsSearchQuery}
                />
              </View>
            </View>
            
            {/* Parts List */}
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // backIcon removed - using vector icon now
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  // headerIconText removed - using vector icons now
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  partCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#1976D2',
    minHeight: 60,
  },
  partNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 5,
  },
  // closeButtonText removed - using vector icons now
  selectedPartText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  colorOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  modalButtonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 10,
  },
  submitButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#CCCCCC',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerIconActive: {
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
  },
  // Parts Modal Styles
  partsModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '95%',
    height: '80%',
    maxWidth: 500,
  },
  modalSearchContainer: {
    marginBottom: 15,
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 10,
  },
  partsList: {
    flex: 1,
  },
  partItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  partItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  partItemNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    marginRight: 10,
  },
  partItemRight: {
    flex: 1,
  },
  partItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  partItemNameTamil: {
    fontSize: 14,
    color: '#666666',
  },
});
