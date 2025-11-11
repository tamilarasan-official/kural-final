import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';

import { import { 

  View,   View, 

  Text,   Text, 

  StyleSheet,   StyleSheet, 

  TouchableOpacity,   TouchableOpacity, 

  TextInput,   TextInput, 

  Modal,   Modal, 

  Switch,  Switch,

  Dimensions,  Dimensions,

  StatusBar,  StatusBar,

  ActivityIndicator  Platform,

} from 'react-native';  PermissionsAndroid,

import { useLanguage } from '../../contexts/LanguageContext';  ActivityIndicator

import { useRouter } from 'expo-router';} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';import { useLanguage } from '../../contexts/LanguageContext';

import ScreenWrapper from '../components/ScreenWrapper';import { useRouter } from 'expo-router';

import { BluetoothPrinterService } from '../../services/BluetoothPrinterService';import Icon from 'react-native-vector-icons/MaterialIcons';

import { PrintService } from '../../services/PrintService';import Constants from 'expo-constants';

import ScreenWrapper from '../components/ScreenWrapper';

const { width } = Dimensions.get('window');import { BluetoothPrinterService } from '../../services/BluetoothPrinterService';

import { PrintService } from '../../services/PrintService';

type SlipBoxSettings = {

  prin: boolean;const { width } = Dimensions.get('window');

  candidate: boolean;

};type SlipBoxSettings = {

  prin: boolean;

export default function SlipScreen() {  candidate: boolean;

  const { t } = useLanguage();};

  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'slipbox' | 'voterslip'>('slipbox');export default function SlipScreen() {

  const [searchQuery, setSearchQuery] = useState('');  const { t } = useLanguage();

  const [showBluetoothModal, setShowBluetoothModal] = useState(false);  const router = useRouter();

  const [showScanModal, setShowScanModal] = useState(false);  const [activeTab, setActiveTab] = useState<'slipbox' | 'voterslip'>('slipbox');

  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);  const [searchQuery, setSearchQuery] = useState('');

  const [isScanning, setIsScanning] = useState(false);  const [showBluetoothModal, setShowBluetoothModal] = useState(false);

  const [showToast, setShowToast] = useState(false);  const [showScanModal, setShowScanModal] = useState(false);

  const [toastMessage, setToastMessage] = useState('');  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);

  const [slipBoxSettings, setSlipBoxSettings] = useState<{[key: string]: SlipBoxSettings}>({  const [isScanning, setIsScanning] = useState(false);

    'Default': { prin: false, candidate: false },  const [showToast, setShowToast] = useState(false);

    'Thondamuthur4': { prin: true, candidate: true }  const [toastMessage, setToastMessage] = useState('');

  });  const [slipBoxSettings, setSlipBoxSettings] = useState<{[key: string]: SlipBoxSettings}>({

  const [printerStatus, setPrinterStatus] = useState<{    'Default': { prin: false, candidate: false },

    bluetoothEnabled: boolean;    'Thondamuthur4': { prin: true, candidate: true }

    printerFound: boolean;  });

    printerConnected: boolean;  const [printerStatus, setPrinterStatus] = useState<{

    printerName?: string;  useEffect(() => {

  }>({    // Check printer status on mount

    bluetoothEnabled: false,    checkPrinterStatus();

    printerFound: false,  }, []);

    printerConnected: false,

  });  const checkPrinterStatus = async () => {

  const [isCheckingStatus, setIsCheckingStatus] = useState(false);    setIsCheckingStatus(true);

  const [isPrinting, setIsPrinting] = useState(false);    try {

      const status = await PrintService.checkPrinterStatus();

  useEffect(() => {      setPrinterStatus(status);

    // Check printer status on mount      setBluetoothEnabled(status.bluetoothEnabled);

    checkPrinterStatus();    } catch (error) {

  }, []);      console.error('Error checking printer status:', error);

    } finally {

  const checkPrinterStatus = async () => {      setIsCheckingStatus(false);

    setIsCheckingStatus(true);    }

    try {  };printerConnected: false,

      const status = await PrintService.checkPrinterStatus();  });

      setPrinterStatus(status);  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

      setBluetoothEnabled(status.bluetoothEnabled);  const [isPrinting, setIsPrinting] = useState(false);

    } catch (error) {

      console.error('Error checking printer status:', error);  useEffect(() => {

    } finally {    // Check if Bluetooth is already enabled

      setIsCheckingStatus(false);    checkBluetoothStatus();

    }  }, []);

  };  const handleBluetoothAllow = async () => {

    try {

  const requestBluetoothPermission = () => {      // Use the new Bluetooth service

    setShowBluetoothModal(true);      const permGranted = await BluetoothPrinterService.requestBluetoothPermissions();

  };      if (!permGranted) {

        showToastMessage(t('common.permissionRequired'));

  const handleBluetoothAllow = async () => {        setShowBluetoothModal(false);

    try {        return;

      // Use the new Bluetooth service      }

      const permGranted = await BluetoothPrinterService.requestBluetoothPermissions();

      if (!permGranted) {      const enabled = await BluetoothPrinterService.enableBluetooth();

        showToastMessage(t('common.permissionRequired'));      if (enabled) {

        setShowBluetoothModal(false);        setBluetoothEnabled(true);

        return;        showToastMessage(t('slip.btEnabled'));

      }        await checkPrinterStatus(); // Refresh status

      } else {

      const enabled = await BluetoothPrinterService.enableBluetooth();        showToastMessage('Failed to enable Bluetooth');

      if (enabled) {      }

        setBluetoothEnabled(true);

        showToastMessage(t('slip.btEnabled'));      setShowBluetoothModal(false);

        await checkPrinterStatus(); // Refresh status      setShowScanModal(true);

      } else {    } catch (err: any) {

        showToastMessage('Failed to enable Bluetooth');      console.log('Enable Bluetooth error:', err?.message || err);

      }      showToastMessage(t('common.error'));

      setShowBluetoothModal(false);

      setShowBluetoothModal(false);    }

      setShowScanModal(true);  };  }

    } catch (err: any) {

      console.log('Enable Bluetooth error:', err?.message || err);      setShowBluetoothModal(false);

      showToastMessage(t('common.error'));      setShowScanModal(true);

      setShowBluetoothModal(false);    } catch (err: any) {

    }      console.log('Enable Bluetooth error:', err?.message || err);

  };      showToastMessage(t('common.error'));

      setShowBluetoothModal(false);

  const handleBluetoothDeny = () => {    }

    setShowBluetoothModal(false);  };

    setShowScanModal(true);

  };  const handleBluetoothDeny = () => {

    setShowBluetoothModal(false);

  const startScanning = async () => {    setShowScanModal(true);

    setIsScanning(true);  };

    setShowScanModal(false);

      const startScanning = () => {

    try {    setIsScanning(true);

      const printers = await BluetoothPrinterService.scanForPrinters();    setShowScanModal(false);

          setTimeout(() => {

      if (printers.length > 0) {      setIsScanning(false);

        showToastMessage(`Found ${printers.length} printer(s): ${printers[0].name}`);      showToastMessage(t('slip.scan.none'));

        await checkPrinterStatus(); // Refresh status    }, 3000);

      } else {  };

        showToastMessage(t('slip.scan.none'));

      }  const showToastMessage = (message: string) => {

    } catch (error) {    setToastMessage(message);

      console.error('Scan error:', error);    setShowToast(true);

      showToastMessage('Scan failed');    setTimeout(() => {

    } finally {      setShowToast(false);

      setIsScanning(false);    }, 3000);

    }  };

  };

  const toggleSetting = (section: string, setting: 'prin' | 'candidate') => {

  const handleTestPrint = async () => {    setSlipBoxSettings(prev => ({

    setIsPrinting(true);      ...prev,

    try {      [section]: {

      const success = await PrintService.testPrint();        ...prev[section],

      if (success) {  const startScanning = async () => {

        showToastMessage('Test print successful! ✅');    setIsScanning(true);

      }    setShowScanModal(false);

    } catch (error) {    

      console.error('Test print error:', error);    try {

    } finally {      const printers = await BluetoothPrinterService.scanForPrinters();

      setIsPrinting(false);      

    }      if (printers.length > 0) {

  };        showToastMessage(`Found ${printers.length} printer(s): ${printers[0].name}`);

        await checkPrinterStatus(); // Refresh status

  const showToastMessage = (message: string) => {      } else {

    setToastMessage(message);        showToastMessage(t('slip.scan.none'));

    setShowToast(true);      }

    setTimeout(() => {    } catch (error) {

      setShowToast(false);      console.error('Scan error:', error);

    }, 3000);      showToastMessage('Scan failed');

  };    } finally {

      setIsScanning(false);

  const toggleSetting = (section: string, setting: 'prin' | 'candidate') => {    }

    setSlipBoxSettings(prev => ({  };

      ...prev,

      [section]: {  const handleTestPrint = async () => {

        ...prev[section],    setIsPrinting(true);

        [setting]: !prev[section][setting]    try {

      }      const success = await PrintService.testPrint();

    }));      if (success) {

  };        showToastMessage('Test print successful! ✅');

      }

  const renderSlipBoxContent = () => (    } catch (error) {

    <View style={styles.contentContainer}>      console.error('Test print error:', error);

      {isCheckingStatus ? (    } finally {

        <View style={styles.statusCheckingContainer}>      setIsPrinting(false);

          <ActivityIndicator size="large" color="#1976D2" />    }

          <Text style={styles.statusCheckingText}>Checking printer status...</Text>  };  {!bluetoothEnabled ? (

        </View>        <TouchableOpacity 

      ) : !bluetoothEnabled ? (          style={styles.enableBluetoothButton}

        <TouchableOpacity   const renderSlipBoxContent = () => (

          style={styles.enableBluetoothButton}    <View style={styles.contentContainer}>

          onPress={requestBluetoothPermission}      {isCheckingStatus ? (

        >        <View style={styles.statusCheckingContainer}>

          <Text style={styles.enableBluetoothText}>{t('slip.enableBluetooth')}</Text>          <ActivityIndicator size="large" color="#1976D2" />

        </TouchableOpacity>          <Text style={styles.statusCheckingText}>Checking printer status...</Text>

      ) : (        </View>

        <View style={styles.bluetoothEnabledContainer}>      ) : !bluetoothEnabled ? (

          <Icon name="bluetooth" size={48} color="#1976D2" />        <TouchableOpacity 

          <Text style={styles.bluetoothEnabledText}>{t('slip.btEnabled')}</Text>          style={styles.enableBluetoothButton}

                    onPress={requestBluetoothPermission}

          {/* Printer Status Card */}        >

          <View style={styles.statusCard}>          <Text style={styles.enableBluetoothText}>{t('slip.enableBluetooth')}</Text>

            <View style={styles.statusRow}>        </TouchableOpacity>

              <Icon       ) : (

                name={printerStatus.printerFound ? "check-circle" : "cancel"}         <View style={styles.bluetoothEnabledContainer}>

                size={20}           <Icon name="bluetooth" size={48} color="#1976D2" />

                color={printerStatus.printerFound ? "#4CAF50" : "#F44336"}           <Text style={styles.bluetoothEnabledText}>{t('slip.btEnabled')}</Text>

              />          

              <Text style={styles.statusLabel}>Printer:</Text>          {/* Printer Status Card */}

              <Text style={styles.statusValue}>          <View style={styles.statusCard}>

                {printerStatus.printerFound             <View style={styles.statusRow}>

                  ? printerStatus.printerName || 'Found'               <Icon 

                  : 'Not Found'}                name={printerStatus.printerFound ? "check-circle" : "cancel"} 

              </Text>                size={20} 

            </View>                color={printerStatus.printerFound ? "#4CAF50" : "#F44336"} 

                          />

            <View style={styles.statusRow}>              <Text style={styles.statusLabel}>Printer:</Text>

              <Icon               <Text style={styles.statusValue}>

                name={printerStatus.printerConnected ? "link" : "link-off"}                 {printerStatus.printerFound 

                size={20}                   ? printerStatus.printerName || 'Found' 

                color={printerStatus.printerConnected ? "#4CAF50" : "#999"}                   : 'Not Found'}

              />              </Text>

              <Text style={styles.statusLabel}>Status:</Text>            </View>

              <Text style={styles.statusValue}>            

                {printerStatus.printerConnected ? 'Connected' : 'Not Connected'}            <View style={styles.statusRow}>

              </Text>              <Icon 

            </View>                name={printerStatus.printerConnected ? "link" : "link-off"} 

          </View>                size={20} 

                color={printerStatus.printerConnected ? "#4CAF50" : "#999"} 

          {/* Action Buttons */}              />

          <View style={styles.actionButtonsContainer}>              <Text style={styles.statusLabel}>Status:</Text>

            <TouchableOpacity               <Text style={styles.statusValue}>

              style={styles.actionButton}                {printerStatus.printerConnected ? 'Connected' : 'Not Connected'}

              onPress={checkPrinterStatus}              </Text>

            >            </View>

              <Icon name="refresh" size={20} color="#1976D2" />          </View>

              <Text style={styles.actionButtonText}>Refresh Status</Text>

            </TouchableOpacity>          {/* Action Buttons */}

          <View style={styles.actionButtonsContainer}>

            <TouchableOpacity             <TouchableOpacity 

              style={[styles.actionButton, styles.scanButton]}              style={styles.actionButton}

              onPress={startScanning}              onPress={checkPrinterStatus}

            >            >

              <Icon name="search" size={20} color="#1976D2" />              <Icon name="refresh" size={20} color="#1976D2" />

              <Text style={styles.actionButtonText}>Scan Printers</Text>              <Text style={styles.actionButtonText}>Refresh Status</Text>

            </TouchableOpacity>            </TouchableOpacity>



            <TouchableOpacity             <TouchableOpacity 

              style={[              style={[styles.actionButton, styles.scanButton]}

                styles.actionButton,               onPress={startScanning}

                styles.testButton,            >

                (!printerStatus.printerFound || isPrinting) && styles.disabledButton              <Icon name="search" size={20} color="#1976D2" />

              ]}              <Text style={styles.actionButtonText}>Scan Printers</Text>

              onPress={handleTestPrint}            </TouchableOpacity>

              disabled={!printerStatus.printerFound || isPrinting}

            >            <TouchableOpacity 

              {isPrinting ? (              style={[

                <ActivityIndicator size="small" color="#fff" />                styles.actionButton, 

              ) : (                styles.testButton,

                <Icon name="print" size={20} color="#fff" />                (!printerStatus.printerFound || isPrinting) && styles.disabledButton

              )}              ]}

              <Text style={styles.testButtonText}>              onPress={handleTestPrint}

                {isPrinting ? 'Printing...' : 'Test Print'}              disabled={!printerStatus.printerFound || isPrinting}

              </Text>            >

            </TouchableOpacity>              {isPrinting ? (

          </View>                <ActivityIndicator size="small" color="#fff" />

              ) : (

          <Text style={styles.bluetoothSubText}>                <Icon name="print" size={20} color="#fff" />

            {printerStatus.printerFound               )}

              ? 'Printer ready for use. Go to Voter Slip tab to print.'               <Text style={styles.testButtonText}>

              : 'Please pair your printer in Bluetooth settings first.'}                {isPrinting ? 'Printing...' : 'Test Print'}

          </Text>              </Text>

        </View>            </TouchableOpacity>

      )}          </View>

    </View>

  );          <Text style={styles.bluetoothSubText}>

            {printerStatus.printerFound 

  const renderVoterSlipContent = () => (              ? 'Printer ready for use. Go to Voter Slip tab to print.' 

    <View style={styles.contentContainer}>              : 'Please pair your printer in Bluetooth settings first.'}

      <View style={styles.searchContainer}>          </Text>

        <TextInput        </View>

          style={styles.searchInput}      )}

          placeholder={t('slip.searchPlaceholder')}    </View>

          value={searchQuery}  );    <TextInput

          onChangeText={setSearchQuery}          style={styles.searchInput}

          placeholderTextColor="#999"          placeholder={t('slip.searchPlaceholder')}

        />          value={searchQuery}

        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />          onChangeText={setSearchQuery}

      </View>          placeholderTextColor="#999"

        />

      {Object.entries(slipBoxSettings).map(([sectionName, settings]) => (        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />

        <View key={sectionName} style={styles.settingsCard}>      </View>

          <Text style={styles.sectionTitle}>{sectionName}</Text>

          <View style={styles.toggleContainer}>      {Object.entries(slipBoxSettings).map(([sectionName, settings]) => (

            <View style={styles.toggleItem}>        <View key={sectionName} style={styles.settingsCard}>

              <Text style={styles.toggleLabel}>{t('slip.prin')}</Text>          <Text style={styles.sectionTitle}>{sectionName}</Text>

              <Switch          <View style={styles.toggleContainer}>

                value={settings.prin}            <View style={styles.toggleItem}>

                onValueChange={() => toggleSetting(sectionName, 'prin')}              <Text style={styles.toggleLabel}>{t('slip.prin')}</Text>

                trackColor={{ false: '#FFCDD2', true: '#C8E6C9' }}              <Switch

                thumbColor={settings.prin ? '#4CAF50' : '#F44336'}                value={settings.prin}

              />                onValueChange={() => toggleSetting(sectionName, 'prin')}

            </View>                trackColor={{ false: '#FFCDD2', true: '#C8E6C9' }}

            <View style={styles.toggleItem}>                thumbColor={settings.prin ? '#4CAF50' : '#F44336'}

              <Text style={styles.toggleLabel}>{t('slip.candidate')}</Text>              />

              <Switch            </View>

                value={settings.candidate}            <View style={styles.toggleItem}>

                onValueChange={() => toggleSetting(sectionName, 'candidate')}              <Text style={styles.toggleLabel}>{t('slip.candidate')}</Text>

                trackColor={{ false: '#FFCDD2', true: '#C8E6C9' }}              <Switch

                thumbColor={settings.candidate ? '#4CAF50' : '#F44336'}                value={settings.candidate}

              />                onValueChange={() => toggleSetting(sectionName, 'candidate')}

            </View>                trackColor={{ false: '#FFCDD2', true: '#C8E6C9' }}

          </View>                thumbColor={settings.candidate ? '#4CAF50' : '#F44336'}

        </View>              />

      ))}            </View>

    </View>          </View>

  );        </View>

      ))}

  return (    </View>

    <ScreenWrapper userRole="booth_agent">  );

      <View style={styles.container}>

        <StatusBar barStyle="dark-content" backgroundColor="#E3F2FD" />  return (

            <ScreenWrapper userRole="booth_agent">

        {/* Header */}      <View style={styles.container}>

        <View style={styles.header}>        <StatusBar barStyle="dark-content" backgroundColor="#E3F2FD" />

          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(boothAgent)/dashboard')}>        

            <Icon name="arrow-back" size={24} color="#000" />        {/* Header */}

          </TouchableOpacity>        <View style={styles.header}>

          <Text style={styles.headerTitle}>{t('slip.header')}</Text>          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(boothAgent)/dashboard')}>

        </View>            <Icon name="arrow-back" size={24} color="#000" />

          </TouchableOpacity>

        {/* Segmented Control */}          <Text style={styles.headerTitle}>{t('slip.header')}</Text>

        <View style={styles.segmentedControl}>        </View>

          <TouchableOpacity

            style={[styles.segmentButton, activeTab === 'slipbox' && styles.activeSegment]}        {/* Segmented Control */}

            onPress={() => setActiveTab('slipbox')}        <View style={styles.segmentedControl}>

          >          <TouchableOpacity

            <Text style={[styles.segmentText, activeTab === 'slipbox' && styles.activeSegmentText]}>            style={[styles.segmentButton, activeTab === 'slipbox' && styles.activeSegment]}

              {t('slip.segment.slipbox')}            onPress={() => setActiveTab('slipbox')}

            </Text>          >

          </TouchableOpacity>            <Text style={[styles.segmentText, activeTab === 'slipbox' && styles.activeSegmentText]}>

          <TouchableOpacity              {t('slip.segment.slipbox')}

            style={[styles.segmentButton, activeTab === 'voterslip' && styles.activeSegment]}            </Text>

            onPress={() => setActiveTab('voterslip')}          </TouchableOpacity>

          >          <TouchableOpacity

            <Text style={[styles.segmentText, activeTab === 'voterslip' && styles.activeSegmentText]}>            style={[styles.segmentButton, activeTab === 'voterslip' && styles.activeSegment]}

              {t('slip.segment.voterslip')}            onPress={() => setActiveTab('voterslip')}

            </Text>          >

          </TouchableOpacity>            <Text style={[styles.segmentText, activeTab === 'voterslip' && styles.activeSegmentText]}>

        </View>              {t('slip.segment.voterslip')}

            </Text>

        {/* Content */}          </TouchableOpacity>

        {activeTab === 'slipbox' ? renderSlipBoxContent() : renderVoterSlipContent()}        </View>



        {/* Bluetooth Permission Modal */}        {/* Content */}

        <Modal        {activeTab === 'slipbox' ? renderSlipBoxContent() : renderVoterSlipContent()}

          visible={showBluetoothModal}

          transparent={true}        {/* Bluetooth Permission Modal */}

          animationType="fade"        <Modal

          onRequestClose={() => setShowBluetoothModal(false)}          visible={showBluetoothModal}

        >          transparent={true}

          <View style={styles.modalOverlay}>          animationType="fade"

            <View style={styles.modalContainer}>          onRequestClose={() => setShowBluetoothModal(false)}

              <View style={styles.modalHeader}>        >

                <Text style={styles.modalTitle}>{t('slip.modal.title')}</Text>          <View style={styles.modalOverlay}>

                <TouchableOpacity onPress={() => setShowBluetoothModal(false)}>            <View style={styles.modalContainer}>

                  <Icon name="close" size={24} color="#000" />              <View style={styles.modalHeader}>

                </TouchableOpacity>                <Text style={styles.modalTitle}>{t('slip.modal.title')}</Text>

              </View>                <TouchableOpacity onPress={() => setShowBluetoothModal(false)}>

              <Text style={styles.modalText}>{t('slip.modal.turnOn')}</Text>                  <Icon name="close" size={24} color="#000" />

              <Text style={styles.modalSubtext}>{t('slip.modal.persist')}</Text>                </TouchableOpacity>

              <View style={styles.checkboxContainer}>              </View>

                <TouchableOpacity style={styles.checkbox}>              <Text style={styles.modalText}>{t('slip.modal.turnOn')}</Text>

                  <Icon name="check-box-outline-blank" size={20} color="#666" />              <Text style={styles.modalSubtext}>{t('slip.modal.persist')}</Text>

                </TouchableOpacity>              <View style={styles.checkboxContainer}>

                <Text style={styles.checkboxText}>{t('slip.modal.dontRemind')}</Text>                <TouchableOpacity style={styles.checkbox}>

              </View>                  <Icon name="check-box-outline-blank" size={20} color="#666" />

              <View style={styles.modalButtons}>                </TouchableOpacity>

                <TouchableOpacity                 <Text style={styles.checkboxText}>{t('slip.modal.dontRemind')}</Text>

                  style={styles.modalButtonSecondary}              </View>

                  onPress={handleBluetoothDeny}              <View style={styles.modalButtons}>

                >                <TouchableOpacity 

                  <Text style={styles.modalButtonSecondaryText}>{t('slip.modal.dontAllow')}</Text>                  style={styles.modalButtonSecondary}

                </TouchableOpacity>                  onPress={handleBluetoothDeny}

                <TouchableOpacity                 >

                  style={styles.modalButtonPrimary}                  <Text style={styles.modalButtonSecondaryText}>{t('slip.modal.dontAllow')}</Text>

                  onPress={handleBluetoothAllow}                </TouchableOpacity>

                >                <TouchableOpacity 

                  <Text style={styles.modalButtonPrimaryText}>{t('slip.modal.allow')}</Text>                  style={styles.modalButtonPrimary}

                </TouchableOpacity>                  onPress={handleBluetoothAllow}

              </View>                >

            </View>                  <Text style={styles.modalButtonPrimaryText}>{t('slip.modal.allow')}</Text>

          </View>                </TouchableOpacity>

        </Modal>              </View>

            </View>

        {/* Scan Modal */}          </View>

        <Modal        </Modal>

          visible={showScanModal}

          transparent={true}        {/* Scan Modal */}

          animationType="fade"        <Modal

          onRequestClose={() => setShowScanModal(false)}          visible={showScanModal}

        >          transparent={true}

          <View style={styles.modalOverlay}>          animationType="fade"

            <View style={styles.modalContainer}>          onRequestClose={() => setShowScanModal(false)}

              <View style={styles.modalHeader}>        >

                <Text style={styles.modalTitle}>{t('slip.modal.title')}</Text>          <View style={styles.modalOverlay}>

                <TouchableOpacity onPress={() => setShowScanModal(false)}>            <View style={styles.modalContainer}>

                  <Icon name="close" size={24} color="#000" />              <View style={styles.modalHeader}>

                </TouchableOpacity>                <Text style={styles.modalTitle}>{t('slip.modal.title')}</Text>

              </View>                <TouchableOpacity onPress={() => setShowScanModal(false)}>

              <Text style={styles.modalSubtitle}>{t('slip.scan.available')}</Text>                  <Icon name="close" size={24} color="#000" />

              <Text style={styles.scanText}>{t('slip.scan.none')}</Text>                </TouchableOpacity>

              <TouchableOpacity               </View>

                style={styles.scanButton}              <Text style={styles.modalSubtitle}>{t('slip.scan.available')}</Text>

                onPress={startScanning}              <Text style={styles.scanText}>{t('slip.scan.none')}</Text>

              >              <TouchableOpacity 

                <Text style={styles.scanButtonText}>{t('slip.scan.cta')}</Text>                style={styles.scanButton}

              </TouchableOpacity>                onPress={startScanning}

            </View>              >

          </View>                <Text style={styles.scanButtonText}>{t('slip.scan.cta')}</Text>

        </Modal>              </TouchableOpacity>

            </View>

        {/* Toast Notification */}          </View>

        {showToast && (        </Modal>

          <View style={styles.toastContainer}>

            <Icon name="bluetooth" size={20} color="#fff" />        {/* Toast Notification */}

            <Text style={styles.toastText}>{toastMessage}</Text>        {showToast && (

          </View>          <View style={styles.toastContainer}>

        )}            <Icon name="bluetooth" size={20} color="#fff" />

            <Text style={styles.toastText}>{toastMessage}</Text>

        {/* Loading Overlay */}          </View>

        {isScanning && (        )}

          <View style={styles.loadingOverlay}>

            <Text style={styles.loadingText}>{t('slip.loading')}</Text>        {/* Loading Overlay */}

          </View>        {isScanning && (

        )}          <View style={styles.loadingOverlay}>

      </View>            <Text style={styles.loadingText}>{t('slip.loading')}</Text>

    </ScreenWrapper>          </View>

  );        )}

}      </View>

    </ScreenWrapper>

const styles = StyleSheet.create({  );

  container: {}

    flex: 1,

    backgroundColor: '#F8F9FA',const styles = StyleSheet.create({

  },  container: {

  header: {    flex: 1,

    backgroundColor: '#E3F2FD',    backgroundColor: '#F8F9FA',

    paddingTop: 12,  },

    paddingBottom: 20,  header: {

    paddingHorizontal: 20,    backgroundColor: '#E3F2FD',

    flexDirection: 'row',    paddingTop: 12,

    alignItems: 'center',    paddingBottom: 20,

  },    paddingHorizontal: 20,

  backButton: {    flexDirection: 'row',

    marginRight: 10,    alignItems: 'center',

  },    borderBottomLeftRadius: 0,

  headerTitle: {    borderBottomRightRadius: 0,

    fontSize: 20,  },

    fontWeight: 'bold',  backButton: {

    color: '#000',    marginRight: 10,

    flex: 1,  },

    textAlign: 'center',  headerTitle: {

  },    fontSize: 20,

  segmentedControl: {    fontWeight: 'bold',

    flexDirection: 'row',    color: '#000',

    margin: 20,    flex: 1,

    backgroundColor: '#fff',    textAlign: 'center',

    borderRadius: 8,  },

    padding: 4,  segmentedControl: {

    elevation: 2,    flexDirection: 'row',

    shadowColor: '#000',    margin: 20,

    shadowOffset: { width: 0, height: 1 },    backgroundColor: '#fff',

    shadowOpacity: 0.2,    borderRadius: 8,

    shadowRadius: 2,    padding: 4,

  },    elevation: 2,

  segmentButton: {    shadowColor: '#000',

    flex: 1,    shadowOffset: { width: 0, height: 1 },

    paddingVertical: 12,    shadowOpacity: 0.2,

    paddingHorizontal: 16,    shadowRadius: 2,

    borderRadius: 6,  },

    alignItems: 'center',  segmentButton: {

  },    flex: 1,

  activeSegment: {    paddingVertical: 12,

    backgroundColor: '#1976D2',    paddingHorizontal: 16,

  },    borderRadius: 6,

  segmentText: {    alignItems: 'center',

    fontSize: 16,  },

    fontWeight: '500',  activeSegment: {

    color: '#1976D2',    backgroundColor: '#1976D2',

  },  },

  activeSegmentText: {  segmentText: {

    color: '#fff',    fontSize: 16,

  },    fontWeight: '500',

  contentContainer: {    color: '#1976D2',

    flex: 1,  },

    paddingHorizontal: 20,  activeSegmentText: {

  },    color: '#fff',

  statusCheckingContainer: {  },

    flex: 1,  contentContainer: {

    justifyContent: 'center',    flex: 1,

    alignItems: 'center',    paddingHorizontal: 20,

  },  },

  statusCheckingText: {  searchContainer: {

    fontSize: 16,    flexDirection: 'row',

    color: '#666',    alignItems: 'center',

    marginTop: 12,    backgroundColor: '#fff',

  },    borderRadius: 8,

  searchContainer: {    marginBottom: 20,

    flexDirection: 'row',    paddingHorizontal: 16,

    alignItems: 'center',    elevation: 2,

    backgroundColor: '#fff',    shadowColor: '#000',

    borderRadius: 8,    shadowOffset: { width: 0, height: 1 },

    marginBottom: 20,    shadowOpacity: 0.2,

    paddingHorizontal: 16,    shadowRadius: 2,

    elevation: 2,  },

    shadowColor: '#000',  searchInput: {

    shadowOffset: { width: 0, height: 1 },    flex: 1,

    shadowOpacity: 0.2,    paddingVertical: 12,

    shadowRadius: 2,    fontSize: 16,

  },    color: '#000',

  searchInput: {  },

    flex: 1,  searchIcon: {

    paddingVertical: 12,    marginLeft: 8,

    fontSize: 16,  },

    color: '#000',  settingsCard: {

  },    backgroundColor: '#fff',

  searchIcon: {    borderRadius: 12,

    marginLeft: 8,    padding: 16,

  },    marginBottom: 16,

  settingsCard: {    elevation: 2,

    backgroundColor: '#fff',    shadowColor: '#000',

    borderRadius: 12,    shadowOffset: { width: 0, height: 1 },

    padding: 16,    shadowOpacity: 0.2,

    marginBottom: 16,    shadowRadius: 2,

    elevation: 2,  },

    shadowColor: '#000',  sectionTitle: {

    shadowOffset: { width: 0, height: 1 },    fontSize: 18,

    shadowOpacity: 0.2,    fontWeight: 'bold',

    shadowRadius: 2,    color: '#000',

  },    marginBottom: 16,

  sectionTitle: {  },

    fontSize: 18,  toggleContainer: {

    fontWeight: 'bold',    flexDirection: 'row',

    color: '#000',    justifyContent: 'space-around',

    marginBottom: 16,  },

  },  toggleItem: {

  toggleContainer: {    alignItems: 'center',

    flexDirection: 'row',    flex: 1,

    justifyContent: 'space-around',  },

  },  toggleLabel: {

  toggleItem: {    fontSize: 14,

    alignItems: 'center',    color: '#666',

    flex: 1,    marginBottom: 8,

  },  },

  toggleLabel: {  enableBluetoothButton: {

    fontSize: 14,    backgroundColor: '#1976D2',

    color: '#666',    paddingVertical: 16,

    marginBottom: 8,    borderRadius: 8,

  },    alignItems: 'center',

  enableBluetoothButton: {    marginTop: 20,

    backgroundColor: '#1976D2',  },

    paddingVertical: 16,  enableBluetoothText: {

    borderRadius: 8,    color: '#fff',

    alignItems: 'center',    fontSize: 16,

    marginTop: 20,    fontWeight: 'bold',

  },  },

  enableBluetoothText: {  bluetoothEnabledContainer: {

    color: '#fff',    flex: 1,

    fontSize: 16,    justifyContent: 'center',

    fontWeight: 'bold',    alignItems: 'center',

  },    paddingHorizontal: 20,

  bluetoothEnabledContainer: {  },

    flex: 1,  bluetoothEnabledText: {

    justifyContent: 'center',    fontSize: 20,

    alignItems: 'center',    fontWeight: 'bold',

    paddingHorizontal: 20,    color: '#1976D2',

  },    marginTop: 16,

  bluetoothEnabledText: {    marginBottom: 8,

    fontSize: 20,  },

    fontWeight: 'bold',  bluetoothSubText: {

    color: '#1976D2',    fontSize: 16,

    marginTop: 16,    color: '#666',

    marginBottom: 20,    textAlign: 'center',

  },  },

  bluetoothSubText: {  modalOverlay: {

    fontSize: 14,    flex: 1,

    color: '#666',    backgroundColor: 'rgba(0, 0, 0, 0.5)',

    textAlign: 'center',    justifyContent: 'center',

    marginTop: 20,    alignItems: 'center',

  },  },

  statusCard: {  modalContainer: {

    width: '100%',    backgroundColor: '#fff',

    backgroundColor: '#F5F5F5',    borderRadius: 12,

    borderRadius: 12,    padding: 20,

    padding: 16,    width: width * 0.85,

    marginBottom: 20,    maxWidth: 400,

  },  },

  statusRow: {  modalHeader: {

    flexDirection: 'row',    flexDirection: 'row',

    alignItems: 'center',    justifyContent: 'space-between',

    marginBottom: 12,    alignItems: 'center',

  },    marginBottom: 16,

  statusLabel: {  },

    fontSize: 14,  modalTitle: {

    fontWeight: '600',    fontSize: 18,

    color: '#000',    fontWeight: 'bold',

    marginLeft: 8,    color: '#000',

    marginRight: 8,  },

  },  modalText: {

  statusValue: {    fontSize: 16,

    fontSize: 14,    color: '#000',

    color: '#666',    marginBottom: 8,

  },  },

  actionButtonsContainer: {  modalSubtext: {

    width: '100%',    fontSize: 14,

    gap: 12,    color: '#666',

  },    marginBottom: 16,

  actionButton: {  },

    flexDirection: 'row',  modalSubtitle: {

    alignItems: 'center',    fontSize: 16,

    justifyContent: 'center',    color: '#000',

    backgroundColor: '#fff',    marginBottom: 8,

    paddingVertical: 14,  },

    borderRadius: 8,  checkboxContainer: {

    borderWidth: 1,    flexDirection: 'row',

    borderColor: '#1976D2',    alignItems: 'center',

    gap: 8,    marginBottom: 20,

  },  },

  scanButton: {  checkbox: {

    borderColor: '#4CAF50',    marginRight: 8,

  },  },

  testButton: {  checkboxText: {

    backgroundColor: '#4CAF50',    fontSize: 14,

    borderColor: '#4CAF50',    color: '#666',

  },  },

  disabledButton: {  modalButtons: {

    backgroundColor: '#CCCCCC',    flexDirection: 'row',

    borderColor: '#CCCCCC',    justifyContent: 'space-between',

    opacity: 0.6,  },

  },  modalButtonSecondary: {

  actionButtonText: {    flex: 1,

    fontSize: 14,    paddingVertical: 12,

    fontWeight: '600',    marginRight: 8,

    color: '#1976D2',    alignItems: 'center',

  },  },

  testButtonText: {  modalButtonSecondaryText: {

    fontSize: 14,    fontSize: 16,

    fontWeight: '600',    color: '#666',

    color: '#fff',  },

  },  modalButtonPrimary: {

  modalOverlay: {    flex: 1,

    flex: 1,    paddingVertical: 12,

    backgroundColor: 'rgba(0, 0, 0, 0.5)',    marginLeft: 8,

    justifyContent: 'center',    alignItems: 'center',

    alignItems: 'center',  },

  },  modalButtonPrimaryText: {

  modalContainer: {    fontSize: 16,

    backgroundColor: '#fff',    color: '#1976D2',

    borderRadius: 12,    fontWeight: 'bold',

    padding: 20,  },

    width: width * 0.85,  scanText: {

    maxWidth: 400,    fontSize: 16,

  },    color: '#000',

  modalHeader: {    textAlign: 'center',

    flexDirection: 'row',    marginBottom: 20,

    justifyContent: 'space-between',  },

    alignItems: 'center',  scanButton: {

    marginBottom: 16,    backgroundColor: '#1976D2',

  },    paddingVertical: 16,

  modalTitle: {    borderRadius: 8,

    fontSize: 18,    alignItems: 'center',

    fontWeight: 'bold',  },

    color: '#000',  scanButtonText: {

  },    color: '#fff',

  modalText: {    fontSize: 16,

    fontSize: 16,    fontWeight: 'bold',

    color: '#000',  },

    marginBottom: 8,  toastContainer: {

  },    position: 'absolute',

  modalSubtext: {    bottom: 100,

    fontSize: 14,    left: 20,

    color: '#666',    right: 20,

    marginBottom: 16,    backgroundColor: 'rgba(0, 0, 0, 0.8)',

  },    flexDirection: 'row',

  modalSubtitle: {    alignItems: 'center',

    fontSize: 16,    paddingVertical: 12,

    color: '#000',    paddingHorizontal: 16,

    marginBottom: 8,    borderRadius: 8,

  },  },

  checkboxContainer: {  toastText: {

    flexDirection: 'row',    color: '#fff',

    alignItems: 'center',    marginLeft: 8,

    marginBottom: 20,    fontSize: 14,

  },  },

  checkbox: {  loadingOverlay: {

    marginRight: 8,    position: 'absolute',

  },    top: 0,

  checkboxText: {    left: 0,

    fontSize: 14,    right: 0,

    color: '#666',    bottom: 0,

  },    backgroundColor: 'rgba(255, 255, 255, 0.8)',

  modalButtons: {    justifyContent: 'center',

    flexDirection: 'row',    alignItems: 'center',

    justifyContent: 'space-between',  },

  },  loadingText: {

  modalButtonSecondary: {    fontSize: 16,

    flex: 1,    color: '#1976D2',

    paddingVertical: 12,    fontWeight: 'bold',

    marginRight: 8,  },

    alignItems: 'center',});
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
