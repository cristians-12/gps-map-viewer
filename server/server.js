import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Initialize WebSocket server without attaching it to the HTTP server directly
const wss = new WebSocketServer({ noServer: true });

// --- Explicitly Handle the HTTP Upgrade to WebSocket ---
server.on('upgrade', (request, socket, head) => {
  console.log('Upgrade request received. Handling WebSocket handshake.');
  
  // Let the WebSocket server handle the upgrade
  wss.handleUpgrade(request, socket, head, (ws) => {
    // The connection is established. Emit the 'connection' event.
    wss.emit('connection', ws, request);
  });
});

app.use(express.json());

const frontendDistPath = path.join(__dirname, '..', 'dist');
app.use(express.static(frontendDistPath));

wss.on('connection', (ws) => {
  console.log('Client connected via handleUpgrade');

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket Error:', error);
  });
});

app.post('/gps-update', (req, res) => {
  const { lat, lng } = req.body;
  console.log(`Received GPS data via POST: lat=${lat}, lng=${lng}`);

  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  const payload = JSON.stringify({ lat, lng });
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  });

  res.status(200).json({ message: 'Position received and broadcasted' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

export default server;
