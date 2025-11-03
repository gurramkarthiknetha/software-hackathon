# 📁 Complete Folder Structure - EcoShop with Climatiq Integration

## 🌳 Project Tree

```
software-hackathon/
│
├── 📂 extension-backend/                    # Node.js/Express Backend
│   ├── 📂 src/
│   │   ├── 📂 config/
│   │   │   ├── database.js                  # MongoDB connection
│   │   │   └── passport.js                  # OAuth configuration
│   │   │
│   │   ├── 📂 controllers/
│   │   │   ├── productController.js         # Product CRUD operations
│   │   │   ├── userController.js            # User management
│   │   │   ├── brandController.js           # Brand operations
│   │   │   ├── authController.js            # Authentication
│   │   │   └── ✨ sustainabilityController.js  # NEW: Climatiq integration
│   │   │
│   │   ├── 📂 middleware/
│   │   │   └── auth.js                      # Authentication middleware
│   │   │
│   │   ├── 📂 models/
│   │   │   ├── Product.js                   # ✅ UPDATED: Added energy fields
│   │   │   ├── User.js                      # User schema
│   │   │   └── Brand.js                     # Brand schema
│   │   │
│   │   ├── 📂 routes/
│   │   │   ├── productRoutes.js             # Product endpoints
│   │   │   ├── userRoutes.js                # User endpoints
│   │   │   ├── brandRoutes.js               # Brand endpoints
│   │   │   ├── authRoutes.js                # Auth endpoints
│   │   │   ├── alternativesRoutes.js        # Alternatives API
│   │   │   ├── protectedRoutes.js           # Protected routes
│   │   │   └── ✨ sustainabilityRoutes.js      # NEW: Sustainability API
│   │   │
│   │   ├── 📂 services/
│   │   │   └── ✨ climatiqService.js           # NEW: Climatiq API service
│   │   │
│   │   ├── 📂 seed/
│   │   │   └── seedData.js                  # Database seeding
│   │   │
│   │   └── server.js                        # ✅ UPDATED: Added routes
│   │
│   ├── .env.example                         # ✅ UPDATED: Added Climatiq key
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
├── 📂 extension-frontend/                   # React Frontend
│   ├── 📂 public/
│   │   ├── 📂 icons/                        # Extension icons
│   │   ├── background.js                    # Background script
│   │   ├── content.js                       # Content script
│   │   ├── manifest.json                    # Extension manifest
│   │   └── ...
│   │
│   ├── 📂 src/
│   │   ├── 📂 api/
│   │   │   └── index.js                     # ✅ UPDATED: Added sustainabilityAPI
│   │   │
│   │   ├── 📂 assets/
│   │   │   └── styles.css                   # Global styles
│   │   │
│   │   ├── 📂 components/
│   │   │   ├── ProductDetails.jsx           # ✅ UPDATED: Carbon footprint display
│   │   │   ├── Dashboard.jsx                # User dashboard
│   │   │   ├── SupplyChainMap.jsx           # Supply chain visualization
│   │   │   ├── SustainableAlternatives.jsx  # Alternative products
│   │   │   └── ...
│   │   │
│   │   ├── 📂 pages/
│   │   │   ├── Popup.jsx                    # Extension popup
│   │   │   └── Dashboard.jsx                # Full dashboard
│   │   │
│   │   ├── App.jsx                          # Main app component
│   │   └── main.jsx                         # Entry point
│   │
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── index.html
│
├── 📄 README.md                             # Main project README
├── 📄 ✨ CLIMATIQ_INTEGRATION_GUIDE.md         # NEW: Technical documentation
├── 📄 ✨ QUICK_START_GUIDE.md                  # NEW: Setup guide
├── 📄 ✨ IMPLEMENTATION_SUMMARY.md             # NEW: Implementation summary
├── 📄 ✨ FOLDER_STRUCTURE.md                   # NEW: This file
└── 📄 ...other docs                         # Various documentation files
```

---

## 🔍 Key Files Explained

### **Backend - Core Files**

