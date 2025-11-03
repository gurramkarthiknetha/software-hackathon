# 🚀 OAuth Quick Reference

## 🔗 Essential URLs

| Purpose | URL |
|---------|-----|
| Start OAuth | `http://localhost:5001/api/auth/google` |
| Health Check | `http://localhost:5001/api/health` |
| My Profile | `http://localhost:5001/api/auth/me` |
| Admin Dashboard | `http://localhost:5001/api/admin/dashboard` |
| Brand Dashboard | `http://localhost:5001/api/brand/dashboard` |

## 🔑 JWT Token Usage

### Get Token
1. Visit: `http://localhost:5001/api/auth/google`
2. Login with Google
3. Extract token from redirect URL

### Use Token
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/auth/me
```

## 👥 User Roles

| Role | Assigned When | Access |
|------|--------------|--------|
| **admin** | Email in `ADMIN_EMAILS` | All routes |
| **brand_owner** | Email in `BRAND_OWNER_EMAILS` | Brand routes |
| **user** | Default | User routes only |

### Update Role Lists
Edit `.env`:
```env
ADMIN_EMAILS=admin1@email.com,admin2@email.com
BRAND_OWNER_EMAILS=brand1@company.com,brand2@company.com
```

## 🛡️ Middleware

### Require Authentication
```javascript
import { requireAuth } from './middleware/auth.js';

app.get('/api/protected', requireAuth, handler);
```

### Require Role
```javascript
import { requireAuth, requireRole } from './middleware/auth.js';

// Admin only
app.get('/api/admin/users', 
  requireAuth, 
  requireRole(['admin']), 
  handler
);

// Brand owner or admin
app.get('/api/brand/products',
  requireAuth,
  requireRole(['brand_owner', 'admin']),
  handler
);
```

## 📋 API Endpoints

### Public Endpoints
```
GET  /api/health                 - Server health check
GET  /api/auth/google            - Start OAuth
GET  /api/auth/status            - Auth status
```

### Protected Endpoints (JWT Required)
```
GET  /api/auth/me                - Current user
GET  /api/auth/verify            - Verify token
POST /api/auth/logout            - Logout
GET  /api/user/profile           - User profile
```

### Admin Endpoints
```
GET  /api/admin/dashboard        - Statistics
GET  /api/admin/users            - List users
PUT  /api/admin/users/:id/role   - Update role
DELETE /api/admin/users/:id      - Delete user
```

### Brand Owner Endpoints
```
GET  /api/brand/dashboard        - Brand stats
GET  /api/brand/products         - Products
PUT  /api/brand/products/:id     - Update product
```

## 🧪 Quick Tests

### Test Server
```bash
curl http://localhost:5001/api/health
```

### Test OAuth (Browser)
```
http://localhost:5001/api/auth/google
```

### Test Protected Route
```bash
TOKEN="your_jwt_token_here"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5001/api/auth/me
```

### Test Admin Access
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5001/api/admin/dashboard
```

## 🔧 Environment Variables

### Required
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

### Optional
```env
FRONTEND_URL=http://localhost:5173
ADMIN_EMAILS=admin1@example.com,admin2@example.com
BRAND_OWNER_EMAILS=brand1@company.com
NODE_ENV=development
PORT=5001
```

## 🎯 Frontend Integration

### Login Button
```javascript
const handleLogin = () => {
  window.location.href = 'http://localhost:5001/api/auth/google';
};
```

### Handle Callback
```javascript
// Extract token from URL
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

// Save token
localStorage.setItem('token', token);
```

### Make Authenticated Request
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5001/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Logout
```javascript
const token = localStorage.getItem('token');

await fetch('http://localhost:5001/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

localStorage.removeItem('token');
```

## 🗄️ Database Operations

### View Users
```javascript
// MongoDB shell
db.users.find().pretty()
```

### Check User Role
```javascript
db.users.findOne({ email: "user@example.com" })
```

### Delete User (to re-assign role)
```javascript
db.users.deleteOne({ email: "user@example.com" })
```

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| redirect_uri_mismatch | Add callback URL to Google Console |
| Invalid token | Token expired, login again |
| Access denied | Check role in `.env` |
| CORS error | Update `FRONTEND_URL` |
| Session not persisting | Check `SESSION_SECRET` |

## 📚 Documentation

- **Setup Guide**: `OAUTH_SETUP.md`
- **Testing Guide**: `OAUTH_TESTING.md`
- **Implementation Summary**: `OAUTH_IMPLEMENTATION.md`

## 🎉 Quick Start

```bash
# 1. Start server
cd extension-backend
npm run dev

# 2. Test OAuth (open in browser)
open http://localhost:5001/api/auth/google

# 3. Use the token from redirect URL
# 4. Test protected routes with the token
```

---

**Server Running:** ✅ http://localhost:5001  
**OAuth Ready:** ✅ Google OAuth configured  
**Roles Active:** ✅ Admin, Brand Owner, User  
**JWT Working:** ✅ 7-day expiration
