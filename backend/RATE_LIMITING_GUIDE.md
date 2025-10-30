# Rate Limiting Configuration Guide

## Current Setup

The API now has **UNLIMITED rate limiting** for both development and production:

### All Modes (Development & Production)
- ✅ **Rate limiting is DISABLED**
- ✅ **Unlimited API requests** (100,000 per 15 minutes)
- ✅ Perfect for development, testing, and production use
- ✅ Console shows: "✓ Rate limiting disabled - Unlimited API requests allowed"

## Current Configuration

The rate limiter is configured with `skip: () => true`, which means:
- No restrictions on API requests
- All requests are processed immediately
- No "Too many requests" errors
- Suitable for both development and production environments

## Server Start Message

When you start the server, you'll see:
```
============================================================
🚀 KURAL API SERVER STARTED SUCCESSFULLY
============================================================
📍 Server running on: http://0.0.0.0:5000
🏠 Local access:      http://localhost:5000
🌐 Network access:    http://192.168.10.137:5000
📚 API Docs:          http://localhost:5000/api-docs
💚 Health Check:      http://localhost:5000/health
⚙️  Environment:       development
🔓 Rate Limiting:     DISABLED (Unlimited requests)
============================================================
```

## How to Re-Enable Rate Limiting (If Needed)

If you want to enable rate limiting for production security, edit `backend/src/app.js`:

```javascript
// Change this line:
skip: () => true, // Currently disabled

// To this:
skip: (req) => config.NODE_ENV === 'development', // Enable in production only
```

And remove the `skip` function to enable for all environments:
```javascript
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // Set your desired limit
    message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter); // Apply to all routes
```

## Current Status

✅ Rate limiting is currently: **DISABLED (Unlimited requests for all environments)**
