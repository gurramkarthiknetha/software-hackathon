/**
 * Sustainability Metrics Generator Service
 * Generates comprehensive sustainability metrics from ML model output and Amazon product data
 */

/**
 * Generate sustainability metrics for a product
 * @param {Object} mlOutput - ML model JSON response
 * @param {Object} productData - Amazon product details
 * @returns {Object} - Complete sustainability metrics object
 */
export const generateSustainabilityMetrics = (mlOutput, productData) => {
  const {
    product_name = productData.title || 'Unknown Product',
    brand = productData.brand || extractBrandFromTitle(productData.title) || 'Unknown',
    category = productData.category || inferCategoryFromTitle(productData.title) || 'General'
  } = productData;

  // Extract ML model data
  const materials = mlOutput.data?.materials || [];
  const packagingImpact = mlOutput.data?.packaging_impact || {};
  const ethicalSourcing = mlOutput.data?.ethical_sourcing || {};
  const recyclability = mlOutput.data?.recyclability || {};

  // Calculate individual metrics
  const carbonFootprint = calculateCarbonFootprint(materials, category, packagingImpact);
  const recyclabilityMetrics = calculateRecyclabilityMetrics(recyclability, materials);
  const ethicalSourcingMetrics = calculateEthicalSourcingMetrics(ethicalSourcing, materials, brand);
  const packagingMetrics = calculatePackagingMetrics(packagingImpact, materials);
  const sustainabilityRating = calculateSustainabilityRating(materials, category, brand);
  const verificationCertificates = calculateVerificationCertificates(brand, category, materials);
  const brandEthicalScore = calculateBrandEthicalScore(brand, category);
  const productDetails = calculateProductDetailsScore(productData);
  const similarProductsComparison = calculateSimilarProductsComparison(
    carbonFootprint.score, 
    recyclabilityMetrics.score, 
    category
  );

  // Calculate overall ESI (EcoShop Sustainability Index)
  const overallScore = calculateESI({
    carbonFootprint: carbonFootprint.score,
    recyclability: recyclabilityMetrics.score,
    ethicalSourcing: ethicalSourcingMetrics.score,
    packaging: packagingMetrics.score,
    sustainabilityRating: sustainabilityRating.score,
    verificationCertificates: verificationCertificates.score,
    brandEthicalScore: brandEthicalScore.score,
    productDetails: productDetails.score,
    similarProductsComparison: similarProductsComparison.score
  });

  return {
    product_name,
    brand,
    category,
    sustainability_metrics: {
      carbon_footprint: carbonFootprint,
      recyclability: recyclabilityMetrics,
      ethical_sourcing: ethicalSourcingMetrics,
      packaging: packagingMetrics,
      sustainability_rating: {
        overall_score: overallScore,
        rating: scoreToRating(overallScore)
      },
      verification_certificates: verificationCertificates,
      brand_ethical_score: brandEthicalScore,
      product_details: productDetails,
      similar_products_comparison: similarProductsComparison
    }
  };
};

/**
 * Calculate carbon footprint metrics
 */
function calculateCarbonFootprint(materials, category, packagingImpact) {
  // Base scores by category
  const categoryBaseScores = {
    'Electronics': 45,
    'Clothing': 55,
    'Home & Garden': 60,
    'Sports': 65,
    'Automotive': 35,
    'Beauty': 70,
    'Books': 80,
    'General': 50
  };

  let score = categoryBaseScores[category] || 50;

  // Adjust based on materials
  const materialAdjustments = {
    'Plastic': -15,
    'Metal': -10,
    'Steel': -8,
    'Aluminum': -5,
    'Polyester': -12,
    'Leather': -18,
    'Bamboo': +20,
    'Recycled Material': +15,
    'Wood': +8,
    'Paper': +10,
    'Cotton': +5,
    'Glass': -3,
    'Ceramic': -5,
    'Silicone': -7
  };

  materials.forEach(material => {
    const adjustment = materialAdjustments[material] || 0;
    score += adjustment;
  });

  // Adjust based on packaging impact
  if (packagingImpact.impact_score) {
    const packagingAdjustment = (1 - packagingImpact.impact_score) * 10;
    score += packagingAdjustment;
  }

  // Clamp score
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    rating: scoreToRating(score, 'carbon')
  };
}

