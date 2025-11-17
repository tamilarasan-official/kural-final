# Quick Command Reference

## 🚀 Building and Running

### Rebuild Dev Client (Required after plugin changes)
```powershell
cd C:\kuralnew\kural-final\kural
npx expo run:android
```

### Start Development Server
```powershell
npx expo start
```

### Clear Cache and Start
```powershell
npx expo start --clear
```

### Clean Install
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

## 📱 Testing on Device

### Check Connected Devices
```powershell
adb devices
```

### View Logs
```powershell
npx react-native log-android
```

### Restart ADB Server
```powershell
adb kill-server
adb start-server
```

## 🐛 Troubleshooting Commands

### Clear Expo Cache
```powershell
npx expo start --clear
```

### Clear Metro Bundler Cache
```powershell
npx react-native start --reset-cache
```

### Clear Android Build
```powershell
cd android
.\gradlew clean
cd ..
```

### Full Clean Build
```powershell
# Clean everything
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force android\build
Remove-Item -Recurse -Force android\app\build

# Reinstall
npm install

# Rebuild
npx expo run:android
```

## 🔧 Printer Testing Commands

These are operations to perform in the app UI (not terminal commands):

### Test Printer Connection
1. Open app
2. Go to **Slip Box** tab
3. Tap **"Enable Bluetooth"**
4. Grant permissions
5. Tap **"Scan Printers"**
6. Tap **"Test Print"**

### Test Print Button Logic
1. Open any voter detail
2. Check button is **gray** (not verified)
3. Tap **"Verify"**
4. Button should turn **green**
5. Tap **"Print Slip"**

## 📦 Package Management

### Check Installed Packages
```powershell
npm list react-native-ble-plx
npm list react-native-view-shot
npm list esc-pos-encoder
```

### Update Specific Package
```powershell
npm update react-native-ble-plx
```

### Check for Outdated Packages
```powershell
npm outdated
```

## 🔍 Debugging

### Enable Remote Debugging
In the running app:
- Shake device or press `Ctrl+M`
- Tap "Debug" or "Open Dev Menu"

### View React Native Debugger
```powershell
# In Chrome
chrome://inspect
```

### Check Bluetooth Status (ADB)
```powershell
adb shell dumpsys bluetooth_manager
```

## 📝 Git Commands (for version control)

### Check Status
```powershell
cd C:\kuralnew\kural-final
git status
```

### Commit Changes
```powershell
git add .
git commit -m "Implement modern Bluetooth printer with image support"
```

### Push to Remote
```powershell
git push origin new-backend
```

## 🎯 Quick Checks

### Verify BLE Plugin Configuration
```powershell
# Check app.json
cat app.json | Select-String "react-native-ble-plx"
```

### Check Dependencies Installed
```powershell
Test-Path "node_modules\react-native-ble-plx"
Test-Path "node_modules\react-native-view-shot"
Test-Path "node_modules\esc-pos-encoder"
```

### Check Android Permissions
```powershell
# View AndroidManifest.xml
cat android\app\src\main\AndroidManifest.xml | Select-String "BLUETOOTH"
```

## 🏃 Fastest Way to Test

From a clean state:

```powershell
# 1. Clean install
cd C:\kuralnew\kural-final\kural
Remove-Item -Recurse -Force node_modules
npm install

# 2. Clear cache
npx expo start --clear

# 3. Rebuild (in another terminal)
npx expo run:android

# 4. Wait for build to complete and app to launch
# 5. Test printer connection in Slip Box tab
# 6. Test print button in voter detail
```

## 📱 Release Build

### Create Production APK
```powershell
cd android
.\gradlew assembleRelease
cd ..
```

### Create Bundle for Play Store
```powershell
cd android
.\gradlew bundleRelease
cd ..
```

### Find APK Location
```
android\app\build\outputs\apk\release\app-release.apk
```

## 🆘 Emergency Reset

If everything breaks:

```powershell
# 1. Kill all processes
adb kill-server
taskkill /F /IM node.exe

# 2. Delete everything
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force android\build
Remove-Item -Recurse -Force android\app\build
Remove-Item -Recurse -Force .expo

# 3. Reinstall
npm install

# 4. Restart ADB
adb start-server

# 5. Rebuild
npx expo run:android
```

## 📚 Documentation Files

```
C:\kuralnew\kural-final\kural\
├── MODERN_PRINTER_SETUP.md      ← Main setup guide
├── IMAGE_PRINTING_GUIDE.md      ← Image printing details
├── IMPLEMENTATION_SUMMARY.md    ← What was changed
└── QUICK_COMMANDS.md           ← This file
```

---

**Pro Tip:** Keep this file open in a separate tab while developing!
