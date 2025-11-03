# 🚀 Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js v16+ installed (`node --version`)
- ✅ MongoDB running locally or Atlas URI ready
- ✅ Chrome browser installed

## Step-by-Step Setup (5 minutes)

### 1️⃣ Backend Setup (2 minutes)

\`\`\`bash
# Navigate to backend
cd extension-backend

# Install dependencies
npm install

# Start MongoDB (if local)
# On macOS: brew services start mongodb-community
# On Windows: net start MongoDB
# On Linux: sudo systemctl start mongod

# Seed the database with sample data
npm run seed

# Start the backend server
npm run dev
\`\`\`

✅ Backend should be running on http://localhost:5000

### 2️⃣ Frontend Setup (2 minutes)

\`\`\`bash
# Open a new terminal
cd extension-frontend

# Install dependencies  
npm install

# Build the extension
npm run build
\`\`\`

✅ Extension files should be in `extension-frontend/dist/`

### 3️⃣ Load Extension in Chrome (1 minute)

1. Open Chrome and go to `chrome://extensions/`
2. Toggle **Developer mode** ON (top right corner)
3. Click **Load unpacked**
4. Navigate to and select `extension-frontend/dist` folder
5. ✅ Extension loaded! You should see the EcoShop icon in your toolbar

### 4️⃣ Test the Extension

**Test on Amazon:**
1. Go to any Amazon product page, e.g., https://www.amazon.com/dp/B08N5WRWNW
2. Wait a few seconds for the eco-score badge to appear on the right side
3. Click "View Details & Alternatives" button
4. Or click the extension icon to see your dashboard

**Test on Flipkart:**
1. Go to any Flipkart product page
2. The badge should appear automatically

### 5️⃣ Common Issues & Fixes

**Issue: Backend won't start**
- Solution: Check if MongoDB is running
- Solution: Verify .env file exists with correct MongoDB URI

**Issue: Extension won't load**
- Solution: Make sure you selected the `dist` folder, not the root folder
- Solution: Check for build errors in terminal

**Issue: Badge doesn't appear**
- Solution: Check backend is running on port 5000
- Solution: Open browser console (F12) for error messages
- Solution: Refresh the product page

**Issue: "Failed to fetch" errors**
- Solution: Check CORS is enabled in backend
- Solution: Verify API_BASE_URL in content.js and background.js

## 🧪 Quick Test Checklist

- [ ] Backend server starts without errors
- [ ] Database seeded successfully (check MongoDB Compass)
- [ ] Extension builds without errors
- [ ] Extension loads in Chrome
- [ ] Badge appears on Amazon/Flipkart product pages
- [ ] Clicking badge opens details
- [ ] Extension popup shows dashboard
- [ ] Settings can be changed and saved

## 📝 Development Workflow

**Backend Changes:**
\`\`\`bash
cd extension-backend
npm run dev  # Auto-reloads on file changes
\`\`\`

**Frontend Changes:**
\`\`\`bash
cd extension-frontend
npm run build  # Rebuild after changes
# Then reload extension in chrome://extensions/
\`\`\`

**Adding New Products:**
\`\`\`bash
cd extension-backend
# Edit src/seed/seedData.js
npm run seed  # Re-run seed script
\`\`\`

## 🎯 Next Steps

1. **Customize Data**: Edit `extension-backend/src/seed/seedData.js` to add your own products
2. **Modify UI**: Change React components in `extension-frontend/src/components/`
3. **Add Features**: Extend backend API in `extension-backend/src/controllers/`
4. **Style Changes**: Update CSS in `extension-frontend/src/` files

## 🆘 Need Help?

- Check the main README.md for detailed documentation
- Review API documentation for endpoint details
- Open browser console for debugging
- Check backend terminal for API errors

---

Happy Coding! 🌱
