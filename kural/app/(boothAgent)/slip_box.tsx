import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Switch,
  Dimensions,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ScreenWrapper from '../components/ScreenWrapper';
import { BluetoothPrinterService } from '../../services/BluetoothPrinterService';
import { PrintService } from '../../services/PrintService';

const { width } = Dimensions.get('window');

type SlipBoxSettings = {
  prin: boolean;
  candidate: boolean;
};

export default function SlipBoxScreen() {
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
  const [printerStatus, setPrinterStatus] = useState<{
    bluetoothEnabled: boolean;
    printerFound: boolean;
    printerConnected: boolean;
    printerName?: string;
  }>({
    bluetoothEnabled: false,
    printerFound: false,
    printerConnected: false,
  });
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    // Check printer status on mount
    checkPrinterStatus();
  }, []);

  const checkPrinterStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const status = await PrintService.checkPrinterStatus();
      setPrinterStatus(status);
      setBluetoothEnabled(status.bluetoothEnabled);
    } catch (error) {
      console.error('Error checking printer status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const requestBluetoothPermission = () => {
    setShowBluetoothModal(true);
  };

  const handleBluetoothAllow = async () => {
    try {
      // Use the new Bluetooth service
      const permGranted = await BluetoothPrinterService.requestBluetoothPermissions();
      if (!permGranted) {
        showToastMessage(t('common.permissionRequired'));
        setShowBluetoothModal(false);
        return;
      }

      const enabled = await BluetoothPrinterService.enableBluetooth();
      if (enabled) {
        setBluetoothEnabled(true);
        showToastMessage(t('slip.btEnabled'));
        await checkPrinterStatus(); // Refresh status
      } else {
        showToastMessage('Failed to enable Bluetooth');
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

  const startScanning = async () => {
    setIsScanning(true);
    setShowScanModal(false);
    
    try {
      const printers = await BluetoothPrinterService.scanForPrinters();
      
      if (printers.length > 0) {
        showToastMessage(`Found ${printers.length} printer(s): ${printers[0].name}`);
        await checkPrinterStatus(); // Refresh status
      } else {
        showToastMessage(t('slip.scan.none'));
      }
    } catch (error) {
      console.error('Scan error:', error);
      showToastMessage('Scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  const handleTestPrint = async () => {
    setIsPrinting(true);
    try {
      const success = await PrintService.testPrint();
      if (success) {
        showToastMessage('Test print successful! ✅');
      }
    } catch (error) {
      console.error('Test print error:', error);
    } finally {
      setIsPrinting(false);
    }
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
      {isCheckingStatus ? (
        <View style={styles.statusCheckingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.statusCheckingText}>Checking printer status...</Text>
        </View>
      ) : !bluetoothEnabled ? (
        <TouchableOpacity 
          style={styles.enableBluetoothButton}
          onPress={requestBluetoothPermission}
        >
          <Icon name="bluetooth" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.enableBluetoothText}>{t('slip.enableBluetooth')}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.bluetoothEnabledContainer}>
          <Icon name="bluetooth" size={48} color="#1976D2" />
          <Text style={styles.bluetoothEnabledText}>{t('slip.btEnabled')}</Text>
          
          {/* Printer Status Card */}
          <View style={styles.statusCard}>
            <Text style={styles.statusCardTitle}>Printer Status</Text>
            
            <View style={styles.statusRow}>
              <Icon 
                name={printerStatus.printerFound ? "check-circle" : "cancel"} 
                size={20} 
                color={printerStatus.printerFound ? "#4CAF50" : "#F44336"} 
              />
              <Text style={styles.statusLabel}>Printer:</Text>
              <Text style={styles.statusValue}>
                {printerStatus.printerFound 
                  ? printerStatus.printerName || 'Found' 
                  : 'Not Found'}
              </Text>
            </View>
            
            <View style={styles.statusRow}>
              <Icon 
                name={printerStatus.printerConnected ? "link" : "link-off"} 
                size={20} 
                color={printerStatus.printerConnected ? "#4CAF50" : "#999"} 
              />
              <Text style={styles.statusLabel}>Connection:</Text>
              <Text style={styles.statusValue}>
                {printerStatus.printerConnected ? 'Connected' : 'Not Connected'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={checkPrinterStatus}
              disabled={isCheckingStatus}
            >
              <Icon name="refresh" size={20} color="#1976D2" />
              <Text style={styles.actionButtonText}>Refresh Status</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.scanButton]}
              onPress={() => setShowScanModal(true)}
            >
              <Icon name="search" size={20} color="#4CAF50" />
              <Text style={[styles.actionButtonText, styles.scanButtonText]}>Scan Printers</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.testButton,
                (!printerStatus.printerFound || isPrinting) && styles.disabledButton
              ]}
              onPress={handleTestPrint}
              disabled={!printerStatus.printerFound || isPrinting}
            >
              {isPrinting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon name="print" size={20} color="#fff" />
              )}
              <Text style={styles.testButtonText}>
                {isPrinting ? 'Printing...' : 'Test Print'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Text */}
          <View style={styles.infoContainer}>
            <Icon name="info-outline" size={20} color="#666" />
            <Text style={styles.bluetoothSubText}>
              {printerStatus.printerFound 
                ? 'Printer ready for use. Go to Voter Slip tab to print voter slips.' 
                : 'Please pair your printer (SR588/PX58B) in phone Bluetooth settings first.'}
            </Text>
          </View>
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
    <ScreenWrapper userRole="booth_agent">
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#E3F2FD" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(boothAgent)/dashboard')}>
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
                <Text style={styles.modalTitle}>Scan for Printers</Text>
                <TouchableOpacity onPress={() => setShowScanModal(false)}>
                  <Icon name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle}>Looking for paired printers...</Text>
              <Text style={styles.scanText}>
                Make sure your printer (SR588/PX58B) is:
                {'\n'}• Turned on
                {'\n'}• Paired in Bluetooth settings
                {'\n'}• Within range
              </Text>
              <TouchableOpacity 
                style={styles.scanButton}
                onPress={startScanning}
                disabled={isScanning}
              >
                {isScanning ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.scanButtonText}>Start Scanning</Text>
                )}
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
            <ActivityIndicator size="large" color="#1976D2" />
            <Text style={styles.loadingText}>Scanning for printers...</Text>
          </View>
        )}
      </View>
    </ScreenWrapper>
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
    marginRight: 34, // Balance the back button
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
  statusCheckingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCheckingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
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
    justifyContent: 'center',
    marginTop: 20,
    flexDirection: 'row',
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
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
    paddingBottom: 40,
  },
  bluetoothEnabledText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
    marginTop: 16,
    marginBottom: 20,
  },
  statusCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
    marginRight: 8,
  },
  statusValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  actionButtonsContainer: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1976D2',
    gap: 8,
    elevation: 1,
  },
  scanButton: {
    borderColor: '#4CAF50',
  },
  testButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    borderColor: '#CCCCCC',
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  scanButtonText: {
    color: '#4CAF50',
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  bluetoothSubText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
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
    marginBottom: 12,
    fontWeight: '600',
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
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: 'bold',
    marginTop: 12,
  },
});
