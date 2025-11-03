// Enhanced Function Injection for EcoShop Chrome Extension
// Ensures ecoShop functions are always available across all contexts

(function() {
  'use strict';
  
  console.log('🔧 Enhanced EcoShop Function Injection Starting...');
  
  // Global state management
  window.ecoShopState = window.ecoShopState || {
    initialized: false,
    productInfo: {},
    analysisData: {},
    debugMode: true
  };
  
  // Safe function wrapper with error handling
  function createSafeFunction(name, handler) {
    return function(...args) {
      try {
        console.log(`🌱 ${name} called with args:`, args);
        return handler.apply(this, args);
      } catch (error) {
        console.error(`❌ Error in ${name}:`, error);
        
        // Fallback notification
        if (typeof showNotification === 'function') {
          showNotification('⚠️ Function Error', `${name} encountered an error`, '#f59e0b');
        } else {
          alert(`EcoShop: ${name} encountered an error`);
        }
      }
    };
  }
  
  // Enhanced Add to Cart function
  const addToCartHandler = function() {
    console.log('🛒 Enhanced Add to Eco Cart function called');
    
    const productInfo = window.ecoShopState.productInfo || {};
    const analysisData = window.ecoShopState.analysisData || {};
    
    // Validate product data
    if (!productInfo.name && !analysisData.ecoScore) {
      console.warn('⚠️ No product data available, using fallback');
      productInfo.name = document.title || 'Current Page Product';
      analysisData.ecoScore = 50; // Default score
    }
    
    // Get/create cart in localStorage
    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem('ecoShopCart') || '[]');
    } catch (e) {
      console.warn('Failed to parse cart data, using empty cart');
      cart = [];
    }
    
    // Create cart item
    const cartItem = {
      id: Date.now(),
      name: productInfo.name || 'Unknown Product',
      url: productInfo.url || window.location.href,
      ecoScore: analysisData.ecoScore || 50,
      co2Footprint: analysisData.co2Footprint || 0,
      materials: analysisData.materials || [],
      addedAt: new Date().toISOString(),
      domain: window.location.hostname
    };
    
    // Add to cart
    cart.push(cartItem);
    
    try {
      localStorage.setItem('ecoShopCart', JSON.stringify(cart));
      console.log('✅ Product added to cart:', cartItem);
      
      // Success notification
      if (typeof showNotification === 'function') {
        showNotification('✅ Added to Eco Cart!', `${cartItem.name} saved for sustainable shopping`, '#10b981');
      }
      
      // Track analytics
      sendToBackground('RECORD_ACTIVITY', {
        userId: localStorage.getItem('ecoUserId') || 'guest',
        activityType: 'cart_add',
        productName: cartItem.name,
        ecoScore: cartItem.ecoScore
      });
      
    } catch (error) {
      console.error('Failed to save to cart:', error);
      alert('✅ Added to Eco Cart! (cart data not saved)');
    }
  };
  
  // Enhanced Dashboard function
  const openDashboardHandler = function() {
    console.log('📊 Enhanced Dashboard function called');
    
    const productInfo = window.ecoShopState.productInfo || {};
    const analysisData = window.ecoShopState.analysisData || {};
    
    const dashboardData = {
      name: productInfo.name || document.title,
      url: productInfo.url || window.location.href,
      ecoScore: analysisData.ecoScore || 50,
      co2Footprint: analysisData.co2Footprint || 0,
      materials: analysisData.materials || [],
      recyclabilityRating: analysisData.recyclabilityRating || 'C',
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Dashboard data:', dashboardData);
    
    // Try to send to extension background
    sendToBackground('OPEN_DASHBOARD', { productData: dashboardData });
    
    // Fallback notification
    if (typeof showNotification === 'function') {
      showNotification('📊 Dashboard', 'Opening EcoShop dashboard...', '#3b82f6');
    }
  };
  
  // Enhanced Feedback function
  const feedbackHandler = function(type) {
    console.log(`👍👎 Enhanced Feedback function called: ${type}`);
    
    const productInfo = window.ecoShopState.productInfo || {};
    const feedback = {
      type: type,
      productName: productInfo.name || document.title,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
    
    // Store feedback
    try {
      const allFeedback = JSON.parse(localStorage.getItem('ecoShopFeedback') || '[]');
      allFeedback.push(feedback);
      localStorage.setItem('ecoShopFeedback', JSON.stringify(allFeedback));
    } catch (e) {
      console.warn('Failed to store feedback locally');
    }
    
    // Send to background
    sendToBackground('RECORD_ACTIVITY', {
      userId: localStorage.getItem('ecoUserId') || 'guest',
      activityType: 'feedback',
      feedbackType: type,
      productName: feedback.productName
    });
    
    // User notification
    if (typeof showNotification === 'function') {
      showNotification('✅ Feedback Recorded', `Thank you for the ${type} feedback!`, '#10b981');
    }
  };
  
  // Enhanced Alternatives function
  const loadAlternativesHandler = function() {
    console.log('🔍 Enhanced Alternatives function called');
    
    const productInfo = window.ecoShopState.productInfo || {};
    
    // Send to background to load alternatives
    sendToBackground('GET_ALTERNATIVES', {
      productName: productInfo.name || document.title,
      currentScore: window.ecoShopState.analysisData?.ecoScore || 50,
      category: productInfo.category || 'general'
    });
    
    if (typeof showNotification === 'function') {
      showNotification('🔍 Loading Alternatives', 'Finding sustainable alternatives...', '#f59e0b');
    }
  };
  
  // Enhanced Upload function
  const uploadProofHandler = function(event) {
    console.log('📷 Enhanced Upload function called');
    
    // Try to trigger file input
    const fileInput = document.getElementById('ecoshop-feedback-image');
    if (fileInput) {
      fileInput.click();
    } else {
      // Create dynamic file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      
      input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
          console.log('📷 File selected:', file.name);
          
          // Handle file upload logic here
          if (typeof showNotification === 'function') {
            showNotification('📷 Image Selected', `${file.name} ready for upload`, '#8b5cf6');
          }
        }
        document.body.removeChild(input);
      };
      
      document.body.appendChild(input);
      input.click();
    }
  };
  
  // Helper function to send messages to background script
  function sendToBackground(type, data) {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type, data }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn('Background message failed:', chrome.runtime.lastError.message);
          } else {
            console.log('Background response:', response);
          }
        });
      } else {
        console.warn('Chrome runtime not available, using fallback');
        // Could implement alternative communication here
      }
    } catch (error) {
      console.error('Failed to send to background:', error);
    }
  }
  
  // Create safe functions
  window.ecoShopAddToCart = createSafeFunction('ecoShopAddToCart', addToCartHandler);
  window.ecoShopOpenDashboard = createSafeFunction('ecoShopOpenDashboard', openDashboardHandler);
  window.ecoShopFeedback = createSafeFunction('ecoShopFeedback', feedbackHandler);
  window.ecoShopLoadAlternatives = createSafeFunction('ecoShopLoadAlternatives', loadAlternativesHandler);
  window.ecoShopUploadProof = createSafeFunction('ecoShopUploadProof', uploadProofHandler);
  
  // CRITICAL: Inject functions into the main page context as well
  // This ensures they're accessible to Amazon's JavaScript
  const script = document.createElement('script');
  script.textContent = `
    (function() {
      // Inject into main window context for page access
      console.log('🔧 Injecting EcoShop functions into main page context...');
      
      window.ecoShopAddToCart = function() {
        console.log('🛒 EcoShop Add to Cart (page context)');
        // Send message to content script
        window.postMessage({
          type: 'ECOSHOP_MESSAGE',
          action: 'ADD_TO_CART',
          data: {}
        }, '*');
      };
      
      window.ecoShopOpenDashboard = function() {
        console.log('📊 EcoShop Open Dashboard (page context)');
        window.postMessage({
          type: 'ECOSHOP_MESSAGE',
          action: 'OPEN_DASHBOARD', 
          data: {}
        }, '*');
      };
      
      window.ecoShopFeedback = function(type) {
        console.log('👍👎 EcoShop Feedback (page context):', type);
        window.postMessage({
          type: 'ECOSHOP_MESSAGE',
          action: 'FEEDBACK',
          data: { type: type }
        }, '*');
      };
      
      window.ecoShopLoadAlternatives = function() {
        console.log('🔍 EcoShop Load Alternatives (page context)');
        window.postMessage({
          type: 'ECOSHOP_MESSAGE',
          action: 'LOAD_ALTERNATIVES',
          data: {}
        }, '*');
      };
      
      window.ecoShopUploadProof = function(event) {
        console.log('📷 EcoShop Upload Proof (page context)');
        window.postMessage({
          type: 'ECOSHOP_MESSAGE',
          action: 'UPLOAD_PROOF',
          data: { event: event }
        }, '*');
      };
      
      console.log('✅ EcoShop functions injected into page context:', {
        addToCart: typeof window.ecoShopAddToCart,
        openDashboard: typeof window.ecoShopOpenDashboard,
        feedback: typeof window.ecoShopFeedback,
        loadAlternatives: typeof window.ecoShopLoadAlternatives,
        uploadProof: typeof window.ecoShopUploadProof
      });
    })();
  `;
  
  // Inject the script into the page and remove it
  (document.head || document.documentElement).appendChild(script);
  script.remove();
  
  // Listen for messages from the injected page functions
  window.addEventListener('message', function(event) {
    if (event.source !== window) return;
    
    if (event.data.type === 'ECOSHOP_MESSAGE') {
      console.log('📨 Received message from page context:', event.data);
      
      switch (event.data.action) {
        case 'ADD_TO_CART':
          addToCartHandler();
          break;
        case 'OPEN_DASHBOARD':
          openDashboardHandler();
          break;
        case 'FEEDBACK':
          feedbackHandler(event.data.data.type);
          break;
        case 'LOAD_ALTERNATIVES':
          loadAlternativesHandler();
          break;
        case 'UPLOAD_PROOF':
          uploadProofHandler(event.data.data.event);
          break;
      }
    }
  });
  
  // Mark as initialized
  window.ecoShopState.initialized = true;
  
  console.log('✅ Enhanced EcoShop functions successfully injected in both contexts');
  
  // Periodic health check
  setInterval(function() {
    if (!window.ecoShopAddToCart || typeof window.ecoShopAddToCart !== 'function') {
      console.warn('⚠️ EcoShop functions missing, reinitializing...');
      // Re-run this script
      setTimeout(() => location.reload(), 100);
    }
  }, 5000);
  
})();