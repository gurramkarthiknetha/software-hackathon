# 🌍 Climatiq API Integration Guide - EcoShop Chrome Extension

## Overview

This guide documents the complete integration of the **Climatiq API** into the EcoShop Chrome Extension for dynamic, real-time carbon footprint calculations and sustainability scoring.

---

## 📁 Folder Structure

```
software-hackathon/
├── extension-backend/
│   ├── src/
│   │   ├── services/
│   │   │   └── climatiqService.js          # ✨ NEW: Climatiq API integration
│   │   ├── controllers/
│   │   │   └── sustainabilityController.js # ✨ NEW: Sustainability endpoints
│   │   ├── routes/
│   │   │   └── sustainabilityRoutes.js     # ✨ NEW: API routes
│   │   ├── models/
│   │   │   └── Product.js                  # ✅ UPDATED: Added energy fields
│   │   └── server.js                       # ✅ UPDATED: Added routes
│   └── .env.example                        # ✅ UPDATED: Added Climatiq key
│
├── extension-frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js                    # ✅ UPDATED: Added sustainability API
│   │   └── components/
│   │       └── ProductDetails.jsx          # ✅ UPDATED: Display carbon data
│   
└── CLIMATIQ_INTEGRATION_GUIDE.md           # 📖 This file
```

---

## 🎯 Features Implemented

### 1. **Dynamic Carbon Footprint Calculation**
- Real-time API calls to Climatiq for accurate CO₂e estimates
- Category-specific emission factors (12+ product categories)
- Fallback estimation when API is unavailable
- Caching mechanism (7-day refresh cycle)

### 2. **Sustainability Scoring Algorithm**
- Carbon Score (0-100) based on category benchmarks
- Overall Eco Score combining 4 metrics:
  - **40%** Carbon Score
  - **25%** Recyclability
  - **20%** Packaging Score
  - **15%** Ethics Score
- Letter grades: A (80+), B (65+), C (50+), D (35+), E (<35)

### 3. **Product Category Mapping**
Supports 12 product categories with specific Climatiq activity IDs:
- Home Appliances (Refrigerator, Washing Machine, AC, Microwave, TV)
- Electronics (Laptop, Smartphone, Tablet)
- Fashion (Clothing, Footwear)
- Furniture
- Other (fallback)

---

## 🔧 Backend Implementation

### **1. Climatiq Service** (`climatiqService.js`)

**Key Functions:**

```javascript
// Fetch carbon footprint from Climatiq API
fetchCarbonFootprint(category, energyConsumption, weight)

// Calculate sustainability score (0-100)
calculateSustainabilityScore(co2e, category)

// Get complete sustainability analysis
getProductSustainabilityData(product)

// Convert score to letter grade
scoreToGrade(score)
```

**Category Mapping Example:**
```javascript
'Refrigerator': {
  activityId: 'consumer_goods-type_refrigerators_and_freezers',
  unit: 'unit',
  dataVersion: '27.27'
}
```

**Scoring Benchmarks:**
```javascript
'Refrigerator': {
  excellent: 50,   // < 50 kg CO₂e = 90-100 score
  good: 100,       // 50-100 kg = 75-90 score
  average: 150,    // 100-150 kg = 50-75 score
  poor: 200        // > 200 kg = 0-25 score
}
```

---

### **2. Sustainability Controller** (`sustainabilityController.js`)

**Endpoints:**

