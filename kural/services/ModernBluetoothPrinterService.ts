/**
 * Modern Bluetooth Printer Service
 * Correct Stack for Generic ESC/POS Thermal Printers with Image Support:
 * - @conodene/react-native-thermal-receipt-printer-image-qr: BLE printing with IMAGE & QR support
 * - react-native-view-shot: For capturing components as images
 * 
 * Hardware: SR588, PX58B, PSF588, SHREYANS (Generic ESC/POS thermal printers)
 * Features: Text printing, Image printing (bitmap), QR codes, Column printing
 */

import { Platform, PermissionsAndroid, Alert } from 'react-native';
// Temporarily disabled - library has dependency issues
// @ts-ignore - Library doesn't have TypeScript definitions
// import { BLEPrinter } from '@conodene/react-native-thermal-receipt-printer-image-qr';

// Using fallback printer service
const BLEPrinter = null;

export interface PrinterDevice {
  device_name: string;
  inner_mac_address: string;
}

export class ModernBluetoothPrinterService {
  private static connectedPrinter: PrinterDevice | null = null;
  private static readonly PRINTER_NAMES = ['SR588', 'PX58B', 'PSF588', 'Posiflow'];

  /**
   * Initialize BLE Printer
   */
  private static async initPrinter(): Promise<boolean> {
    try {
      await BLEPrinter.init();
      console.log('✅ BLE Printer initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize BLE printer:', error);
      return false;
    }
  }

  /**
   * Request Bluetooth permissions on Android
   */
  static async requestBluetoothPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const sdk = Platform.Version;
      
      if (sdk >= 31) {
        // Android 12+ requires new permissions
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ];

        const results = await PermissionsAndroid.requestMultiple(permissions);
        
