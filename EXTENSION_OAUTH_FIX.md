# 🔧 Chrome Extension OAuth Fix - Testing Guide

## ✅ What Was Fixed

**Problem:** OAuth authentication wasn't working properly in Chrome extension popup.

**Root Cause:** Extension popups can't redirect to external OAuth URLs. They close immediately when you navigate away.

**Solution:** 
- Open OAuth in a new tab instead of popup redirect
- Background service worker monitors OAuth callback
- Automatically saves token when callback is detected
- Extension reopens after successful authentication

---

## 🎯 How It Works Now

### In Browser (http://localhost:5173)
✅ Works as before - redirects to OAuth and back

### In Extension Popup
✅ **New Flow:**
1. Click "Sign in with Google" → Opens OAuth in NEW TAB
2. Complete Google OAuth in that tab
3. Redirected to `http://localhost:5173/?token=...`
4. Background worker detects callback and saves token
5. OAuth tab closes automatically
6. Extension dashboard opens

---

## 📦 Load Updated Extension

### Step 1: Navigate to Extensions Page
```
chrome://extensions/
```

### Step 2: Enable Developer Mode
Toggle "Developer mode" switch (top-right corner)

### Step 3: Load Extension
1. Click "Load unpacked"
2. Select folder: `/Users/karthikgurram/projects/software-hackathon/extension-frontend/dist/`
3. Extension should load successfully

### Step 4: Verify Installation
- ✅ Extension appears in extensions list
- ✅ EcoShop icon visible in toolbar
- ✅ No errors shown

---

## 🧪 Testing OAuth in Extension

### Test 1: First Time Login

1. **Click extension icon** in Chrome toolbar
2. **Should see:** Login screen in popup
3. **Click "Sign in with Google"**
   - Popup closes immediately (expected!)
   - New tab opens with Google OAuth
4. **Complete OAuth:**
   - Select your Google account
   - Grant permissions
5. **Redirected to:** `http://localhost:5173/?token=...`
6. **Background worker detects callback:**
   - Saves token to `chrome.storage.local`
   - Closes OAuth tab automatically
   - Opens extension dashboard in new tab
7. **Verify authentication:**
   - Should see your name and profile picture
   - Dashboard shows your data
   - No login screen

### Test 2: Persistent Login

1. **Close all extension tabs**
2. **Click extension icon again**
3. **Should see:** Dashboard directly (no login!)
4. **Verify:** User info in header

### Test 3: Logout

1. **Open extension dashboard**
2. **Click logout button** (🚪 icon)
3. **Should see:** Login screen
4. **Click extension icon**
5. **Should see:** Login screen (not dashboard)

### Test 4: Token Persistence

1. **Login to extension**
2. **Close Chrome completely**
3. **Reopen Chrome**
4. **Click extension icon**
5. **Should see:** Dashboard (still logged in!)

---

## 🔍 Debugging OAuth Flow

### Check Background Service Worker

1. Go to `chrome://extensions/`
2. Find EcoShop extension
3. Click "service worker" link
4. Open **Console** tab
5. Look for logs:
   ```
   🌱 EcoShop background service worker started
   ✅ OAuth callback detected, saving token...
   ✅ Authentication data saved to chrome.storage
   ```

### Check chrome.storage

In service worker console:
```javascript
// View stored data
chrome.storage.local.get(null, (data) => {
  console.log('Storage data:', data);
});

// Check if authenticated
chrome.storage.local.get(['token', 'user', 'isAuthenticated'], (data) => {
  console.log('Auth data:', data);
});
```

### Check Token Validity

```javascript
// Get token
chrome.storage.local.get(['token'], async (data) => {
  const token = data.token;
  console.log('Token:', token);
  
  // Verify with backend
  const response = await fetch('http://localhost:5001/api/auth/verify', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const result = await response.json();
  console.log('Verification result:', result);
});
```

---

## 🐛 Troubleshooting

### Issue: Popup shows login but nothing happens when clicking button

**Check:**
1. Open extension popup
2. Right-click → Inspect
3. Check Console for errors
4. Look for "tabs" permission error

**Solution:**
- Ensure manifest.json has `"tabs"` permission
- Reload extension after changes

### Issue: OAuth tab opens but doesn't close

**Check:**
1. Is backend running? `curl http://localhost:5001/api/health`
2. Check browser console in OAuth tab for errors
3. Check background service worker console for callback detection

**Solution:**
```javascript
// In background service worker console
chrome.tabs.query({}, (tabs) => {
  console.log('Open tabs:', tabs.map(t => ({ id: t.id, url: t.url })));
});
```

### Issue: "Token not found" after OAuth