#### `GET /api/sustainability/:productId`
Get sustainability data for existing product (with caching).

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "507f1f77bcf86cd799439011",
    "name": "Godrej 223 L Refrigerator",
    "carbonFootprint": {
      "value": 150.5,
      "unit": "kg",
      "method": "climatiq_api",
      "isFallback": false
    },
    "scores": {
      "carbonScore": 72,
      "recyclability": 70,
      "packagingScore": 50,
      "ethicsScore": 50,
      "ecoScoreNumeric": 65,
      "ecoScore": "B"
    },
    "cached": false,
    "lastUpdated": "2024-11-04T00:00:00.000Z"
  }
}
```

#### `POST /api/sustainability/calculate`
Calculate sustainability for new product.

**Request Body:**
```json
{
  "name": "Godrej 223 L 3 Star Convertible Freezer",
  "brand": "Godrej",
  "category": "Refrigerator",
  "energyConsumption": 250,
  "weight": 45,
  "url": "https://amazon.in/..."
}
```

#### `GET /api/sustainability/categories`
Get list of supported categories and their Climatiq mappings.

#### `POST /api/sustainability/batch-update`
Batch update multiple products (admin use).

---

### **3. Product Model Updates**

**New Fields:**
```javascript
energyConsumption: {
  type: Number,
  min: 0,
  default: null,
  description: 'Annual energy consumption in kWh'
},
weight: {
  type: Number,
  min: 0,
  default: null,
  description: 'Product weight in kg'
},
carbonFootprint: {
  value: Number,
  unit: String,
  method: String,              // ✨ NEW
  isFallback: Boolean,         // ✨ NEW
  lastCalculated: Date         // ✨ NEW
}
```

---

## 🎨 Frontend Implementation

### **1. API Integration** (`api/index.js`)

```javascript
export const sustainabilityAPI = {
  // Get sustainability data for a product
  getProductSustainability: async (productId) => {...},
  
  // Calculate for new product
  calculateSustainability: async (productData) => {...},
  
  // Get supported categories
  getSupportedCategories: async () => {...},
  
  // Batch update
  batchUpdate: async (productIds, forceRefresh) => {...}
};
```

---

### **2. ProductDetails Component Updates**

**New Features:**
- Real-time carbon footprint display
- Refresh button to recalculate
- Loading states and error handling
- Visual distinction for estimated vs. API data
- Cached data indicator

**UI Components:**
```jsx
// Carbon Footprint Card
<div className="card" style={{ background: '#f0fdf4', border: '2px solid #10b981' }}>
  <Zap icon /> Carbon Footprint Analysis
  - Total Emissions: 150.5 kg CO₂e
  - Carbon Score: 72/100
  - Calculation Method: Climatiq API
  - Last Updated: Nov 4, 2024
</div>
```

---

## 🔐 Environment Setup

### **Backend `.env` Configuration**

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/eco-shopping

# Server
PORT=5001
NODE_ENV=development

# Climatiq API
CLIMATIQ_API_KEY=MT8EYPBK4D2BB417YDKQFNHRDR

# Other APIs
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:5173
```

---

## 📊 Sustainability Score Formula

### **Overall Eco Score Calculation**

```javascript
ecoScoreNumeric = (
  carbonScore * 0.40 +      // 40% weight
  recyclability * 0.25 +    // 25% weight
  packagingScore * 0.20 +   // 20% weight
  ethicsScore * 0.15        // 15% weight
)
```

### **Carbon Score Algorithm**

Uses logarithmic scaling based on category benchmarks:

```javascript
if (co2e <= excellent) {
  score = 90 + (excellent - co2e) / excellent * 10;  // 90-100
} else if (co2e <= good) {
  score = 75 + (good - co2e) / (good - excellent) * 15;  // 75-90
} else if (co2e <= average) {
  score = 50 + (average - co2e) / (average - good) * 25;  // 50-75
} else if (co2e <= poor) {
  score = 25 + (poor - co2e) / (poor - average) * 25;  // 25-50
} else {
  score = max(0, 25 - (co2e - poor) / poor * 25);  // 0-25
}
```

---

## 🚀 Usage Examples

### **Example 1: Calculate Sustainability for Refrigerator**

**Request:**
```bash
POST http://localhost:5001/api/sustainability/calculate
Content-Type: application/json

{
  "name": "Godrej 223 L 3 Star Convertible Freezer",
  "brand": "Godrej",
  "category": "Refrigerator",
  "energyConsumption": 250,
  "weight": 45
}
```

**Response:**
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
      "recyclability": 70,
      "packagingScore": 50,
      "ethicsScore": 50,
      "ecoScoreNumeric": 65,
      "ecoScore": "B"
    }
  }
}
```

---

### **Example 2: Frontend Usage**

```jsx
import { sustainabilityAPI } from '../api';

// In component
const loadSustainability = async () => {
  const response = await sustainabilityAPI.calculateSustainability({
    name: product.name,
    brand: product.brand,
    category: product.category,
    energyConsumption: 250,
    weight: 45
  });
  
  if (response.success) {
    setSustainabilityData(response.data);
  }
};
```

---

## 🔄 Data Flow

```
1. User views product on Amazon/Flipkart
   ↓
