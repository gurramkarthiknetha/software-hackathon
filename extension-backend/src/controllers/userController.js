import User from '../models/User.js';
import Product from '../models/Product.js';

// Get or create user
export const getOrCreateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    let user = await User.findOne({ userId });

    if (!user) {
      user = await User.create({
        userId,
        preferences: {
          showEcoScoreOverlay: true,
          minEcoScore: 'C',
          notificationsEnabled: true,
          darkMode: false
        }
      });
    }

    res.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get user footprint
export const getUserFootprint = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;

    const user = await User.findOne({ userId })
      .populate('footprintData.productId');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    let footprintData = user.footprintData;

    // Filter by date range
    if (startDate || endDate) {
      footprintData = footprintData.filter(item => {
        const itemDate = new Date(item.date);
        if (startDate && itemDate < new Date(startDate)) return false;
        if (endDate && itemDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Calculate statistics
    const stats = {
      totalViewed: footprintData.length,
      totalCarbonSaved: user.totalCarbonSaved,
      sustainableChoices: user.sustainableChoicesCount,
      averageEcoScore: calculateAverageEcoScore(footprintData),
      categoryBreakdown: getCategoryBreakdown(footprintData),
      recentActivity: footprintData.slice(-parseInt(limit))
    };

    res.json({ 
      success: true, 
      data: {
        user: {
          userId: user.userId,
          level: user.level,
          points: user.points,
          achievements: user.achievements
        },
        stats,
        footprintData: footprintData.slice(-parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Record user activity (product view)
export const recordActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, productName, brand, ecoScore, carbonFootprint, action } = req.body;

    let user = await User.findOne({ userId });

    if (!user) {
      user = await User.create({ userId });
    }

    user.footprintData.push({
      productId,
      productName,
      brand,
      ecoScore,
      carbonFootprint: carbonFootprint || 0,
      action: action || 'viewed',
      date: new Date()
    });

    // Update stats
    if (ecoScore === 'A' || ecoScore === 'B') {
      user.sustainableChoicesCount += 1;
      user.points += 10;
    }

    user.lastActive = new Date();
    
    // Level up logic
    if (user.points >= user.level * 100) {
      user.level += 1;
      user.achievements.push({
        name: `Level ${user.level}`,
        description: `Reached level ${user.level}`,
        icon: '🌟',
        earnedDate: new Date()
      });
    }

    await user.save();

    res.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update user preferences
export const updatePreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;

    const user = await User.findOneAndUpdate(
      { userId },
      { $set: { preferences } },
      { new: true, upsert: true }
    );

    res.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Save product to favorites
export const saveProduct = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.savedProducts.includes(productId)) {
      user.savedProducts.push(productId);
      await user.save();
    }

    res.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get saved products
export const getSavedProducts = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId })
      .populate('savedProducts');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      data: user.savedProducts 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Helper functions
function calculateAverageEcoScore(footprintData) {
  if (footprintData.length === 0) return 'N/A';
  
  const scoreMap = { 'A': 90, 'B': 75, 'C': 55, 'D': 40, 'E': 25 };
  const sum = footprintData.reduce((acc, item) => {
    return acc + (scoreMap[item.ecoScore] || 50);
  }, 0);
  
  const avg = sum / footprintData.length;
  
  if (avg >= 80) return 'A';
  if (avg >= 65) return 'B';
  if (avg >= 50) return 'C';
  if (avg >= 35) return 'D';
  return 'E';
}

function getCategoryBreakdown(footprintData) {
  const breakdown = {};
  
  footprintData.forEach(item => {
    const category = item.productId?.category || 'Unknown';
    breakdown[category] = (breakdown[category] || 0) + 1;
  });
  
  return breakdown;
}
