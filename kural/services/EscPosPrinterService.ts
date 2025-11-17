/**
 * ESC/POS Printer Service
 * CORRECT Stack for Image Printing on Generic ESC/POS Thermal Printers
 * 
 * Libraries:
 * - react-native-ble-plx: For BLE scanning and connecting
 * - react-native-view-shot: For capturing React components as images
 * - react-native-esc-pos-printer: For converting images to ESC/POS bitmap and printing
 * 
 * Hardware: SR588, SHREYANS, PX58B (Generic ESC/POS thermal printers)
 * 
 * This printer CAN print images, QR codes, barcodes - it's ESC/POS compatible!
 */

import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
// ✅ CORRECT: Named import with curly braces
// @ts-ignore - react-native-esc-pos-printer doesn't have full TypeScript definitions
import { Printer } from 'react-native-esc-pos-printer';

export interface PrinterDevice {
  id: string;
  name: string | null;
}

export class EscPosPrinterService {
  private static bleManager: BleManager | null = null;
  private static connectedPrinter: PrinterDevice | null = null;
  private static connectedDeviceId: string | null = null;
  private static printerInstance: any = null; // Instance of Printer class
  private static readonly PRINTER_NAMES = ['SR588', 'SHREYANS', 'PX58B', 'PSF588', 'Posiflow'];

