import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Brand from '../models/Brand.js';

const router = express.Router();

// ==========================================
// ADMIN ROUTES
// ==========================================

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Admin only
 */
router.get('/dashboard', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalBrands = await Brand.countDocuments();
    
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const brandOwners = await User.countDocuments({ role: 'brand_owner' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role createdAt lastActive');

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProducts,
          totalBrands,
          usersByRole: {
            admin: adminUsers,
            brand_owner: brandOwners,
            user: regularUsers
          }
        },
        recentUsers
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (admin only)
 * @access  Admin only
 */
router.get('/users', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-__v');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

/**
 * @route   PUT /api/admin/users/:userId/role
 * @desc    Update user role (admin only)
 * @access  Admin only
 */
router.put('/users/:userId/role', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'brand_owner', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be: user, brand_owner, or admin'
      });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role'
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Delete user (admin only)
 * @access  Admin only
 */
router.delete('/users/:userId', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOneAndDelete({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// ==========================================
// BRAND OWNER ROUTES
// ==========================================

/**
 * @route   GET /api/brand/dashboard
 * @desc    Get brand owner dashboard
 * @access  Brand Owner or Admin
 */
router.get('/dashboard', requireAuth, requireRole(['brand_owner', 'admin']), async (req, res) => {
  try {
    // Get brands associated with this user's email
    const brands = await Brand.find({ 
      contactEmail: req.user.email 
    });

    const brandIds = brands.map(b => b._id);

    // Get products from these brands
    const products = await Product.find({ 
      brandId: { $in: brandIds } 
    });

    // Calculate statistics
    const totalProducts = products.length;
    const avgEcoScore = products.reduce((sum, p) => {
      const scoreMap = { 'A': 90, 'B': 75, 'C': 55, 'D': 40, 'E': 25 };
      return sum + (scoreMap[p.ecoScore] || 50);
    }, 0) / (totalProducts || 1);

    const avgSustainabilityScore = brands.reduce((sum, b) => 
      sum + (b.sustainabilityScore || 0), 0
    ) / (brands.length || 1);

    res.json({
      success: true,
      data: {
        stats: {
          totalBrands: brands.length,
          totalProducts,
          averageEcoScore: avgEcoScore.toFixed(1),
          averageSustainabilityScore: avgSustainabilityScore.toFixed(1)
        },
        brands,
        recentProducts: products.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Error fetching brand dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

/**
 * @route   GET /api/brand/products
 * @desc    Get products for brand owner's brands
 * @access  Brand Owner or Admin
 */
router.get('/products', requireAuth, requireRole(['brand_owner', 'admin']), async (req, res) => {
  try {
    // Get brands associated with this user's email
    const brands = await Brand.find({ 
      contactEmail: req.user.email 
    });

    const brandIds = brands.map(b => b._id);

    // Get products from these brands
    const products = await Product.find({ 
      brandId: { $in: brandIds } 
    }).populate('brandId', 'name sustainabilityScore');

    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching brand products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

/**
 * @route   PUT /api/brand/products/:id
 * @desc    Update product (brand owner can update their own products)
 * @access  Brand Owner or Admin
 */
router.put('/products/:id', requireAuth, requireRole(['brand_owner', 'admin']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('brandId');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if brand owner owns this product
    if (req.userRole === 'brand_owner') {
      if (product.brandId && product.brandId.contactEmail !== req.user.email) {
        return res.status(403).json({
          success: false,
          message: 'You can only update products from your own brands'
        });
      }
    }

    // Update product
    Object.assign(product, req.body);
    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// ==========================================
// USER ROUTES (Protected)
// ==========================================

/**
 * @route   GET /api/user/profile
 * @desc    Get current user profile
 * @access  Any authenticated user
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profilePicture: req.user.profilePicture,
        level: req.user.level,
        points: req.user.points,
        totalCarbonSaved: req.user.totalCarbonSaved,
        preferences: req.user.preferences,
        createdAt: req.user.createdAt,
        lastActive: req.user.lastActive
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Any authenticated user
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, preferences } = req.body;

    if (name) req.user.name = name;
    if (preferences) req.user.preferences = { ...req.user.preferences, ...preferences };

    await req.user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: req.user
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

export default router;