**Check chrome.storage:**
```javascript
chrome.storage.local.get(['token', 'user'], (data) => {
  console.log('Stored auth:', data);
  if (!data.token) {
    console.error('Token not saved!');
  }
});
```

**Solution:**
1. Check background worker console for errors
2. Verify callback URL matches: `http://localhost:5173/?token=...`
3. Check `chrome.tabs.onUpdated` listener is working

### Issue: Extension doesn't open after OAuth

**Check:**
```javascript
// In background worker console after OAuth
chrome.tabs.query({}, (tabs) => {
  console.log('Tabs after OAuth:', tabs.length);
});
```

**Solution:**
- Manually open extension: `chrome://extensions/` → Click extension icon
- Check if token was saved in chrome.storage

---

## 📊 Expected Console Logs

### Background Service Worker (Success Flow)

```
🌱 EcoShop background service worker started
Message received: {type: "GET_USER_STATS"}
✅ OAuth callback detected, saving token...
✅ Authentication data saved to chrome.storage
Tab closed: 12345
New tab created: 12346
```

### Extension Popup (Before Login)

```
Checking authentication...
Token: null
Not authenticated - showing login
```

### Extension Popup (After Login)

```
Checking authentication...
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
User: {userId: "google_123...", name: "John Doe", role: "user"}
✅ Authenticated
```

---

## ✅ Success Checklist

Extension OAuth is working when:

- [ ] Clicking "Sign in with Google" opens NEW TAB (not redirect)
- [ ] OAuth completes in the new tab
- [ ] OAuth tab closes automatically after callback
- [ ] Extension dashboard opens in new tab
- [ ] User info displays in dashboard header
- [ ] Token persists after closing Chrome
- [ ] Clicking extension icon shows dashboard (not login)
- [ ] Logout clears token and shows login screen
- [ ] Can login again successfully

---

## 🎬 Demo Flow for Extension

1. **Fresh Install:**
   - Show: Extension installed message
   - Click icon → Login screen

2. **OAuth Login:**
   - Click "Sign in with Google"
   - Show: New tab opens (popup closes)
   - Complete Google OAuth
   - Show: Automatic redirect and tab closure
   - Show: Dashboard opens automatically

3. **Authenticated State:**
   - Click extension icon
   - Show: Dashboard (no login needed)
   - Show: User info in header
   - Show: Data and statistics

4. **Persistent Session:**
   - Close Chrome
   - Reopen Chrome
   - Click extension icon
   - Show: Still logged in!

5. **Logout:**
   - Click logout button
   - Show: Login screen
   - Show: Must login again

---

## 🔄 Comparison: Browser vs Extension

| Feature | Browser (localhost:5173) | Extension Popup |
|---------|--------------------------|-----------------|
| **OAuth Method** | Page redirect | New tab |
| **Popup Behavior** | N/A | Closes during OAuth |
| **Storage** | localStorage | chrome.storage.local |
| **Token Detection** | URL params | Background worker |
| **Post-OAuth** | Stay on same tab | New tab opens |

---

## 🎉 Test It Now!

### Quick Test Steps:

1. **Load extension:**
   ```
   chrome://extensions/ → Load unpacked → Select dist/ folder
   ```

2. **Click extension icon** (EcoShop in toolbar)

3. **Click "Sign in with Google"** 

4. **Complete OAuth in new tab**

5. **Watch:**
   - ✅ Tab closes automatically
   - ✅ Dashboard opens
   - ✅ User info displayed

**Extension OAuth is now fully functional!** 🚀

---

## 📚 Files Modified

1. **manifest.json** - Added `"identity"` permission
2. **background.js** - Added OAuth callback monitoring
3. **Login.jsx** - Opens OAuth in new tab for extension
4. **AuthCallback.jsx** - Saves to chrome.storage
5. **App.jsx** - Reads from chrome.storage
6. **chromeApi.js** - Already had chrome.storage support

---

## 💡 Technical Details

### Why This Approach?

**Chrome Extension Constraints:**
- Popups can't redirect (they close on navigation)
- OAuth requires user interaction
- Service workers can monitor all tabs

**Our Solution:**
- Use `chrome.tabs.create()` to open OAuth in new tab
- Use `chrome.tabs.onUpdated` to detect callback URL
- Use `chrome.storage.local` for persistent storage
- Automatically close OAuth tab after success

**Benefits:**
- ✅ Native Chrome extension experience
- ✅ Secure OAuth flow
- ✅ Persistent authentication
- ✅ Works across browser restarts
- ✅ Seamless user experience

---

## 🎯 Next Steps

1. Test extension with different Google accounts
2. Test role assignment (admin/brand_owner/user)
3. Test on real e-commerce sites (Amazon, Flipkart)
4. Test content script product detection
5. Verify all features work while authenticated

**Everything is ready for testing!** 🎊
