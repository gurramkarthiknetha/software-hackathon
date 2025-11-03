import { useState, useEffect } from 'react';
import { Leaf, TrendingUp, Award, Package, Settings } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ProductDetails from './components/ProductDetails';
import SettingsPanel from './components/SettingsPanel';
import DevModeIndicator from './components/DevModeIndicator';
import { storage, isChromeExtension, dev } from './utils/chromeApi';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentProduct, setCurrentProduct] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Get user ID and current product from storage
        const result = await storage.get(['userId', 'currentProduct']);
        
        if (result.userId) {
          setUserId(result.userId);
        } else {
          // Create new user ID
          const newUserId = dev.generateUserId();
          await storage.set({ userId: newUserId });
          setUserId(newUserId);
        }
        
        if (result.currentProduct) {
          setCurrentProduct(result.currentProduct);
          setActiveTab('product');
        } else if (!isChromeExtension()) {
          // In development mode, optionally load sample product
          // Uncomment the next two lines to show sample product in dev mode
          // setCurrentProduct(dev.getSampleProduct());
          // setActiveTab('product');
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
      } catch (err) {
        console.error('Error initializing app:', err);
        // Fallback user ID in case of error
        setUserId(dev.generateUserId());
      }
    };

    initializeApp();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard userId={userId} />;
      case 'product':
        return <ProductDetails product={currentProduct} userId={userId} />;
      case 'settings':
        return <SettingsPanel userId={userId} />;
      default:
        return <Dashboard userId={userId} />;
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-logo">
          <Leaf className="logo-icon" />
          <h1>EcoShop</h1>
        </div>
        <div className="header-subtitle">Sustainable Shopping Assistant</div>
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
