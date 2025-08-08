const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT_DASHBOARD || 8080;
const ENABLE_RATE_LIMIT = process.env.ENABLE_RATE_LIMIT === 'true';
const ENABLE_CORS = process.env.ENABLE_CORS === 'true';

// Stats storage
let stats = {
  topIPs: new Map(),
  requestsOverTime: [],
  lastLogs: []
};

// Middleware
if (ENABLE_CORS) {
  app.use(cors());
}

if (ENABLE_RATE_LIMIT) {
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  }));
}

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('Dashboard client connected');
  
  // Send initial stats
  socket.emit('initial-stats', {
    topIPs: Array.from(stats.topIPs.entries()),
    requestsOverTime: stats.requestsOverTime,
    lastLogs: stats.lastLogs
  });

  socket.on('toggle-stream', (enabled) => {
    socket.streaming = enabled;
  });

  socket.on('filter-ip', (ip) => {
    socket.ipFilter = ip;
  });

  socket.on('disconnect', () => {
    console.log('Dashboard client disconnected');
  });
});

// Listen for updates from DDoS server
const ddosSocket = require('socket.io-client')(`http://localhost:${process.env.PORT_DDOS}`);

ddosSocket.on('request-log', (log) => {
  // Update top IPs
  const currentCount = stats.topIPs.get(log.ip) || 0;
  stats.topIPs.set(log.ip, currentCount + 1);

  // Update requests over time
  const now = new Date();
  stats.requestsOverTime.push({ timestamp: now, count: 1 });
  // Keep only last hour
  stats.requestsOverTime = stats.requestsOverTime.filter(r => 
    (now - new Date(r.timestamp)) <= 3600000
  );

  // Update last logs
  stats.lastLogs.unshift(log);
  stats.lastLogs = stats.lastLogs.slice(0, 20);

  // Broadcast to all connected dashboard clients
  io.emit('stats-update', {
    topIPs: Array.from(stats.topIPs.entries()),
    requestsOverTime: stats.requestsOverTime,
    lastLogs: stats.lastLogs
  });
});

server.listen(PORT, () => {
  console.log(`Dashboard server running on port ${PORT}`);
});
