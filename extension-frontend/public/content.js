// Content script for detecting and analyzing products on e-commerce pages
console.log('🌱 EcoShop content script loaded');

const API_BASE_URL = 'http://localhost:5000/api';

// Configuration for different e-commerce sites
const SITE_CONFIGS = {
  amazon: {
    selectors: {
      productTitle: '#productTitle, #title',
      brand: '.po-brand .po-break-word, #bylineInfo',
      price: '.a-price-whole, #priceblock_ourprice',
      image: '#landingImage, #imgTagWrapperId img'
    },
    urlPattern: /amazon\.(com|in)/
  },
  flipkart: {
    selectors: {
      productTitle: '.B_NuCI, h1.yhB1nd',
      brand: '._2s0LUZ, ._2a4cYd',
      price: '._30jeq3, ._3I9_wc',
      image: '._396cs4 img, ._2r_T1I img'
    },
    urlPattern: /flipkart\.com/
  }
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

  const imageElement = document.querySelector(config.selectors.image);
  const imageUrl = imageElement ? imageElement.src : '';

  if (!productTitle) return null;

  // Determine category based on URL and content
  const category = inferCategory(window.location.href, productTitle);

  return {
    name: productTitle,
    brand: brand || 'Unknown',
    category,
    url: window.location.href,
    imageUrl,
    site
  };
}

// Infer product category from URL and title
function inferCategory(url, title) {
  const categories = {
    'Clothing': ['clothing', 'apparel', 'shirt', 'pants', 'dress', 'jacket', 'fashion'],
    'Shoes': ['shoes', 'footwear', 'sneakers', 'boots', 'sandals'],
    'Electronics': ['electronics', 'phone', 'laptop', 'computer', 'camera', 'tablet'],
    'Home & Kitchen': ['home', 'kitchen', 'furniture', 'decor', 'appliance'],
    'Personal Care': ['beauty', 'cosmetics', 'skincare', 'personal care', 'hygiene'],
    'Sports': ['sports', 'fitness', 'exercise', 'outdoor', 'athletic'],
    'Books': ['books', 'reading', 'novel'],
    'Toys': ['toys', 'games', 'kids'],
    'Food & Grocery': ['grocery', 'food', 'snacks', 'beverage'],
    'Accessories': ['accessories', 'bag', 'wallet', 'watch', 'jewelry']
  };

  const combinedText = (url + ' ' + title).toLowerCase();

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => combinedText.includes(keyword))) {
      return category;
    }
  }

  return 'Other';
}

// Fetch sustainability data from backend
async function fetchSustainabilityData(productInfo) {
  try {
    const queryParams = new URLSearchParams({
      name: productInfo.name,
      url: productInfo.url,
      brand: productInfo.brand
    });

    const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    } else if (data.defaultScore) {
      return {
        ...productInfo,
        ...data.defaultScore,
        isDefault: true
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching sustainability data:', error);
    return null;
  }
}

// Create eco-score badge overlay
function createEcoBadge(sustainabilityData) {
  // Remove existing badge if present
  const existing = document.getElementById('ecoshop-badge');
  if (existing) existing.remove();

  const badge = document.createElement('div');
  badge.id = 'ecoshop-badge';
  badge.className = 'ecoshop-badge';

  const score = sustainabilityData.ecoScore || 'C';
  const numericScore = sustainabilityData.ecoScoreNumeric || 50;
  const isDefault = sustainabilityData.isDefault;

  const scoreColors = {
    'A': '#10b981',
    'B': '#84cc16',
    'C': '#f59e0b',
    'D': '#f97316',
    'E': '#ef4444'
  };

  const color = scoreColors[score] || '#f59e0b';

  badge.innerHTML = `
    <div class="ecoshop-badge-header" style="background: ${color}">
      <span class="ecoshop-logo">🌱</span>
      <span class="ecoshop-score">${score}</span>
      <span class="ecoshop-numeric">${numericScore}/100</span>
    </div>
    <div class="ecoshop-badge-body">
      <div class="ecoshop-metric">
        <span class="ecoshop-label">🌍 Carbon:</span>
        <span class="ecoshop-value">${sustainabilityData.carbonScore || 50}/100</span>
      </div>
      <div class="ecoshop-metric">
        <span class="ecoshop-label">♻️ Recyclability:</span>
        <span class="ecoshop-value">${sustainabilityData.recyclability || 50}/100</span>
      </div>
      <div class="ecoshop-metric">
        <span class="ecoshop-label">⚖️ Ethics:</span>
        <span class="ecoshop-value">${sustainabilityData.ethicsScore || 50}/100</span>
      </div>
      <div class="ecoshop-metric">
        <span class="ecoshop-label">📦 Packaging:</span>
        <span class="ecoshop-value">${sustainabilityData.packagingScore || 50}/100</span>
      </div>
      ${isDefault ? '<div class="ecoshop-warning">⚠️ Default data - not verified</div>' : ''}
      <button class="ecoshop-details-btn" id="ecoshop-details-btn">
        View Details & Alternatives
      </button>
    </div>
  `;

  document.body.appendChild(badge);

  // Add click handler for details button
  document.getElementById('ecoshop-details-btn')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'SHOW_DETAILS',
      data: sustainabilityData
    });
  });

  // Make badge draggable
  makeDraggable(badge);

  return badge;
}

// Make element draggable
function makeDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const header = element.querySelector('.ecoshop-badge-header');

  header.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + 'px';
    element.style.left = (element.offsetLeft - pos1) + 'px';
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Record user activity
async function recordActivity(productInfo, sustainabilityData) {
  try {
    // Get or create user ID
    let userId = await getUserId();

    await fetch(`${API_BASE_URL}/users/${userId}/activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: sustainabilityData._id,
        productName: productInfo.name,
        brand: productInfo.brand,
        ecoScore: sustainabilityData.ecoScore,
        carbonFootprint: sustainabilityData.carbonFootprint?.value || 0,
        action: 'viewed'
      })
    });
  } catch (error) {
    console.error('Error recording activity:', error);
  }
}

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

// Main initialization
async function init() {
  const site = detectSite();
  if (!site) {
    console.log('Not on a supported e-commerce site');
    return;
  }

  console.log(`🛍️ Detected site: ${site}`);

  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', analyzeProduct);
  } else {
    analyzeProduct();
  }
}

async function analyzeProduct() {
  const productInfo = extractProductInfo();
  
  if (!productInfo) {
    console.log('Could not extract product information');
    return;
  }

  console.log('📦 Product detected:', productInfo);

  const sustainabilityData = await fetchSustainabilityData(productInfo);
  
  if (sustainabilityData) {
    console.log('♻️ Sustainability data:', sustainabilityData);
    createEcoBadge(sustainabilityData);
    await recordActivity(productInfo, sustainabilityData);
  }
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'REFRESH_DATA') {
    analyzeProduct();
    sendResponse({ success: true });
  }
});

// Initialize
init();

// Re-analyze on URL change (for SPAs)
let lastUrl = window.location.href;
new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    setTimeout(init, 1000);
  }
}).observe(document, { subtree: true, childList: true });
