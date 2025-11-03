import { isChromeExtension } from '../utils/chromeApi';

const DevModeIndicator = () => {
  // Only show in development mode
  if (isChromeExtension() || import.meta.env.PROD) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      background: '#fbbf24',
      color: '#78350f',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 600,
      zIndex: 999999,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}>
      <span>⚠️</span>
      <span>DEV MODE</span>
    </div>
  );
};

export default DevModeIndicator;
