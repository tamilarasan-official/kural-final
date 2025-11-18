# Production Deployment Guide

## Issue
The production server at https://api.kuralapp.in is running an old version that:
- ❌ Does NOT have `/api/v1/booths/login` endpoint (returns 404)
- ❌ Does NOT have `/api/v1/master-data` endpoints
- ❌ Missing the updated booth authentication logic

## Solution: Update Production Server

### Step 1: SSH into Production Server
```bash
ssh root@178.16.137.247
# Or use your VPS credentials
```

### Step 2: Navigate to Backend Directory
```bash
cd /root/tamilarasan/kural-backend
# Or wherever your backend is deployed
```

### Step 3: Pull Latest Code
```bash
git pull origin main
# Or: git pull origin master (depending on your branch name)
```

### Step 4: Install Dependencies (if needed)
```bash
npm install
```

### Step 5: Restart the Server
```bash
# If using PM2:
pm2 restart all
pm2 logs

# If using systemd:
sudo systemctl restart kural-backend

# If using forever:
forever restart server.js

# If running directly:
# Kill the process and restart
pkill -f node
npm start
```

### Step 6: Verify Deployment
Test the booth login endpoint:
```bash
curl -X POST "https://api.kuralapp.in/api/v1/booths/login" \
  -H "Content-Type: application/json" \
  -d '{"phone":"7924216094","password":"Booth@123"}'
```

Expected success response:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "data": {
    "_id": "...",
    "name": "...",
    "phone": "7924216094",
    "role": "Booth Agent",
    "aci_id": "111",
    "booth_id": "BOOTH001",
    ...
  }
}
```

Test master data endpoint:
```bash
curl "https://api.kuralapp.in/api/v1/master-data/sections" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 7: Check Server Logs
```bash
# If using PM2:
pm2 logs --lines 100

# If using systemd:
sudo journalctl -u kural-backend -n 100 -f

# If logs are in files:
tail -f /path/to/logs/error.log
tail -f /path/to/logs/combined.log
```

## Quick Verification Checklist
- [ ] Git pull completed successfully
- [ ] No merge conflicts
- [ ] Dependencies installed
- [ ] Server restarted
- [ ] `/health` endpoint returns 200 OK
- [ ] `/api/v1/booths/login` returns 200 (not 404)
- [ ] `/api/v1/auth/login` still works
- [ ] `/api/v1/master-data/sections` accessible (with token)

## Troubleshooting

### If git pull fails with conflicts:
```bash
# Stash local changes
git stash

# Pull again
git pull origin main

# Apply stashed changes (if needed)
git stash pop
```

### If server won't start:
```bash
# Check what's using the port
netstat -tulpn | grep :5000

# Kill the process
kill -9 <PID>

# Start again
npm start
```

### If routes still return 404:
```bash
# Verify app.js has the booth routes:
grep "boothRoutes" src/app.js

# Should see:
# const boothRoutes = require('./routes/boothRoutes');
# app.use('/api/v1/booths', boothRoutes);
```

## Current Production Status
- **URL**: https://api.kuralapp.in
- **Database**: 178.16.137.247:27017/kuraldb
- **Environment**: development (should be production)
- **Missing Routes**: 
  - `/api/v1/booths/*` (entire booth module)
  - `/api/v1/master-data/*` (master data module)

## Last Successful Commit
```
commit fb04b28
Author: [Your name]
Date: [Recent date]

feat: Add Master Data Collection Feature

- Added MasterDataSection and MasterDataResponse models
- Implemented 5 master data endpoints
- Updated booth login to support phone number authentication
- Fixed geospatial index issues
```

## After Deployment
Once the server is updated, the mobile app should be able to:
1. ✅ Login using phone number (Booth Agent)
2. ✅ Access voter details
3. ✅ Add master data responses
4. ✅ Print voter slips
5. ✅ All existing functionality continues to work
