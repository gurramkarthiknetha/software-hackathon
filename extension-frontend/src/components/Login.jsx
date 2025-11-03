import { useState, useEffect } from 'react';
import { LogIn, Loader } from 'lucide-react';
import './Login.css';

const API_BASE_URL = 'http://localhost:5001/api';

const Login = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      setCheckingAuth(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setCheckingAuth(false);
        setLoading(false);
        return;
      }

      // Verify token with backend
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Token is valid, user is authenticated
        onLoginSuccess({
          token,
          user: data.user
        });
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCheckingAuth(false);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error checking authentication:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCheckingAuth(false);
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setError(null);

    // Check if running in Chrome extension
    const isChromeExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

    if (isChromeExtension) {
      // For Chrome extension, open OAuth in a new tab
      chrome.tabs.create({
        url: `${API_BASE_URL}/auth/google`,
        active: true
      }, (tab) => {
        // Store the tab ID to track the OAuth flow
        chrome.storage.local.set({ 
          oauthInProgress: true,
          oauthTabId: tab.id 
        });
      });
      
      // Close the popup (it will reopen after OAuth completes)
      window.close();
    } else {
      // For web app, redirect normally
      const returnUrl = window.location.href;
      localStorage.setItem('returnUrl', returnUrl);
      window.location.href = `${API_BASE_URL}/auth/google`;
    }
  };

  if (checkingAuth) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-loader">
            <Loader size={40} className="spinner" />
            <p>Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-emoji">🌱</span>
            <h1>EcoShop</h1>
          </div>
          <h2>Sustainable Shopping Assistant</h2>
          <p className="login-subtitle">
            Make eco-friendly choices with real-time sustainability ratings
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="login-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Button */}
        <div className="login-actions">
          <button 
            className="login-button" 
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={20} className="spinner" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>Sign in with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Features */}
        <div className="login-features">
          <h3>Why Sign In?</h3>
          <ul>
            <li>
              <span className="feature-icon">📊</span>
              <span>Track your carbon footprint</span>
            </li>
            <li>
              <span className="feature-icon">🏆</span>
              <span>Earn badges and achievements</span>
            </li>
            <li>
              <span className="feature-icon">💚</span>
              <span>Save your favorite eco products</span>
            </li>
            <li>
              <span className="feature-icon">🌍</span>
              <span>See your environmental impact</span>
            </li>
          </ul>
        </div>

        {/* Privacy Notice */}
        <div className="login-privacy">
          <small>
            🔒 We only use your Google account to identify you. 
            We don't access or store any personal data beyond your email and name.
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login;
