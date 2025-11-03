# 🔧 Fixing the 404 Error - Sustainability API

## ❌ Error You're Seeing

```
Failed to load carbon footprint data: Request failed with status code 404
```

---

## ✅ Solution: Start the Backend Server

The 404 error means the sustainability API endpoint cannot be found. This happens when the **backend server is not running**.

### **Step-by-Step Fix:**

#### **1. Open Terminal in Backend Folder**
```bash
cd c:\Users\Tejaswini Katamoni\sh\software-hackathon\extension-backend
```

#### **2. Ensure Dependencies are Installed**
```bash
npm install
```

#### **3. Check if .env File Exists**
```bash
# If .env doesn't exist, create it from example
copy .env.example .env
```

#### **4. Edit .env File**
Make sure it contains:
```bash
MONGODB_URI=mongodb://localhost:27017/eco-shopping
PORT=5001
CLIMATIQ_API_KEY=MT8EYPBK4D2BB417YDKQFNHRDR
FRONTEND_URL=http://localhost:5173
```

#### **5. Start MongoDB (if not running)**
```bash
# Open another terminal and run:
mongod
```

#### **6. Start the Backend Server**
```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5001
🌍 Environment: development
```

#### **7. Test the API**
Open a new terminal and test:
```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Eco Shopping API is running"
}
```

#### **8. Test Sustainability Endpoint**
```bash
curl http://localhost:5001/api/sustainability/categories
```

Expected response:
```json
{
  "success": true,
  "data": [
    { "name": "Refrigerator", "activityId": "..." },
    ...
  ]
}
```

#### **9. Refresh Your Extension**
- Go back to your Chrome Extension
- Click the "Try Again" button
- The carbon footprint should now load successfully!

---

## 🔍 Other Possible Issues

### **Issue 1: Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5001
```

**Solution:**
```bash
# Find and kill the process using port 5001
# Windows:
netstat -ano | findstr :5001
taskkill /PID <PID_NUMBER> /F

# Then restart the server
npm run dev
```

---

### **Issue 2: MongoDB Not Running**
```
MongooseError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
```bash
# Start MongoDB
mongod

# Or if using MongoDB as a service:
net start MongoDB
```

---

### **Issue 3: Missing Climatiq API Key**
```
Error: Climatiq API key not configured
```

**Solution:**
Add to `.env`:
```bash
CLIMATIQ_API_KEY=MT8EYPBK4D2BB417YDKQFNHRDR
```

---

### **Issue 4: CORS Error**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
Check `FRONTEND_URL` in backend `.env`:
```bash
FRONTEND_URL=http://localhost:5173
```

---

## 🧪 Quick Verification Checklist

- [ ] Backend server is running on port 5001
- [ ] MongoDB is running
- [ ] `.env` file exists with correct values
- [ ] `npm install` completed successfully
- [ ] No errors in backend terminal
- [ ] Health check endpoint responds: `http://localhost:5001/api/health`
- [ ] Sustainability endpoint responds: `http://localhost:5001/api/sustainability/categories`

---

## 📊 Expected Flow

```
Extension Frontend (localhost:5173)
         ↓
    API Request
         ↓
Backend Server (localhost:5001)
         ↓
/api/sustainability/calculate
         ↓
Climatiq API
         ↓
Response with CO₂ data
         ↓
Display in Extension
```

---

## 🎯 Test with Sample Request

Once the backend is running, test with:

```bash
curl -X POST http://localhost:5001/api/sustainability/calculate ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Product\",\"brand\":\"Test\",\"category\":\"Refrigerator\",\"energyConsumption\":250}"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "productId": "...",
    "carbonFootprint": {
      "value": 150.5,
      "unit": "kg"
    },
    "scores": {
      "carbonScore": 72,
      "ecoScore": "B"
    }
  }
}
```

---

## 💡 Pro Tips

1. **Keep Backend Running:** Always start the backend before using the extension
2. **Check Logs:** Watch the backend terminal for errors
3. **Use Dev Mode:** `npm run dev` auto-restarts on file changes
4. **Test Endpoints:** Use curl or Postman to verify APIs work

---

## 🆘 Still Having Issues?

### **Check Backend Logs**
Look for errors in the terminal where you ran `npm run dev`

### **Check Browser Console**
Open DevTools (F12) → Console tab → Look for error messages

### **Verify File Exists**
Make sure these files exist:
- `extension-backend/src/services/climatiqService.js`
- `extension-backend/src/controllers/sustainabilityController.js`
- `extension-backend/src/routes/sustainabilityRoutes.js`

### **Restart Everything**
1. Stop backend server (Ctrl+C)
2. Stop frontend (Ctrl+C)
3. Restart MongoDB
4. Start backend: `npm run dev`
5. Start frontend: `npm run dev`
6. Reload extension in Chrome

---

## ✅ Success!

Once fixed, you should see:
- ✅ Green "Carbon Footprint Analysis" card
- ✅ CO₂ emissions value
- ✅ Carbon score
- ✅ No error messages

**Happy sustainable shopping! 🌱**
