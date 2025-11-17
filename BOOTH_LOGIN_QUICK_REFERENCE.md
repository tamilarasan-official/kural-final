# 🚀 Quick Reference - Booth Agent Login

## 🔑 Universal Password
**All Booth Agents now use the same password:** `Booth@123`

---

## 📱 Test Accounts

### Agent_001 (ACI: 119)
- **Phone:** `7223380281`
- **Password:** `Booth@123`
- **Booth ID:** BOOTH001
- **ACI Name:** THONDAMUTHUR

### Agent_006 (ACI: 111)
- **Phone:** `8941753357`
- **Password:** `Booth@123`
- **Booth ID:** BOOTH006
- **ACI Name:** THONDAMUTHUR

### Agent_010 (ACI: 119)
- **Phone:** `7824676255`
- **Password:** `Booth@123`
- **Booth ID:** BOOTH010
- **ACI Name:** THONDAMUTHUR

---

## 🔧 How to Login

1. **Open the app**
2. **Enter Phone Number** (e.g., `8941753357`)
3. **Enter Password:** `Booth@123`
4. **Click Login**

The app will:
- Clear any cached session data
- Authenticate with the backend
- Load the correct booth data (BOOTH006 for Agent_006)
- Navigate to the Booth Agent Dashboard

---

## ✅ What Was Fixed

1. **Password Reset:** All 405 booth agents now have password `Booth@123`
2. **AsyncStorage Clearing:** Login now clears cached data before authentication
3. **Enhanced Logging:** Better debugging to track what data is loaded
4. **SHA-256 Support:** Password matching now works with SHA-256 hashed passwords

---

## 📊 All Credentials

See `BOOTH_AGENT_CREDENTIALS.md` for the complete list of all 405 booth agents.

---

## 🐛 If Issues Persist

1. **Clear app cache** completely
2. **Kill and restart the app**
3. **Check backend logs** for authentication details
4. **Check Metro bundler logs** for AsyncStorage verification

---

**Last Updated:** November 15, 2025
