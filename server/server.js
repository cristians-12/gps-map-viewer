import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

// Since we are using ES Modules, __dirname is not available directly.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app); // Create an HTTP server from the Express app
const wss = new WebSocketServer({ server }); // Attach WebSocket server to the HTTP server

app.use(express.json());

// --- Serve Static Files ---
const frontendDistPath = path.join(__dirname, '..', 'dist');
app.use(express.static(frontendDistPath));

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket server');

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

// --- SPA Fallback ---
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// --- Vercel Export ---
// Instead of listening, we export the server instance.
// Vercel will handle the port and lifecycle.
export default server;
