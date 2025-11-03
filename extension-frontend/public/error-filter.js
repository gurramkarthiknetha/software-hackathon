// Console Error Filter for Chrome Extension
// Filters out known third-party errors that don't affect functionality

(function() {
  'use strict';
  
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // Known third-party error patterns to filter
  const FILTER_PATTERNS = [
    /amazon-adsystem\.com.*sandboxed/i,
    /google.*doubleclick.*sandboxed/i,
    /facebook.*connect.*sandboxed/i,
    /twitter.*widgets.*sandboxed/i
  ];
  
  // Enhanced console.error with filtering
  console.error = function(...args) {
    const message = args.join(' ');
    
    // Check if this is a third-party sandboxed error
    const isThirdPartyError = FILTER_PATTERNS.some(pattern => 
      pattern.test(message)
    );
    
    if (!isThirdPartyError) {
      // Only log errors relevant to our extension
      originalError.apply(console, ['🌱 EcoShop:', ...args]);
    }
  };
  
  // Enhanced console.warn with filtering
  console.warn = function(...args) {
    const message = args.join(' ');
    
    // Filter third-party warnings but keep extension warnings
    if (message.includes('EcoShop') || message.includes('ecoShop')) {
      originalWarn.apply(console, ['🌱 EcoShop:', ...args]);
    }
  };
  
  console.log('🔧 Console error filtering enabled for EcoShop extension');
})();