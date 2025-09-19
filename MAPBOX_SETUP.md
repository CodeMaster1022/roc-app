# 🗺️ Mapbox Integration Setup Guide

This guide will help you set up real Mapbox functionality in the ROC Platform.

## 📋 Prerequisites

- Node.js and npm installed
- A [Mapbox account](https://account.mapbox.com/auth/signup/) (free tier available)

## 🚀 Step-by-Step Setup

### 1. Get Your Mapbox Access Token

1. **Sign up** at [mapbox.com](https://mapbox.com) (free tier includes 50,000 map loads/month)
2. **Go to your Account page** → [Access Tokens](https://account.mapbox.com/access-tokens/)
3. **Copy your Default Public Token** (starts with `pk.`)

### 2. Configure Environment Variables

1. **Open your `.env` file** in the project root
2. **Replace the demo token** with your real token:
   ```env
   # Replace this line:
   VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiZGVtby11c2VyIiwiYSI6ImNsZjBkZW1vZGVtb2RlbW9kZW1vZGVtbyJ9.demo-token-replace-with-real-one
   
   # With your real token:
   VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsZjBkZW1vZGVtb2RlbW9kZW1vZGVtbyJ9.your-real-token-here
   ```

### 3. Restart Development Server

```bash
npm run dev
```

## ✨ Features Included

### 🎯 **Interactive Map**
- Real satellite/street view tiles
- Zoom and pan controls
- Click to place markers

### 📍 **Geocoding & Reverse Geocoding**
- Search addresses and get coordinates
- Click map locations to get addresses
- Mexico-focused search results

### 🎯 **Location Services**
- Get current location button
- Draggable markers
- Coordinate display

### 📱 **Mobile Responsive**
- Touch-friendly controls
- Responsive design
- Fallback for demo mode

## 🔧 Component Usage

The `MapboxMap` component is already integrated into the property flow:

```typescript
import { MapboxMap } from '@/components/hoster/ui/mapbox-map';

<MapboxMap
  address={address}
  onLocationChange={(address, lat, lng) => {
    // Handle location updates
  }}
  onConfirm={() => {
    // Handle location confirmation
  }}
/>
```

## 🎨 Demo Mode vs Real Mode

### **Demo Mode** (Default - No Token Required)
- Shows a placeholder map interface
- No real geocoding or mapping
- Still functional for development

### **Real Mode** (With Valid Token)
- Full Mapbox GL JS integration
- Real map tiles and geocoding
- Interactive location selection

## 📊 Mapbox Pricing

### **Free Tier Includes:**
- 50,000 map loads per month
- 2,500 geocoding requests per month
- All map styles and features

### **Usage in ROC Platform:**
- Property location selection
- Address geocoding
- Interactive map display

## 🛠️ Troubleshooting

### **Map Not Loading?**
1. Check your token in `.env`
2. Ensure token starts with `pk.`
3. Restart development server
4. Check browser console for errors

### **Geocoding Not Working?**
1. Verify internet connection
2. Check API quotas in Mapbox dashboard
3. Ensure token has geocoding permissions

### **Styling Issues?**
1. Verify Mapbox CSS is imported in `src/index.css`
2. Check for CSS conflicts
3. Clear browser cache

## 📚 Additional Resources

- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [Mapbox Geocoding API](https://docs.mapbox.com/api/search/geocoding/)
- [Mapbox Pricing](https://www.mapbox.com/pricing/)

## 🔒 Security Note

**Never commit your real Mapbox token to version control!** 
- Keep it in `.env` (which should be in `.gitignore`)
- Use environment variables in production
- Consider using restricted tokens for production

---

**🎉 You're all set!** Your ROC Platform now has real interactive mapping capabilities powered by Mapbox. 