#### **1. `src/services/climatiqService.js` ✨ NEW**
**Purpose:** Core Climatiq API integration  
**Key Functions:**
- `fetchCarbonFootprint()` - Call Climatiq API
- `calculateSustainabilityScore()` - Compute 0-100 score
- `getProductSustainabilityData()` - Complete analysis
- `scoreToGrade()` - Convert to A-E grade

**Lines of Code:** ~400  
**Dependencies:** axios, dotenv

---

#### **2. `src/controllers/sustainabilityController.js` ✨ NEW**
**Purpose:** API endpoint handlers  
**Endpoints:**
- `GET /api/sustainability/:productId`
- `POST /api/sustainability/calculate`
- `POST /api/sustainability/batch-update`
- `GET /api/sustainability/categories`

**Lines of Code:** ~300  
**Dependencies:** Product model, climatiqService

---

#### **3. `src/routes/sustainabilityRoutes.js` ✨ NEW**
**Purpose:** Route definitions  
**Routes:** 4 endpoints  
**Lines of Code:** ~45

---

#### **4. `src/models/Product.js` ✅ UPDATED**
**Changes:**
- Added `energyConsumption` field (Number, kWh)
- Added `weight` field (Number, kg)
- Enhanced `carbonFootprint` with metadata
  - `method` (String)
  - `isFallback` (Boolean)
  - `lastCalculated` (Date)

---

#### **5. `src/server.js` ✅ UPDATED**
**Changes:**
- Imported `sustainabilityRoutes`
- Registered route: `app.use('/api/sustainability', sustainabilityRoutes)`
- Updated API documentation endpoint

---

#### **6. `.env.example` ✅ UPDATED**
**Added:**
```bash
CLIMATIQ_API_KEY=MT8EYPBK4D2BB417YDKQFNHRDR
```

---

### **Frontend - Core Files**

#### **1. `src/api/index.js` ✅ UPDATED**
**Added:** `sustainabilityAPI` object with 4 methods:
- `getProductSustainability(productId)`
- `calculateSustainability(productData)`
- `getSupportedCategories()`
- `batchUpdate(productIds, forceRefresh)`

**Lines Added:** ~30

---

#### **2. `src/components/ProductDetails.jsx` ✅ UPDATED**
**Changes:**
- Added state: `sustainabilityData`, `loadingSustainability`, `sustainabilityError`
- Added function: `loadSustainabilityData()`
- Added function: `refreshSustainabilityData()`
- Added UI: Carbon Footprint Analysis card
- Added UI: Loading spinner
- Added UI: Error display
- Added UI: Refresh button

**Lines Added:** ~100

---

### **Documentation Files**

#### **1. `CLIMATIQ_INTEGRATION_GUIDE.md` ✨ NEW**
**Content:**
- Complete technical documentation
- API reference
- Scoring algorithms
- Category mappings
- Data flow diagrams
- Testing instructions
- Troubleshooting guide

**Lines:** ~600

---

#### **2. `QUICK_START_GUIDE.md` ✨ NEW**
**Content:**
- 5-minute setup guide
- Quick API reference
- Example requests
- Common issues
- Frontend usage examples

**Lines:** ~300

---

#### **3. `IMPLEMENTATION_SUMMARY.md` ✨ NEW**
**Content:**
- What was built
- Key features
- Setup instructions
- Testing checklist
- Success metrics

**Lines:** ~400

---

#### **4. `FOLDER_STRUCTURE.md` ✨ NEW**
**Content:**
- Complete project tree
- File explanations
- Architecture overview

