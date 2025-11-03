import express from 'express';
import { analyzeItem, detectMaterials } from '../controllers/ecoController.js';

const router = express.Router();

// POST /api/eco/analyze
// body: { item_name, item_description }
router.post('/analyze', analyzeItem);

// POST /api/eco/materials
// returns only detected materials
router.post('/materials', detectMaterials);

export default router;
