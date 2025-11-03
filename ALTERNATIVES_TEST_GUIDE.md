# 🌿 Sustainable Product Alternatives Engine - Test Guide

## Overview
The Sustainable Product Alternatives Engine is now fully integrated into your Chrome extension! Here's how to test and use the new features:

## 🔧 Backend Setup

### 1. Install Dependencies
```bash
cd extension-backend
npm install
```

### 2. Start Backend Server
```bash
npm run dev
```
Server will run on: http://localhost:5001

## 🎯 Frontend Build

### 1. Build Extension
```bash
cd extension-frontend
npm run build
```

### 2. Load Extension in Chrome
1. Open Chrome -> Extensions -> Developer mode ON
2. Click "Load unpacked"
3. Select the `extension-frontend/dist` folder

## ✨ New Features to Test

### 1. **Enhanced Product Analysis**
- Visit any product page on Amazon, Flipkart, or the demo page
- The eco-badge now includes an "Alternatives" section
- Click "🔍 Find Better Alternatives" to discover sustainable options

### 2. **Alternative Product Cards**
Each alternative shows:
- **EcoScore improvement** (A, B, C grades)
- **Price comparison** (+/- percentage)
- **CO₂ savings** (in kg)
- **Why it's better** (materials, certifications)
- **User switch percentage** (simulated data)
- **EcoCoins reward** (+10 per choice)

### 3. **Reward System**
- **EcoCoins**: Earn 10 coins for each sustainable choice
- **CO₂ tracking**: See cumulative environmental impact
- **Progress badges**: New achievements for alternative choices
- **Dashboard integration**: View stats in the extension popup

### 4. **Enhanced Dashboard**
New sections in the dashboard:
- **EcoCoins counter** with alternatives integration
- **Alternative choices impact** section
- **Recent sustainable choices** history
- **New badges** for alternative selections

## 🧪 Test Scenarios

### Test 1: Basic Alternative Discovery
1. Visit: http://localhost:5173/demo-products.html
2. Look for the EcoShopper badge
3. Click "🔍 Find Better Alternatives"
4. Verify alternatives load with proper data

### Test 2: Choosing Alternatives
1. Click any alternative card
2. Verify reward notification appears
3. Check that Amazon link opens in new tab
4. Confirm EcoCoins are awarded

### Test 3: Dashboard Integration
1. Open extension popup (click extension icon)
2. Navigate to Dashboard
3. Verify EcoCoins and alternative stats display
4. Check new badges are earned

### Test 4: API Integration
Test API endpoints directly:
```bash
# Get alternatives
curl "http://localhost:5001/api/alternatives?productName=bamboo%20water%20bottle&currentScore=50&limit=3"

# Record choice
curl -X POST http://localhost:5001/api/alternatives/choose \
  -H "Content-Type: application/json" \
  -d '{"userId":"test123","originalProduct":{"name":"Regular Bottle","ecoScore":50},"chosenAlternative":{"title":"Bamboo Bottle","ecoScore":85},"co2Saved":2.5}'

# Get stats
curl "http://localhost:5001/api/alternatives/stats/test123"
```

## 🎨 UI Features

### Alternative Cards Include:
- **Product images** from Amazon
- **Color-coded EcoScores** (green=good, red=poor)
- **Animated progress bars** for switch percentages
- **Hover effects** and smooth transitions
- **Reward badges** with pulsing animation

### Content Script Enhancements:
- **Smooth slide-in animations**
- **Loading states** with spinners
- **Error handling** with fallback messages
- **Responsive design** for mobile/desktop

## 🔑 Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/alternatives` | GET | Get sustainable alternatives |
| `/api/alternatives/search` | GET | Search eco-friendly products |
| `/api/alternatives/choose` | POST | Record user choice & award EcoCoins |
| `/api/alternatives/stats/:userId` | GET | Get user's alternative statistics |
| `/api/alternatives/product/:asin` | GET | Get Amazon product details |

## 📊 Mock Data for Testing

The system includes comprehensive mock data when Amazon API isn't available:
- **3 sample alternatives** per product
- **Realistic EcoScores** (78-92)
- **CO₂ savings** calculations
- **Material information** (bamboo, recycled, organic)
- **Certifications** (FSC, USDA Organic, etc.)

## 🏆 Achievement System

### New Badges Available:
- 🔄 **Alternative Explorer** - Switch to 1 sustainable alternative
- 🎯 **Choice Champion** - Switch to 5 sustainable alternatives  
- 🌟 **Eco Influencer** - Switch to 10 sustainable alternatives

## 🌱 Environmental Impact

The system tracks:
- **Individual CO₂ savings** per choice
- **Cumulative environmental impact**
- **Community-wide statistics**
- **Sustainable brand promotion**

## 🚀 Production Deployment

### Environment Variables Required:
```env
AMAZON_API_KEY=c94e5710-e8f8-4800-bce5-55a137c6ad75
MONGODB_URI=your_mongodb_connection_string
PORT=5001
```

### Chrome Extension Permissions:
The manifest already includes necessary permissions for:
- Amazon domain access
- External API calls
- Storage for EcoCoins
- Background script communication

## 🐛 Troubleshooting

### Common Issues:
1. **No alternatives found**: Check API key and network connection
2. **EcoCoins not updating**: Verify backend API is running
3. **Content script not loading**: Check manifest permissions
4. **Dashboard not showing stats**: Clear localStorage and try again

### Debug Tools:
- Browser Console: Check for JavaScript errors
- Network Tab: Verify API calls
- Extension Developer Tools: Monitor background script
- MongoDB logs: Check database connections

## 📈 Analytics & Metrics

The system tracks:
- **Alternative discovery rate** (% of users who search)
- **Conversion rate** (% who actually choose alternatives)
- **EcoCoins distribution** across user base
- **CO₂ impact measurement**
- **Popular sustainable brands**

---

**🎉 Your Sustainable Product Alternatives Engine is ready!** 

The feature seamlessly integrates with your existing Chrome extension, providing users with real-time sustainable alternatives while rewarding eco-friendly choices through the EcoCoins system.