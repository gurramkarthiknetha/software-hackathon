# 🔐 Google OAuth Authentication Setup Guide

## Overview

This guide will help you set up Google OAuth 2.0 authentication with role-based access control (Admin, Brand Owner, User) in the EcoShopper backend.

---

## 📋 Table of Contents

1. [Installation](#installation)
2. [Environment Configuration](#environment-configuration)
3. [Google Cloud Console Setup](#google-cloud-console-setup)
4. [Testing the Implementation](#testing-the-implementation)
5. [API Endpoints](#api-endpoints)
6. [Frontend Integration](#frontend-integration)
7. [Role-Based Access Control](#role-based-access-control)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Installation

The required packages are already installed. If you need to reinstall them:

```bash
cd extension-backend
npm install passport passport-google-oauth20 jsonwebtoken cookie-parser express-session
```

**Packages installed:**
- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth 2.0 strategy
- `jsonwebtoken` - JWT token generation and verification
- `cookie-parser` - Parse cookies
- `express-session` - Session management

---

## ⚙️ Environment Configuration

The `.env` file has been updated with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://hackergkn:karthik@hackathon.xkjyqhh.mongodb.net/eco_friendly_ecommerce
PORT=5001

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_this_in_production

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Session Secret
SESSION_SECRET=your_session_secret_key_change_this_in_production

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:5173

# Role-Based Email Lists (comma-separated, no spaces)
ADMIN_EMAILS=admin1@example.com,admin2@example.com
BRAND_OWNER_EMAILS=brand1@company.com,brand2@company.com

NODE_ENV=development
```

### Important Notes:

1. **JWT_SECRET**: Change this to a strong random string in production
2. **SESSION_SECRET**: Change this to a different strong random string in production
3. **ADMIN_EMAILS**: Add actual admin email addresses (comma-separated, no spaces)
4. **BRAND_OWNER_EMAILS**: Add brand owner email addresses
5. **GOOGLE_CALLBACK_URL**: Update when deploying to production

---

## 🔧 Google Cloud Console Setup

Your Google OAuth credentials are already configured, but here's how they were set up:

### Steps (for reference or to create new credentials):

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Create a new project or select an existing one

3. Enable Google+ API:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "EcoShopper Authentication"

5. Configure Authorized redirect URIs:
   - **Development:** `http://localhost:5001/api/auth/google/callback`
   - **Production:** `https://your-domain.com/api/auth/google/callback`

6. Copy the Client ID and Client Secret to your `.env` file

### Current Configuration:

- **Client ID:** `your_google_client_id_here` (Get from Google Cloud Console)
- **Callback URL:** `http://localhost:5001/api/auth/google/callback`

---

## 🧪 Testing the Implementation

### 1. Start the Backend Server

```bash
cd extension-backend
npm run dev
```

You should see:
```
🚀 Server running on port 5001
🌍 Environment: development
MongoDB Connected: ...
```

### 2. Test OAuth Flow

#### Option A: Using Browser

1. Open: `http://localhost:5001/api/auth/google`
2. You'll be redirected to Google login
3. After successful login, you'll be redirected to your frontend with a token

#### Option B: Using curl/Postman

**Step 1: Check server health**
```bash
curl http://localhost:5001/api/health
```

**Step 2: Check auth status**
```bash
curl http://localhost:5001/api/auth/status
```

### 3. Test Protected Routes

After logging in and receiving a JWT token:

**Test with Bearer Token:**
```bash
# Get current user
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/auth/me

# Get user profile
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/user/profile

# Admin dashboard (requires admin role)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/admin/dashboard

# Brand dashboard (requires brand_owner or admin role)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/brand/dashboard
```

---

## 🌐 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/auth/google` | Start Google OAuth flow | Public |
| GET | `/api/auth/google/callback` | OAuth callback URL | Public |
| GET | `/api/auth/me` | Get current user | Private |
| GET | `/api/auth/verify` | Verify JWT token | Private |
| GET | `/api/auth/status` | Check auth status | Public |
| POST | `/api/auth/logout` | Logout user | Private |
| GET | `/api/auth/logout` | Logout (GET method) | Private |

### Admin Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/dashboard` | Admin statistics | Admin only |
| GET | `/api/admin/users` | List all users | Admin only |
| PUT | `/api/admin/users/:userId/role` | Update user role | Admin only |
| DELETE | `/api/admin/users/:userId` | Delete user | Admin only |

### Brand Owner Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/brand/dashboard` | Brand dashboard | Brand Owner/Admin |
| GET | `/api/brand/products` | Brand products | Brand Owner/Admin |
| PUT | `/api/brand/products/:id` | Update product | Brand Owner/Admin |

### User Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/user/profile` | Get profile | Authenticated |
| PUT | `/api/user/profile` | Update profile | Authenticated |

---

## 💻 Frontend Integration

### React/Next.js Example

#### 1. Create an Auth Context

```javascript
// contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    // Redirect to Google OAuth
    window.location.href = 'http://localhost:5001/api/auth/google';
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:5001/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const handleCallback = (tokenFromUrl) => {
    localStorage.setItem('token', tokenFromUrl);
    setToken(tokenFromUrl);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, handleCallback }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

#### 2. Create OAuth Callback Page

```javascript
// pages/auth/callback.jsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const { handleCallback } = useAuth();

  useEffect(() => {
    const { token, error } = router.query;

    if (error) {
      console.error('OAuth error:', error);
      router.push('/login?error=' + error);
      return;
    }

    if (token) {
      handleCallback(token);
      router.push('/dashboard');
    }
  }, [router.query]);

  return (
    <div>
      <h1>Authenticating...</h1>
      <p>Please wait while we log you in.</p>
    </div>
  );
}
```

#### 3. Create Login Component

```javascript
// components/LoginButton.jsx
import { useAuth } from '../contexts/AuthContext';

export default function LoginButton() {
  const { user, login, logout, loading } = useAuth();

  if (loading) {
    return <button disabled>Loading...</button>;
  }

  if (user) {
    return (
      <div>
        <span>Welcome, {user.name}!</span>
        <span>Role: {user.role}</span>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <button onClick={login}>
      Sign in with Google
    </button>
  );
}
```

#### 4. Protected API Calls

```javascript
// utils/api.js
const API_BASE = 'http://localhost:5001/api';

export async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('token');
    window.location.href = '/login';
    return;
  }

  return response.json();
}

// Example usage
export async function getUserProfile() {
  return fetchWithAuth('/user/profile');
}

export async function getAdminDashboard() {
  return fetchWithAuth('/admin/dashboard');
}
```

### Chrome Extension Integration

```javascript
// extension-frontend/src/components/Login.jsx
import { useState, useEffect } from 'react';

export default function Login() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    chrome.storage.local.get(['token', 'user'], (result) => {
      if (result.token && result.user) {
        setUser(result.user);
      }
    });
  }, []);

  const handleLogin = () => {
    // Open OAuth flow in new tab
    chrome.tabs.create({
      url: 'http://localhost:5001/api/auth/google'
    });
  };

  const handleLogout = async () => {
    const token = await chrome.storage.local.get(['token']);
    
    await fetch('http://localhost:5001/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.token}`
      }
    });

    chrome.storage.local.remove(['token', 'user']);
    setUser(null);
  };

  if (user) {
    return (
      <div>
        <img src={user.profilePicture} alt="Profile" />
        <p>{user.name}</p>
        <p>Role: {user.role}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return <button onClick={handleLogin}>Sign in with Google</button>;
}
```

---

## 🔐 Role-Based Access Control

### Role Hierarchy

1. **User** (default)
   - Can view products
   - Can save favorites
   - Can track their carbon footprint
   - Can update their own profile

2. **Brand Owner**
   - All user permissions
   - Can view their brand dashboard
   - Can update their brand's products
   - Can see analytics for their brands

3. **Admin**
   - All permissions
   - Can manage all users
   - Can change user roles
   - Can delete users
   - Can access admin dashboard

### How Roles Are Assigned

Roles are automatically assigned based on email address during OAuth login:

1. User logs in with Google
2. System checks their email against `ADMIN_EMAILS` and `BRAND_OWNER_EMAILS`
3. Role is assigned accordingly:
   - Email in `ADMIN_EMAILS` → **admin**
   - Email in `BRAND_OWNER_EMAILS` → **brand_owner**
   - Otherwise → **user**

### Using Middleware in Your Routes

```javascript
import { requireAuth, requireRole } from './middleware/auth.js';

// Public route - no authentication
app.get('/api/products', getProducts);

// Protected route - any authenticated user
app.get('/api/user/profile', requireAuth, getProfile);

// Admin only
app.get('/api/admin/users', requireAuth, requireRole(['admin']), getAllUsers);

// Brand owner or admin
app.get('/api/brand/dashboard', 
  requireAuth, 
  requireRole(['brand_owner', 'admin']), 
  getBrandDashboard
);

// Multiple roles
app.put('/api/products/:id', 
  requireAuth, 
  requireRole(['brand_owner', 'admin']), 
  updateProduct
);
```

### Checking Permissions in Code

```javascript
import { hasPermission, isAdmin, isBrandOwnerOrAdmin } from './middleware/auth.js';

// In a controller
export const someController = async (req, res) => {
  if (isAdmin(req.user)) {
    // Admin-specific logic
  }

  if (isBrandOwnerOrAdmin(req.user)) {
    // Brand owner or admin logic
  }

  if (hasPermission(req.user, ['admin', 'brand_owner'])) {
    // Custom permission check
  }
};
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "redirect_uri_mismatch" Error

**Problem:** Google OAuth callback URL doesn't match

**Solution:**
- Ensure `GOOGLE_CALLBACK_URL` in `.env` matches the URL in Google Cloud Console
- For local development: `http://localhost:5001/api/auth/google/callback`
- Add both `http://localhost:5001/api/auth/google/callback` and `http://127.0.0.1:5001/api/auth/google/callback` to Google Console

#### 2. "Invalid JWT Token" Error

**Problem:** Token expired or invalid

**Solution:**
- Tokens expire after 7 days by default
- Clear `localStorage` and log in again
- Check that `JWT_SECRET` in `.env` hasn't changed

#### 3. CORS Errors

**Problem:** Frontend can't make requests to backend

**Solution:**
- Ensure `FRONTEND_URL` in `.env` matches your frontend URL
- Update CORS configuration in `server.js`:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

#### 4. Session Not Persisting

**Problem:** User gets logged out immediately

**Solution:**
- Check `SESSION_SECRET` is set in `.env`
- Ensure cookies are enabled in browser
- For production, set `secure: true` in session config

#### 5. User Role Not Updating

**Problem:** Role stays as 'user' even though email is in admin list

**Solution:**
- Check email format in `.env` (no spaces, comma-separated)
- Email comparison is case-insensitive
- Delete user from database and log in again to reassign role

### Debug Mode

Enable detailed logging:

```javascript
// In server.js, add after middleware
app.use((req, res, next) => {
  console.log('Request:', {
    method: req.method,
    path: req.path,
    user: req.user ? req.user.email : 'Not authenticated',
    role: req.user ? req.user.role : 'N/A'
  });
  next();
});
```

### Testing Individual Components

**Test Passport Configuration:**
```bash
node -e "import('./src/config/passport.js').then(m => console.log('Passport config OK'))"
```

**Test JWT Generation:**
```javascript
import jwt from 'jsonwebtoken';
const token = jwt.sign({ test: 'data' }, process.env.JWT_SECRET);
console.log('Token:', token);
```

---

## 📝 Summary

### Files Created/Modified

**New Files:**
- `src/config/passport.js` - Passport.js configuration
- `src/middleware/auth.js` - Authentication middleware
- `src/controllers/authController.js` - Auth controllers
- `src/routes/authRoutes.js` - Auth routes
- `src/routes/protectedRoutes.js` - Role-based protected routes

**Modified Files:**
- `src/models/User.js` - Added `googleId` and `profilePicture`
- `src/server.js` - Integrated Passport and session middleware
- `.env` - Added OAuth and session configuration
- `.env.example` - Updated example configuration

### Quick Start Commands

```bash
# 1. Install dependencies (already done)
npm install

# 2. Configure .env with your credentials
# (Already configured with your Google OAuth credentials)

# 3. Start server
npm run dev

# 4. Test OAuth flow
# Visit: http://localhost:5001/api/auth/google

# 5. Test protected routes with JWT token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/user/profile
```

---

## 🎉 Success!

Your Google OAuth authentication system with role-based access control is now fully configured!

**Next Steps:**
1. Update admin and brand owner emails in `.env`
2. Integrate frontend login component
3. Test different user roles
4. Deploy to production and update OAuth callback URLs

For questions or issues, refer to the troubleshooting section or check the Passport.js documentation.