/**
 * Calculate recyclability metrics
 */
function calculateRecyclabilityMetrics(recyclability, materials) {
  let score = 50;

  // Use ML model data if available
  if (recyclability.recyclable_score) {
    score = Math.round(recyclability.recyclable_score * 100);
  } else {
    // Calculate based on materials
    const recyclabilityScores = {
      'Aluminum': 95,
      'Steel': 90,
      'Glass': 85,
      'Paper': 80,
      'Cardboard': 85,
      'Metal': 88,
      'Wood': 70,
      'Cotton': 60,
      'Bamboo': 85,
      'Recycled Material': 90,
      'Plastic': 25,
      'Polyester': 20,
      'Leather': 15,
      'Rubber': 30,
      'Silicone': 35,
      'Ceramic': 10
    };

    if (materials.length > 0) {
      const scores = materials.map(material => recyclabilityScores[material] || 40);
      score = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
    }
  }

  return {
    score,
    percent: recyclability.recyclable_percent || score,
    rating: scoreToRating(score)
  };
}

/**
 * Calculate ethical sourcing metrics
 */
function calculateEthicalSourcingMetrics(ethicalSourcing, materials, brand) {
  let score = 50;

  // Use ML model data if available
  if (ethicalSourcing.ethical_score) {
    score = Math.round(ethicalSourcing.ethical_score * 100);
  } else {
    // Calculate based on materials and brand
    const ethicalMaterialScores = {
      'Bamboo': 85,
      'Recycled Material': 80,
      'Wood': 65,
      'Cotton': 60,
      'Paper': 70,
      'Leather': 25,
      'Plastic': 40,
      'Metal': 55
    };

    if (materials.length > 0) {
      const scores = materials.map(material => ethicalMaterialScores[material] || 50);
      score = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
    }

    // Brand reputation adjustment
    const brandAdjustment = getBrandEthicalAdjustment(brand);
    score += brandAdjustment;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    rating: ethicalSourcing.ethical_rating || scoreToEthicalRating(score)
  };
}

/**
 * Calculate packaging metrics
 */
function calculatePackagingMetrics(packagingImpact, materials) {
  let score = 50;

  // Use ML model data if available
  if (packagingImpact.impact_score) {
    // Lower impact score = better packaging = higher score
    score = Math.round((1 - packagingImpact.impact_score) * 100);
  } else {
    // Estimate based on materials
    const packagingScores = {
      'Paper': 85,
      'Cardboard': 80,
      'Bamboo': 90,
      'Wood': 75,
      'Glass': 70,
      'Metal': 65,
      'Aluminum': 70,
      'Plastic': 30,
      'Polyester': 25,
      'Styrofoam': 15
    };

    if (materials.length > 0) {
      const scores = materials.map(material => packagingScores[material] || 50);
      score = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
    }
  }

  return {
    score,
    impact_score: packagingImpact.impact_score || (100 - score) / 100,
    rating: packagingImpact.impact_rating || scoreToRating(score)
  };
}

/**
 * Calculate sustainability rating
 */
function calculateSustainabilityRating(materials, category, brand) {
  const categoryScores = {
    'Electronics': 45,
    'Clothing': 55,
    'Home & Garden': 65,
    'Sports': 60,
    'Beauty': 70,
    'Books': 85,
    'Automotive': 40,
    'General': 50
  };

  let score = categoryScores[category] || 50;

  // Material sustainability
  const sustainableMaterials = ['Bamboo', 'Recycled Material', 'Wood', 'Cotton', 'Paper'];
  const unsustainableMaterials = ['Plastic', 'Polyester', 'Leather'];

  const sustainableCount = materials.filter(m => sustainableMaterials.includes(m)).length;
  const unsustainableCount = materials.filter(m => unsustainableMaterials.includes(m)).length;

  score += (sustainableCount * 10) - (unsustainableCount * 8);

  // Brand adjustment
  score += getBrandEthicalAdjustment(brand);

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    rating: scoreToRating(score)
  };
}

