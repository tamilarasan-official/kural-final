# Modern Bluetooth Printer Setup Guide

This guide walks you through setting up the **modern, stable Bluetooth thermal printer stack** for the Kural app using Expo SDK 54.

## 🎯 What We're Using

This implementation uses a proven, actively-maintained stack:

- **react-native-ble-plx**: Modern, stable BLE library for all Bluetooth communication
- **react-native-view-shot**: To capture React components as images
- **esc-pos-encoder**: Modern library to convert images to ESC/POS printer commands
- **react-native-quick-base64**: Helper for base64 encoding

## ✅ Current Status

All dependencies are **already installed** in `package.json`:

```json
{
  "react-native-ble-plx": "^3.5.0",
  "react-native-view-shot": "4.0.3",
  "esc-pos-encoder": "^3.0.0",
  "react-native-quick-base64": "^2.2.2"
}
```

## 📱 What Has Been Implemented

### 1. ✅ App Configuration (`app.json`)
The BLE-PLX plugin is properly configured with:
- Background support disabled (we don't need it)
- Bluetooth permission message
- Android permissions for Bluetooth scanning and connection

### 2. ✅ Modern Bluetooth Service (`ModernBluetoothPrinterService.ts`)
Located at: `services/ModernBluetoothPrinterService.ts`

Features:
- ✅ Bluetooth permission handling (Android 12+)
- ✅ BLE device scanning (finds SR588, PX58B, PSF588, Posiflow printers)
- ✅ Connection management
- ✅ **Image printing with ESC/POS encoder**
- ✅ Text printing support
- ✅ Proper error handling and alerts

### 3. ✅ Updated Print Service (`PrintService.ts`)
Located at: `services/PrintService.ts`

Features:
- ✅ Component screenshot using `react-native-view-shot`
- ✅ Captures voter slip as base64 image
- ✅ Sends image to thermal printer via BLE
- ✅ Test print functionality
- ✅ Printer status checking

### 4. ✅ Conditional Print Button (`voter-detail.tsx`)
Located at: `app/(boothAgent)/voter-detail.tsx`

**Print Button Logic:**
- 🟢 **Green & Enabled**: When voter is verified (`isVerified = true`)
- ⚪ **Gray & Disabled**: When voter is pending (`isVerified = false`)
- The button text changes to "Verify to Print" when disabled

### 5. ✅ Voter Slip Template Supports Images
Located at: `components/VoterSlipTemplate.tsx`

The template already supports:
- ✅ Candidate photos (`candidatePhoto` prop)
- ✅ Party symbols (`partySymbol` prop)
- ✅ Image rendering with proper styling
- ✅ Tamil text and English text sections
- ✅ "Please Cut Here" dashed line

## 🚀 Installation Steps

Since all dependencies are already in `package.json`, you just need to rebuild your dev client:

### Step 1: Clean Install Dependencies

```powershell
cd C:\kuralnew\kural-final\kural
npm install
```

### Step 2: Clear Cache (Optional but Recommended)

```powershell
npx expo start --clear
```

### Step 3: Rebuild Development Client

**CRITICAL:** The BLE-PLX plugin requires native code, so you **MUST** rebuild:

```powershell
npx expo run:android
```

This will:
1. Compile the native BLE-PLX plugin
2. Add proper Bluetooth permissions to AndroidManifest.xml
3. Build a new APK with all native dependencies

**⚠️ Important:** Regular `npx expo start` or Expo Go **WILL NOT WORK**. You need a custom dev client.

### Step 4: Test on Device

After the build completes and the app launches:

1. Go to **Slip Box** tab
2. Turn on your SR588/PX58B printer
3. Tap "Scan for Printers"
4. Connect to your printer
5. Test print to verify connection

## 📖 How to Use

### Connecting to Printer

The connection flow is managed in the **Slip Box** screen:

1. User taps "Scan for Printers"
2. App scans for 10 seconds
3. Shows list of found printers
4. User taps to connect
5. Connection status is displayed

### Printing Voter Slips

1. **Navigate to a voter detail screen**
2. The voter must be **verified** first (tap "Verify" button)
3. Once verified, the **"Print Slip" button turns green**
4. Tap the green button to print
5. The voter slip (with images) is captured and sent to printer

### Print Button States

| Voter Status | Button Color | Button State | Button Text |
|-------------|-------------|--------------|-------------|
| Pending | Gray (⚪) | Disabled | "Verify to Print" |
| Verified | Green (🟢) | Enabled | "Print Slip" |
| Printing | Green (🟢) | Disabled | Loading spinner |

## 🖼️ Image Support in Voter Slips

The `VoterSlipTemplate` component supports images via props:

```typescript
<VoterSlipTemplate
  data={{
    // ... other voter data
    candidatePhoto: 'base64-or-url-string',
    partySymbol: 'base64-or-url-string',
    partyName: 'Party Name',
    candidateName: 'Candidate Name',
  }}
  showPartyInfo={true}  // Set to true to show images
/>
```

### Image Requirements:
- **Format**: PNG or JPEG (will be converted)
- **Candidate Photo**: 60x80 pixels recommended
- **Party Symbol**: 60x60 pixels recommended
- **Encoding**: Can be base64 or URI

### Where to Add Images:

In `voter-detail.tsx`, update the hidden VoterSlipTemplate:

```typescript
<VoterSlipTemplate
  data={{
    voterID: voter.voterID,
    name: voter.name?.english,
    // ... existing fields
    
    // ADD THESE:
    candidatePhoto: voter.candidatePhoto || '',
    partySymbol: voter.partySymbol || '',
    candidateName: voter.candidateName || '',
  }}
/>
```

## 🔧 Troubleshooting

### Issue: "Printer Not Found"
**Solution:**
1. Turn on the printer
2. Make sure Bluetooth is enabled on phone
3. Printer should be within 10 meters
4. Try scanning again (it takes 10 seconds)

### Issue: "Connection Failed"
**Solution:**
1. Restart the printer
2. Forget the device in phone Bluetooth settings
3. Scan and connect again

### Issue: "Print Failed"
**Solution:**
1. Check printer has paper
2. Check printer battery
3. Try reconnecting to printer
4. Run a test print from Slip Box

### Issue: "Build Failed" or "Plugin Not Found"
**Solution:**
1. Delete `node_modules` and reinstall:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   npm install
   ```
2. Clear Expo cache:
   ```powershell
   npx expo start --clear
   ```
3. Rebuild:
   ```powershell
   npx expo run:android
   ```

### Issue: Images Not Printing
**Solution:**
1. Check image format (should be base64 or valid URI)
2. Check image size (large images may fail)
3. Verify `showPartyInfo={true}` is set in VoterSlipTemplate
4. Check printer supports graphics (ESC/POS printers do)

## 📚 Code Architecture

```
kural/
├── services/
│   ├── ModernBluetoothPrinterService.ts   // ✅ NEW: BLE-PLX based service
│   ├── BluetoothPrinterService.ts         // OLD: Can be kept as backup
│   └── PrintService.ts                     // ✅ UPDATED: Uses modern service
├── components/
│   └── VoterSlipTemplate.tsx              // ✅ Already supports images
├── app/
│   └── (boothAgent)/
│       ├── voter-detail.tsx               // ✅ UPDATED: Conditional print button
│       └── slip_box.tsx                   // Connection management
└── app.json                                // ✅ UPDATED: BLE-PLX plugin config
```

## 🎨 Customization

### Change Printer Width

If using a different thermal printer (e.g., 80mm):

```typescript
// In ModernBluetoothPrinterService.ts
static async printImage(base64Image: string, width: number = 576) {
  // 576 dots = 80mm at 203 DPI
}
```

### Add Custom Commands

You can add custom ESC/POS commands:

```typescript
import Encoder from 'esc-pos-encoder';

const encoder = new Encoder();
encoder
  .initialize()
  .align('center')
  .bold(true)
  .text('BOLD CENTERED TEXT')
  .bold(false)
  .newline()
  .image(base64Image, width, width, 'base64')
  .cut();
```

## ✨ Benefits of This Stack

✅ **Modern & Maintained**: All libraries actively updated
✅ **Stable**: Used in production by many apps
✅ **Image Support**: Full graphics printing capability
✅ **Works with Expo**: Compatible with Expo SDK 54
✅ **Cross-Platform**: Works on Android (iOS support available)
✅ **Good Documentation**: Each library is well-documented

## 📞 Support

If you encounter issues:

1. Check the error logs in the terminal
2. Verify printer is compatible (ESC/POS protocol)
3. Make sure you rebuilt the dev client after adding plugins
4. Review this documentation

## 🔄 Migration from Old Service

The old `BluetoothPrinterService.ts` (using react-native-thermal-receipt-printer) is still present as a backup. The new `ModernBluetoothPrinterService.ts` is a complete replacement with better image support.

**Key Differences:**

| Feature | Old Service | New Service |
|---------|------------|-------------|
| Library | thermal-receipt-printer | react-native-ble-plx |
| Image Support | ❌ Limited | ✅ Full support |
| Stability | ⚠️ Issues reported | ✅ Stable |
| Connection | Paired devices only | ✅ BLE scan & connect |
| Expo Support | ⚠️ Tricky | ✅ Native plugin |

## 🎯 Next Steps

1. ✅ Rebuild the app with `npx expo run:android`
2. ✅ Test printer connection in Slip Box
3. ✅ Verify conditional print button (verify voter first)
4. ✅ Test image printing with party symbols/photos
5. ✅ Deploy to production devices

---

**Last Updated:** November 12, 2025
**Version:** 1.0.0
**Expo SDK:** 54
**Status:** ✅ Ready for Testing
