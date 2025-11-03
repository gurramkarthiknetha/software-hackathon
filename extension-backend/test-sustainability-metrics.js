/**
 * Test file for Sustainability Metrics Generator
 * Run this to verify the sustainability metrics generation is working correctly
 */

import { generateSustainabilityMetrics } from './src/services/sustainabilityMetricsGenerator.js';

// Test case 1: Electronics product with mixed materials
const testCase1 = {
  mlOutput: {
    success: true,
    data: {
      materials: ["Plastic", "Metal", "Steel", "Silicone"],
      packaging_impact: {
        impact_score: 0.55,
        impact_rating: "Medium"
      },
      ethical_sourcing: {
        ethical_rating: "Moderately ethical",
        ethical_score: 0.6
      },
      recyclability: {
        recyclable_score: 0.67,
        recyclable_percent: 67.5
      }
    }
  },
  productData: {
    title: "Everest ABS Body EPS 50 Voltage Stabilizer",
    brand: "Everest",
    category: "Electronics",
    description: "A voltage stabilizer with ABS plastic body and metal components",
    price: 50.00,
    rating: 4.2,
    features: ["Energy efficient", "Compact design", "LED indicators"]
  }
};

// Test case 2: Eco-friendly product
const testCase2 = {
  mlOutput: {
    success: true,
    data: {
      materials: ["Bamboo", "Recycled Material", "Paper"],
      packaging_impact: {
        impact_score: 0.2,
        impact_rating: "Low"
      },
      ethical_sourcing: {
        ethical_rating: "Highly ethical",
        ethical_score: 0.9
      },
      recyclability: {
        recyclable_score: 0.85,
        recyclable_percent: 85.0
      }
    }
  },
  productData: {
    title: "EcoGreen Bamboo Coffee Cup",
    brand: "EcoGreen",
    category: "Home & Garden",
    description: "Sustainable bamboo coffee cup with recyclable materials",
    price: 25.00,
    rating: 4.8,
    features: ["100% Bamboo", "Dishwasher safe", "Leak-proof"]
  }
};

// Test case 3: Low sustainability product
const testCase3 = {
  mlOutput: {
    success: true,
    data: {
      materials: ["Plastic", "Polyester", "Leather"],
      packaging_impact: {
        impact_score: 0.8,
        impact_rating: "High"
      },
      ethical_sourcing: {
        ethical_rating: "Unethical",
        ethical_score: 0.25
      },
      recyclability: {
        recyclable_score: 0.2,
        recyclable_percent: 20.0
      }
    }
  },
  productData: {
    title: "Fashion Fast Synthetic Jacket",
    brand: "FastFashion",
    category: "Clothing",
    description: "Synthetic materials jacket with plastic components",
    price: 80.00,
    rating: 3.5,
    features: ["Water resistant", "Lightweight", "Multiple colors"]
  }
};

function runTests() {
  console.log('🧪 Testing Sustainability Metrics Generator\n');
  
  // Test Case 1: Electronics
  console.log('📱 Test Case 1: Electronics Product');
  const result1 = generateSustainabilityMetrics(testCase1.mlOutput, testCase1.productData);
  console.log('Product:', result1.product_name);
  console.log('ESI Score:', result1.sustainability_metrics.sustainability_rating.overall_score);
  console.log('Carbon Footprint:', result1.sustainability_metrics.carbon_footprint.score, 
              `(${result1.sustainability_metrics.carbon_footprint.rating})`);
  console.log('Recyclability:', result1.sustainability_metrics.recyclability.score, 
              `(${result1.sustainability_metrics.recyclability.rating})`);
  console.log('Certifications:', result1.sustainability_metrics.verification_certificates.labels);
  console.log('---\n');

  // Test Case 2: Eco-friendly
  console.log('🌿 Test Case 2: Eco-friendly Product');
  const result2 = generateSustainabilityMetrics(testCase2.mlOutput, testCase2.productData);
  console.log('Product:', result2.product_name);
  console.log('ESI Score:', result2.sustainability_metrics.sustainability_rating.overall_score);
  console.log('Carbon Footprint:', result2.sustainability_metrics.carbon_footprint.score, 
              `(${result2.sustainability_metrics.carbon_footprint.rating})`);
  console.log('Recyclability:', result2.sustainability_metrics.recyclability.score, 
              `(${result2.sustainability_metrics.recyclability.rating})`);
  console.log('Certifications:', result2.sustainability_metrics.verification_certificates.labels);
  console.log('---\n');

  // Test Case 3: Low sustainability
  console.log('⚠️ Test Case 3: Low Sustainability Product');
  const result3 = generateSustainabilityMetrics(testCase3.mlOutput, testCase3.productData);
  console.log('Product:', result3.product_name);
  console.log('ESI Score:', result3.sustainability_metrics.sustainability_rating.overall_score);
  console.log('Carbon Footprint:', result3.sustainability_metrics.carbon_footprint.score, 
              `(${result3.sustainability_metrics.carbon_footprint.rating})`);
  console.log('Recyclability:', result3.sustainability_metrics.recyclability.score, 
              `(${result3.sustainability_metrics.recyclability.rating})`);
  console.log('Certifications:', result3.sustainability_metrics.verification_certificates.labels);
  console.log('---\n');

  // Display sample output for user requirements
  console.log('📋 Sample Output (Test Case 1):');
  console.log(JSON.stringify(result1, null, 2));
}

runTests();