/**
 * Calculate verification certificates
 */
function calculateVerificationCertificates(brand, category, materials) {
  let score = 50;
  const labels = [];

  // Base certifications by category
  const categoryBaseCerts = {
    'Electronics': ['ISO 14001', 'Energy Star'],
    'Clothing': ['OEKO-TEX', 'GOTS'],
    'Home & Garden': ['FSC Certified', 'ISO 14001'],
    'Beauty': ['Cruelty-Free', 'Organic'],
    'Sports': ['ISO 14001', 'Recycled Content'],
    'Automotive': ['ISO 14001', 'RoHS Compliant']
  };

  if (categoryBaseCerts[category]) {
    labels.push(...categoryBaseCerts[category]);
    score += 15;
  }

  // Material-based certifications
  if (materials.includes('Bamboo')) {
    labels.push('FSC Certified');
    score += 10;
  }
  if (materials.includes('Recycled Material')) {
    labels.push('Recycled Content');
    score += 15;
  }
  if (materials.includes('Wood')) {
    labels.push('FSC Certified');
    score += 8;
  }
  if (materials.includes('Cotton')) {
    labels.push('GOTS');
    score += 5;
  }

  // Brand reputation adjustment
  const knownEthicalBrands = ['Patagonia', 'Tesla', 'Bamboo', 'Eco', 'Green', 'Sustainable'];
  if (knownEthicalBrands.some(ethical => brand.toLowerCase().includes(ethical.toLowerCase()))) {
    labels.push('B Corp Certified');
    score += 20;
  }

  score = Math.max(30, Math.min(100, Math.round(score)));

  return {
    score,
    labels: [...new Set(labels)] // Remove duplicates
  };
}

/**
 * Calculate brand ethical score
 */
function calculateBrandEthicalScore(brand, category) {
  let score = 60; // Default score

  const brandName = brand.toLowerCase();

  // Known ethical brands (higher scores)
  const ethicalBrands = {
    'patagonia': 95,
    'tesla': 90,
    'unilever': 80,
    'ben & jerry': 85,
    'seventh generation': 90,
    'method': 85
  };

  // Check for ethical keywords in brand name
  const ethicalKeywords = ['eco', 'green', 'sustainable', 'bamboo', 'organic', 'natural'];
  const hasEthicalKeyword = ethicalKeywords.some(keyword => brandName.includes(keyword));

  if (ethicalBrands[brandName]) {
    score = ethicalBrands[brandName];
  } else if (hasEthicalKeyword) {
    score += 15;
  }

  // Category adjustments
  const categoryAdjustments = {
    'Electronics': -5, // Generally lower ethics in electronics
    'Beauty': +10,     // Beauty brands often focus on ethics
    'Clothing': +5,    // Fashion industry becoming more ethical
    'Automotive': -8   // Auto industry traditionally less ethical
  };

  score += categoryAdjustments[category] || 0;

  score = Math.max(30, Math.min(100, Math.round(score)));

  return {
    score,
    rating: scoreToRating(score)
  };
}

/**
 * Calculate product details transparency score
 */
function calculateProductDetailsScore(productData) {
  let score = 50;

  // Check for detailed product information
  if (productData.description && productData.description.length > 100) score += 15;
  if (productData.features && productData.features.length > 3) score += 10;
  if (productData.specifications) score += 10;
  if (productData.materials || productData.composition) score += 15;
  if (productData.certifications) score += 20;
  if (productData.origin || productData.madeIn) score += 10;
  if (productData.warranty) score += 5;

  score = Math.max(0, Math.min(100, Math.round(score)));

  const transparencyLevel = score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low';

  return {
    score,
    transparency_level: transparencyLevel
  };
}

/**
 * Calculate similar products comparison
 */
