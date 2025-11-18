# 🚀 Redis Cache Integration Guide

This guide shows how to integrate the Redis caching service into your controllers for maximum performance.

---

## 📋 Cache Service API

### Import Cache Service
```javascript
const { cacheService, CacheKeys, CacheTTL } = require('../utils/cache');
```

### Available Methods

#### 1. **get(key)** - Get cached value
```javascript
const data = await cacheService.get(key);
if (data) return data; // Cache hit
```

#### 2. **set(key, value, ttl)** - Set cached value
```javascript
await cacheService.set(key, data, CacheTTL.MEDIUM); // 5 minutes
```

#### 3. **del(key)** - Delete cached value
```javascript
await cacheService.del(key);
```

#### 4. **delPattern(pattern)** - Delete multiple keys by pattern
```javascript
await cacheService.delPattern('voter:booth:*');
```

#### 5. **wrap(key, fetchFunction, ttl)** - Cache wrapper (most useful!)
```javascript
const data = await cacheService.wrap(
    CacheKeys.voters.byBooth(boothId),
    () => Voter.find({ booth_id: boothId }).lean(),
    CacheTTL.MEDIUM
);
```

---

## 🎯 Integration Examples

### Example 1: Voter Controller - Get Voters by Booth

**Before (No Cache)**:
```javascript
exports.getVotersByBooth = asyncHandler(async (req, res) => {
    const { booth_id } = req.params;
    
    const voters = await Voter.find({ booth_id })
        .select('-__v')
        .lean();
    
    res.status(200).json({
        success: true,
        count: voters.length,
        data: voters
    });
});
```

**After (With Cache)**:
```javascript
const { cacheService, CacheKeys, CacheTTL } = require('../utils/cache');

exports.getVotersByBooth = asyncHandler(async (req, res) => {
    const { booth_id } = req.params;
    
    // Use cache wrapper - simplest approach
    const voters = await cacheService.wrap(
        CacheKeys.voters.byBooth(booth_id),
        async () => {
            return await Voter.find({ booth_id })
                .select('-__v')
                .lean();
        },
        CacheTTL.MEDIUM // 5 minutes cache
    );
    
    res.status(200).json({
        success: true,
        count: voters.length,
        data: voters,
        cached: true // Indicate data may be cached
    });
});
```

### Example 2: Survey Controller - Get Active Surveys

**Before**:
```javascript
exports.getSurveys = asyncHandler(async (req, res) => {
    const surveys = await Survey.findActive()
        .select('-__v')
        .lean();
    
    res.json({ success: true, data: surveys });
});
```

**After**:
```javascript
const { cacheService, CacheKeys, CacheTTL } = require('../utils/cache');

exports.getSurveys = asyncHandler(async (req, res) => {
    const surveys = await cacheService.wrap(
        CacheKeys.surveys.active(),
        () => Survey.findActive().select('-__v').lean(),
        CacheTTL.LONG // 30 minutes - surveys don't change often
    );
    
    res.json({ success: true, data: surveys });
});
```

### Example 3: Manual Cache Management (Write Operations)

**Update Voter - Invalidate Cache**:
```javascript
const { cacheService, CacheKeys } = require('../utils/cache');

exports.updateVoter = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const voter = await Voter.findById(id);
    
    if (!voter) {
        return res.status(404).json({ success: false, message: 'Voter not found' });
    }
    
    // Update voter
    Object.assign(voter, req.body);
    await voter.save();
    
    // Invalidate related caches
    await Promise.all([
        cacheService.del(CacheKeys.voters.byId(id)),
        cacheService.del(CacheKeys.voters.byBooth(voter.booth_id)),
        cacheService.delPattern(`voter:search:*`) // Clear all search caches
    ]);
    
    res.json({ success: true, data: voter });
});
```

### Example 4: Booth Login - Cache User Data

**Before**:
```javascript
exports.login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = generateToken(user);
    res.json({ success: true, token, user });
});
```

