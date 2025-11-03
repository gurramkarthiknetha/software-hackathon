/**
 * Chrome Extension API helper utilities
 * Provides fallbacks for development mode when Chrome APIs are not available
 */

// Check if running as Chrome Extension
export const isChromeExtension = () => {
  return typeof chrome !== 'undefined' && 
         chrome.storage && 
         chrome.storage.local;
};

// Check if we're in a popup context (small window)
export const isPopupMode = () => {
  return window.innerWidth <= 600 && window.innerHeight <= 600;
};

// Storage helpers with fallbacks
export const storage = {
  // Get items from storage
  get: async (keys) => {
    if (isChromeExtension()) {
      return new Promise((resolve) => {
        chrome.storage.local.get(keys, (result) => {
          resolve(result);
        });
      });
    } else {
      // Development fallback - use localStorage
      const result = {};
      const keyArray = Array.isArray(keys) ? keys : [keys];
      
      keyArray.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        }
      });
      
      return result;
    }
  },

  // Set items in storage
  set: async (items) => {
    if (isChromeExtension()) {
      return new Promise((resolve) => {
        chrome.storage.local.set(items, resolve);
      });
    } else {
      // Development fallback - use localStorage
      Object.keys(items).forEach(key => {
        const value = typeof items[key] === 'string' 
          ? items[key] 
          : JSON.stringify(items[key]);
        localStorage.setItem(key, value);
      });
    }
  },

  // Remove items from storage
  remove: async (keys) => {
    if (isChromeExtension()) {
      return new Promise((resolve) => {
        chrome.storage.local.remove(keys, resolve);
      });
    } else {
      const keyArray = Array.isArray(keys) ? keys : [keys];
      keyArray.forEach(key => localStorage.removeItem(key));
    }
  },

  // Clear all storage
  clear: async () => {
    if (isChromeExtension()) {
      return new Promise((resolve) => {
        chrome.storage.local.clear(resolve);
      });
    } else {
      localStorage.clear();
    }
  }
};

// Runtime message helpers
export const runtime = {
  sendMessage: async (message) => {
    if (isChromeExtension() && chrome.runtime) {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, resolve);
      });
    } else {
      console.log('[Dev Mode] Would send message:', message);
      return { success: true, devMode: true };
    }
  }
};

// Tabs helpers
export const tabs = {
  query: async (queryInfo) => {
    if (isChromeExtension() && chrome.tabs) {
      return new Promise((resolve) => {
        chrome.tabs.query(queryInfo, resolve);
      });
    } else {
      console.log('[Dev Mode] Would query tabs:', queryInfo);
      return [];
    }
  },

  sendMessage: async (tabId, message) => {
    if (isChromeExtension() && chrome.tabs) {
      return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, message, resolve);
      });
    } else {
      console.log('[Dev Mode] Would send message to tab:', tabId, message);
      return { success: true, devMode: true };
    }
  }
};

// Development mode helpers
export const dev = {
  // Generate sample user ID
  generateUserId: () => {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // Sample product data for testing
  getSampleProduct: () => ({
    name: 'Sample Eco-Friendly Product',
    brand: 'EcoBrand',
    category: 'Home & Kitchen',
    ecoScore: 'A',
    ecoScoreNumeric: 90,
    carbonScore: 92,
    recyclability: 95,
    ethicsScore: 88,
    packagingScore: 90,
    carbonFootprint: { value: 2.5, unit: 'kg CO2e' },
    waterUsage: { value: 15, unit: 'liters' },
    certifications: [
      { name: 'Carbon Neutral', verified: true },
      { name: 'Recyclable', verified: true },
      { name: 'Fair Trade', verified: true }
    ],
    verifiedSources: [
      { name: 'EcoLabel Registry', url: 'https://example.com' }
    ]
  }),

  // Sample user stats for testing
  getSampleUserStats: () => ({
    user: {
      userId: 'dev_user_123',
      level: 5,
      points: 450,
      achievements: [
        {
          name: 'Eco Warrior',
          description: 'Chose 50 sustainable products',
          icon: '🌟',
          earnedDate: new Date()
        },
        {
          name: 'Carbon Reducer',
          description: 'Saved 100kg of CO2',
          icon: '🌍',
          earnedDate: new Date()
        }
      ]
    },
    stats: {
      totalViewed: 45,
      totalCarbonSaved: 125.5,
      sustainableChoices: 32,
      averageEcoScore: 'B',
      categoryBreakdown: {
        'Clothing': 15,
        'Home & Kitchen': 12,
        'Electronics': 8,
        'Personal Care': 10
      }
    }
  })
};

export default {
  isChromeExtension,
  storage,
  runtime,
  tabs,
  dev
};