**Lines:** ~500 (this file)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Extension                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ProductDetails.jsx (React Component)               │   │
│  │  - Displays carbon footprint                        │   │
│  │  - Refresh button                                   │   │
│  │  - Loading/error states                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  api/index.js (API Client)                          │   │
│  │  - sustainabilityAPI.calculateSustainability()      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP Request
┌─────────────────────────────────────────────────────────────┐
│                    Express Backend (Node.js)                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  sustainabilityRoutes.js                            │   │
│  │  POST /api/sustainability/calculate                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  sustainabilityController.js                        │   │
│  │  - Validate request                                 │   │
│  │  - Check MongoDB cache                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  climatiqService.js                                 │   │
│  │  - Call Climatiq API                                │   │
│  │  - Calculate scores                                 │   │
│  │  - Handle fallbacks                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    Climatiq API                              │
│  https://api.climatiq.io/data/v1/estimate                   │
│  - Returns CO₂e emissions                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                          │
│  - Products collection                                       │
│  - Cached sustainability data                               │
│  - 7-day refresh cycle                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Models

### **Product Schema (MongoDB)**
```javascript
{
  _id: ObjectId,
  name: String,
  brand: String,
  category: String,
  url: String,
  imageUrl: String,
  
  // ✨ NEW FIELDS
  energyConsumption: Number,  // kWh
  weight: Number,             // kg
  
  // Scores
  carbonScore: Number,        // 0-100
  recyclability: Number,      // 0-100
  ethicsScore: Number,        // 0-100
  packagingScore: Number,     // 0-100
  ecoScore: String,           // A-E
  ecoScoreNumeric: Number,    // 0-100
  
  // ✨ ENHANCED FIELD
  carbonFootprint: {
    value: Number,            // kg CO₂e
    unit: String,             // "kg"
    method: String,           // "climatiq_api"
    isFallback: Boolean,      // true/false
    lastCalculated: Date      // timestamp
  },
  
  // Other fields...
  certifications: Array,
  alternatives: Array,
  viewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 Request/Response Flow

### **Example: Calculate Sustainability**

**1. User Request (Frontend)**
```javascript
const response = await sustainabilityAPI.calculateSustainability({
  name: "Godrej Refrigerator",
  brand: "Godrej",
  category: "Refrigerator",
  energyConsumption: 250
});
```

**2. HTTP Request**
```
POST http://localhost:5001/api/sustainability/calculate
Content-Type: application/json

{
  "name": "Godrej Refrigerator",
  "brand": "Godrej",
  "category": "Refrigerator",
  "energyConsumption": 250
}
```

**3. Backend Processing**
```
sustainabilityRoutes.js
  ↓
sustainabilityController.calculateSustainability()
  ↓
climatiqService.getProductSustainabilityData()
  ↓
climatiqService.fetchCarbonFootprint()
  ↓ HTTPS Request
Climatiq API
  ↓ Response: { co2e: 150.5, unit: "kg" }
climatiqService.calculateSustainabilityScore()
  ↓
Save to MongoDB
  ↓
Return to frontend
```

**4. Response**
```json
{
  "success": true,
  "data": {
    "productId": "674f1a2b3c4d5e6f7a8b9c0d",
    "carbonFootprint": {
      "value": 150.5,
      "unit": "kg",
      "method": "climatiq_api",
      "isFallback": false
    },
    "scores": {
      "carbonScore": 72,
      "ecoScore": "B"
    }
  }
}
```

---

## 🎨 UI Component Hierarchy

```
ProductDetails.jsx
│
├── Product Info Card
│   ├── Image
│   ├── Name
│   ├── Brand
│   └── Category
│
├── Sustainability Rating Card
│   ├── Eco Score Badge (A-E)
│   ├── Numeric Score (0-100)
│   └── Description
│
├── Sustainability Metrics Card
│   ├── Carbon Score
│   ├── Recyclability
│   ├── Ethics Score
│   └── Packaging Score
│
├── ✨ Carbon Footprint Analysis Card (NEW)
│   ├── Header
│   │   ├── Title + Icon
│   │   ├── Estimated Badge (if fallback)
│   │   └── Refresh Button
│   ├── Metrics Grid
│   │   ├── Total Emissions
│   │   └── Carbon Score
│   ├── Calculation Info
│   │   ├── Method
│   │   ├── Cache Status
│   │   └── Last Updated
│   └── Fallback Warning (if applicable)
│
├── Loading State (if loading)
│
├── Error State (if error)
│
├── Certifications Card
│
├── Greener Alternatives Card
│
└── Supply Chain Map Card
```

---

## 📦 Dependencies

### **Backend (package.json)**
```json
{
  "dependencies": {
    "express": "^5.1.0",
    "mongoose": "^8.19.2",
    "axios": "^1.6.2",        // For Climatiq API
    "dotenv": "^17.2.3",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.2",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0"
  }
}
```

### **Frontend (package.json)**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.2",
    "lucide-react": "^0.263.1"  // Icons (Zap, RefreshCw)
  }
}
```

