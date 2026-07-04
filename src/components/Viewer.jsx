import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// Dynamically set the WebSocket URL based on the hostname
const host = window.location.hostname;
const WS_URL = `ws://${host}:8080`;

export function Viewer() {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received data from WebSocket:', data);
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

  const position = pos ? [pos.lat, pos.lng] : [51.505, -0.09];

  return (
    <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pos && (
        <Marker position={position}>
          <Popup>
            Current Location: <br /> Lat: {pos.lat}, Lng: {pos.lng}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