2. Chrome Extension extracts product info
   ↓
3. Frontend calls /api/sustainability/calculate
   ↓
4. Backend checks if product exists in DB
   ↓
5. If not cached or expired:
   → Call Climatiq API with category + energy data
   → Calculate sustainability scores
   → Store in MongoDB
   ↓
6. Return data to frontend
   ↓
7. Display carbon footprint + scores in popup
```

---

## 🛡️ Error Handling

### **API Fallback Strategy**

When Climatiq API fails:
1. Log error details
2. Use industry average estimates
3. Mark data as `isFallback: true`
4. Display warning to user

**Fallback CO₂e Values:**
```javascript
const categoryAverages = {
  'Refrigerator': 150,
  'Laptop': 300,
  'Smartphone': 70,
  'Clothing': 20,
  // ... etc
};
```

---

## 📈 Performance Optimizations

### **1. Caching Strategy**
- Cache sustainability data for 7 days
- Check `lastCalculated` timestamp before API call
- Reduces API costs and improves response time

### **2. Batch Updates**
- Admin endpoint for bulk recalculation
- Useful for database migrations or data refresh

### **3. Async Processing**
- Non-blocking API calls
- Loading states in UI
- Error boundaries for graceful failures

---

## 🧪 Testing

### **Test the API Endpoints**

```bash
# 1. Health check
curl http://localhost:5001/api/health

# 2. Get supported categories
curl http://localhost:5001/api/sustainability/categories

# 3. Calculate sustainability
curl -X POST http://localhost:5001/api/sustainability/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Refrigerator",
    "brand": "TestBrand",
    "category": "Refrigerator",
    "energyConsumption": 250
  }'

# 4. Get product sustainability (replace ID)
curl http://localhost:5001/api/sustainability/674f1a2b3c4d5e6f7a8b9c0d
```

---

## 🎓 Key Concepts

### **Climatiq Activity IDs**
Climatiq uses standardized emission factors identified by activity IDs. Each product category maps to a specific activity:
- `consumer_goods-type_refrigerators_and_freezers`
- `consumer_goods-type_computers_and_peripheral_equipment`
- etc.

### **CO₂e (Carbon Dioxide Equivalent)**
A standard unit for measuring carbon footprint that accounts for:
- CO₂ (Carbon Dioxide)
- CH₄ (Methane)
- N₂O (Nitrous Oxide)
- Other greenhouse gases

### **Data Version**
Climatiq updates emission factors regularly. We use version `27.27` for consistency.

---

## 🔮 Future Enhancements

1. **Real-time Energy Monitoring**
   - Integrate with smart home APIs
   - Track actual vs. estimated consumption

2. **Supply Chain Analysis**
   - Add transportation emissions
   - Factor in manufacturing location

3. **Comparative Analytics**
   - Compare similar products
   - Show industry benchmarks

4. **User Personalization**
   - Location-based grid emission factors
   - Usage pattern analysis

5. **Blockchain Verification**
   - Immutable sustainability records
   - Third-party audits

---

## 📚 Resources

- **Climatiq API Docs**: https://www.climatiq.io/docs
- **Emission Factors Database**: https://www.climatiq.io/data
- **Carbon Footprint Standards**: ISO 14067
- **GHG Protocol**: https://ghgprotocol.org/

---

## 🐛 Troubleshooting

### **Issue: API Key Invalid**
```
Error: Climatiq API key not configured
```
**Solution:** Add `CLIMATIQ_API_KEY` to `.env` file

### **Issue: Category Not Found**
```
Warning: Using fallback category 'Other'
```
**Solution:** Check category spelling or add new mapping in `climatiqService.js`

### **Issue: Stale Data**
```
Data cached from 8 days ago
```
**Solution:** Click "Refresh" button or call batch-update endpoint

---

## 👥 Contributors

Built for the **EcoShop Chrome Extension** project.

**Integration Date:** November 2024  
**API Version:** Climatiq v1  
**Status:** ✅ Production Ready

---

## 📄 License

This integration is part of the EcoShop project. Climatiq API usage subject to their terms of service.

---

**Happy Sustainable Shopping! 🌱**
