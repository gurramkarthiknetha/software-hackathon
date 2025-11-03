import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, Award, Leaf, ShoppingBag, Target } from 'lucide-react';
import { userAPI } from '../api';

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
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!stats && !loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌱</div>
          <h3 style={{ marginBottom: '8px', color: '#111827' }}>Welcome to EcoShop!</h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Start shopping on Amazon or Flipkart to see your eco-impact here.
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
      {/* User Level & Points */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Award size={20} style={{ color: '#10b981' }} />
            Your Eco-Journey
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
              Level {user.level}
            </div>
            <div style={{ color: '#6b7280', marginTop: '4px' }}>
              {user.points} points
            </div>
            <div className="progress-bar" style={{ marginTop: '12px' }}>
              <div 
                className="progress-fill" 
                style={{ width: `${(user.points % 100)}%` }}
              ></div>
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
              {100 - (user.points % 100)} points to next level
            </div>
          </div>
          <div style={{ fontSize: '48px' }}>🌱</div>
        </div>
      </div>

      {/* Key Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌍</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
            {userStats.totalCarbonSaved?.toFixed(1) || 0} kg
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            CO₂ Saved
          </div>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>♻️</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
            {userStats.sustainableChoices || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Sustainable Choices
          </div>
        </div>
      </div>

      {/* Average Eco Score */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Target size={20} style={{ color: '#10b981' }} />
            Average Eco Score
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className={`eco-score-badge eco-score-${userStats.averageEcoScore || 'C'}`}>
            {userStats.averageEcoScore || 'C'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {userStats.totalViewed || 0} products viewed
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
              Keep choosing sustainable products to improve your score!
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShoppingBag size={20} style={{ color: '#10b981' }} />
              Products by Category
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={70}
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
      )}

      {/* Achievements */}
      {user.achievements && user.achievements.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Award size={20} style={{ color: '#10b981' }} />
              Recent Achievements
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {user.achievements.slice(-3).reverse().map((achievement, index) => (
              <div key={index} style={{
                padding: '12px',
                background: '#f0fdf4',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ fontSize: '24px' }}>{achievement.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#065f46' }}>
                    {achievement.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#047857' }}>
                    {achievement.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card" style={{ background: '#ecfdf5', border: '1px solid #10b981' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ fontSize: '24px' }}>💡</div>
          <div>
            <div style={{ fontWeight: 600, color: '#065f46', marginBottom: '4px' }}>
              Eco Tip of the Day
            </div>
            <div style={{ fontSize: '13px', color: '#047857' }}>
              Look for products with recycled materials and minimal packaging to reduce your environmental impact!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
