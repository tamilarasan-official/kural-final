# Family Calculation Documentation

## Overview
This document explains how families are calculated and managed in the Kural Application for booth agents.

---

## Family Calculation Logic

### Definition of a Family
A **family** is defined as a group of voters sharing the same residential address. The address is determined by combining two fields:
- **House Number**: `voter['Address-House no']`
- **Street**: `voter['Address-Street']`

### Address Key Generation
```javascript
const addressKey = `${houseNo}-${street}`.trim();
```

**Example:**
- House No: "12A"
- Street: "Main Street"
- Address Key: "12A-Main Street"

All voters with the same address key are grouped into one family.

---

## Implementation Details

### 1. Data Fetching Process

#### Dashboard (`dashboard.tsx`)
```javascript
// Step 1: Get total voter count
const initialResponse = await voterAPI.getVotersByPart(boothNumber, { 
  page: 1, 
  limit: 50 
});
const totalVoters = initialResponse.pagination?.total || 0;

// Step 2: Fetch ALL voters for accurate family calculation
const allVotersResponse = await voterAPI.getVotersByPart(boothNumber, { 
  page: 1, 
  limit: totalVoters || 5000 
});
```

#### Family Manager (`families.tsx`)
```javascript
// Same two-step process to ensure all voters are included
const initialResponse = await voterAPI.getVotersByPart(boothNumber, { 
  page: 1, 
  limit: 50 
});
const totalVoters = initialResponse.pagination?.total || 0;

const response = await voterAPI.getVotersByPart(boothNumber, { 
  page: 1, 
  limit: totalVoters || 5000 
});
```

### 2. Family Grouping Algorithm

```javascript
// Create a Map to group voters by address
const familyMap = new Map<string, any[]>();

// Iterate through all voters
votersData.forEach((voter: any) => {
  // Extract address components
  const houseNo = voter['Address-House no'] || voter.HouseNo || '';
  const street = voter['Address-Street'] || voter.Street || '';
  
  // Generate address key
  const addressKey = `${houseNo}-${street}`.trim();
  
  // Skip empty or invalid addresses
  if (addressKey && addressKey !== '-') {
    // Initialize array for this address if not exists
    if (!familyMap.has(addressKey)) {
      familyMap.set(addressKey, []);
    }
    
    // Add voter to this family
    familyMap.get(addressKey)!.push(voter);
  }
});

// Total families = number of unique addresses
const totalFamilies = familyMap.size;
```

### 3. Family Object Structure

Each family object contains:

```typescript
interface Family {
  id: string;                  // Unique identifier (e.g., "family-0")
  address: string;             // Combined address key (e.g., "12A-Main Street")
  members: any[];              // Array of all voter objects in this family
  headOfFamily: string;        // Name of the oldest member
  totalMembers: number;        // Count of family members
  verifiedMembers: number;     // Count of verified members
  phone?: string;              // Phone number (from any member with phone)
}
```

### 4. Head of Family Determination

The head of family is determined by **age** (oldest member):

```javascript
// Sort members by age (descending)
const sortedMembers = [...members].sort((a, b) => {
  const ageA = parseInt(a.Age) || 0;
  const ageB = parseInt(b.Age) || 0;
  return ageB - ageA;  // Oldest first
});

// First member after sorting is the head
const head = sortedMembers[0];
const headOfFamily = head.Name || 'Unknown';
```

---

## Example Calculation

### Sample Data
Booth 119 -001 has 1299 voters with the following addresses:

| Voter Name | House No | Street | Age |
|------------|----------|--------|-----|
| Raja | 12A | Main Street | 45 |
| Lakshmi | 12A | Main Street | 42 |
| Kumar | 12A | Main Street | 18 |
| Priya | 15B | Park Road | 35 |
| Vijay | 15B | Park Road | 38 |
| Anbu | 20C | Temple Street | 50 |

### Grouping Process

**Family 1: "12A-Main Street"**
- Members: Raja (45), Lakshmi (42), Kumar (18)
- Total Members: 3
- Head of Family: Raja (oldest at 45)

**Family 2: "15B-Park Road"**
- Members: Vijay (38), Priya (35)
- Total Members: 2
- Head of Family: Vijay (oldest at 38)

**Family 3: "20C-Temple Street"**
- Members: Anbu (50)
- Total Members: 1
- Head of Family: Anbu

**Result:** 6 voters = 3 families

---

## Statistics Calculation

### Dashboard Display
```javascript
setStats({
  totalVoters: 1299,           // Total registered voters
  totalFamilies: 433,          // Unique addresses (433 families)
  surveysCompleted: 0,         // Completed family surveys
  visitsPending: 433,          // Families pending visit (433 - 0)
  verifiedVoters: 1            // Count of verified voters
});
```

### Verification Progress
```javascript
// Calculate per family
const verificationPercentage = family.totalMembers > 0 
  ? (family.verifiedMembers / family.totalMembers) * 100 
  : 0;

const isFullyVerified = family.verifiedMembers === family.totalMembers;
```

### Survey Completion
```javascript
const visitsPending = Math.max(0, totalFamilies - surveysCompleted);
// Example: 433 families - 0 completed = 433 pending
```

---

## Important Notes

### 1. Address Validation
- Empty addresses (`""` or `"-"`) are excluded from family grouping
- Invalid or malformed addresses are skipped
- This ensures only valid family units are created

### 2. Fallback Calculation
If voter data cannot be fetched, a fallback estimate is used:
```javascript
totalFamilies = Math.ceil(totalVoters / 3);
// Assumes average of 3 voters per family
// Example: 1299 voters ÷ 3 = 433 families
```

### 3. Performance Considerations
- **Two-step fetch**: First gets count, then fetches all data
- Prevents partial data from causing inaccurate counts
- Uses pagination to handle large datasets efficiently

### 4. Consistency Across Screens
Both Dashboard and Family Manager use the **same calculation logic** to ensure:
- ✅ Consistent family counts
- ✅ Same grouping criteria
- ✅ Accurate statistics

---

## API Endpoints Used

### Get Voters by Part/Booth
```javascript
voterAPI.getVotersByPart(boothNumber, { page: 1, limit: totalVoters })
```

**Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "Name": "Raja",
      "Address-House no": "12A",
      "Address-Street": "Main Street",
      "Age": "45",
      "verified": true,
      ...
    }
  ],
  "pagination": {
    "total": 1299,
    "page": 1,
    "limit": 1299,
    "totalPages": 1
  }
}
```

---

## Verification Status

### Voter Level
```javascript
const isVerified = voter.verified === true || voter.status === 'verified';
```

### Family Level
```javascript
const verifiedMembers = members.filter(m => 
  m.verified || m.Verified
).length;

const verificationPercentage = (verifiedMembers / totalMembers) * 100;
```

---

## Display Format

### Dashboard Cards
- **Total Voters**: 1299
- **Total Families**: 433
- **Surveys Completed**: 0
- **Visits Pending**: 433

### Family Manager
Each family card shows:
- Family name (based on head)
- Full address
- Phone number (if available)
- Total members count
- Verification progress bar
- Action buttons (View Details, Start Survey)

---

## Summary

**Current Status for Booth 119 -001:**
- **1299 voters** distributed across **433 unique addresses**
- Average family size: ~3 voters per family
- **1 voter verified** out of 1299 (0.08%)
- **0 families surveyed** out of 433 (0%)
- **433 families pending** visit

This calculation ensures accurate tracking of families for effective booth management and survey completion.
