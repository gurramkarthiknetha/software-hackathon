# Dashboard Full Screen Fix

## Problem
When clicking "View Dashboard" button, the dashboard was opening in a small tab instead of a full browser window.

## Solution
Modified the `background.js` file to use `chrome.windows.create()` instead of `chrome.tabs.create()` with the following settings:
- **type**: 'normal' - Opens as a regular browser window
- **state**: 'maximized' - Opens in maximized/full screen mode

## Changes Made

### File: `extension-frontend/public/background.js`

#### 1. Dashboard Opening (OPEN_DASHBOARD message handler)
**Before:**
```javascript
chrome.tabs.create({
  url: chrome.runtime.getURL('index.html')
});
```

**After:**
```javascript
chrome.windows.create({
  url: chrome.runtime.getURL('index.html'),
  type: 'normal',
  state: 'maximized'
});
```

#### 2. Welcome Page on Installation
**Before:**
```javascript
chrome.tabs.create({
  url: chrome.runtime.getURL('index.html')
});
```

**After:**
```javascript
chrome.windows.create({
  url: chrome.runtime.getURL('index.html'),
  type: 'normal',
  state: 'maximized'
});
```

#### 3. OAuth Callback Redirect
**Before:**
```javascript
chrome.tabs.create({
  url: chrome.runtime.getURL('index.html')
});
```

**After:**
```javascript
chrome.windows.create({
  url: chrome.runtime.getURL('index.html'),
  type: 'normal',
  state: 'maximized'
});
```

## Testing Instructions

1. **Reload the extension:**
   - Go to `chrome://extensions/`
   - Click the reload button on your EcoShop extension

2. **Test the View Dashboard button:**
   - Navigate to any Amazon product page
   - Wait for the EcoShop badge to appear
   - Click the "View Dashboard" button
   - The dashboard should now open in a new maximized window (full screen)

3. **Expected Behavior:**
   - Dashboard opens in a new browser window
   - Window is maximized to fill the entire screen
   - Dashboard displays like a regular website
   - All functionality remains intact

## Benefits

✅ **Better User Experience**: Full screen provides more space for dashboard content
✅ **Website-like Feel**: Opens like a regular web application
✅ **Improved Visibility**: All dashboard features are clearly visible
✅ **Professional Look**: Maximized window looks more polished

## Notes

- The dashboard will open in a new window each time you click "View Dashboard"
- You can minimize or resize the window as needed
- The window behaves like any other browser window
- Product data is still passed correctly to the dashboard
