# Header Image Update

## ✅ What Was Changed

Added the election header banner image to the voter slip template.

### Changes Made

1. **VoterSlipTemplate.tsx** - Added header image at the top
2. **Image Location:** `assets/images/slipimg.png`
3. **Position:** Above "Please Cut Here" line

## 🖼️ Slip Layout (Updated)

```
┌─────────────────────────────┐
│                              │
│   [ELECTION HEADER BANNER]   │  ← slipimg.png
│   (Leader photos & title)    │
│                              │
├──────────────────────────────┤
│                              │
│  தமிழ்நாடு சட்டமன்ற தேர்தல் │
│                              │
│  [Candidate] [Party Symbol]  │  (Optional)
│                              │
│  Additional Tamil text...    │
│                              │
│  --- Please Cut Here ---     │  ← CUT LINE
│                              │
├──────────────────────────────┤
│  Booth No: 2  Serial No: 1   │
│  Voter ID: ABC123            │
│  Name: John Doe              │
│  Father: James Doe           │
│  Gender: M  Age: 44          │
│  Door No: 10/5               │
│                              │
│  Printed on 18/8/2025        │
└──────────────────────────────┘
```

## 📝 Technical Details

### Image Properties

- **File:** `assets/images/slipimg.png`
- **Width:** 360 pixels (fits 384px slip width with padding)
- **Height:** 120 pixels (auto-adjusts based on aspect ratio)
- **Resize Mode:** `contain` (maintains aspect ratio)
- **Position:** Top of slip, before Tamil header

### Code Added

```typescript
<Image 
  source={require('../assets/images/slipimg.png')}
  style={styles.headerImage}
  resizeMode="contain"
/>
```

### Style Added

```typescript
headerImage: {
  width: 360,
  height: 120,
  marginBottom: 8,
}
```

## 🎨 Image Content

Based on the uploaded sample slip, `slipimg.png` contains:
- Election title in Tamil (தமிழ்நாடு சட்டமன்ற தேர்தல் 2026)
- Photos of political leaders
- Party/alliance information
- Election year (2026)

## ✅ How It Works

1. **Always Displayed:** The header image is shown on every voter slip
2. **Above Cut Line:** Image appears in the top section (above "Please Cut Here")
3. **Below Cut Line:** Voter details (name, ID, etc.) remain unchanged
4. **Print Quality:** Image will be converted to grayscale for thermal printing

## 🔄 When Changes Take Effect

The header image will appear:
- ✅ In the app preview (voter detail screen)
- ✅ In printed slips (after rebuild)

## 🚀 Testing

### Test in App Preview

1. Open any voter detail screen
2. Scroll to see the hidden voter slip template
3. Header image should be visible at the top

### Test Print

1. Connect to printer (Slip Box)
2. Verify a voter
3. Print slip
4. Check that header image prints clearly

## 📱 IP Configuration Update

Your current network configuration:

**Wi-Fi Connection:**
- IPv4: `10.185.176.109`
- Gateway: `10.185.176.13`
- Subnet: `255.255.255.0`

**Ethernet (VirtualBox):**
- IPv4: `192.168.56.1`

If you need to update the backend API URL in the app to match your network:

### Update API Base URL

**File:** `app/_config/api.ts` or `config/electionLocations.ts`

```typescript
// Development
export const API_BASE_URL = 'http://10.185.176.109:5000';

// Or if backend is on different machine:
export const API_BASE_URL = 'http://[BACKEND_IP]:5000';
```

### Find Backend Server

If backend is running on this machine:
```powershell
# Backend should be accessible at:
http://10.185.176.109:5000
# or
http://localhost:5000
```

## 📋 Complete File Changes Summary

### Modified Files

1. ✅ `components/VoterSlipTemplate.tsx`
   - Added header image component
   - Added headerImage style
   - Positioned above Tamil header

2. ✅ `IMAGE_PRINTING_GUIDE.md`
   - Updated "What Gets Printed" section
   - Added note about header image

3. ✅ `HEADER_IMAGE_UPDATE.md` (this file)
   - Documentation of header image addition

## 🎯 No Additional Steps Required

- ✅ Image file already exists in `assets/images/`
- ✅ No new dependencies needed
- ✅ No app.json changes required
- ✅ Works with current printer setup

Just rebuild the app to see the changes:

```powershell
cd C:\kuralnew\kural-final\kural
npx expo run:android
```

---

**Updated:** November 12, 2025  
**Status:** ✅ Complete  
**Matches:** Uploaded sample slip layout
