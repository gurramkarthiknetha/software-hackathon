import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, TrendingUp, Package, ExternalLink, Award, MapPin, Zap, RefreshCw, Beaker } from 'lucide-react';
import { productAPI, userAPI, sustainabilityAPI, ecoAPI } from '../api';
import SupplyChainMap from './SupplyChainMap';
import SustainableAlternatives from './SustainableAlternatives';

const ProductDetails = ({ product, userId }) => {
  const [alternatives, setAlternatives] = useState([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [sustainabilityData, setSustainabilityData] = useState(null);
  const [loadingSustainability, setLoadingSustainability] = useState(false);
  const [sustainabilityError, setSustainabilityError] = useState(null);
  
  // New states for ML-driven metrics
  const [mlMetrics, setMlMetrics] = useState(null);
  const [loadingMlAnalysis, setLoadingMlAnalysis] = useState(false);
  const [mlError, setMlError] = useState(null);
  const [animatedValues, setAnimatedValues] = useState({
    carbonFootprint: 50,
    recyclability: 50,
    ethicalSourcing: 50,
    packagingImpact: 50
  });

  useEffect(() => {
    if (product && product.category) {
      loadAlternatives();
      loadSustainabilityData();
      // Automatically run ML analysis for new products
      runMlAnalysis();
    }
  }, [product]);

  const loadAlternatives = async () => {
    try {
      setLoadingAlternatives(true);
      const response = await productAPI.getRecommendations(
        product.category,
        product.ecoScoreNumeric || 50,
        3
      );
      
      if (response.success) {
        setAlternatives(response.data);
      }
    } catch (err) {
      console.error('Failed to load alternatives:', err);
    } finally {
      setLoadingAlternatives(false);
    }
  };

  const loadSustainabilityData = async () => {
    try {
      setLoadingSustainability(true);
      setSustainabilityError(null);

      // Validate required fields
      if (!product.category) {
        setSustainabilityError('Product category is required for carbon footprint calculation');
        setLoadingSustainability(false);
        return;
      }

      // If product has an ID, fetch from backend
      if (product._id) {
        const response = await sustainabilityAPI.getProductSustainability(product._id);
        if (response.success) {
          setSustainabilityData(response.data);
        }
      } else {
        // Calculate for new product
        const response = await sustainabilityAPI.calculateSustainability({
          name: product.name || 'Unknown Product',
          brand: product.brand || 'Unknown',
          category: product.category,
          energyConsumption: product.energyConsumption || null,
          weight: product.weight || null,
          url: product.url || null
        });
        if (response.success) {
          setSustainabilityData(response.data);
        }
      }
    } catch (err) {
      console.error('Failed to load sustainability data:', err);
      
      // Better error messages
      let errorMessage = 'Unable to calculate carbon footprint';
      
      if (err.response) {
        // Server responded with error
        if (err.response.status === 404) {
          errorMessage = 'Sustainability API endpoint not found. Please ensure the backend server is running on port 5001.';
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please check if Climatiq API key is configured.';
        } else {
          errorMessage = err.response.data?.message || err.message;
        }
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'Cannot connect to backend server. Please ensure it is running on http://localhost:5001';
      } else {
        errorMessage = err.message;
      }
      
      setSustainabilityError(errorMessage);
    } finally {
      setLoadingSustainability(false);
    }
  };

  const refreshSustainabilityData = () => {
    loadSustainabilityData();
  };

  // Run ML analysis to get dynamic sustainability metrics
  const runMlAnalysis = async () => {
    try {
      setLoadingMlAnalysis(true);
      setMlError(null);

      const itemName = product.name || 'Unknown Product';
      const itemDescription = product.description || `${product.category} product by ${product.brand}`;

      // Call the complete analysis endpoint
      const response = await ecoAPI.completeAnalysis(itemName, itemDescription, {
        title: itemName,
        brand: product.brand || 'Unknown',
        category: product.category,
        description: itemDescription,
        price: product.price || 0,
        rating: product.rating || 0,
        features: product.features || []
      });

      if (response.success && response.data) {
        console.log('Full ML API response:', response.data);
        setMlMetrics(response.data);
        
        // Extract metrics from the correct path in the response
        const sustainability_metrics = response.data.combined?.sustainability_metrics || response.data.sustainabilityMetrics?.sustainability_metrics;
        
        if (sustainability_metrics) {
          const newValues = {
            // Convert scores (0-100) to percentages, handling both formats
            carbonFootprint: sustainability_metrics.carbon_footprint?.score 
              ? (sustainability_metrics.carbon_footprint.score > 1 
                ? Math.round(100 - sustainability_metrics.carbon_footprint.score) // If score is 0-100, invert it
                : Math.round((1 - sustainability_metrics.carbon_footprint.score) * 100)) // If score is 0-1, invert and scale
              : 50,
              
            recyclability: sustainability_metrics.recyclability?.score 
              ? (sustainability_metrics.recyclability.score > 1 
                ? Math.round(sustainability_metrics.recyclability.score) // If score is 0-100, use directly
                : Math.round(sustainability_metrics.recyclability.score * 100)) // If score is 0-1, scale to 100
              : 50,
              
            ethicalSourcing: sustainability_metrics.ethical_sourcing?.score 
              ? (sustainability_metrics.ethical_sourcing.score > 1 
                ? Math.round(sustainability_metrics.ethical_sourcing.score) // If score is 0-100, use directly
                : Math.round(sustainability_metrics.ethical_sourcing.score * 100)) // If score is 0-1, scale to 100
              : 50,
              
            packagingImpact: sustainability_metrics.packaging?.score 
              ? (sustainability_metrics.packaging.score > 1 
                ? Math.round(100 - sustainability_metrics.packaging.score) // If score is 0-100, invert it
                : Math.round((1 - sustainability_metrics.packaging.score) * 100)) // If score is 0-1, invert and scale
              : 50
          };
          
          console.log('Extracted ML metrics:', sustainability_metrics);
          console.log('Calculated new values:', newValues);
          
          // Animate values smoothly
          animateToNewValues(newValues);
        } else {
          console.log('No sustainability_metrics found in response');
        }
      } else {
        setMlError('Failed to analyze product sustainability');
      }
    } catch (error) {
      console.error('ML Analysis failed:', error);
      let errorMessage = 'Unable to analyze product sustainability';
      
      if (error.response?.status === 404) {
        errorMessage = 'ML Analysis endpoint not found. Please ensure the backend server is running.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error during analysis. Please check backend logs.';
      } else if (error.request) {
        errorMessage = 'Cannot connect to backend server. Please ensure it is running on http://localhost:5001';
      }
      
      setMlError(errorMessage);
    } finally {
      setLoadingMlAnalysis(false);
    }
  };

  // Smooth animation for metric values
  const animateToNewValues = (targetValues) => {
    const startValues = { ...animatedValues };
    const animationDuration = 1500; // 1.5 seconds
    const frameRate = 60;
    const totalFrames = (animationDuration / 1000) * frameRate;
    let currentFrame = 0;

    const animate = () => {
      currentFrame++;
      const progress = Math.min(currentFrame / totalFrames, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      const newValues = {};
      Object.keys(targetValues).forEach(key => {
        const start = startValues[key];
        const target = targetValues[key];
        newValues[key] = Math.round(start + (target - start) * easeOutCubic);
      });
      
      setAnimatedValues(newValues);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };

  if (!product) {
    return (
      <div className="card">
        <p>No product selected. Visit a product page on Amazon or Flipkart to see sustainability data!</p>
      </div>
    );
  }

  const score = mlMetrics?.combined?.sustainability_metrics?.sustainability_rating?.letter_grade || 
                mlMetrics?.sustainabilityMetrics?.sustainability_metrics?.sustainability_rating?.letter_grade || 
                product.ecoScore || 'C';
  const numericScore = mlMetrics?.combined?.sustainability_metrics?.sustainability_rating?.overall_score || 
                       mlMetrics?.sustainabilityMetrics?.sustainability_metrics?.sustainability_rating?.overall_score || 
                       product.ecoScoreNumeric || 50;
  const scoreColor = {
    'A': '#10b981',
    'B': '#84cc16',
    'C': '#f59e0b',
    'D': '#f97316',
    'E': '#ef4444'
  }[score];

  return (
    <div className="product-details">
      {/* Main Product Info */}
      <div className="card">
        <div style={{ display: 'flex', gap: '16px' }}>
          {product.imageUrl && (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px' }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
              {product.name}
            </h3>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
              Brand: <strong>{product.brand || 'Unknown'}</strong>
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Category: <span className="badge badge-info">{product.category || 'Other'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Eco Score */}
      <div className="card" style={{ background: `${scoreColor}15`, border: `2px solid ${scoreColor}` }}>
        <div className="card-header">
          <div className="card-title" style={{ color: scoreColor }}>
            Sustainability Rating
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className={`eco-score-badge eco-score-${score}`} style={{ width: '64px', height: '64px', fontSize: '32px' }}>
            {score}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 600, color: scoreColor, marginBottom: '4px' }}>
              {numericScore}/100
              {mlMetrics && (
                <span style={{ fontSize: '11px', color: '#059669', marginLeft: '8px' }}>
                  ML Analyzed
                </span>
              )}
            </div>
            <div style={{ fontSize: '13px', color: '#4b5563' }}>
              {score === 'A' && 'Excellent choice! This product has minimal environmental impact.'}
              {score === 'B' && 'Good choice! This product is above average in sustainability.'}
              {score === 'C' && 'Average sustainability. Consider greener alternatives below.'}
              {score === 'D' && 'Below average. Check out better alternatives below.'}
              {score === 'E' && 'Poor sustainability score. We recommend choosing alternatives.'}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-title">Sustainability Metrics</div>
            {mlMetrics && (
              <div style={{ fontSize: '11px', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Beaker size={12} />
                ML Analyzed
              </div>
            )}
          </div>
        </div>
        
        {loadingMlAnalysis && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '20px',
            background: '#f8fafc',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div className="spinner"></div>
            <span style={{ fontSize: '14px', color: '#64748b' }}>
              Analyzing product sustainability with machine learning...
            </span>
          </div>
        )}
        
        {mlError && (
          <div style={{ 
            padding: '12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '13px', color: '#991b1b', marginBottom: '8px' }}>
              ⚠️ {mlError}
            </div>
            <button 
              onClick={runMlAnalysis}
              style={{ 
                padding: '6px 12px',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Retry Analysis
            </button>
          </div>
        )}

        <div className="metric-row">
          <div className="metric-label">
            🌍 Carbon Footprint
            {(mlMetrics?.combined?.sustainability_metrics?.carbon_footprint?.rating || 
              mlMetrics?.sustainabilityMetrics?.sustainability_metrics?.carbon_footprint?.rating) && (
              <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '8px' }}>
                ({mlMetrics?.combined?.sustainability_metrics?.carbon_footprint?.rating || 
                  mlMetrics?.sustainabilityMetrics?.sustainability_metrics?.carbon_footprint?.rating})
              </span>
            )}
          </div>
          <div>
            <div className="metric-value">{animatedValues.carbonFootprint}/100</div>
            <div className="progress-bar" style={{ width: '100px', marginTop: '4px' }}>
              <div 
                className="progress-fill animated-progress" 
                style={{ 
                  width: `${animatedValues.carbonFootprint}%`,
                  transition: 'width 0.3s ease-out'
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-label">
            ♻️ Recyclability
            {(mlMetrics?.combined?.sustainability_metrics?.recyclability?.rating || 
              mlMetrics?.sustainabilityMetrics?.sustainability_metrics?.recyclability?.rating) && (
              <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '8px' }}>
                ({mlMetrics?.combined?.sustainability_metrics?.recyclability?.rating || 
                  mlMetrics?.sustainabilityMetrics?.sustainability_metrics?.recyclability?.rating})
              </span>
            )}
          </div>
          <div>
            <div className="metric-value">{animatedValues.recyclability}/100</div>
            <div className="progress-bar" style={{ width: '100px', marginTop: '4px' }}>
              <div 
                className="progress-fill animated-progress" 
                style={{ 
                  width: `${animatedValues.recyclability}%`,
                  transition: 'width 0.3s ease-out'
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-label">
            ⚖️ Ethical Sourcing
            {(mlMetrics?.combined?.sustainability_metrics?.ethical_sourcing?.rating || 
              mlMetrics?.sustainabilityMetrics?.sustainability_metrics?.ethical_sourcing?.rating) && (
              <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '8px' }}>
                ({mlMetrics?.combined?.sustainability_metrics?.ethical_sourcing?.rating || 
                  mlMetrics?.sustainabilityMetrics?.sustainability_metrics?.ethical_sourcing?.rating})
              </span>
            )}
          </div>
          <div>
            <div className="metric-value">{animatedValues.ethicalSourcing}/100</div>
            <div className="progress-bar" style={{ width: '100px', marginTop: '4px' }}>
              <div 
                className="progress-fill animated-progress" 
                style={{ 
                  width: `${animatedValues.ethicalSourcing}%`,
                  transition: 'width 0.3s ease-out'
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-label">
            📦 Packaging Impact
            {(mlMetrics?.combined?.sustainability_metrics?.packaging?.rating || 
              mlMetrics?.sustainabilityMetrics?.sustainability_metrics?.packaging?.rating) && (
              <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '8px' }}>
                ({mlMetrics?.combined?.sustainability_metrics?.packaging?.rating || 
                  mlMetrics?.sustainabilityMetrics?.sustainability_metrics?.packaging?.rating})
              </span>
            )}
          </div>
          <div>
            <div className="metric-value">{animatedValues.packagingImpact}/100</div>
            <div className="progress-bar" style={{ width: '100px', marginTop: '4px' }}>
              <div 
                className="progress-fill animated-progress" 
                style={{ 
                  width: `${animatedValues.packagingImpact}%`,
                  transition: 'width 0.3s ease-out'
                }}
              ></div>
            </div>
          </div>
        </div>

        {(mlMetrics?.combined?.sustainability_metrics || mlMetrics?.sustainabilityMetrics?.sustainability_metrics) && (
          <div style={{ 
            marginTop: '16px',
            padding: '12px',
            background: '#f0fdf4',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#065f46'
          }}>
            <strong>Analysis Details:</strong>
            <br />
            Materials detected: {(mlMetrics?.combined?.ml_analysis?.materials || mlMetrics?.mlOutput?.data?.materials || []).join(', ') || 'Unknown'}
            <br />
            Overall ESI Score: {(mlMetrics?.combined?.sustainability_metrics?.sustainability_rating?.overall_score || 
                                 mlMetrics?.sustainabilityMetrics?.sustainability_metrics?.sustainability_rating?.overall_score || 'N/A')}/100
          </div>
        )}
      </div>

      {/* Carbon Footprint from Climatiq API */}
      {sustainabilityData && sustainabilityData.carbonFootprint && (
        <div className="card" style={{ background: '#f0fdf4', border: '2px solid #10b981' }}>
          <div className="card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-title" style={{ color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} />
                Carbon Footprint Analysis
                {sustainabilityData.carbonFootprint.isFallback && (
                  <span style={{ fontSize: '11px', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px' }}>
                    Estimated
                  </span>
                )}
              </div>
              <button 
                onClick={refreshSustainabilityData}
                disabled={loadingSustainability}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  cursor: loadingSustainability ? 'not-allowed' : 'pointer',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px'
                }}
                title="Refresh sustainability data"
              >
                <RefreshCw size={14} className={loadingSustainability ? 'spinning' : ''} />
                Refresh
              </button>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#065f46', marginBottom: '4px', fontWeight: 500 }}>
                🌍 Total Carbon Emissions
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#047857' }}>
                {sustainabilityData.carbonFootprint.value.toFixed(2)} {sustainabilityData.carbonFootprint.unit}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#065f46', marginBottom: '4px', fontWeight: 500 }}>
                📊 Carbon Score
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#047857' }}>
                {sustainabilityData.scores?.carbonScore || 'N/A'}/100
              </div>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#047857', padding: '8px', background: '#dcfce7', borderRadius: '6px' }}>
            <strong>Calculation Method:</strong> {sustainabilityData.carbonFootprint.method || 'Climatiq API'}
            {sustainabilityData.cached && ' • Cached data'}
            {sustainabilityData.lastUpdated && (
              <span> • Last updated: {new Date(sustainabilityData.lastUpdated).toLocaleDateString()}</span>
            )}
          </div>

          {sustainabilityData.carbonFootprint.isFallback && (
            <div style={{ fontSize: '11px', color: '#92400e', padding: '8px', background: '#fef3c7', borderRadius: '6px', marginTop: '8px' }}>
              ⚠️ This is an estimated value based on industry averages. Actual emissions may vary.
            </div>
          )}
        </div>
      )}

      {loadingSustainability && (
        <div className="card" style={{ background: '#f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', padding: '20px' }}>
            <div className="spinner"></div>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Calculating carbon footprint...</span>
          </div>
        </div>
      )}
{/* 
      {sustainabilityError && (
        <div className="card" style={{ background: '#fef2f2', border: '2px solid #ef4444' }}>
          <div className="card-header">
            <div className="card-title" style={{ color: '#991b1b' }}>
              ⚠️ Carbon Footprint Calculation Failed
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#991b1b', marginBottom: '12px' }}>
            {sustainabilityError}
          </div>
          {sustainabilityError.includes('backend server') && (
            <div style={{ fontSize: '12px', color: '#7f1d1d', background: '#fee2e2', padding: '10px', borderRadius: '6px' }}>
              <strong>Quick Fix:</strong>
              <ol style={{ margin: '8px 0 0 20px', paddingLeft: 0 }}>
                <li>Open terminal in <code>extension-backend</code> folder</li>
                <li>Run: <code>npm run dev</code></li>
                <li>Wait for "Server running on port 5001" message</li>
                <li>Click the Refresh button above</li>
              </ol>
            </div>
          )}
          <button 
            onClick={refreshSustainabilityData}
            style={{ 
              marginTop: '12px',
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            Try Again
          </button>
        </div>
      )} */}

      {/* Environmental Impact */}
      {product.carbonFootprint && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Environmental Impact</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                Carbon Emissions
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                {product.carbonFootprint.value} {product.carbonFootprint.unit}
              </div>
            </div>
            {product.waterUsage && (
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  Water Usage
                </div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                  {product.waterUsage.value} {product.waterUsage.unit}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Certifications */}
      {product.certifications && product.certifications.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Award size={18} />
              Certifications & Verifications
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {product.certifications.map((cert, index) => (
              <span key={index} className={`badge ${cert.verified ? 'badge-success' : 'badge-warning'}`}>
                {cert.verified ? '✓' : '⚠️'} {cert.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Greener Alternatives */}
      {alternatives.length > 0 && (
        <div className="card" style={{ background: '#ecfdf5' }}>
          <div className="card-header">
            <div className="card-title" style={{ color: '#065f46' }}>
              <TrendingUp size={18} />
              Greener Alternatives
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#047857', marginBottom: '12px' }}>
            We found better sustainable options in the same category:
          </div>
          
          {alternatives.map((alt, index) => (
            <div key={index} style={{
              padding: '12px',
              background: 'white',
              borderRadius: '8px',
              marginBottom: '8px',
              border: '1px solid #10b981'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                    {alt.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    by {alt.brand}
                  </div>
                </div>
                <div className={`eco-score-badge eco-score-${alt.ecoScore}`} style={{ width: '36px', height: '36px', fontSize: '16px' }}>
                  {alt.ecoScore}
                </div>
              </div>
              
              <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={14} />
                {((alt.ecoScoreNumeric - (product.ecoScoreNumeric || 50)) / (product.ecoScoreNumeric || 50) * 100).toFixed(0)}% more sustainable
              </div>
            </div>
          ))}
        </div>
      )}

      {loadingAlternatives && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}

      {product.isDefault && (
        <div className="card" style={{ background: '#fef3c7', border: '1px solid #f59e0b' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
            <div style={{ fontSize: '20px' }}>⚠️</div>
            <div style={{ fontSize: '13px', color: '#92400e' }}>
              <strong>Note:</strong> This product is not in our verified database. 
              The sustainability score shown is a default estimate. For accurate data, 
              we recommend checking the manufacturer's sustainability reports.
            </div>
          </div>
        </div>
      )}

      {/* Sustainable Alternatives - Enhanced Component */}
      <SustainableAlternatives currentProduct={product} userId={userId} />

      {/* Supply Chain Map */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <MapPin size={20} />
            Material Journey
          </h3>
        </div>
        <div style={{ padding: '20px' }}>
          <SupplyChainMap category={product.category} />
          <div style={{ marginTop: '16px', padding: '12px', background: '#f0fdf4', borderRadius: '8px', fontSize: '13px', color: '#065f46' }}>
            💡 <strong>Tip:</strong> Products with shorter supply chains typically have lower carbon footprints due to reduced shipping distances.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
