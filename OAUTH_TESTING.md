# 🔐 Authentication Testing Guide

## ✅ Implementation Complete!

Your EcoShop extension now requires Google OAuth authentication before users can access any features.

---

## 🌐 Services Running

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | http://localhost:5173 | ✅ Running |
| **Backend** | http://localhost:5001 | ✅ Running |
| **MongoDB** | Connected | ✅ Connected |

---

## 🧪 Testing Authentication Flow

### Step 1: Visit Frontend

Open browser: **`http://localhost:5173`**

**✅ You Should See:**
- Login screen with "Sign in with Google" button
- EcoShop logo and branding
- Features list (Track footprint, Earn badges, etc.)
- Privacy notice

**❌ You Should NOT See:**
- Dashboard
- Product details
- Any user data

---

### Step 2: Click "Sign in with Google"

**What Happens:**
1. Redirected to: `http://localhost:5001/api/auth/google`
2. Google OAuth consent screen appears
3. Select your Google account
4. Grant permissions
5. Redirected back with token

**Callback URL:**
```
http://localhost:5173/?token=YOUR_JWT_TOKEN&userId=...&role=...
```

---

### Step 3: Role Assignment

Your role is automatically assigned based on email:

| Email Location | Role | Access |
|----------------|------|--------|
| In `ADMIN_EMAILS` | `admin` | All features |
| In `BRAND_OWNER_EMAILS` | `brand_owner` | Brand management |
| Not in any list | `user` | Basic features |

**Test Different Roles:**

Edit `.env`:
```env
# Test admin access
ADMIN_EMAILS=your.actual.email@gmail.com

# Test brand owner access  
BRAND_OWNER_EMAILS=another.email@gmail.com
```

Then restart backend:
```bash
cd extension-backend
npm run dev
```

---

### Step 4: After Login

**✅ You Should See:**

1. **Header with User Info:**
   - Profile picture
   - Your name
   - Your role badge
   - Logout button

2. **Dashboard Tab:**
   - Eco statistics
   - Carbon tracker
   - Badges
   - Charts

3. **Settings Tab:**
   - Preferences
   - Notifications
   - Dark mode

4. **Product Tab** (when viewing products):
   - Sustainability ratings
   - Alternatives
   - Certifications

---

### Step 5: Test Persistence

1. Close browser tab
2. Reopen `http://localhost:5173`
3. **✅ You should still be logged in**
4. Dashboard loads automatically

---

### Step 6: Test Logout

1. Click logout button (🚪 icon) in header
2. **✅ You should be:**
   - Redirected to login screen
   - Token cleared from browser
   - Cannot access dashboard

---

## 📋 Complete Testing Checklist

### ✅ Initial Load Test
- [ ] Visit `http://localhost:5173`
- [ ] See login screen (NOT dashboard)
- [ ] "Sign in with Google" button visible
- [ ] No user data accessible

### ✅ OAuth Flow Test
- [ ] Click "Sign in with Google"
- [ ] Redirected to Google
- [ ] Select account
- [ ] Grant permissions
- [ ] Successfully redirected back

### ✅ After Login Test
- [ ] Dashboard loads automatically
- [ ] User info in header
- [ ] Profile picture displayed
- [ ] Role shown correctly
- [ ] All tabs accessible

### ✅ Persistence Test
- [ ] Close and reopen tab
- [ ] Still authenticated
- [ ] No login required
- [ ] Data persists

### ✅ Logout Test
- [ ] Click logout button
- [ ] Redirected to login
- [ ] Cannot access dashboard
- [ ] Must login again

### ✅ Security Test
- [ ] Open DevTools → Application → Local Storage
- [ ] Manually delete `token`
- [ ] Refresh page
- [ ] Redirected to login ✅

---

## 🎯 Test Different User Roles

### Test as Admin

1. **Update `.env`:**
   ```env
   ADMIN_EMAILS=your.gmail.address@gmail.com
   ```

2. **Restart backend**

3. **Delete existing user** (optional):
   ```javascript
   // In MongoDB
   db.users.deleteOne({ email: "your.gmail.address@gmail.com" })
   ```

4. **Login at:** `http://localhost:5173`

5. **Verify role:** Should see `admin` badge

6. **Test admin API:**
   ```bash
   TOKEN="your_token_from_localStorage"
   
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:5001/api/admin/dashboard
   
   # Should return admin statistics ✅
   ```

### Test as Brand Owner

Same steps as above, but use:
```env
BRAND_OWNER_EMAILS=your.email@gmail.com
```

Test with:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5001/api/brand/dashboard
```

### Test as Regular User

Login with email NOT in either list.

Should see `user` role.

Admin/Brand APIs should return 403:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5001/api/admin/dashboard

# Returns: 403 Forbidden ✅
```

---

## 🐛 Common Issues & Solutions

### Issue: "redirect_uri_mismatch"

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Add redirect URI: `http://localhost:5001/api/auth/google/callback`
3. Wait 5 minutes
4. Try again

### Issue: Login button doesn't work

**Check:**
```bash
# Is backend running?
curl http://localhost:5001/api/health

# Check browser console for errors
# Check Network tab for failed requests
```

### Issue: Role not updating

**Solution:**
1. Update `.env` with your email
2. Restart backend
3. Delete user from MongoDB
4. Login again

### Issue: Token expired

**Solution:**
```javascript
// In browser console
localStorage.clear();
// Then login again
```

---

## 🔍 Verify in Browser Console

### Check Authentication Status

```javascript
// Open browser console (F12)

// Check token
console.log('Token:', localStorage.getItem('token'));

// Check user data
console.log('User:', JSON.parse(localStorage.getItem('user')));

// Check role
console.log('Role:', localStorage.getItem('userRole'));
```

### Test API Call

```javascript
const token = localStorage.getItem('token');

// Get current user
fetch('http://localhost:5001/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('User:', data));

// Test admin access
fetch('http://localhost:5001/api/admin/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('Admin data:', data))
.catch(err => console.log('Access denied (expected if not admin)'));
```

---

## 📱 Chrome Extension Testing

### Load Extension

1. Build:
   ```bash
   cd extension-frontend
   npm run build
   ```

2. Load in Chrome:
   - `chrome://extensions/`
   - Enable "Developer mode"
   - "Load unpacked"
   - Select `dist/` folder

3. Click extension icon
   - Should show login screen
   - OAuth opens in new tab
   - After login, returns to extension

---

## ✅ Success Indicators

Authentication is working correctly when:

1. ✅ Login screen shows on first visit
2. ✅ Google OAuth completes successfully  
3. ✅ Dashboard loads after authentication
4. ✅ User info displays in header
5. ✅ Role assigned correctly
6. ✅ Authentication persists across refreshes
7. ✅ Logout works and clears session
8. ✅ Cannot access dashboard without login
9. ✅ API routes require valid token
10. ✅ Role-based routes enforce permissions

---

## 🎬 Demo Flow

1. Show login screen → Can't access features
2. Click "Sign in with Google" → OAuth flow
3. Show authenticated dashboard → All features accessible
4. Show user info in header → Profile & role
5. Click logout → Back to login screen
6. Try to access dashboard → Blocked, must login

---

## 🎉 Ready to Test!

**Open now:** http://localhost:5173

You should see the login screen requiring Google authentication! 🔐

---

## 📚 More Documentation

- `OAUTH_SETUP.md` - Complete setup guide
- `OAUTH_IMPLEMENTATION.md` - Implementation details
- `OAUTH_QUICK_REFERENCE.md` - Quick reference guide