**After**:
```javascript
const { cacheService, CacheKeys, CacheTTL } = require('../utils/cache');

exports.login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    
    // Try to get user from cache first
    let user = await cacheService.get(CacheKeys.users.byUsername(username));
    
    if (!user) {
        // Cache miss - fetch from database
        user = await User.findOne({ username });
        if (user) {
            // Cache user data (without password!)
            const userCache = user.toObject();
            delete userCache.password;
            await cacheService.set(
                CacheKeys.users.byUsername(username),
                userCache,
                CacheTTL.MEDIUM
            );
        }
    }
    
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = generateToken(user);
    res.json({ success: true, token, user });
});
```

---

## 🔑 Cache Key Patterns

### Using CacheKeys Helper

```javascript
// Voter keys
CacheKeys.voters.byId(voterId)                    // 'voter:id:123'
CacheKeys.voters.byBooth(boothId)                 // 'voter:booth:B001'
CacheKeys.voters.search(query, page)              // 'voter:search:john:1'

// Survey keys
CacheKeys.surveys.active()                        // 'survey:active'
CacheKeys.surveys.byId(surveyId)                  // 'survey:id:456'
CacheKeys.surveys.byType(type)                    // 'survey:type:feedback'

// Booth keys
CacheKeys.booth.byId(boothId)                     // 'booth:id:B001'
CacheKeys.booth.byAci(aciId)                      // 'booth:aci:A001'

// User keys
CacheKeys.users.byId(userId)                      // 'user:id:789'
CacheKeys.users.byUsername(username)              // 'user:username:admin'

// Response keys
CacheKeys.responses.byVoter(voterId)              // 'response:voter:123'
CacheKeys.responses.bySurvey(surveyId, page)      // 'response:survey:456:1'

// Custom keys
CacheKeys.custom('analytics', 'daily')            // 'custom:analytics:daily'
```

---

## ⏱️ Cache TTL (Time To Live)

### Available TTL Constants

```javascript
CacheTTL.SHORT       // 60 seconds (1 minute)
CacheTTL.MEDIUM      // 300 seconds (5 minutes)
CacheTTL.LONG        // 1800 seconds (30 minutes)
CacheTTL.VERY_LONG   // 3600 seconds (1 hour)
CacheTTL.DAILY       // 86400 seconds (24 hours)
```

### Choosing the Right TTL

| Data Type | Recommended TTL | Reason |
|-----------|----------------|---------|
| Voter list by booth | `MEDIUM` (5 min) | Updates occasionally |
| Search results | `SHORT` (1 min) | May change frequently |
| Active surveys | `LONG` (30 min) | Rarely changes |
| User profile | `MEDIUM` (5 min) | Occasional updates |
| Survey responses | `SHORT` (1 min) | Real-time data |
| Booth configuration | `VERY_LONG` (1 hour) | Static data |
| Analytics/Stats | `DAILY` (24 hours) | Computed once per day |

---

## 🔄 Cache Invalidation Strategies

### Strategy 1: Time-Based (TTL)
Let cache expire automatically - simplest approach.

```javascript
// Cache for 5 minutes, auto-expires
await cacheService.set(key, data, CacheTTL.MEDIUM);
```

### Strategy 2: Write-Through
Update cache immediately after database write.

```javascript
// Update database
const voter = await Voter.findByIdAndUpdate(id, data, { new: true });

// Update cache
await cacheService.set(CacheKeys.voters.byId(id), voter, CacheTTL.MEDIUM);
```

### Strategy 3: Write-Invalidate (Recommended)
Delete cache after write, let next read populate it.

```javascript
// Update database
await Voter.findByIdAndUpdate(id, data);

// Invalidate cache - next request will re-populate
await cacheService.del(CacheKeys.voters.byId(id));
await cacheService.del(CacheKeys.voters.byBooth(voter.booth_id));
```

### Strategy 4: Pattern-Based Invalidation
Clear multiple related caches at once.

```javascript
// Delete voter - clear all related caches
await Voter.findByIdAndDelete(id);

// Clear voter cache + all searches + booth list
await cacheService.delPattern('voter:*');
```

---

## 📊 Performance Impact

### Expected Performance Gains

