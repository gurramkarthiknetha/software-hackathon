import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSustainabilityMetrics } from '../services/sustainabilityMetricsGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PY_EXEC = process.env.PYTHON_EXEC || 'python3';
const SCRIPT_PATH = path.join(__dirname, '..', 'services', 'eco_pipeline.py');

function runPythonPipeline(inputJson) {
  return new Promise((resolve, reject) => {
    const proc = spawn(PY_EXEC, [SCRIPT_PATH], { stdio: ['pipe', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('error', (err) => reject(err));

    proc.on('close', (code) => {
      if (stderr) {
        // include stderr but continue attempting to parse stdout
        console.error('eco_pipeline stderr:', stderr);
      }

      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Failed to parse python output. code=${code} stderr=${stderr} stdout=${stdout}`));
      }
    });

    // write input json to python stdin
    proc.stdin.write(JSON.stringify(inputJson));
    proc.stdin.end();
  });
}

export const analyzeItem = async (req, res) => {
  try {
    const { item_name, item_description } = req.body || {};

    if (!item_name && !item_description) {
      return res.status(400).json({ success: false, message: 'item_name or item_description required' });
    }

    const input = { item_name, item_description };
    const result = await runPythonPipeline(input);

    if (!result || !result.success) {
      return res.status(500).json({ success: false, error: result ? result.error : 'Unknown error from python pipeline' });
    }

    return res.json({ success: true, data: result.data });
  } catch (error) {
    console.error('analyzeItem error:', error.message || error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Optional: expose materials-only endpoint by calling the pipeline and returning materials
export const detectMaterials = async (req, res) => {
  try {
    const { item_name, item_description } = req.body || {};
    if (!item_name && !item_description) {
      return res.status(400).json({ success: false, message: 'item_name or item_description required' });
    }

    const input = { item_name, item_description };
    const result = await runPythonPipeline(input);
    if (!result || !result.success) {
      return res.status(500).json({ success: false, error: result ? result.error : 'Unknown error' });
    }

    res.json({ success: true, materials: result.data.materials });
  } catch (err) {
    console.error('detectMaterials error:', err.message || err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Generate comprehensive sustainability metrics from ML model output and product data
 * @route POST /api/eco/sustainability-metrics
 * @body { mlOutput, productData }
 */
export const generateSustainabilityMetricsAPI = async (req, res) => {
  try {
    const { mlOutput, productData } = req.body || {};
    
    if (!mlOutput || !productData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both mlOutput and productData are required' 
      });
    }

    // Generate comprehensive sustainability metrics
    const sustainabilityMetrics = generateSustainabilityMetrics(mlOutput, productData);

    res.json({
      success: true,
      data: sustainabilityMetrics
    });

  } catch (error) {
    console.error('generateSustainabilityMetrics error:', error.message || error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sustainability metrics',
      error: error.message
    });
  }
};

/**
 * Complete sustainability analysis workflow
 * Runs ML pipeline first, then generates comprehensive metrics
 * @route POST /api/eco/complete-analysis
 * @body { item_name, item_description, productData }
 */
export const completeAnalysis = async (req, res) => {
  try {
    const { item_name, item_description, productData } = req.body || {};
    
    if (!item_name && !item_description) {
      return res.status(400).json({ 
        success: false, 
        message: 'item_name or item_description required' 
      });
    }

    // Step 1: Run ML pipeline
    const input = { item_name, item_description };
    const mlResult = await runPythonPipeline(input);
    
    if (!mlResult || !mlResult.success) {
      return res.status(500).json({ 
        success: false, 
        error: mlResult ? mlResult.error : 'ML pipeline failed' 
      });
    }

    // Step 2: Generate comprehensive sustainability metrics
    const mergedProductData = {
      title: item_name,
      description: item_description,
      ...productData
    };
    
    const sustainabilityMetrics = generateSustainabilityMetrics(mlResult, mergedProductData);

    res.json({
      success: true,
      data: {
        mlOutput: mlResult,
        sustainabilityMetrics,
        combined: {
          ...sustainabilityMetrics,
          ml_analysis: mlResult.data
        }
      }
    });

  } catch (error) {
    console.error('completeAnalysis error:', error.message || error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete sustainability analysis',
      error: error.message
    });
  }
};