function calculateSimilarProductsComparison(carbonScore, recyclabilityScore, category) {
  // Category benchmarks (average scores for products in each category)
  const categoryBenchmarks = {
    'Electronics': { carbon: 45, recyclability: 60 },
    'Clothing': { carbon: 55, recyclability: 45 },
    'Home & Garden': { carbon: 60, recyclability: 70 },
    'Beauty': { carbon: 70, recyclability: 50 },
    'Sports': { carbon: 65, recyclability: 55 },
    'Automotive': { carbon: 35, recyclability: 65 },
    'General': { carbon: 50, recyclability: 55 }
  };

  const benchmark = categoryBenchmarks[category] || categoryBenchmarks['General'];
  
  // Calculate how this product compares to category average
  const carbonComparison = carbonScore - benchmark.carbon;
  const recyclabilityComparison = recyclabilityScore - benchmark.recyclability;
  
  // Weighted comparison score
  const comparisonScore = Math.round((carbonComparison * 0.6) + (recyclabilityComparison * 0.4));
  
  let comparison;
  if (comparisonScore > 10) {
    comparison = 'Better';
  } else if (comparisonScore < -10) {
    comparison = 'Worse';
  } else {
    comparison = 'Equal';
  }

  // Convert to 0-100 score
  const score = Math.max(0, Math.min(100, 50 + comparisonScore));

  return {
    score,
    comparison
  };
}

/**
 * Calculate EcoShop Sustainability Index (ESI)
 */
function calculateESI(scores) {
  const esi = Math.round(
    (100 - scores.carbonFootprint) * 0.2 +
    scores.recyclability * 0.1 +
    scores.ethicalSourcing * 0.15 +
    scores.packaging * 0.1 +
    scores.sustainabilityRating * 0.15 +
    scores.similarProductsComparison * 0.05 +
    scores.verificationCertificates * 0.1 +
    scores.productDetails * 0.05 +
    scores.brandEthicalScore * 0.1
  );

  return Math.max(0, Math.min(100, esi));
}

/**
 * Helper functions
 */
function extractBrandFromTitle(title) {
  if (!title) return null;
  
  // Common brand extraction patterns
  const words = title.split(' ');
  return words[0]; // Simple approach - take first word as brand
}

function inferCategoryFromTitle(title) {
  if (!title) return 'General';
  
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('phone') || titleLower.includes('laptop') || titleLower.includes('electronics')) {
    return 'Electronics';
  }
  if (titleLower.includes('shirt') || titleLower.includes('clothing') || titleLower.includes('apparel')) {
    return 'Clothing';
  }
  if (titleLower.includes('home') || titleLower.includes('garden') || titleLower.includes('furniture')) {
    return 'Home & Garden';
  }
  if (titleLower.includes('sports') || titleLower.includes('fitness') || titleLower.includes('exercise')) {
    return 'Sports';
  }
  if (titleLower.includes('beauty') || titleLower.includes('cosmetic') || titleLower.includes('skincare')) {
    return 'Beauty';
  }
  if (titleLower.includes('car') || titleLower.includes('auto') || titleLower.includes('vehicle')) {
    return 'Automotive';
  }
  
  return 'General';
}

function getBrandEthicalAdjustment(brand) {
  const brandLower = brand.toLowerCase();
  
  // Known ethical brands
  if (['patagonia', 'tesla', 'seventh generation'].some(b => brandLower.includes(b))) {
    return 15;
  }
  
  // Ethical keywords in brand name
  if (['eco', 'green', 'sustainable', 'organic', 'natural'].some(k => brandLower.includes(k))) {
    return 8;
  }
  
  return 0;
}

function scoreToRating(score, type = 'general') {
  if (type === 'carbon') {
    // For carbon footprint, lower is better, so invert the rating
    if (score >= 80) return 'Low';
    if (score >= 60) return 'Medium';
    return 'High';
  }
  
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
}

function scoreToEthicalRating(score) {
  if (score >= 80) return 'Highly Ethical';
  if (score >= 50) return 'Moderately Ethical';
  return 'Unethical';
}