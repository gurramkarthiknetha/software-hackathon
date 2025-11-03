import { useState, useEffect } from 'react';
import { TrendingUp, Award, Leaf, Zap, Users, ChevronRight, ArrowUpRight, Trophy } from 'lucide-react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { alternativesAPI } from '../api';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ECO_NEWS = [
  "🌱 This week, 3 brands switched to paper packaging!",
  "♻️ Community saved 50,000 liters of water this month",
  "🌍 Global CO₂ emissions down 2% this quarter",
  "🎋 Bamboo products usage increased by 45%",
  "⚡ Renewable energy adoption reached 60% in fashion industry",
  "🌿 New biodegradable plastic alternative discovered",
  "📦 Amazon commits to 100% recyclable packaging by 2025",
  "🏆 EcoShopper users collectively saved 1M kg CO₂"
];

const BADGES = [
  { id: 1, name: '🌱 Eco Beginner', description: 'Viewed 3 eco-friendly products', requirement: 3, type: 'views' },
  { id: 2, name: '🌿 Green Hero', description: 'Viewed 10 eco products', requirement: 10, type: 'views' },
  { id: 3, name: '🌎 Planet Saver', description: 'Viewed 25 eco products', requirement: 25, type: 'views' },
  { id: 4, name: '♻️ Recycling Champion', description: 'Added 5 items to cart', requirement: 5, type: 'cart' },
  { id: 5, name: '🏆 Eco Warrior', description: 'Earned 100 Green Points', requirement: 100, type: 'points' },
  { id: 6, name: '💚 Sustainability Expert', description: 'Viewed 50 products', requirement: 50, type: 'views' },
  { id: 7, name: '🔄 Alternative Explorer', description: 'Switched to 1 sustainable alternative', requirement: 1, type: 'alternatives' },
  { id: 8, name: '🎯 Choice Champion', description: 'Switched to 5 sustainable alternatives', requirement: 5, type: 'alternatives' },
  { id: 9, name: '🌟 Eco Influencer', description: 'Switched to 10 sustainable alternatives', requirement: 10, type: 'alternatives' }
];

