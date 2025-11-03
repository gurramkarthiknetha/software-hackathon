import express from 'express';
import {
  getProductSustainability,
  calculateSustainability,
  batchUpdateSustainability,
  getSupportedCategories
} from '../controllers/sustainabilityController.js';

const router = express.Router();

/**
 * @route   GET /api/sustainability/categories
 * @desc    Get list of supported product categories
 * @access  Public
 */
router.get('/categories', getSupportedCategories);

/**
 * @route   POST /api/sustainability/calculate
 * @desc    Calculate sustainability for a new product
 * @access  Public
 * @body    { name, brand, category, energyConsumption?, weight?, url? }
 */
router.post('/calculate', calculateSustainability);

/**
 * @route   POST /api/sustainability/batch-update
 * @desc    Batch update sustainability data for multiple products
 * @access  Admin (can add auth middleware later)
 * @body    { productIds: [], forceRefresh?: boolean }
 */
router.post('/batch-update', batchUpdateSustainability);

/**
 * @route   GET /api/sustainability/:productId
 * @desc    Get sustainability data for a specific product
 * @access  Public
 * @important Must be LAST to avoid catching other routes
 */
router.get('/:productId', getProductSustainability);

export default router;
