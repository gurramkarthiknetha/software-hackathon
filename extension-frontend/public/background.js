  // Background service worker for Chrome Extension
console.log('🌱 EcoShop background service worker started');

const API_BASE_URL = 'http://localhost:5001/api';

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed');
    
    // Initialize default settings
    chrome.storage.local.set({
      settings: {
        showEcoScoreOverlay: true,
        minEcoScore: 'C',
        notificationsEnabled: true,
        darkMode: false
      }
    });

    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('index.html')
    });
  }
});

// Monitor tab updates for OAuth callback
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const url = new URL(changeInfo.url);
    
    // Check if this is the OAuth callback
    if (url.origin === 'http://localhost:5173' && url.searchParams.has('token')) {
      const token = url.searchParams.get('token');
      const userId = url.searchParams.get('userId');
      const role = url.searchParams.get('role');
      
      console.log('✅ OAuth callback detected, saving token...');
      
      // Fetch user data
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Save to chrome.storage
          await chrome.storage.local.set({
            token: token,
            user: data.data,
            userId: data.data.userId,
            userRole: role,
            isAuthenticated: true,
            oauthInProgress: false
          });
          
          console.log('✅ Authentication data saved to chrome.storage');
          
          // Close the OAuth tab and open the extension
          chrome.tabs.remove(tabId);
          
          // Open extension popup or dashboard
          chrome.tabs.create({
            url: chrome.runtime.getURL('index.html')
          });
        }
      } catch (error) {
        console.error('Error saving auth data:', error);
      }
    }
  }
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);

  switch (message.type) {
    case 'SHOW_DETAILS':
      handleShowDetails(message.data);
      break;
    
    case 'OPEN_DASHBOARD':
      // Store product data and open dashboard
      console.log('Opening dashboard with product data...', message.productData);
      if (message.productData) {
        chrome.storage.local.set({ currentProduct: message.productData }, () => {
          chrome.tabs.create({
            url: chrome.runtime.getURL('index.html')
          });
        });
      } else {
        chrome.tabs.create({
          url: chrome.runtime.getURL('index.html')
        });
      }
      break;
    
    case 'GET_SUSTAINABILITY_DATA':
      handleGetSustainabilityData(message.productInfo)
        .then(sendResponse)
        .catch(error => sendResponse({ error: error.message }));
      return true; // Keep channel open for async response
    
    case 'RECORD_ACTIVITY':
      handleRecordActivity(message.data)
        .then(sendResponse)
        .catch(error => sendResponse({ error: error.message }));
      return true;
    
    case 'GET_USER_STATS':
      handleGetUserStats()
        .then(sendResponse)
        .catch(error => sendResponse({ error: error.message }));
      return true;
    
    case 'GET_RECOMMENDATIONS':
      handleGetRecommendations(message.category, message.currentScore)
        .then(sendResponse)
        .catch(error => sendResponse({ error: error.message }));
      return true;

    default:
      console.log('Unknown message type:', message.type);
  }
});

// Show product details (open popup or new tab)
function handleShowDetails(data) {
  // Store current product data
  chrome.storage.local.set({ currentProduct: data }, () => {
    // Open popup
    chrome.action.openPopup();
  });
}

// Get sustainability data from API
async function handleGetSustainabilityData(productInfo) {
  try {
    const queryParams = new URLSearchParams({
      name: productInfo.name,
      url: productInfo.url,
      brand: productInfo.brand
    });

    const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error fetching sustainability data:', error);
    throw error;
  }
}

// Record user activity
async function handleRecordActivity(activityData) {
  try {
    const { userId } = await chrome.storage.local.get(['userId']);
    
    if (!userId) {
      throw new Error('User ID not found');
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}/activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(activityData)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error recording activity:', error);
    throw error;
  }
}

// Get user statistics
async function handleGetUserStats() {
  try {
    let { userId } = await chrome.storage.local.get(['userId']);
    
    if (!userId) {
      // Create new user ID
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      await chrome.storage.local.set({ userId });
      
      // Initialize user on backend
      const createResponse = await fetch(`${API_BASE_URL}/users/${userId}`);
      const createData = await createResponse.json();
      
      if (!createData.success) {
        throw new Error('Failed to create user');
      }
      
      return {
        success: true,
        data: {
          user: { userId, level: 1, points: 0, achievements: [] },
          stats: { 
            totalViewed: 0, 
            totalCarbonSaved: 0, 
            sustainableChoices: 0,
            averageEcoScore: 'N/A',
            categoryBreakdown: {},
            recentActivity: []
          }
        }
      };
    }

    // Get user footprint
    const response = await fetch(`${API_BASE_URL}/users/${userId}/footprint`);
    
    // If user not found in database, create them
    if (response.status === 404) {
      const createResponse = await fetch(`${API_BASE_URL}/users/${userId}`);
      const createData = await createResponse.json();
      
      return {
        success: true,
        data: {
          user: { userId, level: 1, points: 0, achievements: [] },
          stats: { 
            totalViewed: 0, 
            totalCarbonSaved: 0, 
            sustainableChoices: 0,
            averageEcoScore: 'N/A',
            categoryBreakdown: {},
            recentActivity: []
          }
        }
      };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
}

// Get greener alternatives
async function handleGetRecommendations(category, currentScore) {
  try {
    const queryParams = new URLSearchParams({
      category,
      currentScore: currentScore || 50,
      limit: 5
    });

    const response = await fetch(`${API_BASE_URL}/products/recommendations?${queryParams}`);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
}

// Handle tab updates (detect when user navigates to product page)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const isSupportedSite = 
      tab.url.includes('amazon.com') || 
      tab.url.includes('amazon.in') ||
      tab.url.includes('flipkart.com');

    if (isSupportedSite) {
      console.log('User on supported e-commerce site:', tab.url);
      
      // Badge to show extension is active
      chrome.action.setBadgeText({ 
        text: '🌱', 
        tabId: tabId 
      });
      
      chrome.action.setBadgeBackgroundColor({ 
        color: '#10b981', 
        tabId: tabId 
      });
    }
  }
});

// Context menu for quick actions (optional)
chrome.runtime.onInstalled.addListener(() => {
  try {
    chrome.contextMenus.create({
      id: 'check-sustainability',
      title: 'Check Sustainability Score',
      contexts: ['page', 'selection']
    });
  } catch (error) {
    console.error('Error creating context menu:', error);
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'check-sustainability') {
    chrome.tabs.sendMessage(tab.id, { type: 'REFRESH_DATA' });
  }
});

// Periodic sync for user stats (every 30 minutes)
chrome.alarms.create('syncUserData', { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncUserData') {
    console.log('Syncing user data...');
    handleGetUserStats().catch(console.error);
  }
});
