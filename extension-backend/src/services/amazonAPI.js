import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const AMAZON_API_KEY = process.env.AMAZON_API_KEY || 'c94e5710-e8f8-4800-bce5-55a137c6ad75';
const AMAZON_API_BASE_URL = 'https://api.rainforestapi.com/request';

// Eco-friendly keywords for scoring
const ECO_KEYWORDS = {
  positive: {
    'recycled': 15, 'organic': 18, 'biodegradable': 20, 'eco-friendly': 15,
    'bamboo': 12, 'sustainable': 15, 'natural': 10, 'renewable': 15,
    'compostable': 18, 'reusable': 15, 'plant-based': 15, 'green': 8,
    'eco': 10, 'environmental': 8, 'carbon-neutral': 20, 'zero-waste': 18,
    'fair-trade': 12, 'ethical': 10, 'b-corp': 15, 'certified': 8,
    'solar': 12, 'wind': 12, 'hemp': 10, 'jute': 10, 'cork': 10,
    'upcycled': 15, 'refillable': 12, 'minimal-packaging': 12, 'bio': 10,
    'vegan': 12, 'cruelty-free': 10, 'non-toxic': 12, 'fsc': 15
  },
  negative: {
    'plastic': -20, 'disposable': -15, 'single-use': -20, 'non-recyclable': -15,
    'petroleum': -15, 'synthetic': -10, 'fossil': -18, 'toxic': -20,
    'chemical': -10, 'bleached': -8, 'non-biodegradable': -15, 'pvc': -15,
    'microplastic': -20, 'styrofoam': -18, 'polystyrene': -15
  }
};

/**
 * Search for products on Amazon using Rainforest API
 * @param {string} query - Search query
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise<Array>} - Array of product data
 */
export const searchAmazonProducts = async (query, maxResults = 10) => {
  try {
    const params = {
      api_key: AMAZON_API_KEY,
      type: 'search',
      amazon_domain: 'amazon.com',
      search_term: query,
      page: 1
    };

    console.log('🔍 Searching Amazon for:', query);
    
    const response = await axios.get(AMAZON_API_BASE_URL, { 
      params,
      timeout: 10000 
    });

    if (!response.data || !response.data.search_results) {
      console.log('❌ No search results found');
      return [];
    }

    const products = response.data.search_results.slice(0, maxResults);
    
    // Transform and enhance with eco data
    const enhancedProducts = products.map(product => {
      const ecoScore = calculateEcoScore(product);
      const sustainabilityData = analyzeSustainability(product);
      
      return {
        asin: product.asin,
        title: product.title,
        price: product.price?.value || 0,
        priceSymbol: product.price?.symbol || '$',
        image: product.image,
        rating: product.rating || 0,
        ratingsTotal: product.ratings_total || 0,
        link: product.link,
        ecoScore: ecoScore,
        ...sustainabilityData
      };
    });

    console.log(`✅ Found ${enhancedProducts.length} products`);
    return enhancedProducts;

  } catch (error) {
    console.error('❌ Amazon API Error:', error.message);
    
    // Return mock data for development/testing
    return generateMockAlternatives(query, maxResults);
  }
};

/**
 * Get product details by ASIN
 * @param {string} asin - Amazon Standard Identification Number
 * @returns {Promise<Object>} - Product details
 */
export const getProductDetails = async (asin) => {
  try {
    const params = {
      api_key: AMAZON_API_KEY,
      type: 'product',
      amazon_domain: 'amazon.com',
      asin: asin
    };

    const response = await axios.get(AMAZON_API_BASE_URL, { 
      params,
      timeout: 10000 
    });

    if (!response.data || !response.data.product) {
      return null;
    }

    const product = response.data.product;
    const ecoScore = calculateEcoScore(product);
    const sustainabilityData = analyzeSustainability(product);

    return {
      asin: product.asin,
      title: product.title,
      price: product.buybox_winner?.price?.value || 0,
      priceSymbol: product.buybox_winner?.price?.symbol || '$',
      image: product.main_image?.link,
      rating: product.rating || 0,
      ratingsTotal: product.ratings_total || 0,
      description: product.description,
      features: product.feature_bullets || [],
      link: product.link,
      ecoScore: ecoScore,
      ...sustainabilityData
    };

  } catch (error) {
    console.error('❌ Get Product Details Error:', error.message);
    return null;
  }
};

/**
 * Calculate EcoScore based on product data
 * @param {Object} product - Product data
 * @returns {number} - Score from 0-100
 */
const calculateEcoScore = (product) => {
  let score = 50; // Base score
  
  const searchableText = [
    product.title || '',
    product.description || '',
    ...(product.feature_bullets || []),
    ...(product.attributes?.map(attr => `${attr.name} ${attr.value}`) || [])
  ].join(' ').toLowerCase();

  // Check positive keywords
  Object.entries(ECO_KEYWORDS.positive).forEach(([keyword, points]) => {
    if (searchableText.includes(keyword)) {
      score += points;
    }
  });

  // Check negative keywords
  Object.entries(ECO_KEYWORDS.negative).forEach(([keyword, points]) => {
    if (searchableText.includes(keyword)) {
      score += points; // points are negative
    }
  });

  // Clamp score between 0-100
  return Math.max(0, Math.min(100, score));
};

