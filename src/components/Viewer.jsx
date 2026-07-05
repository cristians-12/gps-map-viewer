import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Dynamically set the WebSocket URL
const getWebSocketURL = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.hostname;

  if (host === 'localhost') {
    return `ws://${host}:8080`;
  }

  return `${protocol}://${host}`;
};

const WS_URL = getWebSocketURL();


const motorcycleIcon = new L.Icon({
  iconUrl: '/motorcycle.webp', // Path to the image in the public folder
  iconSize: [48, 60],      // Adjust size as needed, e.g., [width, height]
  iconAnchor: [24, 48],      // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -48]     // Point from which the popup should open relative to the iconAnchor
});

// This component will handle map view updates
function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      // Fly to the new position with a smooth animation
      map.flyTo(position, 15, {
        animate: true,
        duration: 1.5
      });
    }
  }, [position, map]);

  return null; // This component does not render anything
}

export function Viewer() {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    console.log(`Connecting to WebSocket at: ${WS_URL}`);
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received new position from WebSocket:', data);
      if (data.lat && data.lng) {
        setPos(data);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const position = pos ? [pos.lat, pos.lng] : null;
  // Fallback initial position if we don't have one yet
  const initialCenter = [10.4631, -73.2532];

  return (
    <MapContainer center={initialCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {position && (
        <Marker position={position} icon={motorcycleIcon}>
          <Popup>
            Current Location: <br /> Lat: {pos.lat}, Lng: {pos.lng}
          </Popup>
        </Marker>
      )}
      {/* Add the MapUpdater component to the map */}
      <MapUpdater position={position} />
    </MapContainer>
  );
}