  /**
   * Initialize BLE Manager
   */
  private static initBleManager() {
    if (!this.bleManager) {
      this.bleManager = new BleManager();
      console.log('✅ BLE Manager initialized');
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
    try {
      this.initBleManager();
      if (!this.bleManager) return false;

      const state = await this.bleManager.state();
      return state === 'PoweredOn';
    } catch (error) {
      console.error('Failed to check Bluetooth state:', error);
      return false;
    }
  }

  /**
   * Scan for nearby Bluetooth printers using react-native-ble-plx
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

      // Check if Bluetooth is enabled
      const btEnabled = await this.isBluetoothEnabled();
      if (!btEnabled) {
        Alert.alert('Bluetooth Required', 'Please enable Bluetooth to scan for printers');
        return [];
      }

      this.initBleManager();
      if (!this.bleManager) {
        throw new Error('BLE Manager not initialized');
      }

      const foundPrinters: PrinterDevice[] = [];
      const deviceMap = new Map<string, PrinterDevice>();

      // Start scanning
      this.bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          return;
        }

        if (device && device.name) {
          const deviceName = device.name.toUpperCase();
          
          // Check if device name matches any known printer names
          const isPrinter = this.PRINTER_NAMES.some(name => 
            deviceName.includes(name.toUpperCase())
          );

          if (isPrinter && !deviceMap.has(device.id)) {
            const printer: PrinterDevice = {
              id: device.id,
              name: device.name,
            };
            
            deviceMap.set(device.id, printer);
            foundPrinters.push(printer);
            
            console.log(`📱 Found printer: ${device.name} (${device.id})`);
          }
        }
      });

      // Scan for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      this.bleManager.stopDeviceScan();
      console.log(`✅ Scan complete. Found ${foundPrinters.length} printer(s)`);
      
      return foundPrinters;
    } catch (error: any) {
      console.error('Scan error:', error);
      Alert.alert('Scan Failed', error.message || 'Could not scan for printers');
      return [];
    }
  }

  /**
   * Connect to a printer using react-native-ble-plx first, 
   * then create a Printer instance from react-native-esc-pos-printer
   */
  static async connectToPrinter(printer: PrinterDevice): Promise<boolean> {
    try {
      console.log(`🔌 Connecting to printer: ${printer.name}...`);

      this.initBleManager();
      if (!this.bleManager) {
        throw new Error('BLE Manager not initialized');
      }

      // First connect using BLE PLX
      const device = await this.bleManager.connectToDevice(printer.id);
      await device.discoverAllServicesAndCharacteristics();
      
      console.log('✅ BLE connection established');

      // Create a new Printer instance (react-native-esc-pos-printer uses class instances)
      this.printerInstance = new Printer({
        target: printer.id,
        deviceName: printer.name || 'Printer',
      });

      // Initialize the printer instance
      await this.printerInstance.init();
      
      // Connect to the printer
      await this.printerInstance.connect(10000); // 10 second timeout

      console.log('✅ ESC/POS Printer initialized and connected');
      
      this.connectedPrinter = printer;
      this.connectedDeviceId = printer.id;
      
      Alert.alert(
        'Connected',
        `Successfully connected to ${printer.name}`,
        [{ text: 'OK' }]
      );
      
      return true;
    } catch (error: any) {
      console.error('Connection error:', error);
      Alert.alert(
        'Connection Failed',
        error.message || 'Could not connect to printer'
      );
      return false;
    }
  }

  /**
   * Disconnect from current printer
   */
  static async disconnect(): Promise<boolean> {
    try {
      // Disconnect the printer instance
      if (this.printerInstance) {
        await this.printerInstance.disconnect();
        this.printerInstance = null;
      }

      // Disconnect BLE
      if (this.connectedDeviceId && this.bleManager) {
        await this.bleManager.cancelDeviceConnection(this.connectedDeviceId);
        console.log('✅ Disconnected from printer');
      }
      
      this.connectedPrinter = null;
      this.connectedDeviceId = null;
      return true;
    } catch (error) {
      console.error('Disconnect error:', error);
      return false;
    }
  }

  /**
   * Get connected printer
   */
  static getConnectedPrinter(): PrinterDevice | null {
    return this.connectedPrinter;
  }

  /**
   * Check if printer is ready
   */
  static isPrinterReady(): boolean {
    return this.connectedPrinter !== null && this.connectedDeviceId !== null;
  }

  /**
   * Print an image using react-native-esc-pos-printer
   * This is the KEY method - it converts base64 image to ESC/POS bitmap
   * @param base64Image - Base64 encoded image (with or without data:image prefix)
   * @param width - Image width in pixels (default 384 for 58mm printer)
   */
  static async printImage(base64Image: string, width: number = 384): Promise<boolean> {
    try {
      console.log('🖨️ Printing image via ESC/POS...');
      
      if (!this.isPrinterReady() || !this.printerInstance) {
        Alert.alert('Not Connected', 'Please connect to a printer first');
        return false;
      }

      // Remove data URI prefix if present (keep only base64 part)
      let imageData = base64Image;
      if (base64Image.startsWith('data:image')) {
        imageData = base64Image.split(',')[1];
      }

      // Add the image to the print buffer
      await this.printerInstance.addImage({
        source: imageData,
        width: width,
      });

      // Add some line feeds
      await this.printerInstance.addFeedLine(3);
      
      // Cut the paper
      await this.printerInstance.addCut();

      // Send all commands to printer
      await this.printerInstance.sendData(10000); // 10 second timeout

      console.log('✅ Image printed successfully');
      return true;
    } catch (error: any) {
      console.error('Failed to print image:', error);
      Alert.alert('Print Failed', error.message || 'Could not print image');
      return false;
    }
  }

  /**
   * Print text content using react-native-esc-pos-printer
   * @param text - Text to print
   */
  static async printText(text: string): Promise<boolean> {
    try {
      console.log('🖨️ Printing text via ESC/POS...');
      
      if (!this.isPrinterReady() || !this.printerInstance) {
        Alert.alert('Not Connected', 'Please connect to a printer first');
        return false;
      }

      // Add text to print buffer
      await this.printerInstance.addText(text);
      
      // Add line feeds
      await this.printerInstance.addFeedLine(3);
      
      // Cut the paper
      await this.printerInstance.addCut();
      
      // Send all commands to printer
      await this.printerInstance.sendData(10000); // 10 second timeout
      
      console.log('✅ Text printed successfully');
      return true;
    } catch (error: any) {
      console.error('Failed to print text:', error);
      Alert.alert('Print Failed', error.message || 'Could not print text');
      return false;
    }
  }

  /**
   * Cleanup - destroy BLE manager
   */
  static cleanup() {
    if (this.bleManager) {
      this.bleManager.destroy();
      this.bleManager = null;
      console.log('✅ BLE Manager cleaned up');
    }
  }
}

export default EscPosPrinterService;
