# ⚡ Quick Reference - Production Commands

**Kural API Backend - 1 Lakh+ Users Optimization**

---

## 🚀 START SERVER

### Windows PowerShell
```powershell
cd C:\kuralnew\kural-final\backend

# Option 1: PM2 (Recommended - Auto clustering)
pm2 start ecosystem.config.js --env production
pm2 save

# Option 2: Native Node.js
$env:NODE_ENV="production"
node src/server.js
```

### Linux/Mac
```bash
cd /path/to/kural-final/backend

# Option 1: PM2 (Recommended)
pm2 start ecosystem.config.js --env production
pm2 save

# Option 2: Native Node.js
NODE_ENV=production node src/server.js
```

---

## 📊 MONITOR

```bash
# PM2 Status
pm2 status

# Real-time monitoring
pm2 monit

# View logs (last 50 lines)
pm2 logs kural-api --lines 50

# Follow logs (real-time)
pm2 logs kural-api --raw

# Flush logs
pm2 flush
```

---

## 🔄 RESTART/RELOAD

```bash
# Graceful reload (zero-downtime)
pm2 reload kural-api

# Hard restart
pm2 restart kural-api

# Restart all
pm2 restart all
```

---

## 🛑 STOP SERVER

```bash
# Stop application
pm2 stop kural-api

# Delete from PM2
pm2 delete kural-api

# Stop all
pm2 stop all
```

---

## 🧪 LOAD TESTING

```bash
cd C:\kuralnew\kural-final\backend

# Warmup (100 users, 30s)
node load-test.js warmup

# Normal load (1,000 users, 60s)
node load-test.js normal

# Stress test (5,000 users, 120s)
node load-test.js stress

# Spike test (10,000 users, 60s)
node load-test.js spike

# Endurance (2,000 users, 10 min)
node load-test.js endurance

# FULL TEST - 1 LAKH USERS (100,000 users, 5 min) 🔥
node load-test.js full
```

---

## ❤️ HEALTH CHECK

```bash
# Check application health
curl http://localhost:5000/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2024-XX-XX...",
#   "uptime": 3600,
#   "environment": "production",
#   "redis": "connected",
#   "mongodb": "connected"
# }
```

---

## 🔴 REDIS

```bash
# Check Redis status
redis-cli ping
# Should return: PONG

# Connect to Redis
redis-cli -h 127.0.0.1 -p 6379 -a your_password

# Inside redis-cli:
INFO stats          # View stats
DBSIZE              # Count keys
KEYS voter:*        # List voter keys
FLUSHDB             # Clear current database (WARNING!)
```

---

## 🍃 MONGODB

```bash
# Connect to MongoDB
mongo mongodb://178.16.137.247:27017/kuraldb

# Inside mongo shell:
show dbs                          # List databases
use kuraldb                       # Switch to database
show collections                  # List collections
db.voters.count()                 # Count voters
db.stats()                        # Database stats
db.voters.getIndexes()            # View indexes
```

---

## 🌐 NGINX

### Windows
```powershell
cd C:\nginx

# Start NGINX
start nginx

# Test configuration
nginx -t

# Reload configuration
nginx -s reload

# Stop NGINX
nginx -s stop
```

### Linux
```bash
# Start NGINX
sudo systemctl start nginx

# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Stop NGINX
sudo systemctl stop nginx

# Check status
sudo systemctl status nginx
```

---

## 🔍 TROUBLESHOOTING

### Check processes
```bash
# Check PM2 processes
pm2 list

# Check Node.js processes
# Windows:
Get-Process node

# Linux:
ps aux | grep node
```

### Check ports
```bash
# Windows:
netstat -ano | findstr :5000

# Linux:
lsof -i :5000
```

### Kill process on port
```bash
# Windows:
$processId = (Get-NetTCPConnection -LocalPort 5000).OwningProcess
Stop-Process -Id $processId -Force

# Linux:
kill -9 $(lsof -t -i:5000)
```

### Check logs
```bash
# Application logs
cd C:\kuralnew\kural-final\backend\logs
Get-Content error-$(Get-Date -Format yyyy-MM-dd).log -Tail 50

# PM2 logs
pm2 logs kural-api --err --lines 50
```

