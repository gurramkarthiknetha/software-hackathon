import axios from 'axios';

/**
 * Climatiq API Service
 * Handles all interactions with the Climatiq API for carbon emission estimates
 */

const CLIMATIQ_API_URL = 'https://api.climatiq.io/data/v1/estimate';
const CLIMATIQ_API_KEY = process.env.CLIMATIQ_API_KEY;

/**
 * Category to Climatiq Activity ID Mapping
 * Maps product categories to appropriate Climatiq emission factors
 */
const CATEGORY_ACTIVITY_MAPPING = {
  // Home Appliances
  'Refrigerator': {
    activityId: 'consumer_goods-type_refrigerators_and_freezers',
    unit: 'unit',
    dataVersion: '27.27'
  },
  'Washing Machine': {
    activityId: 'consumer_goods-type_major_household_appliances',
    unit: 'unit',
    dataVersion: '27.27'
  },
  'Air Conditioner': {
    activityId: 'consumer_goods-type_air_conditioning_equipment',
    unit: 'unit',
    dataVersion: '27.27'
  },
  'Microwave': {
    activityId: 'consumer_goods-type_small_electrical_appliances',
    unit: 'unit',
    dataVersion: '27.27'
  },
  'Television': {
    activityId: 'consumer_goods-type_televisions',
    unit: 'unit',
    dataVersion: '27.27'
  },
  
  // Electronics
  'Electronics': {
    activityId: 'consumer_goods-type_other_manufactured_goods',
    unit: 'unit',
    dataVersion: '27.27'
  },
  'Laptop': {
    activityId: 'consumer_goods-type_computers_and_peripheral_equipment',
    unit: 'unit',
    dataVersion: '27.27'
  },
  'Smartphone': {
    activityId: 'consumer_goods-type_communication_equipment',
    unit: 'unit',
    dataVersion: '27.27'
  },
  'Tablet': {
    activityId: 'consumer_goods-type_computers_and_peripheral_equipment',
    unit: 'unit',
    dataVersion: '27.27'
  },
  
  // Clothing & Textiles
  'Clothing': {
    activityId: 'consumer_goods-type_clothing',
    unit: 'kg',
    dataVersion: '27.27'
  },
  'Footwear': {
    activityId: 'consumer_goods-type_footwear',
    unit: 'unit',
    dataVersion: '27.27'
  },
  
  // Furniture
  'Furniture': {
    activityId: 'consumer_goods-type_furniture',
    unit: 'kg',
    dataVersion: '27.27'
  },
  
  // Default fallback
  'Other': {
    activityId: 'consumer_goods-type_other_manufactured_goods',
    unit: 'unit',
    dataVersion: '27.27'
  }
};

/**
 * Get the appropriate activity mapping for a product category
 * @param {string} category - Product category
 * @returns {object} Activity mapping object
 */
export const getActivityMapping = (category) => {
  return CATEGORY_ACTIVITY_MAPPING[category] || CATEGORY_ACTIVITY_MAPPING['Other'];
};

/**
 * Fetch carbon footprint estimate from Climatiq API
 * @param {string} category - Product category
 * @param {number} energyConsumption - Energy consumption in kWh (optional)
 * @param {number} weight - Product weight in kg (optional)
 * @returns {Promise<object>} Carbon footprint data
 */