/**
 * Analyze sustainability aspects of a product
 * @param {Object} product - Product data
 * @returns {Object} - Sustainability analysis
 */
const analyzeSustainability = (product) => {
  const searchableText = [
    product.title || '',
    product.description || '',
    ...(product.feature_bullets || [])
  ].join(' ').toLowerCase();

  // Detect materials
  const materials = [];
  const materialMap = {
    'bamboo': { emoji: '🎋', score: 85, recyclable: true },
    'organic cotton': { emoji: '🌿', score: 80, recyclable: true },
    'recycled': { emoji: '♻️', score: 90, recyclable: true },
    'hemp': { emoji: '🌾', score: 85, recyclable: true },
    'cork': { emoji: '🪵', score: 80, recyclable: true },
    'wood': { emoji: '🌳', score: 70, recyclable: true },
    'glass': { emoji: '🫙', score: 85, recyclable: true },
    'metal': { emoji: '🔩', score: 75, recyclable: true },
    'plastic': { emoji: '🛢️', score: 30, recyclable: false },
    'polyester': { emoji: '🧵', score: 40, recyclable: false }
  };

  Object.entries(materialMap).forEach(([material, data]) => {
    if (searchableText.includes(material)) {
      materials.push({ name: material, ...data });
    }
  });

  // Calculate CO2 footprint (simplified)
  const avgScore = materials.length > 0 
    ? materials.reduce((sum, m) => sum + m.score, 0) / materials.length 
    : 50;
  const co2Footprint = Math.round((100 - avgScore) * 0.3); // 0-30 kg CO2e

  // Determine recyclability
  const recyclableCount = materials.filter(m => m.recyclable).length;
  const recyclabilityRating = materials.length > 0
    ? recyclableCount / materials.length >= 0.7 ? 'A' : 
      recyclableCount / materials.length >= 0.5 ? 'B' :
      recyclableCount / materials.length >= 0.3 ? 'C' : 'D'
    : 'C';

  // Detect certifications
  const certifications = [];
  const certMap = {
    'fsc certified': '🌲 FSC Certified',
    'fair trade': '🤝 Fair Trade',
    'organic': '🌱 USDA Organic',
    'b corp': '🏆 B Corporation',
    'carbon neutral': '🌍 Carbon Neutral',
    'energy star': '⭐ Energy Star',
    'cruelty free': '🐰 Cruelty Free'
  };

  Object.entries(certMap).forEach(([keyword, cert]) => {
    if (searchableText.includes(keyword)) {
      certifications.push(cert);
    }
  });

  return {
    materials: materials.slice(0, 5),
    co2Footprint,
    recyclabilityRating,
    certifications,
    isEcoFriendly: avgScore >= 70,
    sustainabilityHighlights: generateHighlights(materials, certifications)
  };
};

/**
 * Generate sustainability highlights
 * @param {Array} materials - Detected materials
 * @param {Array} certifications - Detected certifications
 * @returns {Array} - Highlights
 */
const generateHighlights = (materials, certifications) => {
  const highlights = [];
  
  if (materials.some(m => m.name.includes('recycled'))) {
    highlights.push('♻️ Made from recycled materials');
  }
  if (materials.some(m => m.name.includes('bamboo'))) {
    highlights.push('🎋 Sustainable bamboo construction');
  }
  if (materials.some(m => m.name.includes('organic'))) {
    highlights.push('🌿 Organic materials used');
  }
  if (certifications.length > 0) {
    highlights.push(`🏆 ${certifications.length} eco-certifications`);
  }
  if (materials.every(m => m.recyclable)) {
    highlights.push('♻️ Fully recyclable product');
  }
  
  return highlights.slice(0, 3);
};

/**
 * Generate mock alternatives for development/testing
 * @param {string} query - Search query
 * @param {number} count - Number of alternatives
 * @returns {Array} - Mock product data
 */
