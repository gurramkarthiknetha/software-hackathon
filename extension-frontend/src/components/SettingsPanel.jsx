import { useState, useEffect } from 'react';
import { Save, Moon, Sun, Bell, BellOff, Eye, EyeOff } from 'lucide-react';
import { userAPI } from '../api';
import { storage } from '../utils/chromeApi';

const SettingsPanel = ({ userId }) => {
  const [settings, setSettings] = useState({
    showEcoScoreOverlay: true,
    minEcoScore: 'C',
    notificationsEnabled: true,
    darkMode: false
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      const result = await storage.get(['settings']);
      if (result.settings) {
        setSettings(result.settings);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Save to storage (Chrome or localStorage)
      await storage.set({ settings });
      
      // Update backend if userId available
      if (userId) {
        await userAPI.updatePreferences(userId, settings);
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="settings-panel">
      {saved && (
        <div className="success">
          ✓ Settings saved successfully!
        </div>
      )}

      {/* Display Settings */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Display Settings</div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Show Overlay */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                {settings.showEcoScoreOverlay ? <Eye size={18} style={{ display: 'inline', marginRight: '8px' }} /> : <EyeOff size={18} style={{ display: 'inline', marginRight: '8px' }} />}
                Show Eco-Score Overlay
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                Display sustainability badge on product pages
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.showEcoScoreOverlay}
                onChange={(e) => handleChange('showEcoScoreOverlay', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Dark Mode */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                {settings.darkMode ? <Moon size={18} style={{ display: 'inline', marginRight: '8px' }} /> : <Sun size={18} style={{ display: 'inline', marginRight: '8px' }} />}
                Dark Mode
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                Use dark theme for popup
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => handleChange('darkMode', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Notifications</div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
              {settings.notificationsEnabled ? <Bell size={18} style={{ display: 'inline', marginRight: '8px' }} /> : <BellOff size={18} style={{ display: 'inline', marginRight: '8px' }} />}
              Enable Notifications
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>
              Get alerts about sustainable alternatives
            </div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) => handleChange('notificationsEnabled', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Filter Settings */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Filter Preferences</div>
        </div>
        
        <div>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>
            Minimum Eco-Score
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
            Only show products with this score or better
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['A', 'B', 'C', 'D', 'E'].map(score => (
              <button
                key={score}
                onClick={() => handleChange('minEcoScore', score)}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: settings.minEcoScore === score ? '2px solid #10b981' : '1px solid #e5e7eb',
                  borderRadius: '6px',
                  background: settings.minEcoScore === score ? '#ecfdf5' : 'white',
                  color: settings.minEcoScore === score ? '#10b981' : '#6b7280',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {score}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card" style={{ background: '#f9fafb' }}>
        <div className="card-header">
          <div className="card-title">About EcoShop</div>
        </div>
        <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '8px' }}>
            EcoShop helps you make sustainable shopping decisions by providing real-time 
            sustainability ratings and suggesting greener alternatives.
          </p>
          <p>
            Version 1.0.0 • Made with 💚 for a sustainable future
          </p>
        </div>
      </div>

      {/* Save Button */}
      <button 
        onClick={handleSave} 
        disabled={loading}
        className="button button-primary"
        style={{ width: '100%' }}
      >
        <Save size={18} />
        {loading ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
};

export default SettingsPanel;
