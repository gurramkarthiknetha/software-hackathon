import express from 'express';
import {
  getProductByName,
  addOrUpdateProduct,
  getRecommendations,
  searchProducts,
  getProductById,
  rateProduct
} from '../controllers/productController.js';

const router = express.Router();

router.get('/search', searchProducts);
router.get('/recommendations', getRecommendations);
router.get('/:id', getProductById);
router.get('/', getProductByName);
router.post('/', addOrUpdateProduct);
router.post('/rate', rateProduct);

export default router;
