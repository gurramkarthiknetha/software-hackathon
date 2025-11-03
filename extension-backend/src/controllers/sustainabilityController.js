import Product from '../models/Product.js';
import climatiqService from '../services/climatiqService.js';

/**
 * Get sustainability data for a specific product by ID
 * Fetches real-time carbon footprint from Climatiq API
 * @route GET /api/sustainability/:productId
 */
export const getProductSustainability = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find product in database
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if we need to refresh carbon footprint data
    const shouldRefresh = !product.carbonFootprint?.lastCalculated || 
                          (Date.now() - new Date(product.carbonFootprint.lastCalculated).getTime()) > 7 * 24 * 60 * 60 * 1000; // 7 days

    let sustainabilityData;

    if (shouldRefresh) {
      // Fetch fresh data from Climatiq API
      sustainabilityData = await climatiqService.getProductSustainabilityData({
        category: product.category,
        energyConsumption: product.energyConsumption,
        weight: product.weight
      });

      if (sustainabilityData.success) {
        // Update product with new data
        product.carbonFootprint = {
          value: sustainabilityData.data.carbonFootprint.value,
          unit: sustainabilityData.data.carbonFootprint.unit,
          method: sustainabilityData.data.carbonFootprint.method,
          isFallback: sustainabilityData.data.carbonFootprint.isFallback,
          lastCalculated: new Date()
        };

        product.carbonScore = sustainabilityData.data.scores.carbonScore;
        product.recyclability = sustainabilityData.data.scores.recyclability;
        product.packagingScore = sustainabilityData.data.scores.packagingScore;
        product.ethicsScore = sustainabilityData.data.scores.ethicsScore;
        product.ecoScoreNumeric = sustainabilityData.data.scores.ecoScoreNumeric;
        product.ecoScore = sustainabilityData.data.scores.ecoScore;

        await product.save();
      }
    } else {
      // Use cached data
      sustainabilityData = {
        success: true,
        data: {
          carbonFootprint: product.carbonFootprint,
          scores: {
            carbonScore: product.carbonScore,
            recyclability: product.recyclability,
            packagingScore: product.packagingScore,
            ethicsScore: product.ethicsScore,
            ecoScoreNumeric: product.ecoScoreNumeric,
            ecoScore: product.ecoScore
          },
          cached: true
        }
      };
    }

    res.json({
      success: true,
      data: {
        productId: product._id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        carbonFootprint: sustainabilityData.data.carbonFootprint,
        scores: sustainabilityData.data.scores,
        cached: sustainabilityData.data.cached || false,
        lastUpdated: product.carbonFootprint?.lastCalculated || product.lastUpdated
      }
    });

  } catch (error) {
    console.error('Error fetching sustainability data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sustainability data',
      error: error.message
    });
  }
};

/**
 * Calculate sustainability for a product by name/URL (for products not in DB)
 * @route POST /api/sustainability/calculate
 */
export const calculateSustainability = async (req, res) => {
  try {
    const { name, brand, category, energyConsumption, weight, url } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required for sustainability calculation'
      });
    }

    // Check if product already exists
    let product = await Product.findOne({ 
      $or: [
        { url: url },
        { name: name, brand: brand }
      ]
    });

    if (product) {
      // Product exists, return its sustainability data
      return getProductSustainability(req, res);
    }

    // Calculate sustainability for new product
    const sustainabilityData = await climatiqService.getProductSustainabilityData({
      category,
      energyConsumption: energyConsumption || null,
      weight: weight || null
    });

    if (!sustainabilityData.success) {
      throw new Error('Failed to calculate sustainability data');
    }

    // Create new product with sustainability data
    product = new Product({
      name: name || 'Unknown Product',
      brand: brand || 'Unknown',
      category,
      url: url || undefined,
      energyConsumption: energyConsumption || null,
      weight: weight || null,
      carbonFootprint: {
        value: sustainabilityData.data.carbonFootprint.value,
        unit: sustainabilityData.data.carbonFootprint.unit,
        method: sustainabilityData.data.carbonFootprint.method,
        isFallback: sustainabilityData.data.carbonFootprint.isFallback,
        lastCalculated: new Date()
      },
      carbonScore: sustainabilityData.data.scores.carbonScore,
      recyclability: sustainabilityData.data.scores.recyclability,
      packagingScore: sustainabilityData.data.scores.packagingScore,
      ethicsScore: sustainabilityData.data.scores.ethicsScore,
      ecoScoreNumeric: sustainabilityData.data.scores.ecoScoreNumeric,
      ecoScore: sustainabilityData.data.scores.ecoScore
    });

    await product.save();

    res.json({
      success: true,
      data: {
        productId: product._id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        carbonFootprint: sustainabilityData.data.carbonFootprint,
        scores: sustainabilityData.data.scores,
        isNew: true,
        lastUpdated: product.carbonFootprint.lastCalculated
      }
    });

  } catch (error) {
    console.error('Error calculating sustainability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate sustainability data',
      error: error.message
    });
  }
};