### Clear cache (Redis)
```bash
redis-cli -a your_password FLUSHDB
pm2 restart kural-api
```

---

## 📦 DEPENDENCIES

```bash
# Install production dependencies only
npm ci --production

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

---

## 🔐 SECURITY

```bash
# Generate JWT secret (Windows PowerShell)
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))

# Generate random password (Windows PowerShell)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Linux (openssl)
openssl rand -base64 32
```

---

## 📈 PERFORMANCE MONITORING

```bash
# CPU & Memory usage
pm2 status

# Real-time metrics
pm2 monit

# Process info
pm2 show kural-api

# PM2 web dashboard (browser)
pm2 web
# Then open: http://localhost:9615
```

---

## 💾 BACKUP

```bash
# Backup MongoDB (Windows)
"C:\Program Files\MongoDB\Server\5.0\bin\mongodump.exe" --uri="mongodb://178.16.137.247:27017/kuraldb" --out="C:\backup\$(Get-Date -Format yyyyMMdd)"

# Backup MongoDB (Linux)
mongodump --uri="mongodb://178.16.137.247:27017/kuraldb" --out="/backup/$(date +%Y%m%d)"

# Backup PM2 configuration
pm2 save

# Backup PM2 startup script
pm2 startup
```

---

## 🔄 AUTO-START ON BOOT

### PM2 Startup (Windows)
```powershell
# Install pm2-windows-service
npm install -g pm2-windows-service

# Setup PM2 as Windows service
pm2-service-install -n PM2

# Save current PM2 processes
pm2 save
```

### PM2 Startup (Linux)
```bash
# Generate startup script
pm2 startup

# Copy and run the command it outputs
# Example: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u user --hp /home/user

# Save PM2 processes
pm2 save
```

---

## 📊 EXPECTED METRICS

### Target Performance (100k users)
```
✅ Throughput:       50,000+ req/s
✅ Latency P50:      < 100ms
✅ Latency P95:      < 500ms
✅ Latency P99:      < 1000ms
✅ Error Rate:       < 0.1%
✅ CPU Usage:        70-80%
✅ Memory/Worker:    < 2GB
✅ Total Memory:     < 20GB
```

### Health Indicators
```
✅ All PM2 workers online
✅ Redis connected
✅ MongoDB connected
✅ 0 restart count
✅ Low memory usage (<80%)
✅ Response time <100ms
```

---

## 🎯 DAILY OPERATIONS

### Morning Routine
```bash
# 1. Check server status
pm2 status
curl http://localhost:5000/health

# 2. Check logs for errors
pm2 logs kural-api --err --lines 20

# 3. Check Redis
redis-cli ping

# 4. Check MongoDB
mongo --eval "db.serverStatus().ok"

# 5. Check disk space (Linux)
df -h
```

### Issue Response
```bash
# 1. Check PM2 status
pm2 status

# 2. View recent logs
pm2 logs kural-api --lines 100

# 3. Check resource usage
pm2 monit

# 4. Restart if needed
pm2 reload kural-api

# 5. Clear cache if needed
redis-cli FLUSHDB
```

---

## 🆘 EMERGENCY COMMANDS

```bash
# Kill all Node.js processes (Windows)
Get-Process node | Stop-Process -Force

# Kill all Node.js processes (Linux)
killall -9 node

# Restart everything
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart redis

# Nuclear option - full system restart
pm2 delete all
pm2 start ecosystem.config.js --env production
```

---

## 📞 SUPPORT CHECKLIST

Before asking for help, collect:
1. `pm2 status` output
2. `pm2 logs kural-api --lines 50 --err` output
3. Health check response: `curl http://localhost:5000/health`
4. Redis status: `redis-cli ping`
5. MongoDB status: `mongo --eval "db.serverStatus()"`
6. System resources: `pm2 monit` screenshot

---

## 🎉 SUCCESS INDICATORS

Your system is healthy when:
- ✅ All 12 PM2 workers show "online"
- ✅ Health endpoint returns `"status": "healthy"`
- ✅ Redis returns `PONG`
- ✅ MongoDB connection shows `readyState: 1`
- ✅ Memory usage < 2GB per worker
- ✅ Response times < 100ms
- ✅ Zero errors in last hour of logs

---

**Quick Help**: Run `pm2 monit` to see everything at a glance! 📊
