/**
 * Bluetooth Printer Service
 * Handles all Bluetooth thermal printer operations for SR588/PX58B printer
 * Uses react-native-thermal-receipt-printer
 */

import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { BLEPrinter } from 'react-native-thermal-receipt-printer';

export interface PrinterDevice {
  device_name: string;
  inner_mac_address: string;
}

export class BluetoothPrinterService {
  private static connectedPrinter: PrinterDevice | null = null;
  private static readonly PRINTER_NAMES = ['SR588', 'PX58B', 'PSF588', 'Posiflow'];

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
   * Enable Bluetooth on the device
   */
  static async enableBluetooth(): Promise<boolean> {
    try {
      // Request permissions first
      const permGranted = await this.requestBluetoothPermissions();
      console.log('✅ Bluetooth permissions granted');
      return permGranted;
    } catch (error) {
      console.error('Failed to enable Bluetooth:', error);
      return false;
    }
  }

  /**
   * Check if Bluetooth is enabled
   */
  static async isBluetoothEnabled(): Promise<boolean> {
    try {
      const permGranted = await this.requestBluetoothPermissions();
      return permGranted;
    } catch (error) {
      console.error('Failed to check Bluetooth status:', error);
      return false;
    }
  }

  /**
   * Scan for paired Bluetooth devices
   */
  static async scanForPrinters(): Promise<PrinterDevice[]> {
    try {
      console.log('🔍 Scanning for Bluetooth printers...');
      
      const printers = await BLEPrinter.init();
      console.log('Found devices:', printers);

      // Filter for known printer models
      const filteredPrinters = printers.filter((device: PrinterDevice) => 
        this.PRINTER_NAMES.some(name => 
          device.device_name && device.device_name.toUpperCase().includes(name.toUpperCase())
        )
      );

      console.log(`✅ Found ${filteredPrinters.length} printer(s):`, filteredPrinters);
      return filteredPrinters;
    } catch (error) {
      console.error('Failed to scan for printers:', error);
      return [];
    }
  }

  /**
   * Connect to a specific printer
   */
  static async connectToPrinter(printer: PrinterDevice): Promise<boolean> {
    try {
      console.log(`📡 Connecting to printer: ${printer.device_name} (${printer.inner_mac_address})`);
      
      await BLEPrinter.connectPrinter(printer.inner_mac_address);
      this.connectedPrinter = printer;
      
      console.log('✅ Successfully connected to printer');
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
        await BLEPrinter.closeConn();
        console.log('✅ Disconnected from printer');
        this.connectedPrinter = null;
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
   * Print a base64 encoded image
   * @param base64Image - Base64 string of the image (without data:image/png;base64, prefix)
   * @param width - Width in pixels (384 for 58mm printer)
   */
  static async printImage(base64Image: string, width: number = 384): Promise<boolean> {
    try {
      console.log('🖨️ Printing image...');
      
      // Remove data URL prefix if present
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
      
      // Print image
      await BLEPrinter.printImageBase64(cleanBase64, {
        imageWidth: width,
        imageHeight: 0, // Auto calculate
      });
      
      // Add some space and cut
      await BLEPrinter.printText('\n\n\n');
      
      console.log('✅ Print job sent successfully');
      return true;
    } catch (error: any) {
      console.error('Failed to print:', error);
      Alert.alert('Print Failed', error.message || 'Could not print to device');
      return false;
    }
  }

  /**
   * Print text (useful for testing)
   */
  static async printText(text: string): Promise<boolean> {
    try {
      await BLEPrinter.printText(text);
      await BLEPrinter.printText('\n\n\n');
      return true;
    } catch (error) {
      console.error('Failed to print text:', error);
      return false;
    }
  }

  /**
   * Complete workflow: Find printer, connect, and print
   */
  static async findConnectAndPrint(base64Image: string): Promise<boolean> {
    try {
      // 1. Request permissions
      const permGranted = await this.requestBluetoothPermissions();
      if (!permGranted) {
        Alert.alert('Permission Required', 'Please grant Bluetooth permissions to use the printer');
        return false;
      }

      // 2. Scan for printers
      const printers = await this.scanForPrinters();
      if (printers.length === 0) {
        Alert.alert(
          'Printer Not Found',
          'No printer found. Please:\n1. Turn on the printer\n2. Pair it in phone Bluetooth settings\n3. Try again'
        );
        return false;
      }

      // 3. Connect to first printer found
      const printer = printers[0];
      const connected = await this.connectToPrinter(printer);
      if (!connected) {
        return false;
      }

      // 4. Print the image
      const printed = await this.printImage(base64Image);
      
      // 5. Disconnect (optional - printer auto-disconnects after print)
      setTimeout(() => this.disconnect(), 1000);

      return printed;
    } catch (error) {
      console.error('Print workflow error:', error);
      return false;
    }
  }
}
