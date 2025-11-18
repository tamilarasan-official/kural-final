# Kural Election Management System

## 🎯 Project Overview
React Native (Expo) mobile app with Node.js backend for election booth management and voter data collection.

---

## ✨ NEW FEATURE: Dynamic Voter Fields

### 🚀 What's New
**Dynamic Field Reflection System** - Add custom fields via admin panel that automatically appear in the mobile app **without code changes or app rebuilds**!

### 📚 Complete Documentation

#### Getting Started
- **[FINAL_SUMMARY.md](./FINAL_SUMMARY.md)** - Start here! Quick overview and success metrics
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - 5-minute test to verify everything works

#### Detailed Guides
- **[VOTER_FIELD_INTEGRATION.md](./VOTER_FIELD_INTEGRATION.md)** - Complete integration guide with examples
- **[QUICK_COMMANDS.md](./QUICK_COMMANDS.md)** - MongoDB queries and API commands reference
- **[SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)** - Visual diagrams and architecture

#### For Developers
- **[backend/test-voter-field-integration.js](./backend/test-voter-field-integration.js)** - Automated test script

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- MongoDB
- Expo CLI
- React Native development environment

### Backend Setup
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

### Mobile App Setup
```bash
cd kural
npm install
npm start
# or: npx expo start
```

---

## 📱 Key Features

### Core Features
- 🗳️ Booth management and monitoring
- 👥 Voter registration and management
- 📊 Real-time statistics and analytics
- 🔍 Advanced voter search
- 📝 Survey management
- 🖨️ Bluetooth printer integration
- 🌐 Multi-language support (English/Tamil)

### Dynamic Features (NEW! ✨)
- ➕ Add custom fields without code changes
- 👁️ Show/hide fields with visibility toggle
- 📝 Automatic form field generation
- 💾 Seamless data persistence
- 🎨 Type-aware field rendering (String, Number, Date, Boolean, Array)

---

## 🗂️ Project Structure

```
kural-final/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── models/            # MongoDB models
│   │   │   ├── VoterField.js  # Dynamic field schema (NEW)
│   │   │   └── ...
│   │   ├── controllers/       # Business logic
│   │   │   ├── voterFieldController.js (NEW)
│   │   │   └── ...
│   │   ├── routes/           # API endpoints
│   │   │   ├── voterFieldRoutes.js (NEW)
│   │   │   └── ...
│   │   └── app.js            # Express app
│   ├── config/               # Configuration
│   └── test-voter-field-integration.js (NEW)
│
├── kural/                     # React Native app
│   ├── app/                  # Screens
│   │   └── (tabs)/
│   │       └── dashboard/
│   │           ├── voter_info.tsx (UPDATED)
│   │           └── soon_to_be_voter.tsx (UPDATED)
│   ├── services/
│   │   └── api/
│   │       ├── voterField.ts (NEW)
│   │       └── ...
│   └── components/           # Reusable components
│
└── Documentation (NEW)
    ├── FINAL_SUMMARY.md
    ├── TESTING_GUIDE.md
    ├── VOTER_FIELD_INTEGRATION.md
    ├── QUICK_COMMANDS.md
    └── SYSTEM_ARCHITECTURE.md
```

---

## 🧪 Testing Dynamic Fields

### Quick Test (5 minutes)

1. **Add field to MongoDB**:
```javascript
db.voterfields.insertOne({
  name: "bloodGroup",
  type: "String",
  label: "Blood Group",
  visible: true
});
```

2. **Run test script**:
```bash
cd backend
node test-voter-field-integration.js
```

3. **Open mobile app**:
   - View voter details → See "Blood Group" field
   - Add new voter → See "Blood Group" input

**Detailed testing**: See [TESTING_GUIDE.md](./TESTING_GUIDE.md)

---

## 🔧 Environment Setup

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kural
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Mobile App
Configuration in `kural/services/api/config.ts`

---

## 📊 API Endpoints

### Voter Fields (NEW)
- `GET /api/v1/voter-fields` - Get visible fields (public)
- `GET /api/v1/voter-fields/:name` - Get field by name
- `POST /api/v1/voter-fields` - Create field (admin)
- `PUT /api/v1/voter-fields/:name` - Update field (admin)
- `DELETE /api/v1/voter-fields/:name` - Delete field (admin)
- `PUT /api/v1/voter-fields/:name/toggle-visibility` - Toggle visibility (admin)

### Other Endpoints
See [backend/API_ENDPOINTS.md](./backend/API_ENDPOINTS.md)

---

## 🎯 Use Cases

### Scenario 1: Health Campaign
Add "vaccination status" field to track voter vaccinations without app update.

### Scenario 2: Infrastructure Survey
Add fields for "water supply", "road condition", "electricity" to collect infrastructure feedback.

### Scenario 3: Education Data
Add "education level" and "literacy status" fields for education initiatives.

**All without rebuilding the app!** ✨

---

## 📖 Documentation Index

| Document | Purpose | Audience |
|----------|---------|----------|
| [FINAL_SUMMARY.md](./FINAL_SUMMARY.md) | Quick overview & metrics | Everyone |
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | Testing procedures | Developers/QA |
| [VOTER_FIELD_INTEGRATION.md](./VOTER_FIELD_INTEGRATION.md) | Complete technical guide | Developers |
| [QUICK_COMMANDS.md](./QUICK_COMMANDS.md) | Command reference | Admins/Developers |
| [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) | Architecture diagrams | Technical team |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is proprietary and confidential.

---

## 👥 Team

- Backend: Node.js + Express + MongoDB
- Frontend: React Native + Expo + TypeScript
- Dynamic Fields: Implemented January 2024

---

## 🚀 Recent Updates

### v1.0.0 - Dynamic Field System (Jan 2024)
- ✅ Dynamic voter field system
- ✅ Automatic field rendering
- ✅ Zero-code field addition
- ✅ Visibility controls
- ✅ Type-aware components
- ✅ Comprehensive documentation

---

## 📞 Support

For issues or questions:
1. Check documentation in root folder
2. Run test script: `node backend/test-voter-field-integration.js`
3. Review MongoDB collections
4. Check API endpoints
5. Review React Native console logs

---

## 🎉 Success Metrics

| Feature | Status | Notes |
|---------|--------|-------|
| Dynamic Fields | ✅ | Production ready |
| Backend API | ✅ | 6 endpoints |
| Mobile Integration | ✅ | 2 screens |
| Documentation | ✅ | 5 guides |
| Testing | ✅ | Automated script |

---

**Version**: 1.0.0  
**Last Updated**: January 15, 2024  
**Status**: ✅ Production Ready
