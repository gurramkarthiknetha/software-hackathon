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
      try {
        const altStatsResponse = await alternativesAPI.getStats(userId);
        if (altStatsResponse.success) {
          setAlternativeStats(altStatsResponse.data);
        }
      } catch (err) {
        console.error('Failed to load alternative stats:', err);
      }

      // Simulate user stats for now (in production, this would come from API)
      const userStats = {
        greenPoints: Math.floor(Math.random() * 200) + 50,
        ecoCoins: Math.floor(Math.random() * 150) + 25,
        level: Math.floor(Math.random() * 5) + 1,
        totalCO2Saved: (Math.random() * 50 + 10).toFixed(1),
        progressToNextLevel: Math.floor(Math.random() * 100),
        nextLevelPoints: 150,
        totalProducts: Math.floor(Math.random() * 50) + 10,
        ecoFriendlyProducts: Math.floor(Math.random() * 30) + 5,
        averageEcoScore: Math.floor(Math.random() * 40) + 60,
        co2Saved: Math.random() * 50 + 10,
        categoryBreakdown: {
          'Electronics': Math.floor(Math.random() * 20) + 5,
          'Clothing': Math.floor(Math.random() * 15) + 3,
          'Home & Garden': Math.floor(Math.random() * 10) + 2,
          'Health & Beauty': Math.floor(Math.random() * 8) + 1
        },
        scoreDistribution: {
          'A (90-100)': Math.floor(Math.random() * 10) + 2,
          'B (80-89)': Math.floor(Math.random() * 15) + 5,
          'C (70-79)': Math.floor(Math.random() * 12) + 8,
          'D (60-69)': Math.floor(Math.random() * 8) + 3,
          'E (0-59)': Math.floor(Math.random() * 5) + 1
        }
      };
      setStats(userStats);

      // Calculate earned badges
      const earnedBadges = BADGES.filter(badge => {
        switch(badge.type) {
          case 'views':
            return userStats.greenPoints >= badge.requirement * 2; // 2 points per view
          case 'cart':
            return userStats.greenPoints >= badge.requirement * 5; // 5 points per cart add
          case 'points':
            return userStats.greenPoints >= badge.requirement;
          case 'alternatives':
            return alternativeStats && alternativeStats.alternativesSwitched >= badge.requirement;
          default:
            return false;
        }
      });
      setBadges(earnedBadges);

      // Randomize news
      const shuffledNews = [...ECO_NEWS].sort(() => Math.random() - 0.5);
      setNews(shuffledNews.slice(0, 4));

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div>Loading dashboard data...</div>
      </div>
    );
  }

  // Chart data
  const categoryChartData = {
    labels: Object.keys(stats.categoryBreakdown),
    datasets: [{
      data: Object.values(stats.categoryBreakdown),
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
      borderWidth: 0
    }]
  };

  const scoreChartData = {
    labels: Object.keys(stats.scoreDistribution),
    datasets: [{
      label: 'Products',
      data: Object.values(stats.scoreDistribution),
      backgroundColor: ['#10b981', '#84cc16', '#f59e0b', '#f97316', '#ef4444'],
      borderWidth: 0
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
    <div className="dashboard-container">
      {/* Level Progress */}
      <div className="card level-progress-card">
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
      <div className="main-stats-grid">
        <div className="card stats-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
          <div className="stats-card-content">
            <span className="stats-card-icon">🌟</span>
            <div className="stats-card-value">{stats.greenPoints}</div>
            <div className="stats-card-label">Green Points</div>
          </div>
        </div>

        <div className="card stats-card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
          <div className="stats-card-content">
            <span className="stats-card-icon">💰</span>
            <div className="stats-card-value">{stats.ecoCoins}</div>
            <div className="stats-card-label">EcoCoins</div>
          </div>
        </div>

        <div className="card stats-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
          <div className="stats-card-content">
            <span className="stats-card-icon">🔄</span>
            <div className="stats-card-value">{alternativeStats?.alternativesSwitched || 0}</div>
            <div className="stats-card-label">Alternatives Chosen</div>
          </div>
        </div>
      </div>

      {/* Alternative Stats Section */}
      {alternativeStats && alternativeStats.alternativesSwitched > 0 && (
        <div className="card alternative-impact-card">
          <div className="card-header">
            <h3 style={{ margin: 0, color: '#047857', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={20} />
              🌿 Sustainable Choice Impact
            </h3>
          </div>
          <div style={{ padding: '20px' }}>
            <div className="alternative-stats-grid">
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
                <div className="recent-choices-list">
                  {alternativeStats.recentChoices.slice(0, 3).map((choice, index) => (
                    <div key={index} className="recent-choice-item">
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

      {/* Achievements */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} />
            Your Eco Achievements
          </h3>
        </div>
        <div style={{ padding: '20px' }}>
          <div className="achievements-grid">
            {badges.map(badge => (
              <div key={badge.id} className="badge-item">
                <div style={{ fontSize: '24px' }}>{badge.name.split(' ')[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#059669' }}>{badge.name.substring(2)}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{badge.description}</div>
                </div>
              </div>
            ))}
          </div>
          
          {badges.length === 0 && (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏅</div>
              <p>Keep exploring eco-friendly products to earn your first badge!</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
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

      {/* Eco News & Tips */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Leaf size={20} />
            Eco News & Tips
          </h3>
        </div>
        <div style={{ padding: '20px' }}>
          {news.map((item, index) => (
            <div key={index} className="eco-news-item">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;