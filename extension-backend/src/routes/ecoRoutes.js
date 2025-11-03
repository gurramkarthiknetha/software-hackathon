import express from 'express';
import { analyzeItem, detectMaterials, generateSustainabilityMetricsAPI, completeAnalysis } from '../controllers/ecoController.js';

const router = express.Router();

// POST /api/eco/analyze
// body: { item_name, item_description }
router.post('/analyze', analyzeItem);

// POST /api/eco/materials
// returns only detected materials
router.post('/materials', detectMaterials);

// POST /api/eco/sustainability-metrics
// body: { mlOutput, productData }
router.post('/sustainability-metrics', generateSustainabilityMetricsAPI);

// POST /api/eco/complete-analysis
// body: { item_name, item_description, productData }
router.post('/complete-analysis', completeAnalysis);

export default router;
