import express from 'express';
import {
  getAllBrands,
  getBrandById,
  getBrandByName,
  createOrUpdateBrand,
  rateBrand
} from '../controllers/brandController.js';

const router = express.Router();

router.get('/search', getBrandByName);
router.get('/:id', getBrandById);
router.get('/', getAllBrands);
router.post('/', createOrUpdateBrand);
router.post('/rate', rateBrand);

export default router;
