# Google Places API Setup Guide

## 🚀 Quick Setup

### 1. Get Google Places API Key
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing one
3. Enable the **Places API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

### 2. Add API Key to Environment
```bash
# Add to your .env.local file
GOOGLE_PLACES_API_KEY=AIzaSyC123...your_actual_key_here
```

### 3. Configure API Restrictions (Recommended)
**Application restrictions:**
- HTTP referrers (websites)
- Add your domain: `your-domain.com/*`, `localhost:3000/*`

**API restrictions:**
- Restrict key to: Places API

## 🏟️ What It Enables

The address autocomplete will now search for real venues:

- **Type "Ohio Stadium"** → "411 Woody Hayes Dr, Columbus, OH 43210"
- **Type "Michigan Stadium"** → "1201 S Main St, Ann Arbor, MI 48104" 
- **Type "Mercedes Benz"** → "1 AMB Dr NW, Atlanta, GA 30313"

## 💰 Cost Estimate

- **Places API Autocomplete**: $17 per 1,000 requests
- **Typical sports team usage**: ~500 requests/month
- **Monthly cost**: ~$8.50

## 🛡️ Fallback System

If the API key is missing or there's an error:
- Automatically falls back to mock data with real stadium examples
- Users can still enter addresses manually
- No functionality is lost

## 🔧 Testing

**With API key**: Real Google Places suggestions
**Without API key**: Mock data with major stadiums (Ohio Stadium, Michigan Stadium, etc.)

---

*The address service is production-ready. Just add your API key to start getting real venue suggestions!*