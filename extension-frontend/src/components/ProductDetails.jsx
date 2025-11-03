import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, TrendingUp, Package, ExternalLink, Award } from 'lucide-react';
import { productAPI, userAPI } from '../api';

const ProductDetails = ({ product, userId }) => {
  const [alternatives, setAlternatives] = useState([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);

  useEffect(() => {
    if (product && product.category) {
      loadAlternatives();
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

  if (!product) {
    return (
      <div className="card">
        <p>No product selected. Visit a product page on Amazon or Flipkart to see sustainability data!</p>
      </div>
    );
  }

  const score = product.ecoScore || 'C';
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
              {product.ecoScoreNumeric || 50}/100
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
          <div className="card-title">Sustainability Metrics</div>
        </div>
        
        <div className="metric-row">
          <div className="metric-label">
            🌍 Carbon Footprint
          </div>
          <div>
            <div className="metric-value">{product.carbonScore || 50}/100</div>
            <div className="progress-bar" style={{ width: '100px', marginTop: '4px' }}>
              <div className="progress-fill" style={{ width: `${product.carbonScore || 50}%` }}></div>
            </div>
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-label">
            ♻️ Recyclability
          </div>
          <div>
            <div className="metric-value">{product.recyclability || 50}/100</div>
            <div className="progress-bar" style={{ width: '100px', marginTop: '4px' }}>
              <div className="progress-fill" style={{ width: `${product.recyclability || 50}%` }}></div>
            </div>
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-label">
            ⚖️ Ethical Sourcing
          </div>
          <div>
            <div className="metric-value">{product.ethicsScore || 50}/100</div>
            <div className="progress-bar" style={{ width: '100px', marginTop: '4px' }}>
              <div className="progress-fill" style={{ width: `${product.ethicsScore || 50}%` }}></div>
            </div>
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-label">
            📦 Packaging
          </div>
          <div>
            <div className="metric-value">{product.packagingScore || 50}/100</div>
            <div className="progress-bar" style={{ width: '100px', marginTop: '4px' }}>
              <div className="progress-fill" style={{ width: `${product.packagingScore || 50}%` }}></div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default ProductDetails;
