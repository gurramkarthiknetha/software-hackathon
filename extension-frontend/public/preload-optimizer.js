// Preload Resource Optimization for EcoShop Extension
// Manages resource preloading to prevent unused resource warnings

(function() {
  'use strict';
  
  console.log('🚀 EcoShop Preload Optimizer Loading...');
  
  // Track preloaded resources
  const preloadedResources = new Map();
  const resourceUsageTracker = new Map();
  
  // Monitor existing preload links
  function auditExistingPreloads() {
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    
    preloadLinks.forEach((link, index) => {
      const href = link.href;
      const asType = link.getAttribute('as');
      const crossorigin = link.getAttribute('crossorigin');
      
      console.log(`🔍 Found preload ${index + 1}:`, {
        href: href.substring(0, 100) + '...',
        as: asType,
        crossorigin: crossorigin
      });
      
      preloadedResources.set(href, {
        element: link,
        asType: asType,
        timestamp: Date.now(),
        used: false
      });
      
      // Set a timeout to check if resource is used
      setTimeout(() => {
        checkResourceUsage(href);
      }, 3000); // Check after 3 seconds
    });
  }
  
  // Check if a preloaded resource has been used
  function checkResourceUsage(href) {
    const resource = preloadedResources.get(href);
    if (!resource) return;
    
    let isUsed = false;
    
    // Check if resource matches any loaded scripts, stylesheets, or images
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const images = Array.from(document.querySelectorAll('img[src]'));
    
    // Check scripts
    if (resource.asType === 'script') {
      isUsed = scripts.some(script => script.src === href);
    }
    
    // Check stylesheets
    if (resource.asType === 'style') {
      isUsed = stylesheets.some(link => link.href === href);
    }
    
    // Check images
    if (resource.asType === 'image') {
      isUsed = images.some(img => img.src === href);
    }
    
    // Check fonts (they don't appear in DOM but get used by CSS)
    if (resource.asType === 'font') {
      // Fonts are harder to track, assume used if it's a reasonable font URL
      isUsed = href.includes('.woff') || href.includes('.ttf') || href.includes('.otf');
    }
    
    resource.used = isUsed;
    
    if (!isUsed) {
      console.warn(`⚠️ Unused preload detected:`, {
        href: href.substring(0, 100) + '...',
        asType: resource.asType,
        suggestion: getOptimizationSuggestion(resource)
      });
      
      // Optionally remove unused preload links to clean up
      if (resource.element && resource.element.parentNode) {
        resource.element.parentNode.removeChild(resource.element);
        console.log('🧹 Removed unused preload link');
      }
    } else {
      console.log(`✅ Preload used successfully:`, {
        href: href.substring(0, 50) + '...',
        asType: resource.asType
      });
    }
  }
  
  // Get optimization suggestions for unused preloads
  function getOptimizationSuggestion(resource) {
    const suggestions = {
      'script': 'Consider lazy loading or removing if not critical',
      'style': 'Check if CSS is actually applied or needed',
      'image': 'Use lazy loading for images below the fold',
      'font': 'Verify font is used in CSS and consider font-display: swap',
      'fetch': 'Ensure the fetch request is actually made'
    };
    
    return suggestions[resource.asType] || 'Review if this resource is actually needed';
  }
  
  // Optimized preload creator for extension resources
  function createOptimizedPreload(href, asType, options = {}) {
    // Don't create preload if it already exists
    if (preloadedResources.has(href)) {
      console.log('🔄 Preload already exists for:', href.substring(0, 50) + '...');
      return;
    }
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = asType;
    
    // Add crossorigin for external resources
    if (options.crossorigin) {
      link.crossOrigin = options.crossorigin;
    }
    
    // Add type for specific resources
    if (options.type) {
      link.type = options.type;
    }
    
    // Track the preload
    preloadedResources.set(href, {
      element: link,
      asType: asType,
      timestamp: Date.now(),
      used: false
    });
    
    document.head.appendChild(link);
    
    console.log(`✅ Created optimized preload:`, {
      href: href.substring(0, 50) + '...',
      as: asType
    });
    
    // Auto-check usage
    setTimeout(() => checkResourceUsage(href), 2000);
  }
  
  // Preload critical EcoShop resources
  function preloadEcoShopResources() {
    const criticalResources = [
      // Extension icons (if they exist)
      { href: chrome.runtime?.getURL?.('icons/icon48.png'), as: 'image' },
      { href: chrome.runtime?.getURL?.('icons/icon128.png'), as: 'image' },
      
      // Critical API endpoints that might be called
      { 
        href: 'http://localhost:5001/api/products', 
        as: 'fetch', 
        options: { crossorigin: 'anonymous' } 
      }
    ];
    
    criticalResources.forEach(resource => {
      if (resource.href && !resource.href.includes('undefined')) {
        createOptimizedPreload(resource.href, resource.as, resource.options);
      }
    });
  }
  
  // Clean up function to remove all extension preloads
  function cleanupEcoShopPreloads() {
    preloadedResources.forEach((resource, href) => {
      if (href.includes('chrome-extension://') || href.includes('localhost:5001')) {
        if (resource.element && resource.element.parentNode) {
          resource.element.parentNode.removeChild(resource.element);
        }
      }
    });
    console.log('🧹 Cleaned up EcoShop preloads');
  }
  
  // Initialize preload optimization
  function initializePreloadOptimization() {
    // Audit existing preloads
    auditExistingPreloads();
    
    // Preload critical extension resources
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      preloadEcoShopResources();
    }
    
    // Monitor for new preloads
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.tagName === 'LINK' && node.rel === 'preload') {
            console.log('🔍 New preload detected:', node.href);
            preloadedResources.set(node.href, {
              element: node,
              asType: node.as,
              timestamp: Date.now(),
              used: false
            });
          }
        });
      });
    });
    
    observer.observe(document.head, { childList: true });
  }
  
  // Expose utilities globally for debugging
  window.ecoShopPreloadOptimizer = {
    auditExistingPreloads,
    createOptimizedPreload,
    cleanupEcoShopPreloads,
    getPreloadedResources: () => Array.from(preloadedResources.entries()),
    getResourceUsage: () => Array.from(resourceUsageTracker.entries())
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePreloadOptimization);
  } else {
    initializePreloadOptimization();
  }
  
  console.log('✅ EcoShop Preload Optimizer Ready');
  
})();