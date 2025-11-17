/**
 * Print Service
 * Handles capturing React components as images and sending to thermal printer
 * Uses react-native-view-shot for screenshots and ModernBluetoothPrinterService for printing
 * 
 * WORKING STACK (Image printing confirmed working):
 * - react-native-ble-plx: BLE scanning & connecting (via BLEPrinter from thermal-receipt-printer)
 * - react-native-view-shot: Component to image capture
 * - react-native-thermal-receipt-printer: BLE thermal printing with image support
 */

import { captureRef } from 'react-native-view-shot';
import { ModernBluetoothPrinterService } from './ModernBluetoothPrinterService';
import { Alert } from 'react-native';

export class PrintService {
  /**
   * Capture a React component as a base64 image
   * @param viewRef - Reference to the component to capture
   * @param width - Width in pixels (default 384 for 58mm printer)
   */
  static async captureComponentAsImage(
    viewRef: any,
    width: number = 384
  ): Promise<string | null> {
    try {
      console.log('📸 Capturing component as image...');
      
      // Wait a moment to ensure component is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capture the view as a PNG image URI (data:image/png;base64,...)
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1.0,
        result: 'data-uri', // Changed from 'base64' to get full data URI
      });

      console.log('✅ Component captured as data URI');
      return uri;
    } catch (error) {
      console.error('Failed to capture component:', error);
      Alert.alert('Capture Failed', 'Could not capture the slip for printing');
      return null;
    }
  }

  /**
   * Print a voter slip as IMAGE (new capability!)
   * @param viewRef - Reference to the VoterSlipTemplate component
   * @param voterData - Voter data (optional, for logging)
   */
  static async printVoterSlipAsImage(viewRef: any, voterData?: any): Promise<boolean> {
    try {
      console.log('🖨️ Starting IMAGE print process...');

      // Check if printer is connected
      if (!ModernBluetoothPrinterService.isPrinterReady()) {
        Alert.alert(
          'Printer Not Connected',
          'Please connect to a printer first from Settings'
        );
        return false;
      }

      // Capture component as base64 image
      const imageUri = await this.captureComponentAsImage(viewRef, 384);
      if (!imageUri) {
        return false;
      }

      // Extract pure base64 (remove data:image/png;base64, prefix)
      const base64Data = imageUri.split(',')[1];
      
      console.log('🖨️ Printing image via BLEPrinter...');
      
      // Print the actual image!
      const success = await ModernBluetoothPrinterService.printImage(base64Data, 384);
      
      if (success) {
        console.log('✅ Image printed successfully');
        Alert.alert('Success', 'Voter slip printed as image!');
      }
      
      return success;
    } catch (error: any) {
      console.error('Failed to print voter slip as image:', error);
      Alert.alert('Print Failed', error.message || 'Could not print slip as image');
      return false;
    }
  }

  /**
   * Print voter slip with Tamil header + text details
   * Prints: Tamil header as TEXT → Voter details as TEXT
   * @param headerRef - Not used anymore, kept for compatibility
   * @param voterData - Voter data for printing
   */
  static async printVoterSlipComplete(headerRef: any, voterData: any): Promise<boolean> {
    try {
      console.log('🖨️ Starting COMPLETE print (Tamil Header + Text)...');

      // Check if printer is connected
      if (!ModernBluetoothPrinterService.isPrinterReady()) {
        Alert.alert(
          'Printer Not Connected',
          'Please connect to a printer first from Settings'
        );
        return false;
      }

      // 1. Print header
      console.log('🖨️ Printing header...');
      const header = `================================
  TAMILNADU ASSEMBLY ELECTION
           2026
================================

Election Officer
December - 2026
Coimbatore - Thondamuthur

`;
      await ModernBluetoothPrinterService.printText(header);

      // 2. Print separator
      console.log('🖨️ Printing separator...');
      await ModernBluetoothPrinterService.printText('--- Please Cut Here ---\n');

      // 3. Print voter details as text
      console.log('🖨️ Printing voter details...');
      const slipText = this.formatVoterSlipText(voterData);
      await ModernBluetoothPrinterService.printText(slipText);
      console.log('✅ Voter details printed');

      return true;
    } catch (error: any) {
      console.error('Failed to print slip:', error);
      Alert.alert('Print Failed', error.message || 'Could not print slip');
      return false;
    }
  }

  /**
   * Print a voter slip - Uses text formatting that's already working
      console.log('🖨️ Starting COMPLETE print (Image + Text)...');

      // Check if printer is connected
      if (!ModernBluetoothPrinterService.isPrinterReady()) {
        Alert.alert(
          'Printer Not Connected',
          'Please connect to a printer first from Settings'
        );
        return false;
      }

      // 1. Capture and print Tamil header as image
      console.log('📸 Checking headerRef:', headerRef);
      console.log('📸 headerRef.current:', headerRef?.current);
      
      if (headerRef && headerRef.current) {
        console.log('✅ HeaderRef is valid, attempting capture...');
        
        try {
          const headerImageUri = await this.captureComponentAsImage(headerRef, 384);
          console.log('📸 Capture result:', headerImageUri ? 'SUCCESS (length: ' + headerImageUri.length + ')' : 'FAILED');
          
          if (headerImageUri) {
            console.log('🖼️ Image data preview:', headerImageUri.substring(0, 50) + '...');
            const base64Data = headerImageUri.split(',')[1];
            console.log('� Base64 data length:', base64Data?.length || 0);
            
            if (base64Data && base64Data.length > 0) {
              console.log('�🖨️ Printing header image via BLEPrinter...');
              await ModernBluetoothPrinterService.printImage(base64Data, 384);
              console.log('✅ Header image printed successfully');
            } else {
              console.error('❌ Base64 data is empty!');
            }
          } else {
            console.error('❌ Failed to capture header image!');
          }
        } catch (captureError) {
          console.error('❌ Image capture error:', captureError);
        }
      } else {
        console.warn('⚠️ Header ref not available:', { hasRef: !!headerRef, hasCurrent: !!headerRef?.current });
      }

      // 2. Print separator with some spacing
      console.log('🖨️ Printing separator...');
      await ModernBluetoothPrinterService.printText('\n--- Please Cut Here ---\n');

      // 3. Print voter details as text (ONLY ONCE)
      console.log('🖨️ Printing voter details...');
      const slipText = this.formatVoterSlipText(voterData);
      await ModernBluetoothPrinterService.printText(slipText);
      console.log('✅ Voter details printed');

      return true;
    } catch (error: any) {
      console.error('Failed to print slip:', error);
      Alert.alert('Print Failed', error.message || 'Could not print slip');
      return false;
    }
  }

  /**
   * Print a voter slip - Uses text formatting that's already working
   * @param viewRef - Reference to the VoterSlipTemplate component
   * @param voterData - Voter data for printing
   */
  static async printVoterSlip(viewRef: any, voterData?: any): Promise<boolean> {
    try {
      console.log('🖨️ Starting print process...');

      // Check if printer is connected
      const connectedPrinter = ModernBluetoothPrinterService.getConnectedPrinter();
      if (!connectedPrinter) {
        Alert.alert(
          'Printer Not Connected',
          'Please connect to a printer first in Slip Box.'
        );
        return false;
      }

      if (!voterData) {
        Alert.alert('Error', 'Voter data is required for printing');
        return false;
      }

      // Format voter slip as text with ESC/POS tags
      const slipText = this.formatVoterSlipText(voterData);
      
      // Print using text method (this is what's already working!)
      const success = await ModernBluetoothPrinterService.printText(slipText);
      
      if (success) {
        console.log('✅ Print completed successfully');
        Alert.alert('Success', 'Voter slip printed successfully! ✅');
      }

      return success;
    } catch (error: any) {
      console.error('Print error:', error);
      Alert.alert(
        'Print Failed',
        error.message || 'An error occurred while printing'
      );
      return false;
    }
  }

  /**
   * Format voter data as text for printing
   */
  private static formatVoterSlipText(voterData: any): string {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Plain text format - NO ESC/POS tags, NO special characters, NO leading spaces
    const text = `Booth No: ${voterData.partno || 'N/A'}  Serial No: ${voterData.serialNo || 'N/A'}

Booth Name
${voterData.partname || 'N/A'}

Voter ID - ${voterData.voterID || 'N/A'}

Name: ${voterData.name || 'Unknown'}
Father: ${voterData.fathername || 'N/A'}
Gender: ${voterData.gender || 'N/A'} | Age: ${voterData.age || 'N/A'}

Door No: ${voterData.address || 'N/A'}

Printed on ${formattedDate}
`;

    return text;
  }

  /**
   * Test print - prints a simple text message
   * Useful for testing printer connection
   */
  static async testPrint(): Promise<boolean> {
    try {
      console.log('🧪 Running test print...');

      // Request permissions
      const permGranted = await ModernBluetoothPrinterService.requestBluetoothPermissions();
      if (!permGranted) {
        Alert.alert('Permission Required', 'Please grant Bluetooth permissions');
        return false;
      }

      // Check if Bluetooth is enabled
      const btEnabled = await ModernBluetoothPrinterService.isBluetoothEnabled();
      if (!btEnabled) {
        Alert.alert('Bluetooth Required', 'Please enable Bluetooth');
        return false;
      }

      // Scan for printers
      const printers = await ModernBluetoothPrinterService.scanForPrinters();
      if (printers.length === 0) {
        Alert.alert('Printer Not Found', 'Please turn on your printer and try again');
        return false;
      }

      // Connect to first printer
      const connected = await ModernBluetoothPrinterService.connectToPrinter(printers[0]);
      if (!connected) {
        return false;
      }

      // Print test text
      const testText = `
================================
    VOTER SLIP TEST PRINT
================================

Printer: ${printers[0].device_name}
Date: ${new Date().toLocaleString()}

Status: Connected ✓
Paper: 58mm Thermal
Format: ESC/POS via BLE

================================
      TEST SUCCESSFUL
================================
`;

      const printed = await ModernBluetoothPrinterService.printText(testText);
      
      if (printed) {
        Alert.alert('Test Successful', 'Printer is working correctly! ✅');
      }

      return printed;
    } catch (error) {
      console.error('Test print error:', error);
      Alert.alert('Test Failed', 'Could not complete test print');
      return false;
    }
  }

  /**
   * Check printer status and connection
   */
  static async checkPrinterStatus(): Promise<{
    bluetoothEnabled: boolean;
    printerFound: boolean;
    printerConnected: boolean;
    printerName?: string;
  }> {
    try {
      // Check Bluetooth status
      const bluetoothEnabled = await ModernBluetoothPrinterService.isBluetoothEnabled();
      
      if (!bluetoothEnabled) {
        return {
          bluetoothEnabled: false,
          printerFound: false,
          printerConnected: false,
        };
      }

      // Check if connected
      const connectedPrinter = ModernBluetoothPrinterService.getConnectedPrinter();
      const printerConnected = connectedPrinter !== null;

      return {
        bluetoothEnabled,
        printerFound: printerConnected, // If connected, we found it
        printerConnected,
        printerName: connectedPrinter?.device_name || undefined,
      };
    } catch (error) {
      console.error('Failed to check printer status:', error);
      return {
        bluetoothEnabled: false,
        printerFound: false,
        printerConnected: false,
      };
    }
  }

  /**
   * Scan for available printers
   */
  static async scanForPrinters() {
    return ModernBluetoothPrinterService.scanForPrinters();
  }

  /**
   * Connect to a printer
   */
  static async connectToPrinter(printer: any) {
    return ModernBluetoothPrinterService.connectToPrinter(printer);
  }

  /**
   * Disconnect from current printer
   */
  static async disconnect() {
    return ModernBluetoothPrinterService.disconnect();
  }

  /**
   * Get connected printer
   */
  static getConnectedPrinter() {
    return ModernBluetoothPrinterService.getConnectedPrinter();
  }

  /**
   * Request Bluetooth permissions
   */
  static async requestBluetoothPermissions() {
    return ModernBluetoothPrinterService.requestBluetoothPermissions();
  }
}

export default PrintService;
