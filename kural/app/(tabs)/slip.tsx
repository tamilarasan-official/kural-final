import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Alert,
  Switch,
  Dimensions,
  StatusBar,
  Platform,
  PermissionsAndroid
} from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

type SlipBoxSettings = {
  prin: boolean;
  candidate: boolean;
};

export default function SlipScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'slipbox' | 'voterslip'>('slipbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBluetoothModal, setShowBluetoothModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [slipBoxSettings, setSlipBoxSettings] = useState<{[key: string]: SlipBoxSettings}>({
    'Default': { prin: false, candidate: false },
    'Thondamuthur4': { prin: true, candidate: true }
  });

  useEffect(() => {
    // Check if Bluetooth is already enabled
    checkBluetoothStatus();
  }, []);

  const checkBluetoothStatus = async () => {
    setBluetoothEnabled(false);
  };

  const requestBluetoothPermission = () => {
    setShowBluetoothModal(true);
  };

  const handleBluetoothAllow = async () => {
    try {
      if (Platform.OS === 'android') {
        const sdkInt = Number((global as any).nativePerformance?.now ? 31 : 30);
        const neededPerms: string[] = [];
        const BL_CONNECT = 'android.permission.BLUETOOTH_CONNECT';
        const BL_SCAN = 'android.permission.BLUETOOTH_SCAN';
        const BL_ADVERTISE = 'android.permission.BLUETOOTH_ADVERTISE';

        if (sdkInt >= 31) {
          neededPerms.push(BL_CONNECT, BL_SCAN, BL_ADVERTISE);
        } else {
          neededPerms.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        }

        const results = await PermissionsAndroid.requestMultiple(
          // @ts-ignore
          neededPerms
        );
        const denied = Object.values(results).some(r => r !== PermissionsAndroid.RESULTS.GRANTED);
        if (denied) {
          showToastMessage(t('common.permissionRequired'));
          setShowBluetoothModal(false);
          setShowScanModal(true);
          return;
        }
      }

      if (Constants?.appOwnership === 'expo') {
        setBluetoothEnabled(true);
        showToastMessage('Bluetooth simulated in Expo Go. Build a Dev Client to enable for real.');
      } else {
        let BluetoothStateManager: any = null;
        try {
          const mod = await import('react-native-bluetooth-state-manager');
          BluetoothStateManager = (mod as any)?.default ?? mod;
        } catch (e) {
          BluetoothStateManager = null;
        }

        if (BluetoothStateManager && typeof BluetoothStateManager.requestToEnable === 'function') {
          await BluetoothStateManager.requestToEnable();
          setBluetoothEnabled(true);
          showToastMessage(t('slip.btEnabled'));
        } else {
          setBluetoothEnabled(true);
          showToastMessage(t('slip.btEnabled'));
        }
      }

      setShowBluetoothModal(false);
      setShowScanModal(true);
    } catch (err: any) {
      console.log('Enable Bluetooth error:', err?.message || err);
      showToastMessage(t('common.error'));
      setShowBluetoothModal(false);
    }
  };

  const handleBluetoothDeny = () => {
    setShowBluetoothModal(false);
    setShowScanModal(true);
  };

  const startScanning = () => {
    setIsScanning(true);
    setShowScanModal(false);
    setTimeout(() => {
      setIsScanning(false);
      showToastMessage(t('slip.scan.none'));
    }, 3000);
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const toggleSetting = (section: string, setting: 'prin' | 'candidate') => {
    setSlipBoxSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [setting]: !prev[section][setting]
      }
    }));
  };

  const renderSlipBoxContent = () => (
    <View style={styles.contentContainer}>
      {!bluetoothEnabled ? (
        <TouchableOpacity 
          style={styles.enableBluetoothButton}
          onPress={requestBluetoothPermission}
        >
          <Text style={styles.enableBluetoothText}>{t('slip.enableBluetooth')}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.bluetoothEnabledContainer}>
          <Icon name="bluetooth" size={48} color="#1976D2" />
          <Text style={styles.bluetoothEnabledText}>{t('slip.btEnabled')}</Text>
          <Text style={styles.bluetoothSubText}>{t('slip.btReady')}</Text>
        </View>
      )}
    </View>
  );

  const renderVoterSlipContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('slip.searchPlaceholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
      </View>

      {Object.entries(slipBoxSettings).map(([sectionName, settings]) => (
        <View key={sectionName} style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>{sectionName}</Text>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleItem}>
              <Text style={styles.toggleLabel}>{t('slip.prin')}</Text>
              <Switch
                value={settings.prin}
                onValueChange={() => toggleSetting(sectionName, 'prin')}
                trackColor={{ false: '#FFCDD2', true: '#C8E6C9' }}
                thumbColor={settings.prin ? '#4CAF50' : '#F44336'}
              />
            </View>
            <View style={styles.toggleItem}>
              <Text style={styles.toggleLabel}>{t('slip.candidate')}</Text>
              <Switch
                value={settings.candidate}
                onValueChange={() => toggleSetting(sectionName, 'candidate')}
                trackColor={{ false: '#FFCDD2', true: '#C8E6C9' }}
                thumbColor={settings.candidate ? '#4CAF50' : '#F44336'}
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E3F2FD" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('slip.header')}</Text>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'slipbox' && styles.activeSegment]}
          onPress={() => setActiveTab('slipbox')}
        >
          <Text style={[styles.segmentText, activeTab === 'slipbox' && styles.activeSegmentText]}>
            {t('slip.segment.slipbox')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'voterslip' && styles.activeSegment]}
          onPress={() => setActiveTab('voterslip')}
        >
          <Text style={[styles.segmentText, activeTab === 'voterslip' && styles.activeSegmentText]}>
            {t('slip.segment.voterslip')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'slipbox' ? renderSlipBoxContent() : renderVoterSlipContent()}

      {/* Bluetooth Permission Modal */}
      <Modal
        visible={showBluetoothModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBluetoothModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('slip.modal.title')}</Text>
              <TouchableOpacity onPress={() => setShowBluetoothModal(false)}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>{t('slip.modal.turnOn')}</Text>
            <Text style={styles.modalSubtext}>{t('slip.modal.persist')}</Text>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity style={styles.checkbox}>
                <Icon name="check-box-outline-blank" size={20} color="#666" />
              </TouchableOpacity>
              <Text style={styles.checkboxText}>{t('slip.modal.dontRemind')}</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonSecondary}
                onPress={handleBluetoothDeny}
              >
                <Text style={styles.modalButtonSecondaryText}>{t('slip.modal.dontAllow')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonPrimary}
                onPress={handleBluetoothAllow}
              >
                <Text style={styles.modalButtonPrimaryText}>{t('slip.modal.allow')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Scan Modal */}
      <Modal
        visible={showScanModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowScanModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('slip.modal.title')}</Text>
              <TouchableOpacity onPress={() => setShowScanModal(false)}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>{t('slip.scan.available')}</Text>
            <Text style={styles.scanText}>{t('slip.scan.none')}</Text>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={startScanning}
            >
              <Text style={styles.scanButtonText}>{t('slip.scan.cta')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Toast Notification */}
      {showToast && (
        <View style={styles.toastContainer}>
          <Icon name="bluetooth" size={20} color="#fff" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Loading Overlay */}
      {isScanning && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>{t('slip.loading')}</Text>
        </View>
      )}
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
  paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeSegment: {
    backgroundColor: '#1976D2',
  },
  segmentText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1976D2',
  },
  activeSegmentText: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  searchIcon: {
    marginLeft: 8,
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  toggleItem: {
    alignItems: 'center',
    flex: 1,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  enableBluetoothButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  enableBluetoothText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bluetoothEnabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bluetoothEnabledText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
    marginTop: 16,
    marginBottom: 8,
  },
  bluetoothSubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  comingSoon: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: width * 0.85,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  modalText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  modalSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxText: {
    fontSize: 14,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    color: '#666',
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  scanText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  toastText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: 'bold',
  },
});