| Operation | Without Cache | With Cache | Speedup |
|-----------|--------------|------------|---------|
| Get voter by ID | 50ms | 2ms | **25x faster** |
| List voters by booth | 200ms | 5ms | **40x faster** |
| Search voters | 300ms | 10ms | **30x faster** |
| Get active surveys | 100ms | 3ms | **33x faster** |
| User authentication | 80ms | 8ms | **10x faster** |

### Database Load Reduction

With 100,000 concurrent users:
- **Without cache**: 100,000 database queries/second
- **With cache (90% hit rate)**: 10,000 database queries/second
- **Result**: **90% reduction** in database load

---

## ✅ Implementation Checklist

### Phase 1: Read-Heavy Endpoints (Start Here)
- [ ] `getVotersByBooth()` - Most frequently accessed
- [ ] `searchVoters()` - Heavy queries
- [ ] `getSurveys()` - List all surveys
- [ ] `getActiveSurveys()` - Dashboard data
- [ ] `getBoothDetails()` - Booth information

### Phase 2: Authentication & User Data
- [ ] `login()` - Cache user data after authentication
- [ ] `getUserProfile()` - User profile endpoint
- [ ] `getBoothAgent()` - Agent information

### Phase 3: Write Operations (Invalidation)
- [ ] `updateVoter()` - Invalidate voter cache
- [ ] `deleteVoter()` - Clear related caches
- [ ] `createSurvey()` - Invalidate survey list cache
- [ ] `updateSurvey()` - Clear survey cache
- [ ] `submitResponse()` - Invalidate response caches

### Phase 4: Analytics & Reports
- [ ] `getVoterStats()` - Daily stats (DAILY TTL)
- [ ] `getBoothStats()` - Booth analytics
- [ ] `getSurveyAnalytics()` - Survey reports

---

## 🛠️ Testing Cache Integration

### Test Cache Hit/Miss

```javascript
// Enable debug logging in cache.js
logger.debug(`Cache HIT: ${key}`);  // When data found in cache
logger.debug(`Cache MISS: ${key}`); // When fetching from DB

// Check Redis
redis-cli -a your_password
> KEYS voter:*
> GET voter:id:123
> TTL voter:id:123
```

### Monitor Cache Performance

```javascript
// In your controller
const startTime = Date.now();
const data = await cacheService.wrap(key, fetchFn, ttl);
const duration = Date.now() - startTime;

logger.info(`Query completed in ${duration}ms (cached: ${duration < 10})`);
```

---

## 🚨 Important Notes

### 1. **Cache Consistency**
- Always invalidate cache after updates
- Use appropriate TTL for data freshness
- Consider stale data acceptable for read-heavy endpoints

### 2. **Error Handling**
- Cache failures won't crash the app
- Falls back to database if Redis is down
- Monitor Redis connection in health endpoint

### 3. **Memory Management**
- Redis stores data in memory
- Monitor Redis memory usage
- Use appropriate TTLs to prevent memory overflow
- Consider LRU eviction policy

### 4. **Security**
- Never cache sensitive data (passwords, tokens)
- Use Redis password authentication
- Encrypt cache data if needed

---

## 🎯 Quick Start - Add Cache to One Endpoint

**1. Import cache service**:
```javascript
const { cacheService, CacheKeys, CacheTTL } = require('../utils/cache');
```

**2. Wrap your database query**:
```javascript
const data = await cacheService.wrap(
    'your-cache-key',
    () => YourModel.find().lean(), // Your existing query
    CacheTTL.MEDIUM
);
```

**3. Test it**:
```bash
# First request - slow (cache miss)
curl http://localhost:5000/api/your-endpoint

# Second request - fast (cache hit)
curl http://localhost:5000/api/your-endpoint
```

**Done! You've just cached your first endpoint! 🎉**

---

## 📞 Need Help?

Check these resources:
- Redis documentation: https://redis.io/docs/
- ioredis documentation: https://github.com/luin/ioredis
- Cache service code: `backend/src/utils/cache.js`

---

**Happy Caching! 🚀**
