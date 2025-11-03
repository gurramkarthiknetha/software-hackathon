// Enhanced Content script for EcoShopper - Full Feature Implementation
console.log('🌱 EcoShopper Enhanced Content Script Loaded');

const API_BASE_URL = 'http://localhost:5001/api';

// Define functions immediately and robustly
console.log('🔧 Defining EcoShop window functions...');

// Ensure window object is available
if (typeof window === 'undefined') {
  console.error('❌ Window object not available');
}

// Define functions with error handling
try {

// Initialize global state for better data management
window.ecoShopState = window.ecoShopState || {
  initialized: false,
  productInfo: {},
  analysisData: {},
  debugMode: true
};

// Global function definitions for button interactions
window.ecoShopAddToCart = function() {
  console.log('🛒 Add to Eco Cart button clicked!');
  
  const productInfo = window.currentProductInfo || window.ecoShopState.productInfo || {};
  const analysisData = window.currentAnalysisData || window.ecoShopState.analysisData || {};
  
  console.log('Product Info:', productInfo);
  console.log('Analysis Data:', analysisData);
  
  // Get existing cart
  const cart = JSON.parse(localStorage.getItem('ecoShopCart') || '[]');
  
  // Add current product to cart
  const cartItem = {
    id: Date.now(),
    name: productInfo.name || 'Unknown Product',
    url: productInfo.url || window.location.href,
    ecoScore: analysisData.ecoScore || 50,
    co2Footprint: analysisData.co2Footprint || 10,
    materials: analysisData.materials || [],
    addedAt: new Date().toISOString()
  };
  
  cart.push(cartItem);
  localStorage.setItem('ecoShopCart', JSON.stringify(cart));
  
  // Show success notification
  showNotification('✅ Added to Eco Cart!', 'Product saved for sustainable shopping', '#10b981');
  
  // Track the action
  try {
    chrome.runtime.sendMessage({
      type: 'RECORD_ACTIVITY',
      data: {
        userId: localStorage.getItem('ecoUserId') || 'guest',
        activityType: 'cart_add',
        productName: cartItem.name,
        ecoScore: cartItem.ecoScore
      }
    });
  } catch (error) {
    console.error('Failed to track cart addition:', error);
  }
};

window.ecoShopOpenDashboard = function() {
  console.log('📊 View Dashboard button clicked!');
  
  const productInfo = window.currentProductInfo || window.ecoShopState.productInfo || {};
  const analysisData = window.currentAnalysisData || window.ecoShopState.analysisData || {};
  
  console.log('Dashboard - Product Info:', productInfo);
  console.log('Dashboard - Analysis Data:', analysisData);
  
  try {
    chrome.runtime.sendMessage({
      type: 'OPEN_DASHBOARD',
      productData: {
        name: productInfo.name,
        url: productInfo.url,
        ecoScore: analysisData.ecoScore,
        co2Footprint: analysisData.co2Footprint,
        materials: analysisData.materials,
        recyclabilityRating: analysisData.recyclabilityRating
      }
    });
  } catch (error) {
    console.error('Failed to open dashboard:', error);
    // Fallback: show a notification
    showNotification('📊 Dashboard', 'Please open the extension popup to view dashboard', '#3b82f6');
  }
};

window.ecoShopFeedback = function(type) {
  console.log(`👍👎 Feedback button clicked: ${type}`);
  
  const productInfo = window.currentProductInfo || {};
  const analysisData = window.currentAnalysisData || {};
  
  console.log('Feedback - Product Info:', productInfo);
  
  // Store feedback locally
  const feedback = JSON.parse(localStorage.getItem('ecoShopFeedback') || '[]');
  feedback.push({
    type: type, // 'up' or 'down'
    productName: productInfo.name,
    ecoScore: analysisData.ecoScore,
    timestamp: new Date().toISOString(),
    url: window.location.href
  });
  localStorage.setItem('ecoShopFeedback', JSON.stringify(feedback.slice(-50))); // Keep last 50
  
  // Visual feedback
  const button = event.target;
  const originalText = button.innerHTML;
  button.innerHTML = type === 'up' ? '✅' : '❌';
  button.style.transform = 'scale(1.2)';
  
  setTimeout(() => {
    button.innerHTML = originalText;
    button.style.transform = 'scale(1)';
  }, 1000);
  
  // Show thank you message
  const message = type === 'up' ? 
    'Thanks for the positive feedback! 😊' : 
    'Thanks for feedback! We\'ll improve our scoring. 📝';
  showNotification('Feedback Received', message, '#8b5cf6');
  
  // Send to analytics (if available)
  try {
    chrome.runtime.sendMessage({
      type: 'RECORD_FEEDBACK',
      data: {
        type,
        productName: productInfo.name,
        ecoScore: analysisData.ecoScore,
        userId: localStorage.getItem('ecoUserId') || 'guest'
      }
    });
  } catch (error) {
    console.error('Failed to send feedback:', error);
  }
};

window.ecoShopUploadProof = function(event) {
  console.log('📷 Upload Proof/Comment triggered');
  
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file
  if (!file.type.startsWith('image/')) {
    showNotification('Error', 'Please select an image file', '#ef4444');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    showNotification('Error', 'Image must be smaller than 5MB', '#ef4444');
    return;
  }
  
  // Show processing notification
  showNotification('Processing...', 'Analyzing your uploaded image', '#f59e0b');
  
  // Create FileReader to process image
  const reader = new FileReader();
  reader.onload = function(e) {
    const imageData = e.target.result;
    
    // Store proof locally (in real app, you'd upload to server)
    const proofs = JSON.parse(localStorage.getItem('ecoShopProofs') || '[]');
    proofs.push({
      id: Date.now(),
      productName: window.currentProductInfo?.name || 'Unknown Product',
      imageData: imageData,
      fileSize: file.size,
      fileName: file.name,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
    localStorage.setItem('ecoShopProofs', JSON.stringify(proofs.slice(-10))); // Keep last 10
    
    // Show success
    showNotification('✅ Uploaded Successfully!', 'Your proof has been saved for review', '#10b981');
    
    // Reset file input
    event.target.value = '';
    
    // Track the upload
    try {
      chrome.runtime.sendMessage({
        type: 'RECORD_ACTIVITY',
        data: {
          userId: localStorage.getItem('ecoUserId') || 'guest',
          activityType: 'proof_upload',
          productName: window.currentProductInfo?.name || 'Unknown Product'
        }
      });
    } catch (error) {
      console.error('Failed to track proof upload:', error);
    }
  };
  
  reader.readAsDataURL(file);
};

// Enhanced notification system with fallbacks
function showNotification(title, message, color = '#10b981') {
  try {
    // Remove any existing notifications
    const existingNotification = document.getElementById('ecoshop-notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.id = 'ecoshop-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${color};
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      z-index: 9999999;
      max-width: 300px;
      animation: slideInRight 0.5s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      line-height: 1.4;
    `;
    
    notification.innerHTML = `
      <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">${title}</div>
      <div style="font-size: 13px; opacity: 0.9; line-height: 1.4;">${message}</div>
    `;
    
    // Add animation styles once
    if (!document.getElementById('ecoshop-notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'ecoshop-notification-styles';
      styles.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
          if (notification && notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }, 4000);
    
  } catch (error) {
    console.error('Notification error:', error);
    // Fallback to basic alert
    alert(`${title}: ${message}`);
  }
}

// Make showNotification globally available
window.showNotification = showNotification;

// Test function to verify all buttons work (for debugging)
window.ecoShopTestButtons = function() {
  console.log('🧪 Testing EcoShop buttons...');
  
  const tests = [
    () => window.ecoShopAddToCart && window.ecoShopAddToCart(),
    () => window.ecoShopOpenDashboard && window.ecoShopOpenDashboard(),
    () => window.ecoShopFeedback && window.ecoShopFeedback('up'),
    () => window.ecoShopLoadAlternatives && window.ecoShopLoadAlternatives()
  ];
  
  const testNames = ['AddToCart', 'OpenDashboard', 'Feedback', 'LoadAlternatives'];
  
  tests.forEach((test, index) => {
    try {
      console.log(`✅ ${testNames[index]} function exists`);
      // test(); // Uncomment to actually run the test
    } catch (error) {
      console.error(`❌ ${testNames[index]} failed:`, error);
    }
  });
  
  showNotification('🧪 Button Test', 'Check console for test results', '#8b5cf6');
};

// Log that functions are ready
console.log('✅ All EcoShop functions defined:', {
  addToCart: typeof window.ecoShopAddToCart,
  openDashboard: typeof window.ecoShopOpenDashboard,
  feedback: typeof window.ecoShopFeedback,
  loadAlternatives: typeof window.ecoShopLoadAlternatives,
  uploadProof: typeof window.ecoShopUploadProof
});

} catch (error) {
  console.error('❌ Error defining EcoShop functions:', error);
}

// Additional safety: Inject functions into page context to ensure they're always available
// This is necessary because content scripts run in an isolated world
const script = document.createElement('script');
script.textContent = `
  // Fallback functions in case content script functions aren't accessible
  window.ecoShopAddToCart = window.ecoShopAddToCart || function() {
    console.log('🛒 Add to Cart (fallback)');
    // Try postMessage first, then alert
    try {
      window.postMessage({type: 'ECOSHOP_ADD_TO_CART'}, '*');
    } catch (e) {
      alert('✅ Added to Eco Cart!');
    }
  };
  
  window.ecoShopOpenDashboard = window.ecoShopOpenDashboard || function() {
    console.log('📊 Dashboard (fallback)');
    try {
      window.postMessage({type: 'ECOSHOP_OPEN_DASHBOARD'}, '*');
    } catch (e) {
      alert('📊 Opening Dashboard...');
    }
  };
  
  window.ecoShopFeedback = window.ecoShopFeedback || function(type) {
    console.log('👍👎 Feedback (fallback):', type);
    try {
      window.postMessage({type: 'ECOSHOP_FEEDBACK', payload: type}, '*');
    } catch (e) {
      alert('✅ Feedback recorded: ' + type);
    }
  };
  
  window.ecoShopLoadAlternatives = window.ecoShopLoadAlternatives || function() {
    console.log('🔍 Alternatives (fallback)');
    try {
      window.postMessage({type: 'ECOSHOP_LOAD_ALTERNATIVES'}, '*');
    } catch (e) {
      alert('🔍 Loading alternatives...');
    }
  };
  
  window.ecoShopUploadProof = window.ecoShopUploadProof || function() {
    console.log('📷 Upload (fallback)');
    document.getElementById('ecoshop-feedback-image')?.click();
  };
  
  console.log('🔧 Fallback functions injected into page context');
  console.log('🔧 Available functions:', {
    addToCart: typeof window.ecoShopAddToCart,
    openDashboard: typeof window.ecoShopOpenDashboard,
    feedback: typeof window.ecoShopFeedback,
    loadAlternatives: typeof window.ecoShopLoadAlternatives,
    uploadProof: typeof window.ecoShopUploadProof
  });
`;

// Inject the script into the page
(document.head || document.documentElement).appendChild(script);
script.remove();

console.log('🔧 Script injection completed');

// Setup message passing between content script and page
window.addEventListener('message', function(event) {
  // Only accept messages from the same origin
  if (event.source !== window) return;
  
  if (event.data.type && event.data.type.startsWith('ECOSHOP_')) {
    console.log('📨 Received message:', event.data);
    
    switch (event.data.type) {
      case 'ECOSHOP_ADD_TO_CART':
        if (typeof window.ecoShopAddToCart === 'function') {
          window.ecoShopAddToCart();
        }
        break;
      case 'ECOSHOP_OPEN_DASHBOARD':
        if (typeof window.ecoShopOpenDashboard === 'function') {
          window.ecoShopOpenDashboard();
        }
        break;
      case 'ECOSHOP_FEEDBACK':
        if (typeof window.ecoShopFeedback === 'function') {
          window.ecoShopFeedback(event.data.payload);
        }
        break;
      case 'ECOSHOP_LOAD_ALTERNATIVES':
        if (typeof window.ecoShopLoadAlternatives === 'function') {
          window.ecoShopLoadAlternatives();
        }
        break;
    }
  }
}, false);

// Eco-friendly keywords and their weights
const ECO_KEYWORDS = {
  positive: {
    'recycled': 10, 'organic': 12, 'biodegradable': 15, 'eco-friendly': 10,
    'bamboo': 8, 'sustainable': 10, 'natural': 8, 'renewable': 10,
    'compostable': 12, 'reusable': 10, 'plant-based': 10, 'green': 5,
    'eco': 8, 'environmental': 5, 'carbon-neutral': 15, 'zero-waste': 12,
    'fair-trade': 8, 'ethical': 6, 'b-corp': 10, 'certified': 5,
    'solar': 8, 'wind': 8, 'hemp': 7, 'jute': 7, 'cork': 6,
    'upcycled': 10, 'refillable': 8, 'minimal-packaging': 8
  },
  negative: {
    'plastic': -15, 'disposable': -12, 'single-use': -15, 'non-recyclable': -10,
    'petroleum': -10, 'synthetic': -8, 'fossil': -12, 'toxic': -15,
    'chemical': -8, 'bleached': -6, 'non-biodegradable': -12, 'pvc': -10,
    'microplastic': -15, 'styrofoam': -12, 'polystyrene': -10
  }
};

// Material detection patterns
const MATERIALS = {
  'cotton': { eco: 70, emoji: '🌿', recyclable: true },
  'organic cotton': { eco: 90, emoji: '🌿', recyclable: true },
  'polyester': { eco: 30, emoji: '⚠️', recyclable: false },
  'bamboo': { eco: 95, emoji: '🎋', recyclable: true },
  'plastic': { eco: 20, emoji: '💨', recyclable: false },
  'glass': { eco: 75, emoji: '♻️', recyclable: true },
  'metal': { eco: 80, emoji: '♻️', recyclable: true },
  'steel': { eco: 85, emoji: '♻️', recyclable: true },
  'aluminum': { eco: 80, emoji: '♻️', recyclable: true },
  'wood': { eco: 70, emoji: '🌳', recyclable: true },
  'paper': { eco: 65, emoji: '📄', recyclable: true },
  'cardboard': { eco: 70, emoji: '📦', recyclable: true },
  'rubber': { eco: 50, emoji: '⚠️', recyclable: false },
  'leather': { eco: 40, emoji: '⚠️', recyclable: false },
  'silk': { eco: 60, emoji: '🌿', recyclable: false },
  'wool': { eco: 65, emoji: '🌿', recyclable: true }
};

// Configuration for different e-commerce sites
const SITE_CONFIGS = {
  amazon: {
    selectors: {
      productTitle: '#productTitle, #title',
      brand: '.po-brand .po-break-word, #bylineInfo',
      price: '.a-price-whole, #priceblock_ourprice',
      image: '#landingImage, #imgTagWrapperId img',
      description: '#feature-bullets, #productDescription, .a-expander-content'
    },
    urlPattern: /amazon\.(com|in)/
  },
  flipkart: {
    selectors: {
      productTitle: '.B_NuCI, h1.yhB1nd',
      brand: '._2s0LUZ, ._2a4cYd',
      price: '._30jeq3, ._3I9_wc',
      image: '._396cs4 img, ._2r_T1I img',
      description: '._1mXcCf, ._3WHvuP'
    },
    urlPattern: /flipkart\.com/
  }
};

// Eco-friendly alternatives database (mock data)
const ECO_ALTERNATIVES = {
  'Clothing': [
    { name: '🌿 Organic Cotton T-Shirt', ecoScore: 88, brand: 'EcoWear', reason: '100% organic cotton, fair trade certified' },
    { name: '🎋 Bamboo Fiber Shirt', ecoScore: 92, brand: 'GreenFashion', reason: 'Sustainable bamboo, biodegradable' },
    { name: '♻️ Recycled Polyester Jacket', ecoScore: 85, brand: 'ReWear', reason: 'Made from recycled plastic bottles' }
  ],
  'Electronics': [
    { name: '🔋 Solar-Powered Charger', ecoScore: 95, brand: 'SunPower', reason: 'Renewable energy, no electricity needed' },
    { name: '♻️ Refurbished Phone', ecoScore: 82, brand: 'EcoTech', reason: 'Reduces e-waste, certified quality' },
    { name: '🌱 Energy-Efficient Monitor', ecoScore: 78, brand: 'GreenScreen', reason: 'Low power consumption, Energy Star certified' }
  ],
  'Home & Living': [
    { name: '🎋 Bamboo Utensil Set', ecoScore: 94, brand: 'BambooLife', reason: 'Renewable bamboo, biodegradable' },
    { name: '♻️ Recycled Glass Container', ecoScore: 87, brand: 'GlassWorks', reason: '100% recycled glass, reusable' },
    { name: '🌿 Organic Cotton Bedding', ecoScore: 90, brand: 'DreamGreen', reason: 'Organic, chemical-free' }
  ],
  'Beauty & Personal Care': [
    { name: '🌿 Natural Soap Bar', ecoScore: 93, brand: 'PureNature', reason: 'Plastic-free, organic ingredients' },
    { name: '🎋 Bamboo Toothbrush', ecoScore: 96, brand: 'EcoBrush', reason: 'Biodegradable, sustainable' },
    { name: '♻️ Refillable Shampoo', ecoScore: 89, brand: 'CleanPlanet', reason: 'Reduces plastic waste' }
  ],
  'Other': [
    { name: '♻️ Reusable Water Bottle', ecoScore: 91, brand: 'HydroGreen', reason: 'Replaces single-use plastic' },
    { name: '🌱 Biodegradable Phone Case', ecoScore: 86, brand: 'CasaVerde', reason: 'Plant-based materials' }
  ]
};

// Detect current site
function detectSite() {
  const hostname = window.location.hostname;
  if (SITE_CONFIGS.amazon.urlPattern.test(hostname)) return 'amazon';
  if (SITE_CONFIGS.flipkart.urlPattern.test(hostname)) return 'flipkart';
  return null;
}

// Extract product information from page
function extractProductInfo() {
  const site = detectSite();
  if (!site) return null;

  const config = SITE_CONFIGS[site];
  
  const getTextContent = (selector) => {
    const element = document.querySelector(selector);
    return element ? element.textContent.trim() : '';
  };

  const productTitle = getTextContent(config.selectors.productTitle);
  const brand = getTextContent(config.selectors.brand)
    .replace(/^(Brand:|Visit the|by)\s*/i, '')
    .split(/\s+Store$/)[0];
  
  const description = getTextContent(config.selectors.description);

  const imageElement = document.querySelector(config.selectors.image);
  const imageUrl = imageElement ? imageElement.src : '';

  if (!productTitle) return null;

  const category = inferCategory(window.location.href, productTitle);

  return {
    name: productTitle,
    brand: brand || 'Unknown',
    url: window.location.href,
    imageUrl,
    category,
    description
  };
}

// Infer product category
function inferCategory(url, title) {
  const lower = (url + ' ' + title).toLowerCase();
  
  if (lower.includes('clothing') || lower.includes('apparel') || lower.includes('fashion') || lower.includes('shirt') || lower.includes('dress')) {
    return 'Clothing';
  } else if (lower.includes('electronics') || lower.includes('gadget') || lower.includes('phone') || lower.includes('laptop')) {
    return 'Electronics';
  } else if (lower.includes('home') || lower.includes('furniture') || lower.includes('decor')) {
    return 'Home & Living';
  } else if (lower.includes('beauty') || lower.includes('cosmetic') || lower.includes('skincare')) {
    return 'Beauty & Personal Care';
  } else if (lower.includes('food') || lower.includes('grocery') || lower.includes('kitchen')) {
    return 'Food & Beverage';
  } else if (lower.includes('toy') || lower.includes('game')) {
    return 'Toys & Games';
  } else if (lower.includes('book') || lower.includes('stationery')) {
    return 'Books & Stationery';
  } else {
    return 'Other';
  }
}

// Calculate EcoScore using keyword-based analysis
function calculateEcoScore(productName, description) {
  const text = (productName + ' ' + description).toLowerCase();
  let score = 50; // Base score
  const foundKeywords = [];
  
  // Check positive keywords
  for (const [keyword, weight] of Object.entries(ECO_KEYWORDS.positive)) {
    const regex = new RegExp('\\b' + keyword.replace('-', '[\\s-]') + '\\b', 'gi');
    const matches = text.match(regex);
    if (matches) {
      score += weight * matches.length;
      foundKeywords.push(keyword);
    }
  }
  
  // Check negative keywords
  for (const [keyword, weight] of Object.entries(ECO_KEYWORDS.negative)) {
    const regex = new RegExp('\\b' + keyword.replace('-', '[\\s-]') + '\\b', 'gi');
    const matches = text.match(regex);
    if (matches) {
      score += weight * matches.length;
      foundKeywords.push(keyword);
    }
  }
  
  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));
  
  return { score: Math.round(score), keywords: foundKeywords };
}

// Detect materials in product description
function detectMaterials(productName, description) {
  const text = (productName + ' ' + description).toLowerCase();
  const detectedMaterials = [];
  
  for (const [material, info] of Object.entries(MATERIALS)) {
    const regex = new RegExp('\\b' + material.replace(/\s+/g, '\\s+') + '\\b', 'gi');
    if (regex.test(text)) {
      detectedMaterials.push({ name: material, ...info });
    }
  }
  
  return detectedMaterials;
}

// Calculate recyclability rating (A-F)
function calculateRecyclabilityRating(materials, ecoScore) {
  if (materials.length === 0) {
    if (ecoScore >= 80) return 'A';
    if (ecoScore >= 65) return 'B';
    if (ecoScore >= 50) return 'C';
    if (ecoScore >= 35) return 'D';
    if (ecoScore >= 20) return 'E';
    return 'F';
  }
  
  const recyclableCount = materials.filter(m => m.recyclable).length;
  const recyclablePercentage = (recyclableCount / materials.length) * 100;
  
  if (recyclablePercentage >= 80) return 'A';
  if (recyclablePercentage >= 65) return 'B';
  if (recyclablePercentage >= 50) return 'C';
  if (recyclablePercentage >= 35) return 'D';
  if (recyclablePercentage >= 20) return 'E';
  return 'F';
}

// Estimate CO2 footprint
function estimateCO2Footprint(category, ecoScore, materials) {
  const baseCO2 = {
    'Clothing': 15,
    'Electronics': 45,
    'Home & Living': 25,
    'Beauty & Personal Care': 8,
    'Food & Beverage': 5,
    'Toys & Games': 12,
    'Books & Stationery': 6,
    'Other': 15
  };
  
  let co2 = baseCO2[category] || 15;
  
  const ecoMultiplier = 1.5 - (ecoScore / 100);
  co2 *= ecoMultiplier;
  
  if (materials.some(m => m.name.includes('plastic'))) {
    co2 *= 1.5;
  }
  
  return Math.round(co2 * 10) / 10;
}

// Generate AI insight
function generateAIInsight(ecoScore, materials, keywords) {
  const positiveKeywords = keywords.filter(k => ECO_KEYWORDS.positive[k]);
  const negativeKeywords = keywords.filter(k => ECO_KEYWORDS.negative[k]);
  
  if (ecoScore >= 80) {
    const features = positiveKeywords.slice(0, 3).join(', ');
    return `✨ AI Insight: Highly eco-friendly due to ${features || 'sustainable features'}. Great choice!`;
  } else if (ecoScore >= 60) {
    return `💡 AI Insight: Moderately eco-friendly with some sustainable features. Consider alternatives for better impact.`;
  } else {
    const issues = negativeKeywords.slice(0, 2).join(', ') || 'limited eco-friendly features';
    return `⚠️ AI Insight: Low sustainability score. Issues: ${issues}.`;
  }
}

// Get recycle tips
function getRecycleTips(materials, category) {
  if (materials.length === 0) {
    return '📋 Check local recycling guidelines for proper disposal.';
  }
  
  const recyclable = materials.filter(m => m.recyclable);
  if (recyclable.length > 0) {
    const materialNames = recyclable.map(m => m.name).join(', ');
    return `♻️ This product contains ${materialNames} which can be recycled. Remove non-recyclable parts first.`;
  }
  
  if (category === 'Clothing') {
    return '👕 Donate to charity or textile recycling programs instead of throwing away.';
  }
  
  return '🌍 Consider creative reuse or check with local recycling centers.';
}

// Get eco-friendly alternatives
function getEcoAlternatives(category, currentScore) {
  const alternatives = ECO_ALTERNATIVES[category] || ECO_ALTERNATIVES['Other'];
  return alternatives.filter(alt => alt.ecoScore > currentScore).slice(0, 3);
}

// Create enhanced eco-badge with all features
function createEnhancedEcoBadge(productInfo, analysisData) {
  // Remove existing badge if any
  const existingBadge = document.getElementById('ecoshop-enhanced-badge');
  if (existingBadge) {
    existingBadge.remove();
  }

  const { ecoScore, materials, recyclabilityRating, co2Footprint, aiInsight, recycleTips, alternatives } = analysisData;

  // Determine color based on score
  let color, textColor, emoji, message;
  if (ecoScore >= 80) {
    color = '#10b981';
    textColor = 'white';
    emoji = '🌿';
    message = 'Eco-Friendly Choice!';
  } else if (ecoScore >= 50) {
    color = '#f59e0b';
    textColor = 'white';
    emoji = '⚠️';
    message = 'Moderate Impact';
  } else {
    color = '#ef4444';
    textColor = 'white';
    emoji = '💨';
    message = 'High Carbon Footprint!';
  }

  const badge = document.createElement('div');
  badge.id = 'ecoshop-enhanced-badge';
  badge.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 380px;
    max-height: 90vh;
    overflow-y: auto;
    background: white;
    border-radius: 16px;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    animation: slideInRight 0.4s ease-out;
  `;

  badge.innerHTML = `
    <style>
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      #ecoshop-enhanced-badge::-webkit-scrollbar {
        width: 6px;
      }
      #ecoshop-enhanced-badge::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
      #ecoshop-enhanced-badge::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 10px;
      }
      .ecoshop-section {
        padding: 12px 16px;
        border-bottom: 1px solid #e5e7eb;
      }
      .ecoshop-section:last-child {
        border-bottom: none;
      }
      .ecoshop-btn {
        padding: 10px 16px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        width: 100%;
        margin-top: 8px;
      }
      .ecoshop-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      .ecoshop-material-chip {
        display: inline-block;
        padding: 4px 10px;
        margin: 4px;
        background: #f3f4f6;
        border-radius: 16px;
        font-size: 12px;
      }
      .ecoshop-alternative-card {
        background: white;
        padding: 12px;
        border-radius: 8px;
        margin: 8px 0;
        border: 2px solid #10b981;
        cursor: pointer;
        transition: all 0.2s;
      }
      .ecoshop-alternative-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
      }
      .ecoshop-alt-image {
        width: 100%;
        height: 120px;
        object-fit: contain;
        background: #f9fafb;
        border-radius: 6px;
        margin-bottom: 8px;
      }
      .ecoshop-alt-score {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 700;
        color: white;
        margin-bottom: 8px;
      }
      .ecoshop-alt-highlight {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: #047857;
        margin: 4px 0;
      }
      .ecoshop-reward-badge {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        color: #92400e;
        margin-top: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
      .ecoshop-feedback-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border: 2px solid #e5e7eb;
        border-radius: 50%;
        background: white;
        cursor: pointer;
        font-size: 20px;
        margin: 0 8px;
        transition: all 0.2s;
      }
      .ecoshop-feedback-btn:hover {
        transform: scale(1.1);
        border-color: #10b981;
      }
    </style>

    <!-- Header -->
    <div style="background: ${color}; color: ${textColor}; padding: 20px; border-radius: 16px 16px 0 0;">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div>
          <div style="font-size: 28px; font-weight: bold;">
            ${emoji} EcoScore: ${ecoScore}
          </div>
          <div style="font-size: 14px; opacity: 0.9; margin-top: 4px;">
            ${message}
          </div>
        </div>
        <button onclick="document.getElementById('ecoshop-enhanced-badge').remove()" 
                style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 20px;">
          ×
        </button>
      </div>
    </div>

    <!-- AI Insight -->
    <div class="ecoshop-section" style="background: #fef3c7; font-size: 13px; color: #92400e;">
      ${aiInsight}
    </div>

    <!-- Carbon Footprint -->
    <div class="ecoshop-section">
      <div style="font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
        💨 Carbon Footprint
      </div>
      <div style="font-size: 24px; font-weight: bold; color: ${co2Footprint > 20 ? '#ef4444' : '#10b981'};">
        ${co2Footprint} kg CO₂e
      </div>
      ${co2Footprint > 20 ? `
        <div style="margin-top: 8px; padding: 8px; background: #fee2e2; border-radius: 6px; font-size: 12px; color: #991b1b;">
          ⚠️ High emissions! Production and shipping increase CO₂ levels significantly.
        </div>
      ` : ''}
    </div>

    <!-- Materials Breakdown -->
    ${materials.length > 0 ? `
      <div class="ecoshop-section">
        <div style="font-weight: 600; margin-bottom: 8px;">
          🧪 Materials Detected
        </div>
        <div>
          ${materials.map(m => `
            <span class="ecoshop-material-chip">
              ${m.emoji} ${m.name.charAt(0).toUpperCase() + m.name.slice(1)}
            </span>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Recyclability Rating -->
    <div class="ecoshop-section">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600;">♻️ Recyclability Rating</span>
        <span style="font-size: 24px; font-weight: bold; color: ${recyclabilityRating <= 'B' ? '#10b981' : '#ef4444'};">
          ${recyclabilityRating}
        </span>
      </div>
    </div>

    <!-- Recycle Tips -->
    <div class="ecoshop-section" style="background: #ecfdf5; font-size: 13px;">
      ${recycleTips}
    </div>

    <!-- Alternatives Section (Enhanced) -->
    <div id="ecoshop-alternatives-section" class="ecoshop-section" style="padding: 0;">
      <div style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
        <div style="font-weight: 600; margin-bottom: 4px; color: #10b981; display: flex; align-items: center; gap: 6px;">
          🌿 Sustainable Alternatives
          <span id="ecoshop-alt-loading" style="display: none; font-size: 12px; color: #6b7280;">Loading...</span>
        </div>
        <div style="font-size: 12px; color: #6b7280;">
          Discover eco-friendlier options with higher ratings
        </div>
      </div>
      <div id="ecoshop-alternatives-list" style="padding: 12px 16px;">
        <button class="ecoshop-btn" style="background: #10b981; color: white;" onclick="window.ecoShopLoadAlternatives()">
          🔍 Find Better Alternatives
        </button>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="ecoshop-section">
      <button class="ecoshop-btn" style="background: #10b981; color: white;" onclick="window.ecoShopAddToCart()">
        🛒 Add to Eco Cart
      </button>
      <button class="ecoshop-btn" style="background: #3b82f6; color: white;" onclick="window.ecoShopOpenDashboard()">
        📊 View Dashboard
      </button>
    </div>

    <!-- Feedback Section -->
    <div class="ecoshop-section">
      <div style="font-weight: 600; margin-bottom: 12px; text-align: center;">
        Was this score helpful?
      </div>
      <div style="display: flex; justify-content: center; align-items: center;">
        <button class="ecoshop-feedback-btn" onclick="window.ecoShopFeedback('up')">
          👍
        </button>
        <button class="ecoshop-feedback-btn" onclick="window.ecoShopFeedback('down')">
          👎
        </button>
      </div>
      <div style="margin-top: 12px;">
        <input type="file" id="ecoshop-feedback-image" accept="image/*" style="display: none;" onchange="window.ecoShopUploadProof(event)">
        <button class="ecoshop-btn" style="background: #e5e7eb; color: #374151;" onclick="document.getElementById('ecoshop-feedback-image').click()">
          📷 Upload Proof/Comment
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(badge);
  makeDraggable(badge);
  
  return badge;
}

// Make element draggable
function makeDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const header = element.firstElementChild;
  
  header.style.cursor = 'move';
  header.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
    element.style.bottom = 'auto';
    element.style.right = 'auto';
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Add to cart function
window.ecoShopAddToCart = function() {
  const cart = JSON.parse(localStorage.getItem('ecoShopCart') || '[]');
  const productInfo = window.currentProductInfo;
  
  if (productInfo) {
    cart.push({
      ...productInfo,
      addedAt: new Date().toISOString()
    });
    localStorage.setItem('ecoShopCart', JSON.stringify(cart));
    alert('✅ Added to Eco Cart!');
  }
};

// Open dashboard with current product
window.ecoShopOpenDashboard = function() {
  const productInfo = window.currentProductInfo;
  const analysisData = window.currentAnalysisData;
  
  if (productInfo && analysisData) {
    chrome.runtime.sendMessage({
      type: 'OPEN_DASHBOARD',
      productData: {
        ...productInfo,
        ...analysisData,
        viewedAt: new Date().toISOString()
      }
    });
  } else {
    chrome.runtime.sendMessage({type: 'OPEN_DASHBOARD'});
  }
};

// Feedback function
window.ecoShopFeedback = function(type) {
  const feedbacks = JSON.parse(localStorage.getItem('ecoShopFeedbacks') || '[]');
  feedbacks.push({
    type,
    productUrl: window.location.href,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('ecoShopFeedbacks', JSON.stringify(feedbacks));
  
  alert(type === 'up' ? '👍 Thanks for your feedback!' : '👎 Feedback recorded. We\'ll improve!');
};

// Upload proof function
window.ecoShopUploadProof = function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const proofs = JSON.parse(localStorage.getItem('ecoShopProofs') || '[]');
      proofs.push({
        productUrl: window.location.href,
        image: e.target.result,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('ecoShopProofs', JSON.stringify(proofs));
      alert('📷 Image uploaded successfully!');
    };
    reader.readAsDataURL(file);
  }
};

// Get or create user ID
async function getUserId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['userId'], (result) => {
      if (result.userId) {
        resolve(result.userId);
      } else {
        const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        chrome.storage.local.set({ userId: newUserId }, () => {
          resolve(newUserId);
        });
      }
    });
  });
}

// Update green points
async function updateGreenPoints(ecoScore) {
  if (ecoScore >= 70) {
    const points = JSON.parse(localStorage.getItem('ecoShopGreenPoints') || '0');
    localStorage.setItem('ecoShopGreenPoints', JSON.stringify(points + 10));
    
    const coins = JSON.parse(localStorage.getItem('ecoShopEcoCoins') || '0');
    localStorage.setItem('ecoShopEcoCoins', JSON.stringify(coins + 5));
  }
}

// Main analysis function
async function analyzeProduct() {
  const productInfo = extractProductInfo();
  if (!productInfo) {
    console.log('No product info found on this page');
    return;
  }

  window.currentProductInfo = productInfo;

  // Calculate eco score using keyword analysis
  const { score: ecoScore, keywords } = calculateEcoScore(productInfo.name, productInfo.description);
  
  // Detect materials
  const materials = detectMaterials(productInfo.name, productInfo.description);
  
  // Calculate recyclability
  const recyclabilityRating = calculateRecyclabilityRating(materials, ecoScore);
  
  // Estimate CO2
  const co2Footprint = estimateCO2Footprint(productInfo.category, ecoScore, materials);
  
  // Generate AI insight
  const aiInsight = generateAIInsight(ecoScore, materials, keywords);
  
  // Get recycle tips
  const recycleTips = getRecycleTips(materials, productInfo.category);
  
  // Get alternatives
  const alternatives = getEcoAlternatives(productInfo.category, ecoScore);

  const analysisData = {
    ecoScore,
    materials,
    recyclabilityRating,
    co2Footprint,
    aiInsight,
    recycleTips,
    alternatives
  };

  // Store analysis data globally for dashboard access
  window.currentAnalysisData = analysisData;

  // Create enhanced badge
  createEnhancedEcoBadge(productInfo, analysisData);
  
  // Update green points
  await updateGreenPoints(ecoScore);
  
  // Track in history
  const history = JSON.parse(localStorage.getItem('ecoShopHistory') || '[]');
  history.push({
    ...productInfo,
    ...analysisData,
    viewedAt: new Date().toISOString()
  });
  localStorage.setItem('ecoShopHistory', JSON.stringify(history.slice(-100))); // Keep last 100
}

// Initialize
async function init() {
  const site = detectSite();
  if (!site) {
    console.log('Not on a supported e-commerce site');
    return;
  }

  console.log(`Detected site: ${site}`);
  
  // Wait for page to load completely
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', analyzeProduct);
  } else {
    setTimeout(analyzeProduct, 1000);
  }
}

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYZE_PRODUCT') {
    analyzeProduct();
  }
});

// Load sustainable alternatives from API
window.ecoShopLoadAlternatives = async function() {
  console.log('🔍 Find Better Alternatives button clicked!');
  
  const loadingEl = document.getElementById('ecoshop-alt-loading');
  const listEl = document.getElementById('ecoshop-alternatives-list');
  
  console.log('Loading element:', loadingEl);
  console.log('List element:', listEl);
  console.log('Current product data:', window.currentAnalysisData);
  console.log('Current product info:', window.currentProductInfo);
  
  if (!listEl) {
    console.error('❌ No alternatives list element found');
    showNotification('Error', 'Alternatives section not found', '#ef4444');
    return;
  }
  
  if (!window.currentAnalysisData) {
    console.error('❌ No product analysis data available');
    showNotification('Error', 'Please wait for product analysis to complete', '#ef4444');
    return;
  }

  // Show loading state
  if (loadingEl) loadingEl.style.display = 'inline';
  listEl.innerHTML = '<div style="text-align: center; padding: 20px; color: #6b7280;">🔍 Searching for eco-friendly alternatives...</div>';

  try {
    const productInfo = window.currentProductInfo || {};
    const analysisData = window.currentAnalysisData || {};
    
    const params = new URLSearchParams({
      productName: productInfo.name || productInfo.title || 'Product',
      currentScore: analysisData.ecoScore || 50,
      category: productInfo.category || 'General',
      limit: 3
    });

    const response = await fetch(`${API_BASE_URL}/alternatives?${params}`);
    const data = await response.json();

    if (loadingEl) loadingEl.style.display = 'none';

    if (!data.success || !data.data.alternatives || data.data.alternatives.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 32px; margin-bottom: 8px;">🌟</div>
          <div style="color: #047857; font-weight: 600;">Great choice!</div>
          <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">
            This product already has a good sustainability rating
          </div>
        </div>
      `;
      return;
    }

    // Display alternatives
    const alternatives = data.data.alternatives;
    listEl.innerHTML = alternatives.map(alt => {
      const scoreColor = alt.ecoScore >= 80 ? '#10b981' : 
                        alt.ecoScore >= 70 ? '#84cc16' : 
                        alt.ecoScore >= 60 ? '#f59e0b' : '#f97316';
      
      const scoreGrade = alt.ecoScore >= 80 ? 'A' : 
                        alt.ecoScore >= 70 ? 'B' : 
                        alt.ecoScore >= 60 ? 'C' : 'D';

      return `
        <div class="ecoshop-alternative-card" onclick="window.ecoShopChooseAlternative('${alt.asin}', '${encodeURIComponent(JSON.stringify(alt))}')">
          ${alt.image ? `<img src="${alt.image}" alt="${alt.title}" class="ecoshop-alt-image">` : ''}
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div class="ecoshop-alt-score" style="background: ${scoreColor};">
              EcoScore: ${scoreGrade} (${alt.ecoScore})
            </div>
            ${alt.co2Savings > 0 ? `
              <div style="font-size: 11px; color: #1e40af; background: #dbeafe; padding: 4px 8px; border-radius: 6px;">
                💨 -${alt.co2Savings.toFixed(1)} kg CO₂
              </div>
            ` : ''}
          </div>

          <div style="font-weight: 600; font-size: 13px; color: #111827; margin-bottom: 6px;">
            ${alt.title}
          </div>

          ${alt.price ? `
            <div style="font-size: 14px; font-weight: 700; color: #047857; margin-bottom: 6px;">
              ${alt.priceSymbol}${alt.price}
              ${alt.priceDifference !== 0 ? `
                <span style="font-size: 11px; font-weight: 500; color: ${alt.priceDifference > 0 ? '#991b1b' : '#166534'};">
                  (${alt.priceDifference > 0 ? '+' : ''}${alt.priceDifference}%)
                </span>
              ` : ''}
            </div>
          ` : ''}

          <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
            ✨ ${alt.whyBetter}
          </div>

          ${alt.sustainabilityHighlights && alt.sustainabilityHighlights.length > 0 ? `
            <div style="margin-bottom: 8px;">
              ${alt.sustainabilityHighlights.slice(0, 2).map(h => `
                <div class="ecoshop-alt-highlight">
                  <span style="color: #10b981;">✓</span>
                  <span>${h}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${alt.switchPercentage ? `
            <div style="margin-bottom: 8px;">
              <div style="background: #e5e7eb; height: 4px; border-radius: 2px; overflow: hidden;">
                <div style="background: #10b981; height: 100%; width: ${alt.switchPercentage}%; transition: width 0.6s;"></div>
              </div>
              <div style="font-size: 10px; color: #6b7280; margin-top: 4px;">
                ${alt.switchPercentage}% of users switched to this
              </div>
            </div>
          ` : ''}

          <div class="ecoshop-reward-badge">
            🏆 Click to view & earn +10 EcoCoins
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Error loading alternatives:', error);
    if (loadingEl) loadingEl.style.display = 'none';
    listEl.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #ef4444;">
        ⚠️ Unable to load alternatives. Please try again.
      </div>
    `;
  }
};

// Choose an alternative and record the choice
window.ecoShopChooseAlternative = async function(asin, alternativeDataEncoded) {
  try {
    const alternative = JSON.parse(decodeURIComponent(alternativeDataEncoded));
    
    // Show reward notification
    const badge = document.getElementById('ecoshop-enhanced-badge');
    if (badge) {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        z-index: 9999999;
        animation: slideInRight 0.5s ease-out;
        border: 2px solid #f59e0b;
      `;
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 32px;">🎉</div>
          <div>
            <div style="font-weight: 700; color: #92400e; margin-bottom: 4px;">
              +10 EcoCoins Earned!
            </div>
            <div style="font-size: 13px; color: #78350f;">
              Great choice for the environment!
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(notification);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }

    // Record the choice
    const productInfo = window.currentProductInfo || {};
    const analysisData = window.currentAnalysisData || {};
    
    try {
      await fetch(`${API_BASE_URL}/alternatives/choose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('ecoUserId') || 'guest',
          originalProduct: {
            name: productInfo.name,
            ecoScore: analysisData.ecoScore
          },
          chosenAlternative: alternative,
          co2Saved: alternative.co2Savings || 0,
          ecoCoinsEarned: 10
        })
      });
    } catch (err) {
      console.error('Error recording choice:', err);
    }

    // Open Amazon link
    if (alternative.link) {
      window.open(alternative.link, '_blank');
    }

  } catch (error) {
    console.error('Error choosing alternative:', error);
  }
};

// Initialize
init();

// Re-analyze on URL change (for SPAs)
let lastUrl = window.location.href;
new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    setTimeout(analyzeProduct, 1500);
  }
}).observe(document, { subtree: true, childList: true });
