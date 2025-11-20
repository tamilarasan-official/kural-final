# Printer Module Fix for Expo Go

## Problem
The `@conodene/react-native-thermal-receipt-printer-image-qr` library depends on `ping-react-native`, which is a native module. Expo Go cannot run apps with custom native modules, causing this error:

```
TurboModuleRegistry.getEnforcing(...): 'RNPing' could not be found
```

## Solution
We've wrapped the printer import in a try-catch block to make it optional:

```typescript
let BLEPrinter: any = null;
try {
  BLEPrinter = require('@conodene/react-native-thermal-receipt-printer-image-qr').BLEPrinter;
} catch (error) {
  // Create mock implementation for Expo Go
  BLEPrinter = { /* mock methods */ };
}
```

## How to Use

### Testing in Expo Go (No Printer)
- The app will load successfully
- Printer buttons will show a message: "Printer Not Available - Use development build"
- All other features work normally

### Testing with Real Printer (Development Build Required)
You need to create a development build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --profile development --platform android

# Build for iOS
eas build --profile development --platform ios
```

Install the development build APK/IPA on your device, then:
- Printer scanning will work
- Bluetooth connection will work
- Printing will work

## Files Modified
- `services/ModernBluetoothPrinterService.ts` - Added availability check and graceful fallback

## Development Workflow
1. **Expo Go**: Test UI, navigation, API calls (printer disabled)
2. **Development Build**: Test printer features on real device
3. **Production**: Build production APK with printer fully enabled
