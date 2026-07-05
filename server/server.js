import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer } from 'ws';
import net from 'net';
import mqtt from 'mqtt';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 8080;

app.use(express.json());
// --- Serve Static Files ---
const frontendDistPath = path.join(process.cwd(), 'dist');
console.log(`Serving static files from: ${frontendDistPath}`);
app.use(express.static(frontendDistPath));

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket server');
  ws.on('close', () => console.log('Client disconnected'));
  ws.on('error', (error) => console.error('WebSocket Error:', error));
});

// --- MQTT: Conexión al broker público de EMQX ---
const MQTT_BROKER_URL = 'mqtt://broker.emqx.io:1883';
const mqttClient = mqtt.connect(MQTT_BROKER_URL, {
  clientId: `backend_${Math.random().toString(16).substring(2, 10)}`,
});

mqttClient.on('connect', () => {
  console.log(`[MQTT] Conectado exitosamente al broker público EMQX`);
  mqttClient.subscribe('gps/data', (err) => {
    if (!err) {
      console.log(`[MQTT] Suscrito correctamente al topic: gps/data`);
    } else {
      console.error(`[MQTT] Error al suscribirse: ${err}`);
    }
  });
});

mqttClient.on('message', (topic, message) => {
  console.log(`[MQTT] Recibido en ${topic}: ${message.toString()}`);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message.toString());
    }
  });
});

mqttClient.on('error', (error) => {
  console.error('[MQTT] Error de conexión:', error);
});

// --- Legacy HTTP endpoint (puedes borrarlo cuando no lo necesites) ---
app.post('/gps-update', (req, res) => {
  const { lat, lon } = req.body;
  console.log(`Received GPS data via POST: lat=${lat}, lon=${lon}`);
  if (lat === undefined || lon === undefined) {
    return res.status(400).json({ error: 'Invalid coordinates. Expecting lat and lon.' });
  }
  const payload = JSON.stringify({ lat, lng: lon });
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  });
  res.status(200).json({ message: 'Position received and broadcasted' });
});

// --- SPA Fallback ---
app.get('/*', (req, res) => {
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath);
});

// --- TCP raw server (opcional, por si acaso) ---
net.createServer((socket) => {
  let buf = '';
  socket.on('data', (chunk) => {
    buf += chunk.toString();
    if (buf.includes('#')) {
      const trama = buf.substring(0, buf.indexOf('#'));
      buf = buf.substring(buf.indexOf('#') + 1);
      const partes = trama.split(',');
      const payload = JSON.stringify({ lat: parseFloat(partes[1]), lng: parseFloat(partes[2]) });
      wss.clients.forEach((c) => { if (c.readyState === c.OPEN) c.send(payload); });
    }
  });
}).listen(5001);

server.listen(PORT, () => {
  console.log(`HTTP and WebSocket server running on port ${PORT}`);
});
