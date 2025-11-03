# 🌱 EcoShopper - Fully Functional Chrome Extension

## Overview

EcoShopper is a feature-rich, gamified Chrome extension that helps users make eco-friendly shopping decisions by analyzing products on e-commerce sites like Amazon and Flipkart.

## ✨ Features

### Core Features
- ✅ **Real-time EcoScore Analysis** (0-100 scale) using keyword-based logic
- ✅ **Material Detection** - Identifies materials (cotton, plastic, bamboo, etc.)
- ✅ **Recyclability Rating** (A-F grade)
- ✅ **Carbon Footprint Estimation** with visual warnings
- ✅ **AI-Powered Insights** - Keyword-based reasoning
- ✅ **Brand Sustainability Score** from database
- ✅ **Eco-Friendly Alternatives** - Suggests 2-3 greener options when score < 60
- ✅ **Recycle & Reuse Tips** - Product-specific disposal guidance

### Interactive Features
- ✅ **Add to Eco Cart** - Save products to localStorage
- ✅ **User Feedback System** - Thumbs up/down buttons
- ✅ **Image Upload** - Upload proof/comments for products
- ✅ **Floating Draggable Badge** - Non-intrusive on-page display

### Gamification
- ✅ **Green Points** - Earn +10 for viewing eco-friendly products (>70 score)
- ✅ **EcoCoins** - Gamified currency system
- ✅ **Badges & Achievements** - 6 levels of badges (🌱 Eco Beginner → 🏆 Eco Warrior)
- ✅ **Level System** - Progress through levels based on points
- ✅ **Progress Tracking** - Visual progress bar

### Dashboard
- ✅ **Statistics Overview** - Total products, average eco score
- ✅ **CO₂ Saved Tracker** - Calculate environmental impact
- ✅ **Interactive Charts** - Pie chart (categories) & Bar chart (score distribution)
- ✅ **Impact Tracker** - Compare to real-world metrics (electricity, water, trees)
- ✅ **Community Impact** - Global user statistics
- ✅ **Eco News Feed** - 5 rotating eco-related headlines

### Advanced Features
- ✅ **Supply Chain Map** - Interactive Leaflet.js map showing material origin journey
- ✅ **Animated Material Journey** - Visual path animation on map
- ✅ **Light & Dark Theme** - Toggle in settings
- ✅ **Eco Shopping Mode** - Filter eco-certified products (in settings)
- ✅ **Development Mode Indicator** - Shows when running in dev mode

## 🚀 Installation & Testing

### Prerequisites
- Node.js 18+ and npm
- Chrome Browser
- MongoDB (optional, for backend)

### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd extension-backend
npm install

