# Quick Guide: Adding Images to Voter Slips

This guide shows you exactly how to add candidate photos and party symbols to printed voter slips.

## 🎯 Overview

The voter slip template already supports images. You just need to pass the image data through props.

## 📸 Image Requirements

| Image Type | Recommended Size | Format | Notes |
|-----------|-----------------|--------|-------|
| Candidate Photo | 60x80 pixels | PNG/JPEG | Portrait orientation |
| Party Symbol | 60x60 pixels | PNG/JPEG | Square, transparent background recommended |

## 🔧 Implementation Steps

### Step 1: Update Voter Data Model (Backend)

Add image fields to your voter schema:

```javascript
// backend/src/models/Voter.js
{
  // ... existing fields
  candidatePhoto: String,      // base64 or URL
  partySymbol: String,         // base64 or URL
  candidateName: String,
  candidateNameTamil: String,
  partyName: String,
  partyNameTamil: String,
}
```

### Step 2: Update API to Return Images

Ensure your voter API returns the image data:

```javascript
// backend/src/controllers/voterController.js
const voter = {
  voterID: 'ABC123',
  name: 'John Doe',
  // ... other fields
  candidatePhoto: 'data:image/png;base64,iVBORw0KG...',
  partySymbol: 'data:image/png;base64,iVBORw0KG...',
  candidateName: 'Candidate Name',
  candidateNameTamil: 'வேட்பாளர் பெயர்',
};
```

### Step 3: Update Voter Detail Screen

In `app/(boothAgent)/voter-detail.tsx`, update the VoterSlipTemplate in two places:

#### Location 1: Hidden Slip Template (for printing)

Find the hidden `VoterSlipTemplate` component (around line 575):

```typescript
<View 
  style={{ 
    position: 'absolute', 
    top: 0, 
    left: 0,
    opacity: 0, 
    zIndex: -1 
  }} 
  ref={slipRef}
  collapsable={false}
>
  <VoterSlipTemplate
    data={{
      voterID: voter.voterID || voter['EPIC No'] || voter.Number || 'N/A',
      name: voter.name?.english || voter.Name || 'Unknown',
      nameTamil: voter.name?.tamil || '',
      fatherName: voter.fatherName || voter['Father Name'] || '',
      fatherNameTamil: voter.fatherNameTamil || '',
      gender: voter.gender || voter.sex || voter.Sex || voter.Gender || 'M',
      age: parseInt(voter.age || voter.Age) || 18,
      doorNo: voter.doorNo || voter.address || '',
      boothNo: parseInt(voter.boothNumber || voter.PS_NO) || 1,
      serialNo: parseInt(voter.slipNo || voter['Sl.No.'] || voter.Number) || 1,
      boothName: voter.boothName || 'Booth',
      boothNameTamil: voter.boothNameTamil || '',
      
      // ADD THESE IMAGE FIELDS:
      candidatePhoto: voter.candidatePhoto || '',
      partySymbol: voter.partySymbol || '',
      candidateName: voter.candidateName || '',
      candidateNameTamil: voter.candidateNameTamil || '',
      partyName: voter.partyName || '',
      partyNameTamil: voter.partyNameTamil || '',
    }}
    showPartyInfo={true}  // Set to true to enable images
  />
</View>
```

## 🖼️ Image Format Options

### Option 1: Base64 Encoded (Recommended)

Store images directly in the database as base64:

```javascript
candidatePhoto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
```

**Pros:** No external dependencies, works offline
**Cons:** Larger database size

### Option 2: Remote URL

Store image URLs and load them:

```javascript
candidatePhoto: 'https://yourserver.com/images/candidate-123.jpg'
```

**Pros:** Smaller database
**Cons:** Requires internet connection, slower printing

### Option 3: Local Asset

For party symbols that don't change:

```typescript
import partySymbol from '../../assets/images/party-dmk.png';

// In component:
partySymbol: Image.resolveAssetSource(partySymbol).uri
```

## 💾 How to Convert Images to Base64

### Using Node.js (Backend)

```javascript
const fs = require('fs');

function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return `data:image/png;base64,${imageBuffer.toString('base64')}`;
}

// Usage:
const candidatePhoto = imageToBase64('./path/to/photo.png');
```

### Using Python (Data Processing)