const EnhancedDashboard = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [news, setNews] = useState([]);
  const [alternativeStats, setAlternativeStats] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load alternative stats from API
      let altStats = null;
      try {
        const altResponse = await alternativesAPI.getStats(userId || 'guest');
        if (altResponse.success) {
          altStats = altResponse.data;
        }
      } catch (error) {
        console.error('Failed to load alternative stats:', error);
      }
      
      // Load from localStorage
      const history = JSON.parse(localStorage.getItem('ecoShopHistory') || '[]');
      const greenPoints = parseInt(localStorage.getItem('ecoShopGreenPoints') || '0');
      const ecoCoins = parseInt(localStorage.getItem('ecoShopEcoCoins') || '0') + (altStats?.ecoCoins || 0);
      const cart = JSON.parse(localStorage.getItem('ecoShopCart') || '[]');
      
      // Calculate statistics
      const totalProducts = history.length;
      const ecoFriendlyProducts = history.filter(p => p.ecoScore >= 70).length;
      const averageEcoScore = history.length > 0 
        ? Math.round(history.reduce((acc, p) => acc + p.ecoScore, 0) / history.length)
        : 0;
      
      // Calculate CO2 saved (including alternatives)
      const averageCO2 = 20; // kg
      const actualCO2 = history.reduce((acc, p) => acc + (p.co2Footprint || 0), 0);
      const expectedCO2 = totalProducts * averageCO2;
      const co2Saved = Math.max(0, expectedCO2 - actualCO2) + (altStats?.totalCO2Saved || 0);
      
      // Category breakdown
      const categoryBreakdown = {};
      history.forEach(item => {
        categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
      });
      
      // Eco score distribution
      const scoreDistribution = {
        'A (80-100)': history.filter(p => p.ecoScore >= 80).length,
        'B (60-79)': history.filter(p => p.ecoScore >= 60 && p.ecoScore < 80).length,
        'C (40-59)': history.filter(p => p.ecoScore >= 40 && p.ecoScore < 60).length,
        'D (20-39)': history.filter(p => p.ecoScore >= 20 && p.ecoScore < 40).length,
        'E (0-19)': history.filter(p => p.ecoScore < 20).length
      };
      
      // Calculate level
      const level = Math.floor(greenPoints / 50) + 1;
      const nextLevelPoints = level * 50;
      const progressToNextLevel = ((greenPoints % 50) / 50) * 100;
      
      // Check earned badges (including alternative-based badges)
      const earnedBadges = BADGES.filter(badge => {
        if (badge.type === 'views') return totalProducts >= badge.requirement;
        if (badge.type === 'cart') return cart.length >= badge.requirement;
        if (badge.type === 'points') return greenPoints >= badge.requirement;
        if (badge.type === 'alternatives') return (altStats?.alternativesSwitched || 0) >= badge.requirement;
        return false;
      });

      setAlternativeStats(altStats);
      
      // Generate random news
      const randomNews = ECO_NEWS.sort(() => 0.5 - Math.random()).slice(0, 5);
      
      setStats({
        totalProducts,
        ecoFriendlyProducts,
        averageEcoScore,
        greenPoints,
        ecoCoins,
        co2Saved: Math.round(co2Saved * 10) / 10,
        categoryBreakdown,
        scoreDistribution,
        level,
        nextLevelPoints,
        progressToNextLevel,
        cartItems: cart.length
      });
      
      setBadges(earnedBadges);
      setNews(randomNews);
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', color: '#666' }}>Loading your eco journey...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Leaf size={48} style={{ color: '#10b981', marginBottom: '16px' }} />
        <h3>Start Your Eco Journey!</h3>
        <p style={{ color: '#666', marginTop: '8px' }}>Visit product pages to begin tracking your sustainable shopping.</p>
      </div>
    );
  }

  // Chart data
  const categoryChartData = {
    labels: Object.keys(stats.categoryBreakdown),
    datasets: [{
      label: 'Products by Category',
      data: Object.values(stats.categoryBreakdown),
      backgroundColor: [
        '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'
      ]
    }]
  };

  const scoreChartData = {
    labels: Object.keys(stats.scoreDistribution),
    datasets: [{
      label: 'Number of Products',
      data: Object.values(stats.scoreDistribution),
      backgroundColor: ['#10b981', '#84cc16', '#f59e0b', '#f97316', '#ef4444']
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Level Progress */}
      <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ margin: 0 }}>Level {stats.level} Eco Warrior</h3>
              <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                {stats.nextLevelPoints - stats.greenPoints} points to Level {stats.level + 1}
              </p>
            </div>
            <div style={{ fontSize: '48px' }}>🏆</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', height: '12px', overflow: 'hidden' }}>
            <div style={{ 
              background: 'white', 
              height: '100%', 
              width: `${stats.progressToNextLevel}%`,
              transition: 'width 0.5s'
            }}></div>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌟</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.greenPoints}</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Green Points</div>
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.ecoCoins}</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>EcoCoins</div>
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>�</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{alternativeStats?.alternativesSwitched || 0}</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Alternatives Chosen</div>
          </div>
        </div>
      </div>

      {/* Alternative Stats Section */}
      {alternativeStats && alternativeStats.alternativesSwitched > 0 && (
        <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '2px solid #10b981' }}>
          <div className="card-header">
            <h3 style={{ margin: 0, color: '#047857', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={20} />
              🌿 Sustainable Choice Impact
            </h3>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{alternativeStats.alternativesSwitched}</div>
                <div style={{ fontSize: '12px', color: '#047857' }}>Better Choices Made</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{alternativeStats.totalCO2Saved?.toFixed(1) || 0}kg</div>
                <div style={{ fontSize: '12px', color: '#047857' }}>Extra CO₂ Saved</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{alternativeStats.ecoCoins || 0}</div>
                <div style={{ fontSize: '12px', color: '#047857' }}>EcoCoins from Choices</div>
              </div>
            </div>
            
            {alternativeStats.recentChoices && alternativeStats.recentChoices.length > 0 && (
              <div>
                <h4 style={{ color: '#047857', marginBottom: '12px' }}>Recent Sustainable Choices:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {alternativeStats.recentChoices.slice(0, 3).map((choice, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #d1fae5'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>
                          {choice.productName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          EcoScore: {choice.ecoScore} • {choice.metadata?.co2Saved?.toFixed(1) || 0}kg CO₂ saved
                        </div>
                      </div>
                      <div style={{ 
                        background: '#fef3c7', 
                        padding: '4px 8px', 
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#92400e'
                      }}>
                        +{choice.metadata?.ecoCoinsEarned || 10} EcoCoins
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="card">
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <TrendingUp size={24} color="#10b981" />
              <h4 style={{ margin: 0 }}>Products Viewed</h4>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{stats.totalProducts}</div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              {stats.ecoFriendlyProducts} eco-friendly
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Leaf size={24} color="#10b981" />
              <h4 style={{ margin: 0 }}>Avg EcoScore</h4>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: stats.averageEcoScore >= 70 ? '#10b981' : '#f59e0b' }}>
              {stats.averageEcoScore}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              {stats.averageEcoScore >= 70 ? 'Great job!' : 'Keep improving!'}
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Award size={20} />
              Your Badges
            </h3>
          </div>
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
            {badges.map(badge => (
              <div key={badge.id} style={{ 
                textAlign: 'center', 
                padding: '16px',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                borderRadius: '12px',
                border: '2px solid #f59e0b'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>{badge.name.split(' ')[0]}</div>
                <div style={{ fontWeight: '600', fontSize: '12px', color: '#92400e' }}>
                  {badge.name.substring(2)}
                </div>
                <div style={{ fontSize: '10px', color: '#92400e', marginTop: '4px', opacity: 0.8 }}>
                  {badge.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Products by Category</h3>
          </div>
          <div style={{ padding: '20px', height: '250px' }}>
            {Object.keys(stats.categoryBreakdown).length > 0 ? (
              <Pie data={categoryChartData} options={chartOptions} />
            ) : (
              <p style={{ textAlign: 'center', color: '#666' }}>No data yet</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>EcoScore Distribution</h3>
          </div>
          <div style={{ padding: '20px', height: '250px' }}>
            {Object.values(stats.scoreDistribution).some(v => v > 0) ? (
              <Bar data={scoreChartData} options={chartOptions} />
            ) : (
              <p style={{ textAlign: 'center', color: '#666' }}>No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Impact Tracker */}
      <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '2px solid #10b981' }}>
        <div style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', color: '#065f46' }}>
            <Zap size={24} />
            Your Impact This Month
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#065f46', marginBottom: '4px' }}>⚡ Electricity Saved</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                Enough for {Math.round(stats.co2Saved / 2)} homes/day
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#065f46', marginBottom: '4px' }}>🌊 Water Saved</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                ~{Math.round(stats.co2Saved * 100)} liters
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#065f46', marginBottom: '4px' }}>🌳 Trees Planted Equivalent</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                {Math.round(stats.co2Saved / 20)} trees
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Impact */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ padding: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}>
            <Users size={24} color="#3b82f6" />
            Community Impact
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '16px', background: '#eff6ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>50,000</div>
              <div style={{ fontSize: '12px', color: '#1e40af' }}>Liters of water saved 🌊</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: '#eff6ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>1M kg</div>
              <div style={{ fontSize: '12px', color: '#1e40af' }}>CO₂ reduced 💨</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: '#eff6ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>10,000+</div>
              <div style={{ fontSize: '12px', color: '#1e40af' }}>Active users 👥</div>
            </div>
          </div>
        </div>
      </div>

      {/* Eco News Feed */}
      <div className="card">
        <div className="card-header" style={{ background: '#f0fdf4' }}>
          <h3 style={{ margin: 0, color: '#065f46' }}>🌍 Eco News Feed</h3>
        </div>
        <div style={{ padding: '0' }}>
          {news.map((item, index) => (
            <div key={index} style={{ 
              padding: '16px 20px', 
              borderBottom: index < news.length - 1 ? '1px solid #e5e7eb' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <ChevronRight size={16} color="#10b981" />
              <span style={{ fontSize: '14px' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
