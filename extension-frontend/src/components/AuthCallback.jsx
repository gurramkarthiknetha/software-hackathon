import { useEffect, useState } from 'react';
import { Loader, CheckCircle, XCircle } from 'lucide-react';
import './AuthCallback.css';

const AuthCallback = ({ onAuthComplete }) => {
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Get query parameters from URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const userId = params.get('userId');
      const role = params.get('role');
      const error = params.get('error');

      // Check for error
      if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${error}`);
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
        return;
      }

      // Check for token
      if (!token) {
        setStatus('error');
        setMessage('No authentication token received');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
        return;
      }

      // Save authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId || 'unknown');
      localStorage.setItem('userRole', role || 'user');

      // Fetch user profile
      const response = await fetch('http://localhost:5001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.data));
        
        // Also save to chrome.storage if available
        if (typeof chrome !== 'undefined' && chrome.storage) {
          await chrome.storage.local.set({
            token: token,
            user: data.data,
            userId: data.data.userId,
            userRole: role,
            isAuthenticated: true
          });
        }
        
        setStatus('success');
        setMessage('Successfully authenticated!');
        
        // Redirect to app after showing success message
        setTimeout(() => {
          const returnUrl = localStorage.getItem('returnUrl') || '/';
          localStorage.removeItem('returnUrl');
          
          // Notify parent component first
          if (onAuthComplete) {
            // Call the callback to update parent state
            onAuthComplete({
              token,
              user: data.data
            });
            
            // Give state time to update, then clear URL and force re-render
            setTimeout(() => {
              // Clear URL parameters and force page reload to show dashboard
              window.location.href = '/';
            }, 100);
          } else {
            // For standalone mode, redirect to base URL
            window.location.href = returnUrl === '/' ? '/' : returnUrl;
          }
        }, 1500);
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } catch (err) {
      console.error('Error in auth callback:', err);
      setStatus('error');
      setMessage('Authentication failed. Please try again.');
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  };

  return (
    <div className="auth-callback-container">
      <div className="auth-callback-card">
        {status === 'processing' && (
          <div className="auth-callback-content">
            <Loader size={48} className="spinner" />
            <h2>Authenticating...</h2>
            <p>{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="auth-callback-content success">
            <CheckCircle size={48} className="success-icon" />
            <h2>Success!</h2>
            <p>{message}</p>
            <p className="redirect-message">Redirecting to dashboard...</p>
            
          </div>
        )}

        {status === 'error' && (
          <div className="auth-callback-content error">
            <XCircle size={48} className="error-icon" />
            <h2>Error</h2>
            <p>{message}</p>
            <p className="redirect-message">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
