import React, { useState, useEffect } from 'react';
import { TrendingUp, Leaf, DollarSign, Award, ExternalLink, CheckCircle, ArrowRight } from 'lucide-react';
import './SustainableAlternatives.css';

const API_BASE_URL = 'http://localhost:5001/api';

const SustainableAlternatives = ({ currentProduct, userId }) => {
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlternative, setSelectedAlternative] = useState(null);
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState(null);

  useEffect(() => {
    if (currentProduct) {
      loadAlternatives();
    }
  }, [currentProduct]);

  const loadAlternatives = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        productName: currentProduct.name || currentProduct.title,
        currentScore: currentProduct.ecoScore || 50,
        category: currentProduct.category || 'General',
        limit: 3,
        ...(currentProduct.price && { price: currentProduct.price })
      });

      const response = await fetch(`${API_BASE_URL}/alternatives?${params}`);
      const data = await response.json();

      if (data.success && data.data.alternatives) {
        setAlternatives(data.data.alternatives);
      }
    } catch (error) {
      console.error('Error loading alternatives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChooseAlternative = async (alternative) => {
    try {
      setSelectedAlternative(alternative);

      // Record the choice and award EcoCoins
      const response = await fetch(`${API_BASE_URL}/alternatives/choose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId || 'guest',
          originalProduct: {
            name: currentProduct.name,
            ecoScore: currentProduct.ecoScore
          },
          chosenAlternative: alternative,
          co2Saved: alternative.co2Savings,
          ecoCoinsEarned: 10
        })
      });

      const data = await response.json();

      if (data.success) {
        setRewardData(data.data);
        setShowReward(true);
        
        // Hide reward message after 5 seconds
        setTimeout(() => {
          setShowReward(false);
        }, 5000);
      }

      // Open Amazon link in new tab
      if (alternative.link) {
        window.open(alternative.link, '_blank');
      }
    } catch (error) {
      console.error('Error recording choice:', error);
      // Still open the link even if recording fails
      if (alternative.link) {
        window.open(alternative.link, '_blank');
      }
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 70) return '#84cc16';
    if (score >= 60) return '#f59e0b';
    if (score >= 50) return '#f97316';
    return '#ef4444';
  };

  const getScoreGrade = (score) => {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'E';
  };

  if (!currentProduct) {
    return null;
  }

  if (loading) {
    return (
      <div className="alternatives-container">
        <div className="alternatives-header">
          <Leaf size={24} className="header-icon" />
          <h3>Finding Sustainable Alternatives...</h3>
        </div>
        <div className="alternatives-loading">
          <div className="spinner"></div>
          <p>Searching for eco-friendly options</p>
        </div>
      </div>
    );
  }

  if (alternatives.length === 0) {
    return (
      <div className="alternatives-container">
        <div className="alternatives-header">
          <Leaf size={24} className="header-icon" />
          <h3>Sustainable Alternatives</h3>
        </div>
        <div className="alternatives-empty">
          <p>🌟 Great choice! This product already has a good sustainability rating.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alternatives-container">
      {/* Header */}
      <div className="alternatives-header">
        <Leaf size={24} className="header-icon" />
        <div>
          <h3>🌿 Sustainable Alternatives</h3>
          <p className="alternatives-subtitle">
            We found {alternatives.length} eco-friendlier {alternatives.length === 1 ? 'option' : 'options'} 
            with higher sustainability ratings
          </p>
        </div>
      </div>

      {/* Reward Notification */}
      {showReward && rewardData && (
        <div className="reward-notification">
          <div className="reward-content">
            <Award size={24} className="reward-icon" />
            <div>
              <div className="reward-title">🎉 +{rewardData.ecoCoinsEarned} EcoCoins Earned!</div>
              <div className="reward-text">
                Total: {rewardData.totalEcoCoins} EcoCoins | 
                CO₂ Saved: {rewardData.totalCO2Saved?.toFixed(1)} kg
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alternatives Grid */}
      <div className="alternatives-grid">
        {alternatives.map((alt, index) => (
          <div 
            key={alt.asin || index} 
            className={`alternative-card ${selectedAlternative?.asin === alt.asin ? 'selected' : ''}`}
          >
            {/* Product Image */}
            <div className="alternative-image">
              <img src={alt.image} alt={alt.title} />
              <div 
                className="alternative-score-badge"
                style={{ background: getScoreColor(alt.ecoScore) }}
              >
                {getScoreGrade(alt.ecoScore)}
              </div>
            </div>

            {/* Product Info */}
            <div className="alternative-content">
              <h4 className="alternative-title">{alt.title}</h4>

              {/* Stats Row */}
              <div className="alternative-stats">
                <div className="stat-item">
                  <TrendingUp size={16} />
                  <span className="stat-label">EcoScore</span>
                  <span className="stat-value" style={{ color: getScoreColor(alt.ecoScore) }}>
                    {alt.ecoScore}
                  </span>
                </div>

                <div className="stat-item">
                  <DollarSign size={16} />
                  <span className="stat-label">Price</span>
                  <span className="stat-value">
                    {alt.priceSymbol}{alt.price}
                  </span>
                </div>
              </div>

              {/* Price Difference */}
              {alt.priceDifference !== 0 && (
                <div className={`price-difference ${alt.priceDifference > 0 ? 'higher' : 'lower'}`}>
                  {alt.priceDifference > 0 ? '↑' : '↓'} 
                  {Math.abs(alt.priceDifference)}% 
                  {alt.priceDifference > 0 ? ' more' : ' less'} than current
                </div>
              )}

              {/* CO2 Savings */}
              {alt.co2Savings > 0 && (
                <div className="co2-savings">
                  💨 Saves {alt.co2Savings.toFixed(1)} kg CO₂
                </div>
              )}

              {/* Why Better */}
              <div className="why-better">
                <strong>✨ Why it's better:</strong>
                <p>{alt.whyBetter}</p>
              </div>

              {/* Sustainability Highlights */}
              {alt.sustainabilityHighlights && alt.sustainabilityHighlights.length > 0 && (
                <div className="highlights">
                  {alt.sustainabilityHighlights.map((highlight, idx) => (
                    <div key={idx} className="highlight-item">
                      <CheckCircle size={14} />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Materials */}
              {alt.materials && alt.materials.length > 0 && (
                <div className="materials">
                  {alt.materials.slice(0, 3).map((material, idx) => (
                    <span key={idx} className="material-chip">
                      {material.emoji} {material.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Switch Percentage */}
              <div className="switch-percentage">
                <div className="switch-bar">
                  <div 
                    className="switch-fill"
                    style={{ width: `${alt.switchPercentage}%` }}
                  ></div>
                </div>
                <span className="switch-text">
                  {alt.switchPercentage}% of users switched to this
                </span>
              </div>

              {/* Action Button */}
              <button 
                className="view-amazon-btn"
                onClick={() => handleChooseAlternative(alt)}
              >
                <span>View on Amazon</span>
                <ExternalLink size={16} />
              </button>

              {/* Earn EcoCoins Badge */}
              <div className="ecocoins-badge">
                <Award size={14} />
                <span>Earn +10 EcoCoins</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="alternatives-footer">
        <p>
          💡 <strong>Tip:</strong> Choosing sustainable alternatives helps reduce your carbon footprint 
          and supports eco-friendly brands. You earn EcoCoins for every green choice!
        </p>
      </div>
    </div>
  );
};

export default SustainableAlternatives;