export const fetchCarbonFootprint = async (category, energyConsumption = null, weight = null) => {
  try {
    if (!CLIMATIQ_API_KEY) {
      throw new Error('Climatiq API key not configured');
    }

    const mapping = getActivityMapping(category);
    
    // Build request payload based on available data
    const payload = {
      emission_factor: {
        activity_id: mapping.activityId,
        data_version: mapping.dataVersion
      },
      parameters: {}
    };

    // Add appropriate parameters based on unit type and available data
    if (mapping.unit === 'unit') {
      payload.parameters.number = 1; // Single unit
    } else if (mapping.unit === 'kg' && weight) {
      payload.parameters.weight = weight;
      payload.parameters.weight_unit = 'kg';
    } else if (mapping.unit === 'kg' && !weight) {
      // Default weight if not provided
      payload.parameters.weight = 1;
      payload.parameters.weight_unit = 'kg';
    }

    // If energy consumption is provided, add it (for appliances)
    if (energyConsumption && ['Refrigerator', 'Washing Machine', 'Air Conditioner', 'Television'].includes(category)) {
      // Calculate annual energy consumption
      payload.parameters.energy = energyConsumption;
      payload.parameters.energy_unit = 'kWh';
    }

    const response = await axios.post(CLIMATIQ_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${CLIMATIQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    return {
      success: true,
      data: {
        co2e: response.data.co2e,
        co2e_unit: response.data.co2e_unit,
        co2e_calculation_method: response.data.co2e_calculation_method,
        emission_factor: response.data.emission_factor,
        constituent_gases: response.data.constituent_gases
      }
    };

  } catch (error) {
    console.error('Climatiq API Error:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      fallback: true,
      data: estimateFallbackFootprint(category, energyConsumption, weight)
    };
  }
};

/**
 * Fallback carbon footprint estimation when API fails
 * Uses industry averages
 * @param {string} category - Product category
 * @param {number} energyConsumption - Energy consumption in kWh
 * @param {number} weight - Product weight in kg
 * @returns {object} Estimated carbon footprint
 */
const estimateFallbackFootprint = (category, energyConsumption, weight) => {
  // Industry average CO2e per category (kg CO2e)
  const categoryAverages = {
    'Refrigerator': 150,
    'Washing Machine': 80,
    'Air Conditioner': 120,
    'Microwave': 30,
    'Television': 50,
    'Laptop': 300,
    'Smartphone': 70,
    'Tablet': 100,
    'Clothing': 20,
    'Footwear': 15,
    'Furniture': 100,
    'Other': 50
  };

  let baseCO2e = categoryAverages[category] || categoryAverages['Other'];

  // Adjust based on energy consumption if provided
  if (energyConsumption) {
    // Average grid emission factor: 0.5 kg CO2e per kWh
    baseCO2e += energyConsumption * 0.5;
  }

  // Adjust based on weight if provided
  if (weight) {
    baseCO2e += weight * 2; // Rough estimate: 2 kg CO2e per kg of product
  }

  return {
    co2e: baseCO2e,
    co2e_unit: 'kg',
    co2e_calculation_method: 'fallback_estimate',
    note: 'Estimated using industry averages (Climatiq API unavailable)'
  };
};

/**
 * Calculate sustainability score from CO2 emissions
 * Score ranges from 0-100 (higher is better)
 * @param {number} co2e - CO2 equivalent in kg
 * @param {string} category - Product category
 * @returns {number} Sustainability score (0-100)
 */
export const calculateSustainabilityScore = (co2e, category) => {
  // Category-specific CO2e benchmarks (kg CO2e)
  const benchmarks = {
    'Refrigerator': { excellent: 50, good: 100, average: 150, poor: 200 },
    'Washing Machine': { excellent: 30, good: 60, average: 80, poor: 120 },
    'Air Conditioner': { excellent: 40, good: 80, average: 120, poor: 180 },
    'Microwave': { excellent: 10, good: 20, average: 30, poor: 50 },
    'Television': { excellent: 20, good: 40, average: 50, poor: 80 },
    'Laptop': { excellent: 150, good: 250, average: 300, poor: 400 },
    'Smartphone': { excellent: 30, good: 50, average: 70, poor: 100 },
    'Tablet': { excellent: 50, good: 80, average: 100, poor: 150 },
    'Clothing': { excellent: 5, good: 15, average: 20, poor: 30 },
    'Footwear': { excellent: 5, good: 10, average: 15, poor: 25 },
    'Furniture': { excellent: 40, good: 70, average: 100, poor: 150 },
    'Other': { excellent: 20, good: 40, average: 50, poor: 80 }
  };

  const benchmark = benchmarks[category] || benchmarks['Other'];

  // Calculate score using logarithmic scale
  let score;
  if (co2e <= benchmark.excellent) {
    score = 90 + (benchmark.excellent - co2e) / benchmark.excellent * 10;
  } else if (co2e <= benchmark.good) {
    score = 75 + (benchmark.good - co2e) / (benchmark.good - benchmark.excellent) * 15;
  } else if (co2e <= benchmark.average) {
    score = 50 + (benchmark.average - co2e) / (benchmark.average - benchmark.good) * 25;
  } else if (co2e <= benchmark.poor) {
    score = 25 + (benchmark.poor - co2e) / (benchmark.poor - benchmark.average) * 25;
  } else {
    score = Math.max(0, 25 - (co2e - benchmark.poor) / benchmark.poor * 25);
  }

  return Math.round(Math.max(0, Math.min(100, score)));
};

/**
 * Convert numeric score to letter grade
 * @param {number} score - Numeric score (0-100)
 * @returns {string} Letter grade (A-E)
 */
export const scoreToGrade = (score) => {
  if (score >= 80) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'E';
};

/**
 * Get comprehensive sustainability data for a product
 * @param {object} product - Product object with category, energyConsumption, weight
 * @returns {Promise<object>} Complete sustainability analysis
 */
export const getProductSustainabilityData = async (product) => {
  try {
    const { category, energyConsumption, weight } = product;

    // Fetch carbon footprint from Climatiq
    const carbonData = await fetchCarbonFootprint(category, energyConsumption, weight);

    if (!carbonData.success && !carbonData.fallback) {
      throw new Error('Failed to fetch carbon footprint data');
    }

    const co2e = carbonData.data.co2e;

    // Calculate sustainability score
    const carbonScore = calculateSustainabilityScore(co2e, category);

    // Calculate other scores (you can enhance these with additional APIs)
    const recyclability = estimateRecyclability(category);
    const packagingScore = estimatePackagingScore(category);
    const ethicsScore = 50; // Default, can be enhanced with supply chain data

    // Calculate overall eco score
    const ecoScoreNumeric = Math.round(
      (carbonScore * 0.4) + 
      (recyclability * 0.25) + 
      (packagingScore * 0.2) + 
      (ethicsScore * 0.15)
    );

    const ecoScore = scoreToGrade(ecoScoreNumeric);

    return {
      success: true,
      data: {
        carbonFootprint: {
          value: co2e,
          unit: carbonData.data.co2e_unit,
          method: carbonData.data.co2e_calculation_method,
          isFallback: carbonData.fallback || false
        },
        scores: {
          carbonScore,
          recyclability,
          packagingScore,
          ethicsScore,
          ecoScoreNumeric,
          ecoScore
        },
        climatiqData: carbonData.data,
        lastUpdated: new Date()
      }
    };

  } catch (error) {
    console.error('Error getting sustainability data:', error);
    throw error;
  }
};

/**
 * Estimate recyclability score based on category
 * @param {string} category - Product category
 * @returns {number} Recyclability score (0-100)
 */
const estimateRecyclability = (category) => {
  const recyclabilityMap = {
    'Refrigerator': 70,
    'Washing Machine': 75,
    'Air Conditioner': 65,
    'Microwave': 60,
    'Television': 55,
    'Laptop': 60,
    'Smartphone': 50,
    'Tablet': 55,
    'Clothing': 80,
    'Footwear': 40,
    'Furniture': 65,
    'Other': 50
  };

  return recyclabilityMap[category] || 50;
};

/**
 * Estimate packaging score based on category
 * @param {string} category - Product category
 * @returns {number} Packaging score (0-100)
 */
const estimatePackagingScore = (category) => {
  const packagingMap = {
    'Refrigerator': 50,
    'Washing Machine': 50,
    'Air Conditioner': 45,
    'Microwave': 55,
    'Television': 50,
    'Laptop': 60,
    'Smartphone': 65,
    'Tablet': 65,
    'Clothing': 70,
    'Footwear': 60,
    'Furniture': 40,
    'Other': 50
  };

  return packagingMap[category] || 50;
};

export default {
  fetchCarbonFootprint,
  calculateSustainabilityScore,
  scoreToGrade,
  getProductSustainabilityData,
  getActivityMapping
};
