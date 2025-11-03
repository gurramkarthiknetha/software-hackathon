# 🚀 EcoShopper - 5 Minute Quick Start

## Installation (2 minutes)

```bash
# 1. Navigate to frontend folder
cd extension-frontend

# 2. Install dependencies (if not already done)
npm install

# 3. Build the extension
npm run build
```

## Load Extension in Chrome (1 minute)

1. Open Chrome and go to: `chrome://extensions/`
2. Toggle **"Developer mode"** ON (top-right corner)
3. Click **"Load unpacked"**
4. Select the folder: `extension-frontend/dist/`
5. ✅ Extension installed!

## Test It Now (2 minutes)

### Option 1: Demo Page (Fastest)

1. Open file in Chrome:
   ```
   extension-frontend/public/demo-products.html
   ```
   Or double-click the file to open it.

2. **Click any product card**
3. See the floating eco-badge appear! 🌱
4. Try these actions:
   - View EcoScore and carbon footprint
   - See material breakdown
   - Check eco-friendly alternatives
   - Click "Add to Eco Cart"
   - Give thumbs up/down feedback
   - Upload a proof image

5. **Click the extension icon** (top-right corner)
6. See your dashboard with:
   - Green Points earned
   - Charts and statistics
   - Badges unlocked
   - Impact tracker

### Option 2: Real Shopping Site

1. Go to Amazon.com or Flipkart.com
2. Open any product page
3. Wait 1-2 seconds
4. See the eco-badge appear automatically! 🌿

## What You'll See

### On Product Pages:
- **Floating Badge** (bottom-right)
  - EcoScore (0-100)
  - Color-coded: 🟢 Green = Good | 🟡 Yellow = Moderate | 🔴 Red = Bad
  - Carbon footprint (kg CO₂)
  - Materials detected
  - Recyclability rating (A-F)
  - AI insight
  - Eco alternatives (if score < 60)
  - Recycle tips

### In Extension Popup:
- **Dashboard Tab:**
  - Level and progress bar
  - Green Points, EcoCoins, CO₂ saved
  - Products viewed statistics
  - Interactive charts (pie + bar)
  - Badges earned
  - Impact tracker
  - Community stats
  - Eco news feed

- **Product Tab** (when viewing a product):
  - Detailed product analysis
  - Supply chain map with animated journey
  - Brand sustainability score
  - Certifications

- **Settings Tab:**
  - Theme toggle (light/dark)
  - Notification preferences
  - Eco shopping mode

## Demo Products to Try

The demo page includes 9 products with varying eco-scores:

| Product | Expected Score | Features |
|---------|---------------|----------|
| 🥤 Plastic Bottles | ~30 (Red) | Shows danger warning, high CO₂ |
| 🎋 Bamboo Toothbrush | ~92 (Green) | Perfect score, shows alternatives |
| 👕 Cotton Blend Shirt | ~60 (Yellow) | Moderate, shows improvement tips |
| 🌿 Organic Cotton Bags | ~90 (Green) | High score, recyclable |
| 💻 Gaming Laptop | ~35 (Red) | High emissions, non-eco |
| ♻️ Steel Water Bottle | ~88 (Green) | Excellent reusable option |

## Quick Tips

### Earn Green Points Fast:
- View products with EcoScore > 70 → +10 points each
- Add items to cart → Earn EcoCoins
- Give feedback → Help the community

### Unlock Badges:
- 🌱 Eco Beginner: View 3 products
- 🌿 Green Hero: View 10 products
- 🌎 Planet Saver: View 25 products
- ♻️ Recycling Champion: Add 5 items to cart
- 🏆 Eco Warrior: Earn 100 Green Points

### See the Map:
1. Click extension icon
2. Go to "Product" tab (when viewing a product)
3. Scroll to "Material Journey"
4. Watch the animated supply chain route!

## Troubleshooting

**Badge not showing?**
- Refresh the page
- Check extension is enabled: `chrome://extensions/`
- Open console (F12) and check for errors

**Charts not displaying?**
- View at least 1 product first
- Open dashboard tab
- Charts populate after data is collected

**Map not loading?**
- Check internet connection (map tiles load online)
- Try a different product
- Refresh the page

## Common Commands

```bash
# Rebuild extension after changes
npm run build

# Run in development mode (browser testing)
npm run dev

# Start backend (optional)
cd ../extension-backend
npm start
```

## What's Next?

After testing the demo:
1. ✅ Try on real Amazon/Flipkart pages
2. ✅ Collect multiple products to see charts
3. ✅ Unlock all badges
4. ✅ Compare different categories
5. ✅ Share with team/judges

## Presentation Demo Flow

Perfect 3-minute demo:

1. **Open demo page** → Click product → Badge appears (30s)
2. **Show features** → EcoScore, CO₂, materials, alternatives (45s)
3. **Add to cart + feedback** → Show interactivity (30s)
4. **Open dashboard** → Charts, badges, impact tracker (45s)
5. **Show map** → Product details → Animated journey (30s)

## Success Checklist

- ✅ Extension loads in Chrome
- ✅ Demo page shows badges
- ✅ EcoScore displays correctly
- ✅ Dashboard shows charts
- ✅ Map animation works
- ✅ Cart functionality works
- ✅ Badges are earned
- ✅ Feedback system works

---

**⏱️ Total Time: 5 minutes**  
**🎯 Status: Demo-Ready**  
**💚 Built for sustainable shopping**

For detailed documentation, see `DEMO_README.md`
