import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

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