const generateMockAlternatives = (query, count = 5) => {
  console.log('🧪 Using mock data for development');
  
  const mockProducts = [
    {
      asin: 'B08MOCK001',
      title: `Eco-Friendly ${query} - Bamboo Edition`,
      price: 29.99,
      priceSymbol: '$',
      image: 'https://via.placeholder.com/300x300?text=Bamboo+Product',
      rating: 4.5,
      ratingsTotal: 1250,
      link: 'https://amazon.com/mock1',
      ecoScore: 85,
      materials: [
        { name: 'bamboo', emoji: '🎋', score: 85, recyclable: true }
      ],
      co2Footprint: 5,
      recyclabilityRating: 'A',
      certifications: ['🌲 FSC Certified', '🌱 USDA Organic'],
      isEcoFriendly: true,
      sustainabilityHighlights: [
        '🎋 Sustainable bamboo construction',
        '🏆 2 eco-certifications',
        '♻️ Fully recyclable product'
      ]
    },
    {
      asin: 'B08MOCK002',
      title: `Recycled ${query} - Zero Waste`,
      price: 34.99,
      priceSymbol: '$',
      image: 'https://via.placeholder.com/300x300?text=Recycled+Product',
      rating: 4.7,
      ratingsTotal: 890,
      link: 'https://amazon.com/mock2',
      ecoScore: 92,
      materials: [
        { name: 'recycled', emoji: '♻️', score: 90, recyclable: true }
      ],
      co2Footprint: 3,
      recyclabilityRating: 'A',
      certifications: ['♻️ 100% Recycled', '🌍 Carbon Neutral'],
      isEcoFriendly: true,
      sustainabilityHighlights: [
        '♻️ Made from recycled materials',
        '🏆 2 eco-certifications',
        '♻️ Fully recyclable product'
      ]
    },
    {
      asin: 'B08MOCK003',
      title: `Organic ${query} - Natural Materials`,
      price: 27.99,
      priceSymbol: '$',
      image: 'https://via.placeholder.com/300x300?text=Organic+Product',
      rating: 4.3,
      ratingsTotal: 650,
      link: 'https://amazon.com/mock3',
      ecoScore: 78,
      materials: [
        { name: 'organic cotton', emoji: '🌿', score: 80, recyclable: true }
      ],
      co2Footprint: 7,
      recyclabilityRating: 'B',
      certifications: ['🌱 USDA Organic', '🤝 Fair Trade'],
      isEcoFriendly: true,
      sustainabilityHighlights: [
        '🌿 Organic materials used',
        '🏆 2 eco-certifications'
      ]
    }
  ];

  return mockProducts.slice(0, count);
};

/**
 * Find sustainable alternatives for a product
 * @param {Object} currentProduct - Current product data
 * @param {number} minScore - Minimum EcoScore for alternatives
 * @param {number} maxResults - Maximum number of alternatives
 * @returns {Promise<Array>} - Array of alternative products
 */
export const findSustainableAlternatives = async (currentProduct, minScore = 60, maxResults = 5) => {
  try {
    // Extract search keywords from product name
    const keywords = extractKeywords(currentProduct.name || currentProduct.title);
    const searchQuery = keywords.join(' ');

    console.log('🔍 Finding alternatives for:', searchQuery);

    // Search for similar products
    const allProducts = await searchAmazonProducts(searchQuery, maxResults * 2);

    // Filter products with higher EcoScore
    const currentScore = currentProduct.ecoScore || 50;
    let alternatives = allProducts.filter(product => 
      product.ecoScore > currentScore && 
      product.ecoScore >= minScore &&
      product.asin !== currentProduct.asin
    );

    // Calculate comparison data
    alternatives = alternatives.map(alt => {
      const priceDiff = currentProduct.price 
        ? ((alt.price - currentProduct.price) / currentProduct.price * 100).toFixed(1)
        : 0;
      
      const co2Savings = Math.abs(currentProduct.co2Footprint - alt.co2Footprint);
      const scoreDiff = alt.ecoScore - currentScore;

      return {
        ...alt,
        priceDifference: parseFloat(priceDiff),
        co2Savings,
        scoreDifference: scoreDiff,
        whyBetter: generateWhyBetter(alt, currentProduct),
        switchPercentage: Math.min(95, Math.round(50 + scoreDiff * 0.5)) // Simulated
      };
    });

    // Sort by EcoScore (descending)
    alternatives.sort((a, b) => b.ecoScore - a.ecoScore);

    console.log(`✅ Found ${alternatives.length} sustainable alternatives`);
    return alternatives.slice(0, maxResults);

  } catch (error) {
    console.error('❌ Error finding alternatives:', error.message);
    return [];
  }
};

/**
 * Extract keywords from product name
 * @param {string} productName - Product name
 * @returns {Array} - Keywords
 */
const extractKeywords = (productName) => {
  // Remove common words and extract meaningful keywords
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by'];
  const words = productName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
  
  return words.slice(0, 3); // Top 3 keywords
};

/**
 * Generate explanation for why alternative is better
 * @param {Object} alternative - Alternative product
 * @param {Object} current - Current product
 * @returns {string} - Explanation
 */
const generateWhyBetter = (alternative, current) => {
  const reasons = [];
  
  const co2Diff = current.co2Footprint - alternative.co2Footprint;
  if (co2Diff > 0) {
    reasons.push(`Reduces CO₂ emissions by ${co2Diff.toFixed(1)} kg`);
  }

  if (alternative.materials.some(m => m.name.includes('recycled'))) {
    reasons.push('Uses recycled materials');
  } else if (alternative.materials.some(m => m.name.includes('bamboo'))) {
    reasons.push('Made from sustainable bamboo');
  } else if (alternative.materials.some(m => m.name.includes('organic'))) {
    reasons.push('Uses organic materials');
  }

  if (alternative.certifications.length > current.certifications?.length || 0) {
    reasons.push(`${alternative.certifications.length} eco-certifications`);
  }

  if (alternative.recyclabilityRating === 'A') {
    reasons.push('Fully recyclable');
  }

  return reasons.slice(0, 2).join(' • ') || 'Better sustainability rating';
};

export default {
  searchAmazonProducts,
  getProductDetails,
  findSustainableAlternatives
};