/**
 * Batch update sustainability data for multiple products
 * Useful for refreshing database
 * @route POST /api/sustainability/batch-update
 */
export const batchUpdateSustainability = async (req, res) => {
  try {
    const { productIds, forceRefresh } = req.body;

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: 'productIds array is required'
      });
    }

    const results = {
      updated: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    for (const productId of productIds) {
      try {
        const product = await Product.findById(productId);

        if (!product) {
          results.failed++;
          results.errors.push({ productId, error: 'Product not found' });
          continue;
        }

        // Check if refresh is needed
        const shouldRefresh = forceRefresh || 
                             !product.carbonFootprint?.lastCalculated || 
                             (Date.now() - new Date(product.carbonFootprint.lastCalculated).getTime()) > 7 * 24 * 60 * 60 * 1000;

        if (!shouldRefresh) {
          results.skipped++;
          continue;
        }

        // Fetch and update sustainability data
        const sustainabilityData = await climatiqService.getProductSustainabilityData({
          category: product.category,
          energyConsumption: product.energyConsumption,
          weight: product.weight
        });

        if (sustainabilityData.success) {
          product.carbonFootprint = {
            value: sustainabilityData.data.carbonFootprint.value,
            unit: sustainabilityData.data.carbonFootprint.unit,
            method: sustainabilityData.data.carbonFootprint.method,
            isFallback: sustainabilityData.data.carbonFootprint.isFallback,
            lastCalculated: new Date()
          };

          product.carbonScore = sustainabilityData.data.scores.carbonScore;
          product.recyclability = sustainabilityData.data.scores.recyclability;
          product.packagingScore = sustainabilityData.data.scores.packagingScore;
          product.ethicsScore = sustainabilityData.data.scores.ethicsScore;

          await product.save();
          results.updated++;
        } else {
          results.failed++;
          results.errors.push({ productId, error: 'Failed to fetch sustainability data' });
        }

      } catch (error) {
        results.failed++;
        results.errors.push({ productId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Batch update completed',
      results
    });

  } catch (error) {
    console.error('Error in batch update:', error);
    res.status(500).json({
      success: false,
      message: 'Batch update failed',
      error: error.message
    });
  }
};

/**
 * Get supported categories and their Climatiq activity mappings
 * @route GET /api/sustainability/categories
 */
export const getSupportedCategories = async (req, res) => {
  try {
    const categories = [
      { name: 'Refrigerator', activityId: 'consumer_goods-type_refrigerators_and_freezers' },
      { name: 'Washing Machine', activityId: 'consumer_goods-type_major_household_appliances' },
      { name: 'Air Conditioner', activityId: 'consumer_goods-type_air_conditioning_equipment' },
      { name: 'Microwave', activityId: 'consumer_goods-type_small_electrical_appliances' },
      { name: 'Television', activityId: 'consumer_goods-type_televisions' },
      { name: 'Laptop', activityId: 'consumer_goods-type_computers_and_peripheral_equipment' },
      { name: 'Smartphone', activityId: 'consumer_goods-type_communication_equipment' },
      { name: 'Tablet', activityId: 'consumer_goods-type_computers_and_peripheral_equipment' },
      { name: 'Clothing', activityId: 'consumer_goods-type_clothing' },
      { name: 'Footwear', activityId: 'consumer_goods-type_footwear' },
      { name: 'Furniture', activityId: 'consumer_goods-type_furniture' },
      { name: 'Other', activityId: 'consumer_goods-type_other_manufactured_goods' }
    ];

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

export default {
  getProductSustainability,
  calculateSustainability,
  batchUpdateSustainability,
  getSupportedCategories
};
