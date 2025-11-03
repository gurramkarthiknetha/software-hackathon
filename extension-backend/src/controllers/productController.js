import Product from '../models/Product.js';
import Brand from '../models/Brand.js';

// Get or create product by name/URL
export const getProductByName = async (req, res) => {
  try {
    const { name, url, brand } = req.query;
    
    if (!name && !url) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product name or URL is required' 
      });
    }

    let product;
    
    if (url) {
      product = await Product.findOne({ url }).populate('brandRef');
    }
    
    if (!product && name) {
      product = await Product.findOne({ 
        name: new RegExp(name, 'i') 
      }).populate('brandRef');
    }

    if (product) {
      // Increment view count
      product.viewCount += 1;
      await product.save();
      
      return res.json({ 
        success: true, 
        data: product 
      });
    }

    // If not found, return a default eco-score
    res.json({ 
      success: true, 
      data: null,
      message: 'Product not found in database',
      defaultScore: {
        ecoScore: 'C',
        ecoScoreNumeric: 50,
        carbonScore: 50,
        recyclability: 50,
        ethicsScore: 50,
        packagingScore: 50
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Add or update product
export const addOrUpdateProduct = async (req, res) => {
  try {
    const productData = req.body;

    // Find or create brand
    let brand = null;
    if (productData.brand) {
      brand = await Brand.findOne({ 
        name: new RegExp(`^${productData.brand}$`, 'i') 
      });
      
      if (!brand) {
        brand = await Brand.create({
          name: productData.brand,
          sustainabilityScore: 50,
          transparencyScore: 50
        });
      }
      
      productData.brandRef = brand._id;
    }

    let product;
    
    if (productData.url) {
      product = await Product.findOneAndUpdate(
        { url: productData.url },
        productData,
        { new: true, upsert: true, runValidators: true }
      ).populate('brandRef');
    } else {
      product = await Product.create(productData);
      await product.populate('brandRef');
    }

    res.status(201).json({ 
      success: true, 
      data: product 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get greener alternatives
export const getRecommendations = async (req, res) => {
  try {
    const { category, currentScore, limit = 5 } = req.query;

    if (!category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category is required' 
      });
    }

    const minScore = parseInt(currentScore) || 0;

    const alternatives = await Product.find({
      category: new RegExp(category, 'i'),
      ecoScoreNumeric: { $gte: minScore + 10 }
    })
    .sort({ ecoScoreNumeric: -1 })
    .limit(parseInt(limit))
    .populate('brandRef');

    res.json({ 
      success: true, 
      data: alternatives,
      count: alternatives.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Search products
export const searchProducts = async (req, res) => {
  try {
    const { q, category, minScore } = req.query;

    let query = {};

    if (q) {
      query.$text = { $search: q };
    }

    if (category) {
      query.category = new RegExp(category, 'i');
    }

    if (minScore) {
      const scoreMap = { 'A': 80, 'B': 65, 'C': 50, 'D': 35, 'E': 0 };
      query.ecoScoreNumeric = { $gte: scoreMap[minScore] || 0 };
    }

    const products = await Product.find(query)
      .populate('brandRef')
      .limit(50);

    res.json({ 
      success: true, 
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('brandRef')
      .populate('alternatives');

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
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Rate product
export const rateProduct = async (req, res) => {
  try {
    const { productId, userId, rating, comment } = req.body;

    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    product.userRatings.push({
      userId,
      rating,
      comment,
      date: new Date()
    });

    await product.save();

    res.json({ 
      success: true, 
      data: product 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};
