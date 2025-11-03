# 🛠 Development Guide

## Running in Development Mode

The extension now supports **two modes of development**:

### Mode 1: Browser Development (Vite Dev Server)

Best for rapid UI development and testing without needing to reload the extension.

\`\`\`bash
cd extension-frontend
npm run dev
\`\`\`

Then open http://localhost:5173 in your browser.

**Features:**
- ✅ Hot Module Replacement (HMR)
- ✅ Fast refresh on file changes
- ✅ Uses localStorage instead of Chrome APIs
- ✅ Dev mode indicator shown
- ⚠️ Chrome Extension APIs simulated

**Limitations:**
- Content scripts won't inject on product pages
- No real product detection
- Background worker not active

### Mode 2: Chrome Extension Development

Best for testing full extension functionality with content scripts and background workers.

\`\`\`bash
cd extension-frontend
npm run build
\`\`\`

Then load the `dist/` folder in Chrome via `chrome://extensions/`.

**Features:**
- ✅ Full Chrome Extension API access
- ✅ Content scripts inject on product pages
- ✅ Background worker active
- ✅ Real product detection on Amazon/Flipkart
- ⚠️ Requires rebuild after changes

## Chrome API Compatibility Layer

We've created a compatibility layer at `src/utils/chromeApi.js` that:

1. **Detects environment**: Checks if running as Chrome Extension
2. **Provides fallbacks**: Uses localStorage in dev mode
3. **Consistent API**: Same interface regardless of environment

### Usage Example

\`\`\`javascript
import { storage, isChromeExtension } from './utils/chromeApi';

// Works in both modes!
const data = await storage.get(['userId']);
await storage.set({ userId: 'abc123' });

// Check environment
if (isChromeExtension()) {
  // Extension-specific code
}
\`\`\`

## Development Workflow

### For UI Changes (Recommended)

1. Run Vite dev server: `npm run dev`
2. Open http://localhost:5173
3. Edit React components
4. See changes instantly with HMR
5. When done, build and test as extension

### For Extension Features

1. Make changes to content scripts or background worker
2. Rebuild: `npm run build`
3. Go to `chrome://extensions/`
4. Click reload button on EcoShop extension
5. Refresh product page to test

## Backend Development

\`\`\`bash
cd extension-backend

# Watch mode (auto-restart)
npm run dev

# Check if server is running
curl http://localhost:5000/api/health
\`\`\`

## Common Development Tasks

### Add New Component

\`\`\`bash
# Create component file
touch src/components/MyComponent.jsx

# Import in App.jsx or parent component
\`\`\`

### Add New API Endpoint

1. Create controller in `extension-backend/src/controllers/`
2. Add route in `extension-backend/src/routes/`
3. Register route in `extension-backend/src/server.js`
4. Update API client in `extension-frontend/src/api/index.js`

### Add Sample Product

1. Edit `extension-backend/src/seed/seedData.js`
2. Add product to `products` array
3. Run: `npm run seed`

### Update Manifest

Edit `extension-frontend/public/manifest.json` then rebuild.

## Debugging

### Frontend Debugging

**In Vite Dev Mode:**
- Open browser DevTools (F12)
- Check Console tab for logs
- Use React DevTools extension

**In Chrome Extension Mode:**
- Right-click extension icon → Inspect popup
- Or go to `chrome://extensions/` → Click "Inspect views"

### Backend Debugging

- Check terminal for API logs
- Use MongoDB Compass to view database
- Test endpoints with curl or Postman

### Content Script Debugging

1. Open product page (Amazon/Flipkart)
2. Right-click page → Inspect
3. Console shows content script logs
4. Check "Console" filter for extension logs

## Environment Variables

### Backend (.env)

\`\`\`env
MONGODB_URI=mongodb://localhost:27017/eco-shopping
PORT=5000
NODE_ENV=development
\`\`\`

### Frontend

Chrome Extension APIs are detected automatically. No env vars needed.

## Testing Checklist

Before committing changes:

- [ ] Run `npm run build` successfully
- [ ] Test in browser dev mode (http://localhost:5173)
- [ ] Load and test as Chrome extension
- [ ] Check all features work in both modes
- [ ] No console errors
- [ ] Backend API responding correctly

## Hot Tips 🔥

1. **Use browser mode** for UI work (faster)
2. **Use extension mode** for testing real functionality
3. **Keep backend running** while developing frontend
4. **Use MongoDB Compass** to inspect database
5. **Check browser console** for all errors
6. **Reload extension** after manifest changes

## Keyboard Shortcuts

- **F12**: Open DevTools
- **Ctrl/Cmd + R**: Reload page
- **Ctrl/Cmd + Shift + R**: Hard reload (clear cache)

## Useful Commands

\`\`\`bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build extension
npm run preview      # Preview build

# Backend
npm run dev          # Start with auto-reload
npm run seed         # Seed database
npm start            # Production start

# Check for issues
npm run lint         # Run linter (if configured)
\`\`\`

## Project Structure Quick Reference

\`\`\`
extension-frontend/
├── public/           # Static files (manifest, scripts)
│   ├── manifest.json # Extension manifest
│   ├── background.js # Background worker
│   ├── content.js    # Content script
│   └── content.css   # Badge styles
├── src/
│   ├── components/   # React components
│   ├── api/          # API client
│   ├── utils/        # Utilities (Chrome API)
│   ├── App.jsx       # Main app
│   └── main.jsx      # Entry point

extension-backend/
├── src/
│   ├── config/       # Database config
│   ├── models/       # Mongoose models
│   ├── controllers/  # Business logic
│   ├── routes/       # API routes
│   ├── seed/         # Sample data
│   └── server.js     # Express app
\`\`\`

## Need Help?

- Check browser console for errors
- Review QUICKSTART.md for setup issues
- See API_TESTING.md for endpoint examples
- Read main README.md for full documentation

---

Happy Developing! 🚀
