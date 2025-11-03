import { findSustainableAlternatives, searchAmazonProducts, getProductDetails } from '../services/amazonAPI.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

/**
 * Get sustainable alternatives for a product
 * @route GET /api/alternatives
 * @query productName, productUrl, currentScore, category, limit
 */
export const getAlternatives = async (req, res) => {
  try {
    const { 
      productName, 
      productUrl, 
      currentScore = 50, 
      category,
      limit = 5,
      price
    } = req.query;

    if (!productName && !productUrl) {
      return res.status(400).json({
        success: false,
        message: 'Product name or URL is required'
      });
    }

    console.log('🔍 Finding alternatives for:', productName);

    // Create current product object
    const currentProduct = {
      name: productName,
      url: productUrl,
      ecoScore: parseInt(currentScore),
      price: parseFloat(price) || 0,
      co2Footprint: Math.round((100 - parseInt(currentScore)) * 0.25)
    };

    // Find alternatives using Amazon API
    const alternatives = await findSustainableAlternatives(
      currentProduct, 
      parseInt(currentScore) + 5, // Only show alternatives with at least 5 points higher
      parseInt(limit)
    );

    let finalAlternatives = alternatives || [];
    let fallbackUsed = false;
    console.log(`✅ Found ${finalAlternatives.length} eco-filtered alternatives from service`);

    // If no eco-filtered alternatives found, fall back to a plain search for related products
    if ((!finalAlternatives || finalAlternatives.length === 0) ) {
      try { 
        console.log('ℹ️ No eco-filtered alternatives found in service — performing plain search fallback');
        const searchResults = await searchAmazonProducts(productName || currentProduct.name, parseInt(limit));
        console.log(`🔍 Fallback search found ${searchResults.length} results`);
        // Map search results into the same shape expected by the frontend
        finalAlternatives = (searchResults || []).slice(0, parseInt(limit)).map(s => ({
          ...s,
          priceDifference: currentProduct.price ? (((s.price || 0) - currentProduct.price) / (currentProduct.price || 1) * 100).toFixed(1) : 0,
          co2Savings: Math.abs((currentProduct.co2Footprint || 0) - (s.co2Footprint || 0)),
          scoreDifference: (s.ecoScore || 0) - currentProduct.ecoScore,
          whyBetter: (s.sustainabilityHighlights && s.sustainabilityHighlights.length) ? s.sustainabilityHighlights.slice(0,2).join(' • ') : 'Related product',
          switchPercentage: Math.min(95, Math.round(50 + ((s.ecoScore || 50) - currentProduct.ecoScore) * 0.5))
        }));
        fallbackUsed = true;
      } catch (searchErr) {
        console.warn('Fallback search failed:', searchErr.message || searchErr);
      }
    }

    // Save alternatives to database for future reference
    for (const alt of finalAlternatives) {
      try {
        await Product.findOneAndUpdate(
          { url: alt.link },
          {
            name: alt.title,
            url: alt.link,
            brand: alt.brand || 'Amazon',
            category: category || 'General',
            ecoScore: alt.ecoScore,
            materials: alt.materials.map(m => m.name),
            carbonFootprint: alt.co2Footprint,
            recyclabilityScore: alt.recyclabilityRating,
            certifications: alt.certifications,
            price: alt.price,
            imageUrl: alt.image,
            source: 'amazon_api'
          },
          { upsert: true, new: true }
        );
      } catch (dbError) {
        console.error('DB save error:', dbError.message);
      }
    }

    res.json({
      success: true,
      data: {
        currentProduct: {
          name: productName,
          ecoScore: currentScore
        },
        alternatives: finalAlternatives,
        count: finalAlternatives.length,
        fallbackUsed
      }
    });

  } catch (error) {
    console.error('❌ Get Alternatives Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Search for eco-friendly products
 * @route GET /api/alternatives/search
 * @query query, minScore, limit
 */
export const searchEcoProducts = async (req, res) => {
  try {
    const {
      query,
      minScore = 60,
      limit = 10
    } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    console.log('🔍 Searching for eco products:', query);

    // Add eco keywords to search
    const ecoQuery = `${query} eco-friendly sustainable organic recycled`;

    const products = await searchAmazonProducts(ecoQuery, parseInt(limit) * 2);

    // Filter by minimum score
    const filteredProducts = products.filter(p => p.ecoScore >= parseInt(minScore));

    res.json({
      success: true,
      data: filteredProducts.slice(0, parseInt(limit)),
      count: filteredProducts.length
    });

  } catch (error) {
    console.error('❌ Search Eco Products Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get product details from Amazon
 * @route GET /api/alternatives/product/:asin
 */
export const getAmazonProductDetails = async (req, res) => {
  try {
    const { asin } = req.params;

    if (!asin) {
      return res.status(400).json({
        success: false,
        message: 'ASIN is required'
      });
    }

    const product = await getProductDetails(asin);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('❌ Get Product Details Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Record when user chooses a sustainable alternative
 * @route POST /api/alternatives/choose
 * @body userId, originalProduct, chosenAlternative
 */
export const recordAlternativeChoice = async (req, res) => {
  try {
    const {
      userId,
      originalProduct,
      chosenAlternative,
      co2Saved,
      ecoCoinsEarned = 10
    } = req.body;

    if (!userId || !chosenAlternative) {
      return res.status(400).json({
        success: false,
        message: 'User ID and chosen alternative are required'
      });
    }

    // Find or create user
    let user = await User.findOne({ userId });
    if (!user) {
      user = new User({ userId });
    }

    // Award EcoCoins
    user.greenPoints = (user.greenPoints || 0) + ecoCoinsEarned;

    // Record activity
    user.footprintData.push({
      productName: chosenAlternative.title,
      productUrl: chosenAlternative.link,
      ecoScore: chosenAlternative.ecoScore,
      category: chosenAlternative.category || 'General',
      carbonFootprint: chosenAlternative.co2Footprint,
      timestamp: new Date(),
      activityType: 'alternative_chosen',
      metadata: {
        originalProduct: originalProduct?.name,
        co2Saved: co2Saved || 0,
        ecoCoinsEarned
      }
    });

    // Track alternative switches
    if (!user.stats) {
      user.stats = {};
    }
    user.stats.alternativesSwitched = (user.stats.alternativesSwitched || 0) + 1;
    user.stats.totalCO2Saved = (user.stats.totalCO2Saved || 0) + (co2Saved || 0);

    await user.save();

    res.json({
      success: true,
      message: 'Alternative choice recorded successfully',
      data: {
        ecoCoinsEarned,
        totalEcoCoins: user.greenPoints,
        totalAlternativesSwitched: user.stats.alternativesSwitched,
        totalCO2Saved: user.stats.totalCO2Saved
      }
    });

  } catch (error) {
    console.error('❌ Record Alternative Choice Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get alternative choice statistics
 * @route GET /api/alternatives/stats/:userId
 */
export const getAlternativeStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId });

    if (!user) {
      return res.json({
        success: true,
        data: {
          alternativesSwitched: 0,
          totalCO2Saved: 0,
          ecoCoins: 0
        }
      });
    }

    res.json({
      success: true,
      data: {
        alternativesSwitched: user.stats?.alternativesSwitched || 0,
        totalCO2Saved: user.stats?.totalCO2Saved || 0,
        ecoCoins: user.greenPoints || 0,
        recentChoices: user.footprintData
          .filter(item => item.activityType === 'alternative_chosen')
          .slice(-5)
          .reverse()
      }
    });

  } catch (error) {
    console.error('❌ Get Alternative Stats Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getAlternatives,
  searchEcoProducts,
  getAmazonProductDetails,
  recordAlternativeChoice,
  getAlternativeStats
};
