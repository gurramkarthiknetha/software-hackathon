# 🔧 Complete Fix Guide - 404 Error on /calculate

## 🎯 Current Situation

**Error:** `POST http://localhost:5001/api/sustainability/calculate 404 (Not Found)`

**Root Cause:** The backend server is running with OLD code that has routes in wrong order.

---

## ✅ SOLUTION: Restart Backend Server

### **Step 1: Stop the Backend**

Find your terminal running the backend and press:
```
Ctrl + C
```

### **Step 2: Restart Backend**

In the backend folder terminal:
```bash
cd c:\Users\Tejaswini Katamoni\sh\software-hackathon\extension-backend
npm run dev
```

### **Step 3: Verify It's Running**

You should see:
```
🚀 Server running on port 5001
🌍 Environment: development
```

---

## 🧪 Test the Fix

### **Test 1: Health Check**
```powershell
curl http://localhost:5001/api/health
```

Should return: `{"success":true,"message":"Eco Shopping API is running"}`

### **Test 2: Categories Endpoint**
```powershell
curl http://localhost:5001/api/sustainability/categories
```

Should return: List of supported categories

### **Test 3: Calculate Endpoint (PowerShell)**
```powershell
$body = @{
    name = "Test Product"
    brand = "Test Brand"
    category = "Electronics"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5001/api/sustainability/calculate" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

Should return: Success with carbon footprint data

---

## 🔄 Alternative: Kill and Restart

If you can't find the terminal:

### **Windows PowerShell:**
```powershell
# Find Node processes
Get-Process node

# Kill all Node processes
Stop-Process -Name node -Force

# Start backend again
cd c:\Users\Tejaswini Katamoni\sh\software-hackathon\extension-backend
npm run dev
```

---

## 📱 After Backend Restarts

### **In Your Chrome Extension:**

1. Click the **"Try Again"** button in the error message
2. OR refresh the product page
3. The carbon footprint should now load successfully!

---

## 🎨 What You Should See

After the fix, your extension will display:

```
✅ Carbon Footprint Analysis
   🌍 Total Carbon Emissions: XX.X kg CO₂e
   📊 Carbon Score: XX/100
   
   Calculation Method: Climatiq API
   Last updated: Nov 4, 2024
```

---

## 🐛 Troubleshooting

### **Still Getting 404?**

1. **Check backend terminal** - Any errors?
2. **Check port** - Is it really running on 5001?
3. **Check .env** - Does it have `PORT=5001`?
4. **Hard refresh extension** - Reload the extension in Chrome

### **Backend Won't Start?**

```bash
# Check if port is in use
netstat -ano | findstr :5001

# If something is using it, kill that process
taskkill /PID <PID_NUMBER> /F

# Then start backend
npm run dev
```

### **MongoDB Error?**

```bash
# Start MongoDB
mongod

# Or as service
net start MongoDB
```

---

## 📊 Technical Details

### **What Was Fixed:**

**Before (Wrong Order):**
```javascript
router.get('/:productId', getProductSustainability);  // Catches everything!
router.post('/calculate', calculateSustainability);   // Never reached
```

**After (Correct Order):**
```javascript
router.post('/calculate', calculateSustainability);   // Specific route first
router.get('/:productId', getProductSustainability);  // Parameterized last
```

### **Why Restart is Needed:**

- Node.js loads routes at startup
- Even with `--watch` flag, route order changes may not reload properly
- Manual restart ensures fresh route registration

---

## ✅ Success Checklist

- [ ] Backend server stopped (Ctrl+C)
- [ ] Backend server restarted (`npm run dev`)
- [ ] Health check passes
- [ ] Categories endpoint works
- [ ] Calculate endpoint works
- [ ] Extension shows carbon footprint
- [ ] No 404 errors

---

## 🎉 You're Done!

Once the backend restarts with the new route order, everything will work perfectly!

**The code is already fixed - you just need to restart the server!**

---

## 💡 Pro Tip

To avoid this in the future:

1. Always restart backend after route changes
2. Watch the terminal for reload messages
3. Test endpoints with curl/Postman before using in extension

---

**Need help? Check the backend terminal for error messages!**
