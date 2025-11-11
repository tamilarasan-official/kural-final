/**
 * Print Service
 * Handles capturing React components as images and sending to thermal printer
 */

import { captureRef } from 'react-native-view-shot';
import * as ImageManipulator from 'expo-image-manipulator';
import { BluetoothPrinterService } from './BluetoothPrinterService';
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
      
      // Capture the view as a PNG image URI
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
        width: width,
      });

      console.log('✅ Component captured:', uri);

      // Convert to grayscale and optimize for thermal printer
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width } }, // Ensure correct width
        ],
        {
          compress: 1, // Maximum quality
          format: ImageManipulator.SaveFormat.PNG,
          base64: true, // Get base64 output
        }
      );

      if (!manipulatedImage.base64) {
        throw new Error('Failed to convert image to base64');
      }

      console.log('✅ Image optimized for thermal printer');
      return manipulatedImage.base64;
    } catch (error) {
      console.error('Failed to capture component:', error);
      Alert.alert('Capture Failed', 'Could not capture the slip for printing');
      return null;
    }
  }

  /**
   * Print a voter slip component
   * @param viewRef - Reference to the VoterSlipTemplate component
   */
  static async printVoterSlip(viewRef: any): Promise<boolean> {
    try {
      console.log('🖨️ Starting print process...');

      // Step 1: Capture component as image
      const base64Image = await this.captureComponentAsImage(viewRef, 384);
      if (!base64Image) {
        return false;
      }

      // Step 2: Use Bluetooth service to find, connect, and print
      const success = await BluetoothPrinterService.findConnectAndPrint(base64Image);
      
      if (success) {
        Alert.alert('Success', 'Voter slip printed successfully! ✅');
        console.log('✅ Print completed successfully');
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
   * Test print - prints a simple text message
   * Useful for testing printer connection
   */
  static async testPrint(): Promise<boolean> {
    try {
      console.log('🧪 Running test print...');

      // Request permissions and enable Bluetooth
      const permGranted = await BluetoothPrinterService.requestBluetoothPermissions();
      if (!permGranted) {
        Alert.alert('Permission Required', 'Please grant Bluetooth permissions');
        return false;
      }

      const btEnabled = await BluetoothPrinterService.enableBluetooth();
      if (!btEnabled) {
        Alert.alert('Bluetooth Required', 'Please enable Bluetooth');
        return false;
      }

      // Scan for printers
      const printers = await BluetoothPrinterService.scanForPrinters();
      if (printers.length === 0) {
        Alert.alert('Printer Not Found', 'Please pair your printer first');
        return false;
      }

      // Connect to first printer
      const connected = await BluetoothPrinterService.connectToPrinter(printers[0]);
      if (!connected) {
        return false;
      }

      // Print test text
      const testText = `
================================
    VOTER SLIP TEST PRINT
================================

Printer: ${printers[0].name}
Date: ${new Date().toLocaleString()}

Status: Connected ✓
Paper: 58mm Thermal
Format: ESC/POS

================================
      TEST SUCCESSFUL
================================


`;

      const printed = await BluetoothPrinterService.printText(testText);
      
      if (printed) {
        Alert.alert('Test Successful', 'Printer is working correctly! ✅');
      }

      // Disconnect after a delay
      setTimeout(() => BluetoothPrinterService.disconnect(), 1000);

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
      const bluetoothEnabled = await BluetoothPrinterService.isBluetoothEnabled();
      
      if (!bluetoothEnabled) {
        return {
          bluetoothEnabled: false,
          printerFound: false,
          printerConnected: false,
        };
      }

      // Check for paired printers
      const printers = await BluetoothPrinterService.scanForPrinters();
      const printerFound = printers.length > 0;

      // Check if connected
      const connectedPrinter = BluetoothPrinterService.getConnectedPrinter();
      const printerConnected = connectedPrinter !== null;

      return {
        bluetoothEnabled,
        printerFound,
        printerConnected,
        printerName: printerFound ? printers[0].name : undefined,
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
}

export default PrintService;
