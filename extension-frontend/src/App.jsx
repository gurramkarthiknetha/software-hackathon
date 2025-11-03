import { useState, useEffect } from 'react';
import { Leaf, TrendingUp, Award, Package, Settings, LogOut, User } from 'lucide-react';
import EnhancedDashboard from './components/EnhancedDashboard';
import ProductDetails from './components/ProductDetails';
import SettingsPanel from './components/SettingsPanel';
import DevModeIndicator from './components/DevModeIndicator';
import Login from './components/Login';
import AuthCallback from './components/AuthCallback';
import { storage, isChromeExtension, dev } from './utils/chromeApi';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentProduct, setCurrentProduct] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if we're on the callback route
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('token')) {
          // Don't initialize app yet, let AuthCallback handle it
          setLoading(false);
          return;
        }

        // Check authentication from chrome.storage or localStorage
        const authData = await storage.get(['token', 'user', 'userId', 'isAuthenticated']);
        const token = authData.token || localStorage.getItem('token');
        const storedUser = authData.user || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
        
        if (token && storedUser) {
          // Verify token is still valid
          try {
            const response = await fetch('http://localhost:5001/api/auth/verify', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (response.ok) {
              const userData = storedUser;
              setUser(userData);
              setUserId(userData.userId);
              setIsAuthenticated(true);

              // Get current product from storage
              const result = await storage.get(['currentProduct']);
              if (result.currentProduct) {
                setCurrentProduct(result.currentProduct);
                setActiveTab('product');
              }

              // Listen for storage changes (only in Chrome Extension mode)
              if (isChromeExtension() && chrome.storage) {
                chrome.storage.onChanged.addListener((changes) => {
                  if (changes.currentProduct) {
                    setCurrentProduct(changes.currentProduct.newValue);
                    setActiveTab('product');
                  }
                });
              }
            } else {
              // Token invalid, clear auth
              handleLogout();
            }
          } catch (err) {
            console.error('Error verifying token:', err);
            handleLogout();
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error initializing app:', err);
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleLoginSuccess = async (authData) => {
    setUser(authData.user);
    setUserId(authData.user.userId);
    setIsAuthenticated(true);
    setLoading(false);
    
    // Save to both chrome.storage and localStorage
    await storage.set({
      token: authData.token,
      user: authData.user,
      userId: authData.user.userId,
      userRole: authData.user.role,
      isAuthenticated: true
    });
  };

  const handleLogout = async () => {
    try {
      // Get token from storage
      const authData = await storage.get(['token']);
      const token = authData.token || localStorage.getItem('token');
      
      if (token) {
        await fetch('http://localhost:5001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      // Clear both chrome.storage and localStorage
      await storage.remove(['token', 'user', 'userId', 'userRole', 'isAuthenticated']);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      
      setIsAuthenticated(false);
      setUser(null);
      setUserId(null);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <EnhancedDashboard userId={userId} />;
      case 'product':
        return <ProductDetails product={currentProduct} userId={userId} />;
      case 'settings':
        return <SettingsPanel userId={userId} />;
      default:
        return <EnhancedDashboard userId={userId} />;
    }
  };

  // Check if we're on the callback route
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('token')) {
    return <AuthCallback onAuthComplete={handleLoginSuccess} />;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-logo">
          <Leaf className="logo-icon" />
          <h1>EcoShop</h1>
        </div>
        <div className="header-subtitle">Sustainable Shopping Assistant</div>
        
        {/* User Info & Logout */}
        <div className="header-user">
          <div className="user-info">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="user-avatar" />
            ) : (
              <User size={20} className="user-icon" />
            )}
            <div className="user-details">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">{user?.role || 'user'}</span>
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="app-nav">
        <button
          className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <TrendingUp size={18} />
          <span>Dashboard</span>
        </button>
        {currentProduct && (
          <button
            className={`nav-button ${activeTab === 'product' ? 'active' : ''}`}
            onClick={() => setActiveTab('product')}
          >
            <Package size={18} />
            <span>Product</span>
          </button>
        )}
        <button
          className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="app-content">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <span>Made with 💚 for a sustainable future</span>
      </footer>

      {/* Development Mode Indicator */}
      <DevModeIndicator />
    </div>
  );
}

export default App;
