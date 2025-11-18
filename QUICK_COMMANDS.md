# Quick Command Reference - Dynamic Voter Fields

## 🚀 Running the App

### Backend
```bash
cd backend
npm start
```
Backend will run at: `http://localhost:5000`

### Mobile App
```bash
cd kural
npm start
# or
npx expo start
```

---

## 🧪 Testing the Integration

### Run Integration Test
```bash
cd backend
node test-voter-field-integration.js
```

This will:
- ✅ Check if bloodGroup field exists
- ✅ Create it if missing
- ✅ List all visible fields
- ✅ Test visibility toggle
- ✅ Show sample data structure
- ✅ Display expected API response

---

## 🗄️ MongoDB Commands

### View All Voter Fields
```javascript
db.voterfields.find().pretty()
```

### View Only Visible Fields (What app sees)
```javascript
db.voterfields.find({ visible: true }).pretty()
```

### Add Blood Group Field
```javascript
db.voterfields.insertOne({
  name: "bloodGroup",
  type: "String",
  label: "Blood Group",
  description: "Voter's blood group type (A+, B+, O+, etc.)",
  required: false,
  visible: true
})
```

### Add Disability Field (Boolean)
```javascript
db.voterfields.insertOne({
  name: "disability",
  type: "Boolean",
  label: "Has Disability",
  description: "Whether voter has any disability",
  required: false,
  visible: true
})
```

### Add Education Level Field
```javascript
db.voterfields.insertOne({
  name: "educationLevel",
  type: "String",
  label: "Education Level",
  description: "Highest education qualification",
  required: false,
  visible: true
})
```

### Add Multiple Fields at Once
```javascript
db.voterfields.insertMany([
  {
    name: "bloodGroup",
    type: "String",
    label: "Blood Group",
    description: "Voter's blood group",
    required: false,
    visible: true
  },
  {
    name: "disability",
    type: "Boolean",
    label: "Has Disability",
    description: "Disability status",
    required: false,
    visible: true
  },
  {
    name: "educationLevel",
    type: "String",
    label: "Education Level",
    description: "Educational qualification",
    required: false,
    visible: true
  },
  {
    name: "occupation",
    type: "String",
    label: "Occupation",
    description: "Current occupation",
    required: false,
    visible: true
  }
])
```

### Hide a Field (Won't show in app)
```javascript
db.voterfields.updateOne(
  { name: "bloodGroup" },
  { $set: { visible: false } }
)
```

### Show a Hidden Field
```javascript
db.voterfields.updateOne(
  { name: "bloodGroup" },
  { $set: { visible: true } }
)
```

### Make a Field Required
```javascript
db.voterfields.updateOne(
  { name: "bloodGroup" },
  { $set: { required: true } }
)
```

### Update Field Label
```javascript
db.voterfields.updateOne(
  { name: "bloodGroup" },
  { $set: { label: "Blood Type" } }
)
```

### Delete a Field
```javascript
db.voterfields.deleteOne({ name: "bloodGroup" })
```

### Count Visible Fields
```javascript
db.voterfields.countDocuments({ visible: true })
```

---

## 🌐 API Testing with curl/Postman

### Get All Visible Fields (Mobile Endpoint)
```bash
curl http://localhost:5000/api/v1/voter-fields
```

Expected Response:
```json
{
  "success": true,
  "fields": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "bloodGroup",
      "type": "String",
      "label": "Blood Group",
      "description": "Voter's blood group type",
      "required": false,
      "visible": true
    }
  ],
  "count": 1
}
```

### Get Field by Name
```bash
curl http://localhost:5000/api/v1/voter-fields/bloodGroup
```

---

## 📱 Testing in Mobile App

### Test Flow 1: Voter Detail Screen
1. Start backend: `cd backend && npm start`
2. Start mobile app: `cd kural && npm start`
3. Navigate to any voter list
4. Click on a voter card
5. **Expected**: See "Dynamic Fields" section showing bloodGroup (if data exists)

### Test Flow 2: Add Voter Form
1. Navigate to "Soon to be Voter" screen
2. Click the FAB (+ button)
3. **Expected**: See "Additional Information" section with bloodGroup input
4. Fill in the form including bloodGroup
5. Submit
6. **Expected**: Voter created with bloodGroup value saved

---

## 🐛 Troubleshooting

### Fields Not Showing in App

**Check 1**: Verify field exists in MongoDB
```javascript
db.voterfields.find({ name: "bloodGroup" })
```

**Check 2**: Verify field is visible
```javascript
db.voterfields.find({ name: "bloodGroup", visible: true })
```

**Check 3**: Test API directly
```bash
curl http://localhost:5000/api/v1/voter-fields
```

**Check 4**: Check React Native console for errors
```bash
# In terminal where Expo is running, press 'j' to open debugger
```

### Backend Not Starting

**Check MongoDB Connection**:
```bash
# In backend/config/config.js
# Verify DATABASE_URI is correct
```

**Check Port Availability**:
```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 5000

# If port is in use, kill the process or change port
```

---

## 📊 Sample Data for Testing

### Create Sample Voter with Blood Group
```javascript
db.voters.insertOne({
  name: "Test Voter",
  Number: "ABC1234567",
  age: 35,
  gender: "male",
  Part_no: 123,
  mobile: "9876543210",
  bloodGroup: "O+",  // ← Dynamic field
  disability: false,  // ← Dynamic field
  educationLevel: "Graduate"  // ← Dynamic field
})
```

---

## 🔄 Quick Reset Commands

### Remove All Voter Fields
```javascript
db.voterfields.deleteMany({})
```

### Reset to Default Fields
```javascript
db.voterfields.deleteMany({});
db.voterfields.insertMany([
  {
    name: "bloodGroup",
    type: "String",
    label: "Blood Group",
    description: "Voter's blood group",
    required: false,
    visible: true
  },
  {
    name: "disability",
    type: "Boolean",
    label: "Has Disability",
    description: "Disability status",
    required: false,
    visible: true
  }
])
```

---

## ⚡ Development Workflow

### Adding a New Field
1. **Admin adds field to MongoDB**:
   ```javascript
   db.voterfields.insertOne({ name: "newField", type: "String", label: "New Field", visible: true })
   ```

2. **No code changes needed!**

3. **Restart mobile app** (if already running):
   - Close app
   - Reopen app
   - Navigate to voter detail or add voter form
   - Field appears automatically ✨

### Hiding a Field
1. **Admin updates visibility**:
   ```javascript
   db.voterfields.updateOne({ name: "bloodGroup" }, { $set: { visible: false } })
   ```

2. **Reload screen in app**:
   - Pull to refresh (if implemented)
   - Or navigate away and back
   - Field disappears ✨

---

## 📈 Performance Tips

- Fields are fetched once per screen load
- API endpoint is optimized with MongoDB indexing
- Only visible fields are returned to mobile app
- Minimal network overhead

---

## 🎯 Next Steps

1. ✅ **Done**: Backend API for voter fields
2. ✅ **Done**: Mobile app integration (voter_info.tsx, soon_to_be_voter.tsx)
3. ✅ **Done**: Documentation and test scripts
4. 🔄 **Optional**: Add edit voter functionality
5. 🔄 **Optional**: Add field ordering/grouping
6. 🔄 **Optional**: Add validation rules
7. 🔄 **Optional**: Add admin panel UI for field management

---

**For support**: Check `VOTER_FIELD_INTEGRATION.md` for detailed documentation
