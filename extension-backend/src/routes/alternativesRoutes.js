import express from 'express';
import {
  getAlternatives,
  searchEcoProducts,
  getAmazonProductDetails,
  recordAlternativeChoice,
  getAlternativeStats
} from '../controllers/alternativesController.js';

const router = express.Router();

// Get sustainable alternatives for a product
router.get('/', getAlternatives);

// Search for eco-friendly products
router.get('/search', searchEcoProducts);

// Get product details by ASIN
router.get('/product/:asin', getAmazonProductDetails);

// Record when user chooses an alternative
router.post('/choose', recordAlternativeChoice);

// Get user's alternative choice statistics
router.get('/stats/:userId', getAlternativeStats);

export default router;
