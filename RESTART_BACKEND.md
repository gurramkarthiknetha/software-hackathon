# 🔄 RESTART BACKEND SERVER - CRITICAL!

## ⚠️ IMPORTANT: You MUST restart the backend server!

The route order has been fixed in the code, but the **running server still has the old routes**.

---

## 🚀 How to Restart

### **Option 1: If Backend is Running in Terminal**

1. Find the terminal where backend is running
2. Press `Ctrl + C` to stop the server
3. Run: `npm run dev`
4. Wait for: `🚀 Server running on port 5001`

### **Option 2: If Using VS Code Terminal**

1. Click on the terminal tab with backend
2. Press `Ctrl + C`
3. Type: `npm run dev`
4. Press Enter

### **Option 3: If You Can't Find the Terminal**

1. Open Task Manager (Ctrl + Shift + Esc)
2. Find "Node.js" process
3. End task
4. Open new terminal in `extension-backend` folder
5. Run: `npm run dev`

---

## ✅ Verification

After restarting, you should see:

```
🚀 Server running on port 5001
🌍 Environment: development
```

Then test:

```powershell
# In PowerShell:
Invoke-WebRequest -Uri "http://localhost:5001/api/sustainability/categories" -Method GET
```

Should return list of categories (not an error).

---

## 🎯 Why This is Necessary

**Node.js doesn't auto-reload route changes!**

- ✅ Code files updated: `sustainabilityRoutes.js`
- ❌ Running server: Still using old route order
- ✅ Solution: Restart to load new code

---

## 📋 Step-by-Step Checklist

- [ ] Find terminal running backend
- [ ] Press Ctrl+C to stop
- [ ] Run `npm run dev`
- [ ] See "Server running on port 5001"
- [ ] Test health endpoint
- [ ] Reload Chrome Extension
- [ ] Click "Try Again" button
- [ ] See carbon footprint data ✅

---

## 🆘 Still Getting 404?

If you still get 404 after restarting:

1. **Check the terminal output** - Look for any errors
2. **Verify port 5001** - Make sure nothing else is using it
3. **Check .env file** - Ensure `PORT=5001`
4. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)

---

## 🎉 Success Looks Like

After restart, your extension should show:

```
✅ Carbon Footprint Analysis
   🌍 Total Carbon Emissions: XX.X kg
   📊 Carbon Score: XX/100
```

**No more 404 errors!**
