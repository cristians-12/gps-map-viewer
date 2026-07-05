import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer } from 'ws';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 8080;

app.use(express.json());

// --- Serve Static Files ---
// Use process.cwd() which is the project root in Render's environment
const frontendDistPath = path.join(process.cwd(), 'dist');
console.log(`Serving static files from: ${frontendDistPath}`);

app.use(express.static(frontendDistPath));

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket server');
  ws.on('close', () => console.log('Client disconnected'));
  ws.on('error', (error) => console.error('WebSocket Error:', error));
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

// --- SPA Fallback ---
app.get('*', (req, res) => {
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath);
});

server.listen(PORT, () => {
  console.log(`HTTP and WebSocket server running on port ${PORT}`);
});