# Install frontend dependencies
cd ../extension-frontend
npm install
```

### Step 2: Start Backend (Optional)

```bash
cd extension-backend
npm start
# Backend runs on http://localhost:5001
```

### Step 3: Build Extension

```bash
cd extension-frontend
npm run build
```

This creates a `dist/` folder with the extension files.

### Step 4: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `extension-frontend/dist/` folder
5. The EcoShopper extension should now appear in your extensions list

### Step 5: Test with Demo Page

1. Open `extension-frontend/public/demo-products.html` in Chrome
2. Click on any product card
3. Watch the floating eco-badge appear with full analysis
4. Try all features:
   - View EcoScore, CO₂ footprint, materials
   - See eco-friendly alternatives
   - Add to cart
   - Give feedback (thumbs up/down)
   - Upload proof image
   - Click extension icon to view dashboard

### Step 6: Test on Real Sites

1. Visit Amazon.com or Flipkart.com
2. Go to any product page
3. Wait 1-2 seconds for analysis
4. See the floating badge appear automatically

## 📁 Project Structure

```
software-hackathon/
├── extension-backend/          # Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── server.js
│   │   ├── models/            # Brand, Product, User models
│   │   ├── controllers/       # Business logic
│   │   ├── routes/            # API endpoints
│   │   └── seed/              # Sample data
│   └── package.json
│
├── extension-frontend/         # React + Vite Chrome Extension
│   ├── public/
│   │   ├── manifest.json      # Extension manifest (Manifest V3)
│   │   ├── content-enhanced.js # Enhanced content script with all features
│   │   ├── background.js      # Service worker
│   │   ├── demo-products.html # Demo/test page
│   │   └── content.css
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── EnhancedDashboard.jsx  # Full dashboard with charts
│   │   │   ├── ProductDetails.jsx     # Product view with map
│   │   │   ├── SupplyChainMap.jsx     # Interactive Leaflet map
│   │   │   ├── SettingsPanel.jsx
│   │   │   └── DevModeIndicator.jsx
│   │   ├── api/               # API client
│   │   └── utils/             # Chrome API helpers
│   └── package.json
│
└── README.md, DEPLOYMENT.md, etc.
```

## 🎯 Key Technologies

- **Frontend:** React 18, Vite, Lucide Icons, Chart.js, React-Leaflet
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Chrome APIs:** Storage, Tabs, Scripting, Runtime
- **Manifest:** V3 (latest Chrome extension standard)

## 🧪 Testing Features

### Test the EcoScore Algorithm
Products are scored 0-100 based on keywords:

**Positive keywords** (+5 to +15 points):
- recycled, organic, biodegradable, sustainable, bamboo, eco-friendly, etc.

**Negative keywords** (-8 to -15 points):
- plastic, disposable, single-use, toxic, non-recyclable, etc.

Try these test products in demo page:
1. **Disposable Plastic Bottles** → Low score (~25-35)
2. **Bamboo Toothbrush** → High score (~85-95)
3. **Cotton Blend T-Shirt** → Medium score (~55-65)

### Test Gamification
1. View 3 eco-friendly products → Earn "🌱 Eco Beginner" badge
2. View 10 products → Earn "🌿 Green Hero" badge
3. Accumulate 50 points → Level up!
4. Add 5 items to cart → Earn "♻️ Recycling Champion" badge

### Test Dashboard Charts
1. View products from different categories
2. Open extension popup
3. Navigate to Dashboard
4. See pie chart (categories) and bar chart (score distribution)
5. Check Green Points, EcoCoins, and CO₂ saved

### Test Supply Chain Map
1. Click any product in demo page or real site
2. Open extension popup
3. Navigate to Product Details
4. Scroll to "Material Journey" map
5. See animated route from origin to distribution

## 🎨 Design Features

- **Color-coded EcoScores:**
  - Green (80-100): Eco-friendly
  - Yellow (50-79): Moderate
  - Red (0-49): High carbon footprint

- **Floating Badge:**
  - Draggable
  - Auto-positioned bottom-right
  - Smooth animations
  - Collapsible sections

- **Responsive Design:**
  - Works on desktop and laptop screens
  - Mobile-friendly demo page
  - Adaptive charts and maps

## 🔧 Development Mode

Run the extension in development mode for rapid testing:

```bash
cd extension-frontend
npm run dev
```

Open http://localhost:5173 to test in browser without loading as extension.

## 📊 Data Storage

All data is stored in **localStorage**:
- `ecoShopHistory` - Product view history (last 100)
- `ecoShopCart` - Shopping cart items
- `ecoShopGreenPoints` - Total points earned
- `ecoShopEcoCoins` - Total coins earned
- `ecoShopFeedbacks` - User feedback records
- `ecoShopProofs` - Uploaded images (base64)

## 🌍 Supported Sites

- Amazon.com
- Amazon.in
- Flipkart.com
- Demo page (for testing)
- Localhost (for development)

## 🎓 Hackathon-Ready Features

This extension is **100% demo-ready** with:
- ✅ Live working demo page
- ✅ No backend dependency for core features
- ✅ Mock data for instant testing
- ✅ Visual appeal with animations and emojis
- ✅ Gamification to engage audience
- ✅ Real-world impact metrics
- ✅ Professional UI/UX
- ✅ Works offline

## 📝 Presentation Tips

1. **Start with demo page** - Shows all features instantly
2. **Highlight gamification** - Badges, levels, coins
3. **Show the map** - Visual supply chain journey
4. **Demonstrate impact tracker** - Real-world comparisons
5. **Live test on Amazon** - Show it works on real sites
6. **Show dashboard** - Charts and statistics

## 🐛 Troubleshooting

**Badge not appearing?**
- Check if extension is enabled in chrome://extensions/
- Refresh the page
- Check console for errors

**Charts not loading?**
- Make sure Chart.js is installed: `npm install chart.js react-chartjs-2`
- Check for JavaScript errors in console

**Map not displaying?**
- Verify Leaflet is installed: `npm install leaflet react-leaflet`
- Check internet connection (map tiles load from CDN)

**Extension not loading?**
- Rebuild: `npm run build`
- Reload extension in chrome://extensions/
- Check manifest.json for errors

## 📧 Support

For issues or questions, check:
- Browser console for errors
- Network tab for API failures
- Extension background page logs (chrome://extensions → Details → Inspect views)

## 🎉 Success Metrics

A successful demo shows:
- ✅ Badge appears on product pages
- ✅ EcoScore calculated correctly
- ✅ Dashboard displays charts
- ✅ Map shows animated journey
- ✅ Green points increase
- ✅ Badges are earned
- ✅ Feedback and cart work

## 🚀 Next Steps for Production

To make this production-ready:
1. Connect to real Carbon Interface API
2. Build comprehensive product database
3. Add user authentication
4. Implement cloud sync
5. Create browser store listing
6. Add more e-commerce sites
7. Enhance AI insights with ML model

---

**Built with 💚 for a sustainable future**

**Demo-ready in 24 hours | Fully functional | Hackathon-optimized**
