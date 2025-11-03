import axios from 'axios';

// Allow overriding via Vite env (VITE_API_BASE_URL). Default to port 5001 which
// matches the backend `server.js` default PORT.
const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Product APIs
export const productAPI = {
  getByName: async (name, url, brand) => {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (url) params.append('url', url);
    if (brand) params.append('brand', brand);
    
    const response = await api.get(`/products?${params}`);
    return response.data;
  },
  
  search: async (query, category, minScore) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    if (minScore) params.append('minScore', minScore);
    
    const response = await api.get(`/products/search?${params}`);
    return response.data;
  },
  
  getRecommendations: async (category, currentScore, limit = 5) => {
    const params = new URLSearchParams();
    params.append('category', category);
    params.append('currentScore', currentScore);
    params.append('limit', limit);
    
    const response = await api.get(`/products/recommendations?${params}`);
    return response.data;
  },
  
  addOrUpdate: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  rate: async (productId, userId, rating, comment) => {
    const response = await api.post('/products/rate', {
      productId,
      userId,
      rating,
      comment
    });
    return response.data;
  }
};

// User APIs
export const userAPI = {
  getOrCreate: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  getFootprint: async (userId, startDate, endDate, limit) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (limit) params.append('limit', limit);
    
    const response = await api.get(`/users/${userId}/footprint?${params}`);
    return response.data;
  },
  
  recordActivity: async (userId, activityData) => {
    const response = await api.post(`/users/${userId}/activity`, activityData);
    return response.data;
  },
  
  updatePreferences: async (userId, preferences) => {
    const response = await api.put(`/users/${userId}/preferences`, preferences);
    return response.data;
  },
  
  saveProduct: async (userId, productId) => {
    const response = await api.post(`/users/${userId}/save-product`, { productId });
    return response.data;
  },
  
  getSavedProducts: async (userId) => {
    const response = await api.get(`/users/${userId}/saved-products`);
    return response.data;
  }
};

// Alternatives APIs
export const alternativesAPI = {
  getAlternatives: async (productName, currentScore, category, limit = 3) => {
    const params = new URLSearchParams({
      productName,
      currentScore,
      category: category || 'General',
      limit
    });
    const response = await api.get(`/alternatives?${params}`);
    return response.data;
  },

  searchEcoProducts: async (query, minScore = 60, limit = 10) => {
    const params = new URLSearchParams({
      query,
      minScore,
      limit
    });
    const response = await api.get(`/alternatives/search?${params}`);
    return response.data;
  },

  getProductDetails: async (asin) => {
    const response = await api.get(`/alternatives/product/${asin}`);
    return response.data;
  },

  recordChoice: async (userId, originalProduct, chosenAlternative, co2Saved, ecoCoinsEarned = 10) => {
    const response = await api.post('/alternatives/choose', {
      userId,
      originalProduct,
      chosenAlternative,
      co2Saved,
      ecoCoinsEarned
    });
    return response.data;
  },

  getStats: async (userId) => {
    const response = await api.get(`/alternatives/stats/${userId}`);
    return response.data;
  }
};

// Sustainability APIs (Climatiq Integration)
export const sustainabilityAPI = {
  getProductSustainability: async (productId) => {
    const response = await api.get(`/sustainability/${productId}`);
    return response.data;
  },
  
  calculateSustainability: async (productData) => {
    const response = await api.post('/sustainability/calculate', productData);
    return response.data;
  },
  
  getSupportedCategories: async () => {
    const response = await api.get('/sustainability/categories');
    return response.data;
  },
  
  batchUpdate: async (productIds, forceRefresh = false) => {
    const response = await api.post('/sustainability/batch-update', {
      productIds,
      forceRefresh
    });
    return response.data;
  }
};

// Brand APIs
export const brandAPI = {
  getAll: async (limit = 50, sort = '-sustainabilityScore') => {
    const params = new URLSearchParams();
    params.append('limit', limit);
    params.append('sort', sort);
    
    const response = await api.get(`/brands?${params}`);
    return response.data;
  },
  
  getByName: async (name) => {
    const params = new URLSearchParams({ name });
    const response = await api.get(`/brands/search?${params}`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/brands/${id}`);
    return response.data;
  },
  
  createOrUpdate: async (brandData) => {
    const response = await api.post('/brands', brandData);
    return response.data;
  },
  
  rate: async (brandId, rating) => {
    const response = await api.post('/brands/rate', { brandId, rating });
    return response.data;
  }
};

// Helper to get user ID from Chrome storage
export const getUserId = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['userId'], (result) => {
      resolve(result.userId || null);
    });
  });
};

// Helper to set user ID in Chrome storage
export const setUserId = (userId) => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ userId }, resolve);
  });
};

export default api;

// Eco pipeline APIs (calls backend Python pipeline)
export const ecoAPI = {
  analyze: async (itemName, itemDescription) => {
    const response = await api.post('/eco/analyze', {
      item_name: itemName,
      item_description: itemDescription
    });
    return response.data;
  },

  materials: async (itemName, itemDescription) => {
    const response = await api.post('/eco/materials', {
      item_name: itemName,
      item_description: itemDescription
    });
    return response.data;
  },

  sustainabilityMetrics: async (mlOutput, productData) => {
    const response = await api.post('/eco/sustainability-metrics', {
      mlOutput,
      productData
    });
    return response.data;
  },

  completeAnalysis: async (itemName, itemDescription, productData = {}) => {
    const response = await api.post('/eco/complete-analysis', {
      item_name: itemName,
      item_description: itemDescription,
      productData
    });
    return response.data;
  }
};
