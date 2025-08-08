const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT_DDOS || 9000;
const ENABLE_CORS = process.env.ENABLE_CORS === 'true';

// Middleware
if (ENABLE_CORS) {
  app.use(cors());
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper function to get real IP
const getRealIP = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  return (forwardedFor ? forwardedFor.split(',')[0] : null) || 
         req.connection.remoteAddress;
};

// Handle all HTTP methods
app.all('*', (req, res) => {
  const startTime = process.hrtime();
  
  const requestLog = {
    ip: getRealIP(req),
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl || req.url,
    headers: req.headers,
    userAgent: req.get('user-agent'),
    payloadSize: req.headers['content-length'] || 0
  };

  // Calculate latency
  const endTime = process.hrtime(startTime);
  requestLog.latency = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(2);

  // Log to console and file
  logger.log(requestLog);

  // Emit to dashboard via Socket.IO
  io.emit('request-log', requestLog);

  // Send response
  res.json({
    message: 'Request received successfully',
    metadata: requestLog
  });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('Client connected to DDoS server');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected from DDoS server');
  });
});

server.listen(PORT, () => {
  console.log(`DDoS target server running on port ${PORT}`);
});