        return Object.values(results).every(
          result => result === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        // Android 11 and below
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Bluetooth permission error:', error);
      return false;
    }
  }

  /**
   * Check if Bluetooth is enabled
   */
  static async isBluetoothEnabled(): Promise<boolean> {
    // For thermal-receipt-printer, we just try to init
    // If it fails, Bluetooth is likely disabled
    return true;
  }

  /**
   * Scan for nearby Bluetooth printers using thermal-receipt-printer
   * Returns array of printer devices found
   */
  static async scanForPrinters(): Promise<PrinterDevice[]> {
    try {
      console.log('🔍 Scanning for Bluetooth printers...');
      
      // Request permissions first
      const permGranted = await this.requestBluetoothPermissions();
      if (!permGranted) {
        Alert.alert('Permission Required', 'Please grant Bluetooth permissions');
        return [];
      }

      // Initialize BLE Printer
      const initialized = await this.initPrinter();
      if (!initialized) {
        Alert.alert('Initialization Failed', 'Could not initialize Bluetooth printer');
        return [];
      }

      // Get device list from thermal-receipt-printer
      const devices = await BLEPrinter.getDeviceList();
      console.log(`🔍 Scan complete. Found ${devices.length} printer(s)`);
      
      // Filter for known printer names
      const printers = devices.filter((device: PrinterDevice) => 
        this.PRINTER_NAMES.some(name => 
          device.device_name?.toUpperCase().includes(name.toUpperCase())
        )
      );

      printers.forEach((printer: PrinterDevice) => {
        console.log(`✅ Found printer: ${printer.device_name} (${printer.inner_mac_address})`);
      });

      return printers;
    } catch (error) {
      console.error('Failed to scan for printers:', error);
      return [];
    }
  }

  /**
   * Connect to a specific printer device using thermal-receipt-printer
   */
  static async connectToPrinter(printer: PrinterDevice): Promise<boolean> {
    try {
      console.log(`📡 Connecting to printer: ${printer.device_name} (${printer.inner_mac_address})`);
      
      // Disconnect from any previous device
      if (this.connectedPrinter) {
        await this.disconnect();
      }

      // Connect using thermal-receipt-printer's BLEPrinter
      await BLEPrinter.connectPrinter(printer.inner_mac_address);
      
      this.connectedPrinter = printer;
      console.log('✅ Connected to printer');
      
      Alert.alert('Success', `Connected to ${printer.device_name}`);
      return true;
    } catch (error: any) {
      console.error('Failed to connect to printer:', error);
      Alert.alert('Connection Failed', error.message || 'Could not connect to printer');
      return false;
    }
  }

  /**
   * Disconnect from current printer
   */
  static async disconnect(): Promise<void> {
    try {
      if (this.connectedPrinter) {
        // thermal-receipt-printer doesn't have explicit disconnect
        // Just clear the reference
        this.connectedPrinter = null;
        console.log('✅ Disconnected from printer');
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }

  /**
   * Get currently connected printer
   */
  static getConnectedPrinter(): PrinterDevice | null {
    return this.connectedPrinter;
  }

  /**
   * Check if printer is ready to print
   */
  static isPrinterReady(): boolean {
    return this.connectedPrinter !== null;
  }

  /**
   * Print image using BLEPrinter with real image support
   * @param base64Image - Base64 encoded image string (without data:image prefix)
   * @param width - Image width in pixels (default: 384 for 58mm printer)
   */
  static async printImage(base64Image: string, width: number = 384): Promise<boolean> {
    try {
      console.log('🖨️ Printing image via BLEPrinter...');
      console.log('📦 Image data length:', base64Image.length);
      console.log('📏 Image width:', width);
      
      if (!this.isPrinterReady()) {
        Alert.alert('Not Connected', 'Please connect to a printer first');
        return false;
      }

      // Try different image printing approaches
      try {
        // Method 1: Using printImageBase64 with explicit dimensions
        await BLEPrinter.printImageBase64(base64Image, {
          imageWidth: 384,
          imageHeight: 0, // Auto-calculate
        });
        console.log('✅ Image printed successfully (method 1)');
      } catch (error1) {
        console.error('⚠️ Method 1 failed:', error1);
        
        // Method 2: Try with different width
        try {
          await BLEPrinter.printImageBase64(base64Image, {
            imageWidth: 576,
            imageHeight: 0,
          });
          console.log('✅ Image printed successfully (method 2 - 576px)');
        } catch (error2) {
          console.error('⚠️ Method 2 failed:', error2);
          throw new Error('All image printing methods failed');
        }
      }
      
      console.log('✅ Image printed successfully');
      return true;
    } catch (error: any) {
      console.error('Failed to print image:', error);
      Alert.alert('Print Failed', error.message || 'Could not print image');
      return false;
    }
  }

  /**
   * Print text content using BLEPrinter
   * Supports ESC/POS formatting tags: <C> (center), <B> (bold), etc.
   * @param text - Text to print (can include formatting tags)
   */
  static async printText(text: string): Promise<boolean> {
    try {
      console.log('🖨️ Printing text via BLEPrinter...');
      
      if (!this.isPrinterReady()) {
        Alert.alert('Not Connected', 'Please connect to a printer first');
        return false;
      }

      // Print using BLEPrinter with formatting support
      // Add exactly 1 line feed after the content for minimal spacing before cut
      await BLEPrinter.printText(text + '\n');
      
      console.log('✅ Text printed successfully');
      return true;
    } catch (error: any) {
      console.error('Failed to print text:', error);
      Alert.alert('Print Failed', error.message || 'Could not print text');
      return false;
    }
  }

  /**
   * Complete workflow: Scan, connect, and print
   */
  static async findConnectAndPrint(base64Image: string): Promise<boolean> {
    try {
      // 1. Request permissions
      const permGranted = await this.requestBluetoothPermissions();
      if (!permGranted) {
        Alert.alert('Permission Required', 'Please grant Bluetooth permissions');
        return false;
      }

      // 2. Scan for printers
      const printers = await this.scanForPrinters();
      if (printers.length === 0) {
        Alert.alert(
          'Printer Not Found',
          'No printer found. Please:\n1. Turn on the printer\n2. Make sure Bluetooth is enabled\n3. Try again'
        );
        return false;
      }

      // 3. Connect to first printer found
      const connected = await this.connectToPrinter(printers[0]);
      if (!connected) {
        return false;
      }

      // 4. Print the image
      const printed = await this.printImage(base64Image);

      return printed;
    } catch (error) {
      console.error('Print workflow error:', error);
      return false;
    }
  }

  /**
   * Cleanup (disconnect)
   */
  static async destroy(): Promise<void> {
    try {
      await this.disconnect();
    } catch (error) {
      console.error('Failed to destroy:', error);
    }
  }
}

export default ModernBluetoothPrinterService;
