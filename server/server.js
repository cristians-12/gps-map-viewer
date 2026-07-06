import express from 'express';
import http from 'http';
import path from 'path';
import dgram from 'dgram';
import { WebSocketServer } from 'ws';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 8080;

// --- UDP Server para recibir GPS ---
const udpServer = dgram.createSocket('udp4');
const UDP_PORT = 41234;

console.log(`Starting UDP server on port ${UDP_PORT}...`);
udpServer.bind(UDP_PORT, '0.0.0.0', () => {
  console.log(`[UDP] Escuchando en puerto ${UDP_PORT}`);
});

udpServer.on('message', (msg, rinfo) => {
  if (msg.length < 9) {
    console.log(`[UDP] Mensaje muy corto desde ${rinfo.address}:${rinfo.port}`);
    return;
  }

  const magic = msg[0];
  if (magic !== 0x47) {
    console.log(`[UDP] Magic incorrecto: ${magic.toString(16)}`);
    return;
  }

  // Decodificar floats (IEEE 754)
  const buffer = Buffer.from(msg);
  const lat = buffer.readFloatLE(1);
  const lon = buffer.readFloatLE(5);

  console.log(`[UDP] Posicion recibida: ${lat.toFixed(6)}, ${lon.toFixed(6)} desde ${rinfo.address}`);

  // Broadcasts a WebSocket clients
  const payload = JSON.stringify({
    l: lat,      // latitude
    o: lon,      // longitude (origin)
    ts: new Date().toISOString()
  });

  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  });
});

udpServer.on('error', (err) => {
  console.error(`[UDP] Error: ${err}`);
  udpServer.close();
});

// --- WebSocket Server ---
app.use(express.json());

const frontendDistPath = path.join(process.cwd(), 'dist');
console.log(`Sirviendo archivos estaticos desde: ${frontendDistPath}`);
app.use(express.static(frontendDistPath));

wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');
  ws.on('close', () => console.log('Cliente WebSocket desconectado'));
  ws.on('error', (error) => console.error('Error WebSocket:', error));
});

// --- Legacy HTTP endpoint (fallback) ---
app.post('/gps-update', (req, res) => {
  const { lat, lon, l, o } = req.body;
  const latitude = lat || l;
  const longitude = lon || o;

  console.log(`[HTTP] Posicion recibida: ${latitude}, ${longitude}`);

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Falta lat/lon o l/o' });
  }

  const payload = JSON.stringify({
    l: latitude,
    o: longitude,
    ts: new Date().toISOString()
  });

  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  });

  res.status(200).json({ message: 'Posicion recibida y transmitida' });
});

// --- SPA Fallback ---
app.get('/*', (req, res) => {
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath);
});

server.listen(PORT, () => {
  console.log(`[HTTP+WS] Servidor escuchando en puerto ${PORT}`);
  console.log(`[UDP] Asegurate que puerto ${UDP_PORT} está abierto en firewall`);
});
