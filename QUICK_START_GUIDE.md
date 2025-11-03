# 🚀 Quick Start Guide - Climatiq Integration

## Setup in 5 Minutes

### 1. **Backend Setup**

```bash
cd extension-backend

# Install dependencies (if not already done)
npm install

# Create .env file
cp .env.example .env

# Add your Climatiq API key to .env
# CLIMATIQ_API_KEY=MT8EYPBK4D2BB417YDKQFNHRDR

# Start the server
npm run dev
```

Server runs on: `http://localhost:5001`

---

### 2. **Frontend Setup**

```bash
cd extension-frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

### 3. **Test the Integration**

Open your browser and test the API:

```bash
# Test 1: Health Check
curl http://localhost:5001/api/health

# Test 2: Get Categories
curl http://localhost:5001/api/sustainability/categories

# Test 3: Calculate Carbon Footprint
curl -X POST http://localhost:5001/api/sustainability/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Godrej 223 L Refrigerator",
    "brand": "Godrej",
    "category": "Refrigerator",
    "energyConsumption": 250
  }'
```

---

## 📋 API Endpoints Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sustainability/categories` | List supported categories |
| `GET` | `/api/sustainability/:productId` | Get product sustainability data |
| `POST` | `/api/sustainability/calculate` | Calculate for new product |
| `POST` | `/api/sustainability/batch-update` | Batch update products |

---

## 🎯 Example Product Data

### **Refrigerator Example**
```json
{
  "name": "Godrej 223 L 3 Star Convertible Freezer",
  "brand": "Godrej",
  "category": "Refrigerator",
  "energyConsumption": 250,
  "weight": 45
}
```

**Expected Output:**
- Carbon Footprint: ~150 kg CO₂e
- Carbon Score: 70-75/100
- Eco Score: B

---

### **Laptop Example**
```json
{
  "name": "Dell XPS 13",
  "brand": "Dell",
  "category": "Laptop",
  "weight": 1.2
}
```

**Expected Output:**
- Carbon Footprint: ~300 kg CO₂e
- Carbon Score: 60-65/100
- Eco Score: B/C

---

### **Smartphone Example**
```json
{
  "name": "iPhone 15",
  "brand": "Apple",
  "category": "Smartphone",
  "weight": 0.171
}
```

**Expected Output:**
- Carbon Footprint: ~70 kg CO₂e
- Carbon Score: 65-70/100
- Eco Score: B

---

## 🔧 Supported Categories

1. **Refrigerator** - Home appliance, high energy
2. **Washing Machine** - Home appliance, medium energy
3. **Air Conditioner** - Home appliance, high energy
4. **Microwave** - Small appliance
5. **Television** - Electronics
6. **Laptop** - Electronics
7. **Smartphone** - Electronics
8. **Tablet** - Electronics
9. **Clothing** - Fashion (weight-based)
10. **Footwear** - Fashion
11. **Furniture** - Home goods (weight-based)
12. **Other** - Fallback category

---

## 💡 Frontend Usage

### **In React Component:**

```jsx
import { sustainabilityAPI } from '../api';

const MyComponent = () => {
  const [data, setData] = useState(null);

  const fetchSustainability = async () => {
    const response = await sustainabilityAPI.calculateSustainability({
      name: "Product Name",
      brand: "Brand",
      category: "Refrigerator",
      energyConsumption: 250
    });
    
    if (response.success) {
      setData(response.data);
      console.log('Carbon Footprint:', response.data.carbonFootprint.value);
      console.log('Eco Score:', response.data.scores.ecoScore);
    }
  };

  return (
    <div>
      <button onClick={fetchSustainability}>Calculate</button>
      {data && (
        <div>
          <h3>Carbon: {data.carbonFootprint.value} kg CO₂e</h3>
          <h3>Score: {data.scores.ecoScore}</h3>
        </div>
      )}
    </div>
  );
};
```

---

## 🐛 Common Issues

### **Issue 1: API Key Error**
```
Error: Climatiq API key not configured
```
**Fix:** Add `CLIMATIQ_API_KEY=your_key_here` to `.env`

---

### **Issue 2: CORS Error**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Fix:** Ensure `FRONTEND_URL=http://localhost:5173` in backend `.env`

---

### **Issue 3: MongoDB Connection**
```
MongooseError: connect ECONNREFUSED
```
**Fix:** Start MongoDB: `mongod` or check `MONGODB_URI` in `.env`

---

## 📊 Score Interpretation

| Score | Grade | Meaning |
|-------|-------|---------|
| 80-100 | A | Excellent - Minimal environmental impact |
| 65-79 | B | Good - Above average sustainability |
| 50-64 | C | Average - Room for improvement |
| 35-49 | D | Below Average - Consider alternatives |
| 0-34 | E | Poor - High environmental impact |

---

## 🎨 UI Components Available

The `ProductDetails` component now includes:

1. **Carbon Footprint Card** - Real-time Climatiq data
2. **Refresh Button** - Recalculate on demand
3. **Loading States** - Spinner during API calls
4. **Error Handling** - User-friendly error messages
5. **Fallback Indicators** - Shows when using estimates
6. **Cache Status** - Displays last update time

---

## 📦 Files Modified/Created

### **Backend:**
- ✨ `src/services/climatiqService.js` (NEW)
- ✨ `src/controllers/sustainabilityController.js` (NEW)
- ✨ `src/routes/sustainabilityRoutes.js` (NEW)
- ✅ `src/models/Product.js` (UPDATED)
- ✅ `src/server.js` (UPDATED)
- ✅ `.env.example` (UPDATED)

### **Frontend:**
- ✅ `src/api/index.js` (UPDATED)
- ✅ `src/components/ProductDetails.jsx` (UPDATED)

### **Documentation:**
- ✨ `CLIMATIQ_INTEGRATION_GUIDE.md` (NEW)
- ✨ `QUICK_START_GUIDE.md` (NEW)

---

## 🚀 Next Steps

1. **Test with Real Products**
   - Visit Amazon/Flipkart product pages
   - Check if extension captures data correctly

2. **Customize Categories**
   - Add more product categories in `climatiqService.js`
   - Update benchmarks for your region

3. **Enhance UI**
   - Add charts for carbon comparison
   - Show historical trends

4. **Deploy**
   - Set up production MongoDB
   - Deploy backend to Heroku/Railway
   - Publish Chrome Extension

---

## 📞 Need Help?

- **Climatiq Docs**: https://www.climatiq.io/docs
- **API Reference**: See `CLIMATIQ_INTEGRATION_GUIDE.md`
- **MongoDB Setup**: https://www.mongodb.com/docs/manual/installation/

---

**Happy Coding! 🎉**
