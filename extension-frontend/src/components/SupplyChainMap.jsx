import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock supply chain data
const SUPPLY_CHAINS = {
  'Clothing': [
    { location: 'India', coords: [20.5937, 78.9629], step: 'Cotton Farming', emoji: '🌱', country: '🇮🇳' },
    { location: 'Bangladesh', coords: [23.6850, 90.3563], step: 'Textile Processing', emoji: '🧵', country: '🇧🇩' },
    { location: 'Vietnam', coords: [14.0583, 108.2772], step: 'Manufacturing', emoji: '🏭', country: '🇻🇳' },
    { location: 'USA', coords: [37.0902, -95.7129], step: 'Distribution', emoji: '🚢', country: '🇺🇸' }
  ],
  'Electronics': [
    { location: 'Congo', coords: [-4.0383, 21.7587], step: 'Raw Materials', emoji: '⛏️', country: '🇨🇩' },
    { location: 'China', coords: [35.8617, 104.1954], step: 'Component Manufacturing', emoji: '🔧', country: '🇨🇳' },
    { location: 'Taiwan', coords: [23.6978, 120.9605], step: 'Assembly', emoji: '🏭', country: '🇹🇼' },
    { location: 'USA', coords: [37.0902, -95.7129], step: 'Distribution', emoji: '📦', country: '🇺🇸' }
  ],
  'Home & Living': [
    { location: 'Indonesia', coords: [-0.7893, 113.9213], step: 'Bamboo Harvesting', emoji: '🎋', country: '🇮🇩' },
    { location: 'Thailand', coords: [15.8700, 100.9925], step: 'Processing', emoji: '🔨', country: '🇹🇭' },
    { location: 'USA', coords: [37.0902, -95.7129], step: 'Distribution', emoji: '🚚', country: '🇺🇸' }
  ],
  'Beauty & Personal Care': [
    { location: 'Morocco', coords: [31.7917, -7.0926], step: 'Natural Ingredients', emoji: '🌿', country: '🇲🇦' },
    { location: 'France', coords: [46.2276, 2.2137], step: 'Manufacturing', emoji: '🏭', country: '🇫🇷' },
    { location: 'USA', coords: [37.0902, -95.7129], step: 'Distribution', emoji: '✈️', country: '🇺🇸' }
  ],
  'Other': [
    { location: 'China', coords: [35.8617, 104.1954], step: 'Manufacturing', emoji: '🏭', country: '🇨🇳' },
    { location: 'USA', coords: [37.0902, -95.7129], step: 'Distribution', emoji: '📦', country: '🇺🇸' }
  ]
};

// Animated Polyline Component
function AnimatedPolyline({ positions, color }) {
  const map = useMap();
  const [animatedPositions, setAnimatedPositions] = useState([positions[0]]);

  useEffect(() => {
    let currentIndex = 0;
    let progress = 0;
    const animationSpeed = 0.02;

    const animate = () => {
      if (currentIndex < positions.length - 1) {
        progress += animationSpeed;
        
        if (progress >= 1) {
          progress = 0;
          currentIndex++;
        }

        const start = positions[currentIndex];
        const end = positions[currentIndex + 1] || start;
        
        const lat = start[0] + (end[0] - start[0]) * progress;
        const lng = start[1] + (end[1] - start[1]) * progress;
        
        setAnimatedPositions([...positions.slice(0, currentIndex + 1), [lat, lng]]);
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [positions]);

  return <Polyline positions={animatedPositions} color={color} weight={3} opacity={0.7} />;
}

const SupplyChainMap = ({ category = 'Other' }) => {
  const supplyChain = SUPPLY_CHAINS[category] || SUPPLY_CHAINS['Other'];
  const positions = supplyChain.map(item => item.coords);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % supplyChain.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [supplyChain.length]);

  // Calculate center and zoom
  const center = positions.length > 0 ? positions[0] : [20, 0];

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Animated route */}
        <AnimatedPolyline positions={positions} color="#10b981" />
        
        {/* Markers */}
        {supplyChain.map((item, index) => (
          <Marker 
            key={index} 
            position={item.coords}
          >
            <Popup>
              <div style={{ textAlign: 'center', padding: '8px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{item.emoji}</div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{item.country} {item.location}</div>
                <div style={{ color: '#10b981', fontSize: '14px' }}>{item.step}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Journey Timeline */}
      <div style={{ 
        padding: '16px', 
        background: 'white', 
        borderTop: '2px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {supplyChain.map((item, index) => (
          <div 
            key={index}
            style={{
              textAlign: 'center',
              padding: '8px 12px',
              borderRadius: '8px',
              background: currentStep === index ? '#ecfdf5' : '#f9fafb',
              border: currentStep === index ? '2px solid #10b981' : '2px solid transparent',
              transition: 'all 0.3s',
              minWidth: '100px'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{item.emoji}</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{item.location}</div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{item.step}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupplyChainMap;
