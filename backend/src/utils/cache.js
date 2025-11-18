const Redis = require('ioredis');
const config = require('../../config/config');

class CacheService {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }

    /**
     * Initialize Redis connection
     */
    async connect() {
        try {
            const redisConfig = {
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD || undefined,
                db: process.env.REDIS_DB || 0,
                maxRetriesPerRequest: 3,
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                reconnectOnError: (err) => {
                    const targetError = 'READONLY';
                    if (err.message.includes(targetError)) {
                        return true;
                    }
                    return false;
                },
                // Performance optimizations for 1L+ users
                enableReadyCheck: true,
                enableOfflineQueue: true,
                lazyConnect: false,
                connectTimeout: 10000,
                // Connection pool settings
                maxRetriesPerRequest: 3,
                showFriendlyErrorStack: process.env.NODE_ENV !== 'production'
            };

            this.client = new Redis(redisConfig);

            this.client.on('connect', () => {
                console.log('📦 Redis: Connecting...');
            });

            this.client.on('ready', () => {
                this.isConnected = true;
                console.log('✅ Redis: Connected and ready');
            });

            this.client.on('error', (err) => {
                console.error('❌ Redis Error:', err.message);
                this.isConnected = false;
            });

            this.client.on('close', () => {
                console.log('🔌 Redis: Connection closed');
                this.isConnected = false;
            });

            this.client.on('reconnecting', () => {
                console.log('🔄 Redis: Reconnecting...');
            });

            // Wait for connection
            await this.client.ping();
            return true;
        } catch (error) {
            console.error('❌ Redis Connection Failed:', error.message);
            this.isConnected = false;
            return false;
        }
    }

    /**
     * Check if Redis is connected
     */
    isReady() {
        return this.isConnected && this.client && this.client.status === 'ready';
    }

    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {Promise<any>} - Cached value or null
     */
    async get(key) {
        if (!this.isReady()) return null;

        try {
            const value = await this.client.get(key);
            if (!value) return null;

            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        } catch (error) {
            console.error(`Cache GET error for key ${key}:`, error.message);
            return null;
        }
    }

    /**
     * Set value in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in seconds (default: 5 minutes)
     */
    async set(key, value, ttl = 300) {
        if (!this.isReady()) return false;

        try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

            if (ttl > 0) {
                await this.client.setex(key, ttl, stringValue);
            } else {
                await this.client.set(key, stringValue);
            }
            return true;
        } catch (error) {
            console.error(`Cache SET error for key ${key}:`, error.message);
            return false;
        }
    }

    /**
     * Delete key from cache
     * @param {string} key - Cache key
     */
    async del(key) {
        if (!this.isReady()) return false;

        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            console.error(`Cache DEL error for key ${key}:`, error.message);
            return false;
        }
    }

    /**
     * Delete multiple keys matching pattern
     * @param {string} pattern - Key pattern (e.g., 'user:*')
     */
    async delPattern(pattern) {
        if (!this.isReady()) return false;

        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(...keys);
            }
            return true;
        } catch (error) {
            console.error(`Cache DEL pattern error for ${pattern}:`, error.message);
            return false;
        }
    }

    /**
     * Check if key exists
     * @param {string} key - Cache key
     */
    async exists(key) {
        if (!this.isReady()) return false;

        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            console.error(`Cache EXISTS error for key ${key}:`, error.message);
            return false;
        }
    }

    /**
     * Get multiple keys at once
     * @param {Array<string>} keys - Array of cache keys
     */
    async mget(keys) {
        if (!this.isReady()) return [];

        try {
            const values = await this.client.mget(...keys);
            return values.map(v => {
                if (!v) return null;
                try {
                    return JSON.parse(v);
                } catch (e) {
                    return v;
                }
            });
        } catch (error) {
            console.error('Cache MGET error:', error.message);
            return [];
        }
    }

    /**
     * Cache wrapper for database queries
     * @param {string} key - Cache key
     * @param {Function} fetchFunction - Function to fetch data if not cached
     * @param {number} ttl - Time to live in seconds
     */
    async wrap(key, fetchFunction, ttl = 300) {
        // Try to get from cache first
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }

        // Fetch fresh data
        const data = await fetchFunction();

        // Store in cache
        await this.set(key, data, ttl);

        return data;
    }

    /**
     * Increment counter (useful for rate limiting)
     * @param {string} key - Counter key
     * @param {number} ttl - Time to live in seconds
     */
    async incr(key, ttl = null) {
        if (!this.isReady()) return 0;

        try {
            const value = await this.client.incr(key);
            if (ttl && value === 1) {
                await this.client.expire(key, ttl);
            }
            return value;
        } catch (error) {
            console.error(`Cache INCR error for key ${key}:`, error.message);
            return 0;
        }
    }

    /**
     * Set expiration time for a key
     * @param {string} key - Cache key
     * @param {number} seconds - Seconds until expiration
     */
    async expire(key, seconds) {
        if (!this.isReady()) return false;

        try {
            await this.client.expire(key, seconds);
            return true;
        } catch (error) {
            console.error(`Cache EXPIRE error for key ${key}:`, error.message);
            return false;
        }
    }

    /**
     * Get cache statistics
     */
    async getStats() {
        if (!this.isReady()) return null;

        try {
            const info = await this.client.info('stats');
            return info;
        } catch (error) {
            console.error('Cache STATS error:', error.message);
            return null;
        }
    }

    /**
     * Flush all cache
     */
    async flushAll() {
        if (!this.isReady()) return false;

        try {
            await this.client.flushdb();
            return true;
        } catch (error) {
            console.error('Cache FLUSH error:', error.message);
            return false;
        }
    }

    /**
     * Close Redis connection
     */
    async disconnect() {
        if (this.client) {
            await this.client.quit();
            this.isConnected = false;
            console.log('👋 Redis: Disconnected');
        }
    }
}

// Singleton instance
const cacheService = new CacheService();

// Cache key generators for common patterns
const CacheKeys = {
    voter: (id) => `voter:${id}`,
    votersByBooth: (aciId, boothId, page) => `voters:booth:${aciId}:${boothId}:p${page}`,
    voterCount: (aciId, boothId) => `voters:count:${aciId}:${boothId}`,
    survey: (id) => `survey:${id}`,
    surveyList: (page, status) => `surveys:list:${status}:p${page}`,
    surveyResponses: (surveyId, page) => `survey:${surveyId}:responses:p${page}`,
    user: (id) => `user:${id}`,
    boothAgent: (id) => `booth:${id}`,
    voterFields: () => `voter:fields:visible`,
    rateLimit: (ip, endpoint) => `ratelimit:${ip}:${endpoint}`
};

// TTL constants (in seconds)
const CacheTTL = {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 1800, // 30 minutes
    HOUR: 3600, // 1 hour
    DAY: 86400, // 24 hours
    WEEK: 604800 // 7 days
};

module.exports = {
    cacheService,
    CacheKeys,
    CacheTTL
};