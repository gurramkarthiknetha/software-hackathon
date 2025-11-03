import Brand from '../models/Brand.js';

// Get all brands
export const getAllBrands = async (req, res) => {
  try {
    const { limit = 50, sort = '-sustainabilityScore' } = req.query;

    const brands = await Brand.find()
      .sort(sort)
      .limit(parseInt(limit));

    res.json({ 
      success: true, 
      data: brands,
      count: brands.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get brand by ID
export const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({ 
        success: false, 
        message: 'Brand not found' 
      });
    }

    res.json({ 
      success: true, 
      data: brand 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get brand by name
export const getBrandByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Brand name is required' 
      });
    }

    const brand = await Brand.findOne({ 
      name: new RegExp(`^${name}$`, 'i') 
    });

    if (!brand) {
      return res.status(404).json({ 
        success: false, 
        message: 'Brand not found' 
      });
    }

    res.json({ 
      success: true, 
      data: brand 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Create or update brand
export const createOrUpdateBrand = async (req, res) => {
  try {
    const brandData = req.body;

    const brand = await Brand.findOneAndUpdate(
      { name: new RegExp(`^${brandData.name}$`, 'i') },
      brandData,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({ 
      success: true, 
      data: brand 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Rate brand
export const rateBrand = async (req, res) => {
  try {
    const { brandId, rating } = req.body;

    const brand = await Brand.findById(brandId);

    if (!brand) {
      return res.status(404).json({ 
        success: false, 
        message: 'Brand not found' 
      });
    }

    const currentTotal = brand.userRatings.average * brand.userRatings.count;
    const newCount = brand.userRatings.count + 1;
    const newAverage = (currentTotal + rating) / newCount;

    brand.userRatings.average = newAverage;
    brand.userRatings.count = newCount;

    await brand.save();

    res.json({ 
      success: true, 
      data: brand 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};
