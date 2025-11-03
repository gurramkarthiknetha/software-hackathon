import express from 'express';
import {
  getOrCreateUser,
  getUserFootprint,
  recordActivity,
  updatePreferences,
  saveProduct,
  getSavedProducts
} from '../controllers/userController.js';

const router = express.Router();

router.get('/:userId', getOrCreateUser);
router.get('/:userId/footprint', getUserFootprint);
router.post('/:userId/activity', recordActivity);
router.put('/:userId/preferences', updatePreferences);
router.post('/:userId/save-product', saveProduct);
router.get('/:userId/saved-products', getSavedProducts);

export default router;