---

## 🔐 Environment Variables

### **Backend (.env)**
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/eco-shopping

# Server
PORT=5001
NODE_ENV=development

# Authentication
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend
FRONTEND_URL=http://localhost:5173

# ✨ NEW: Climatiq API
CLIMATIQ_API_KEY=MT8EYPBK4D2BB417YDKQFNHRDR
```

---

## 📈 Code Statistics

### **Lines of Code Added/Modified:**

| File | Status | Lines |
|------|--------|-------|
| `climatiqService.js` | ✨ NEW | ~400 |
| `sustainabilityController.js` | ✨ NEW | ~300 |
| `sustainabilityRoutes.js` | ✨ NEW | ~45 |
| `Product.js` | ✅ UPDATED | +20 |
| `server.js` | ✅ UPDATED | +5 |
| `.env.example` | ✅ UPDATED | +3 |
| `api/index.js` | ✅ UPDATED | +30 |
| `ProductDetails.jsx` | ✅ UPDATED | +100 |
| **Documentation** | ✨ NEW | ~1800 |
| **TOTAL** | | **~2703** |

---

## 🎯 Integration Points

### **1. Backend → Climatiq API**
- **File:** `climatiqService.js`
- **Method:** `axios.post()`
- **Endpoint:** `https://api.climatiq.io/data/v1/estimate`
- **Auth:** Bearer token

### **2. Backend → MongoDB**
- **File:** `sustainabilityController.js`
- **Model:** `Product`
- **Operations:** Find, Create, Update

### **3. Frontend → Backend**
- **File:** `api/index.js`
- **Method:** `axios.post()`
- **Endpoint:** `http://localhost:5001/api/sustainability/calculate`

### **4. Component → API**
- **File:** `ProductDetails.jsx`
- **Function:** `loadSustainabilityData()`
- **API:** `sustainabilityAPI.calculateSustainability()`

---

## 🚀 Deployment Structure

### **Production Setup:**
```
┌─────────────────────────────────────────┐
│  Chrome Web Store                       │
│  - Published Extension                  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Frontend (Static Hosting)              │
│  - Netlify / Vercel                     │
│  - Extension files                      │
└─────────────────────────────────────────┘
              ↓ API Calls
┌─────────────────────────────────────────┐
│  Backend (Node.js Server)               │
│  - Heroku / Railway / AWS               │
│  - Express + Climatiq integration       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  MongoDB Atlas                          │
│  - Cloud database                       │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist for Developers

### **Setup:**
- [ ] Clone repository
- [ ] Install backend dependencies (`npm install`)
- [ ] Install frontend dependencies (`npm install`)
- [ ] Create `.env` file with Climatiq API key
- [ ] Start MongoDB
- [ ] Start backend server
- [ ] Start frontend dev server

### **Testing:**
- [ ] Test `/api/health` endpoint
- [ ] Test `/api/sustainability/categories`
- [ ] Test calculate endpoint with sample data
- [ ] Open Chrome Extension popup
- [ ] View product on Amazon/Flipkart
- [ ] Verify carbon footprint displays
- [ ] Test refresh button
- [ ] Check error handling

### **Deployment:**
- [ ] Set production environment variables
- [ ] Deploy backend to hosting service
- [ ] Set up MongoDB Atlas
- [ ] Build Chrome Extension
- [ ] Test in production
- [ ] Submit to Chrome Web Store

---

**This folder structure represents a complete, production-ready integration! 🎉**
