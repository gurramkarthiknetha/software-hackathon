import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, Award, Leaf, ShoppingBag, Target } from 'lucide-react';
import { userAPI } from '../api';
import './Dashboard.css';

const Dashboard = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      loadUserStats();
    }
  }, [userId]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getFootprint(userId);
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your eco-dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!stats && !loading) {
    return (
      <div className="dashboard">
        <div className="welcome-state">
          <div className="welcome-icon">🌱</div>
          <h3>Welcome to EcoShop!</h3>
          <p>
            Start shopping on Amazon or Flipkart to see your eco-impact here.
            <br />
            We'll track your sustainable choices and show you greener alternatives.
          </p>
        </div>
      </div>
    );
  }

  const { user, stats: userStats } = stats;

  // Prepare chart data
  const categoryData = Object.entries(userStats.categoryBreakdown || {}).map(([name, value]) => ({
    name,
    value
  }));

  const ecoScoreColors = {
    'A': '#10b981',
    'B': '#84cc16',
    'C': '#f59e0b',
    'D': '#f97316',
    'E': '#ef4444'
  };

  return (
    <div className="dashboard">
      {/* User Level & Points - Hero Section */}
      <div className="card hero">
        <div className="card-header">
          <div className="card-title">
            <Award size={24} style={{ color: '#10b981' }} />
            Your Eco-Journey
          </div>
        </div>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
              Level {user.level}
            </div>
            <div style={{ color: '#6b7280', fontSize: '18px', marginBottom: '16px' }}>
              {user.points} EcoCoins earned
            </div>
            <div className="progress-bar" style={{ marginBottom: '8px' }}>
              <div 
                className="progress-fill" 
                style={{ width: `${(user.points % 100)}%` }}
              ></div>
            </div>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>
              {100 - (user.points % 100)} points to next level
            </div>
          </div>
          <div style={{ fontSize: '80px' }}>🌱</div>
        </div>
      </div>

      {/* Key Statistics Grid */}
      <div className="stats-grid">
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌍</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}>
            {userStats.totalCarbonSaved?.toFixed(1) || 0} kg
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            CO₂ Saved This Month
          </div>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>♻️</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}>
            {userStats.sustainableChoices || 0}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Sustainable Choices
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏆</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}>
            {user.achievements?.length || 0}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Achievements Unlocked
          </div>
        </div>
      </div>

      {/* Average Eco Score */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Target size={24} style={{ color: '#10b981' }} />
            Your Eco Performance
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className={`eco-score-badge eco-score-${userStats.averageEcoScore || 'C'}`} style={{ width: '80px', height: '80px', fontSize: '36px' }}>
            {userStats.averageEcoScore || 'C'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
              Average Eco Score
            </div>
            <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '8px' }}>
              {userStats.totalViewed || 0} products analyzed
            </div>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>
              Keep choosing sustainable products to improve your score!
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Chart */}
      {categoryData.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShoppingBag size={24} style={{ color: '#10b981' }} />
              Products by Category
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#10b981"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 40 + 140}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      {user.achievements && user.achievements.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Award size={24} style={{ color: '#10b981' }} />
              Recent Achievements
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {user.achievements.slice(-4).reverse().map((achievement, index) => (
              <div key={index} style={{
                padding: '16px',
                background: '#f0fdf4',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                border: '1px solid #bbf7d0'
              }}>
                <div style={{ fontSize: '32px' }}>{achievement.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#065f46', fontSize: '16px', marginBottom: '4px' }}>
                    {achievement.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#047857' }}>
                    {achievement.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Eco Tips */}
      <div className="card full-width" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)', border: '1px solid #10b981' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '32px' }}>💡</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: '#065f46', marginBottom: '8px', fontSize: '18px' }}>
              Eco Tip of the Day
            </div>
            <div style={{ fontSize: '16px', color: '#047857', lineHeight: '1.5' }}>
              Look for products with recycled materials and minimal packaging to reduce your environmental impact! 
              Every sustainable choice counts towards a greener future. 🌍
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