```python
import base64

def image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        encoded = base64.b64encode(image_file.read()).decode('utf-8')
        return f"data:image/png;base64,{encoded}"

# Usage:
candidate_photo = image_to_base64("path/to/photo.png")
```

### Using Online Tool

1. Go to https://www.base64-image.de/
2. Upload your image
3. Copy the base64 string
4. Paste into your database or API

## 🧪 Testing Images

### Test 1: Without Images (Current Setup)

Set `showPartyInfo={false}`:

```typescript
<VoterSlipTemplate
  data={{...voterData}}
  showPartyInfo={false}  // No images
/>
```

This will print voter details only (current behavior).

### Test 2: With Images

Set `showPartyInfo={true}` and provide image data:

```typescript
<VoterSlipTemplate
  data={{
    ...voterData,
    candidatePhoto: 'data:image/png;base64,...',
    partySymbol: 'data:image/png;base64,...',
  }}
  showPartyInfo={true}  // Show images
/>
```

This will print voter details + images.

## 📱 What Gets Printed

When the slip is printed, it appears in this order:

```
┌─────────────────────────────┐
│   [HEADER IMAGE/BANNER]      │  ← slipimg.png (Election banner)
│                               │
│  தமிழ்நாடு சட்டமன்ற தேர்தல்   │  (Tamil header)
│                               │
│   [Photo]  [Symbol]          │  (Optional: Candidate photo + Party symbol)
│                               │
│   கட்சி பெயர்                 │  (Party name in Tamil)
│   வேட்பாளர் பெயர்             │  (Candidate name in Tamil)
│                               │
│   --- Please Cut Here ---    │  (Cut line)
│                               │
│   Booth No: 2  Serial No: 1  │
│   Voter ID: ABC123           │
│   Name: John Doe             │
│   Father: James Doe          │
│   Gender: M  Age: 45         │
│   Door No: 10/5              │
│                               │
│   Printed on 12/11/2025      │
└─────────────────────────────┘
```

**Note:** The header image (`slipimg.png`) is always printed at the top. This image contains the election banner with leader photos.

## 🎨 Customizing Image Layout

You can modify the image layout in `components/VoterSlipTemplate.tsx`:

### Change Image Sizes

```typescript
// In styles section:
candidatePhoto: {
  width: 80,   // Change from 60
  height: 100, // Change from 80
  // ...
},
partySymbol: {
  width: 80,   // Change from 60
  height: 80,  // Change from 60
  // ...
},
```

### Change Image Position

```typescript
// In symbolRow style:
symbolRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',  // Change alignment
  alignItems: 'center',
  marginBottom: 8,
  gap: 20,  // Change gap between images
},
```

## 🔍 Troubleshooting

### Images Not Showing in Printed Slip

**Check:**
1. ✅ `showPartyInfo={true}` is set
2. ✅ Image data is valid base64 or URL
3. ✅ Image data is not empty string
4. ✅ Images load correctly in app preview (not just print)

### Images Look Distorted

**Solution:**
- Resize images to recommended dimensions before encoding
- Maintain aspect ratio (use square for symbols, portrait for photos)

### Printer Can't Handle Images

**Check:**
1. Printer supports ESC/POS graphics (SR588 does)
2. Image file size is reasonable (< 50KB per image)
3. Printer has sufficient memory

### Images Print Too Dark/Light

**Solution:**
- Adjust image brightness before encoding
- Ensure images have good contrast
- Use black & white images if possible (thermal printers work better with high contrast)

## 📦 Sample Image Data for Testing

Here's a minimal test image (1x1 pixel white PNG in base64):

```javascript
const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

// Use for testing:
<VoterSlipTemplate
  data={{
    ...voterData,
    candidatePhoto: testImage,
    partySymbol: testImage,
  }}
  showPartyInfo={true}
/>
```

If this prints successfully, your setup is working correctly.

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Test with actual candidate photos
- [ ] Test with actual party symbols
- [ ] Verify images print clearly
- [ ] Test with no images (empty strings)
- [ ] Test with only photo, no symbol
- [ ] Test with only symbol, no photo
- [ ] Verify image file sizes are reasonable
- [ ] Test on actual SR588 printer
- [ ] Verify print button only works when verified

---

**Need Help?** Check the main setup guide: `MODERN_PRINTER_SETUP.md`
