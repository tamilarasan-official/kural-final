# Bluetooth Thermal Printer Implementation Guide

## Overview
This guide explains how to implement Bluetooth thermal printer (SR588/PX58B) integration in your React Native Expo booth agent app for printing voter slips.

## Hardware Details
- **Printer Model**: Posiflow PSF588
- **Bluetooth Name**: SR588 (or PX58B - varies by firmware)
- **Paper Width**: 58mm (384 dots)
- **Password**: None (or try 0000/1234 if prompted)

## Prerequisites

### 1. Install Required Dependencies

```bash
# Core dependencies
npx expo install expo-dev-client
npx expo install react-native-bluetooth-escpos-printer
npx expo install react-native-view-shot
npx expo install expo-image-manipulator

# Build tools
npx expo install expo-build-properties
```

### 2. Update app.json

Add permissions and plugins:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "minSdkVersion": 23
          }
        }
      ],
      [
        "react-native-bluetooth-escpos-printer",
        {
          "BLUETOOTH_SCAN_permission": "Allow $(PRODUCT_NAME) to scan for Bluetooth devices",
          "BLUETOOTH_CONNECT_permission": "Allow $(PRODUCT_NAME) to connect to Bluetooth devices"
        }
      ]
    ],
    "android": {
      "permissions": [
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.BLUETOOTH_CONNECT",
        "android.permission.BLUETOOTH_SCAN",
        "android.permission.ACCESS_FINE_LOCATION"
      ]
    }
  }
}
```

### 3. Build Custom Development Client

```bash
# For Android
npx expo run:android

# This creates a custom build with native modules
# You CANNOT use Expo Go for Bluetooth printing
```

## Implementation Steps

### Step 1: Create Voter Slip Template Component

See `components/VoterSlipTemplate.tsx`

### Step 2: Create Bluetooth Printer Service

See `services/BluetoothPrinterService.ts`

### Step 3: Update Slip Screen

See updated `app/(boothAgent)/slip.tsx`

### Step 4: Integrate with Voter List

Add print buttons to voter cards in voter list screens.

## How to Use the Printer

### Physical Setup:
1. **Charge**: Use USB cable to fully charge
2. **Load Paper**: Open lid, insert 58mm thermal roll
3. **Power On**: Hold power button for 3 seconds
4. **Pair**: Go to phone Bluetooth settings → Find "SR588" → Pair

### In-App Usage:
1. Open app → Go to "Slip" tab
2. Click "Enable Bluetooth" button
3. Grant permissions when prompted
4. Phone will scan and find printer
5. Printer appears as "Connected" in slip box
6. Navigate to voters list
7. Click print icon on any voter card
8. Slip prints automatically!

### Important Notes:
- Printer only "Connects" during actual printing (2-3 seconds)
- It's normal to show "Not Connected" in phone settings
- As long as it's "Paired", it will work
- Tamil text prints via image conversion (renders perfectly)
- Images and logos print clearly

## Testing

### Test 1: Hardware Self-Test
1. Turn printer OFF
2. Hold FEED button
3. Press POWER while holding FEED
4. Releases when print starts
5. Confirms printer hardware works

### Test 2: App Connection Test
1. Download "RawBT" or "ESC POS Printer" from Play Store
2. Select your paired printer
3. Send test print
4. If works → Your phone/printer connection is good
5. If fails → Check pairing/permissions

### Test 3: Print Voter Slip
1. In your app, go to voters list
2. Find any voter
3. Click print icon
4. Slip should print with all details

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Printer not found" | Go to phone settings → Pair "SR588" first |
| "Permission denied" | Grant all Bluetooth permissions in app settings |
| "Connection failed" | Restart both phone and printer |
| Tamil text garbled | App uses image conversion - should be perfect |
| Print cuts off | Check paper roll installed correctly |
| Nothing prints | Ensure printer is charged and powered on |

## File Structure

```
kural/
├── app/
│   └── (boothAgent)/
│       └── slip.tsx                    # Updated with print functionality
├── components/
│   └── VoterSlipTemplate.tsx          # Voter slip visual template
├── services/
│   ├── BluetoothPrinterService.ts     # Bluetooth printer logic
│   └── api/
│       └── voter.ts                    # Voter API (existing)
└── app.json                            # Updated with permissions
```

## Next Steps

After implementing:
1. Build dev client: `npx expo run:android`
2. Install on physical Android device
3. Pair printer in phone settings
4. Test print from voter list
5. Deploy to all booth agents

## Support
- Library docs: https://github.com/januslo/react-native-bluetooth-escpos-printer
- Expo docs: https://docs.expo.dev/
