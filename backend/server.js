// backend/server.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);

// basic setup & defensive checks
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set in env. Exiting.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET not set — auth endpoints will fail.');
}

// socket.io
const io = new Server(server, {
  cors: { origin: FRONTEND_URL, credentials: true }
});

// middlewares
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(passport.initialize());
require('./config/passport'); // if present

// rate limiter for search route
const searchLimiter = rateLimit({
  windowMs: 15 * 1000, // 15s
  max: 8,
  standardHeaders: true,
  legacyHeaders: false
});

// attach io to req so route handlers can emit
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orgs', require('./routes/orgs'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/members', require('./routes/members'));
app.use('/api/comments', require('./routes/comments'));
// ✅ Updated line for notifications route
const { router: notificationRouter, createNotification } = require('./routes/notifications');
app.use('/api/notifications', notificationRouter);

app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api/search', searchLimiter, require('./routes/search'));
// Serve React build
app.use(express.static(path.join(__dirname, 'frontend-build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend-build', 'index.html'));
});

// health check
app.get('/health', (req, res) => res.json({ ok: true }));

// socket listeners
io.on('connection', (socket) => {
  console.log('🔌 socket connected', socket.id);

  // ✅ authenticate user and join their personal room
  socket.on('auth', ({ token }) => {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const userId = payload.id;
      socket.join(`user_${userId}`);
      console.log(`✅ User ${userId} joined their private room`);
    } catch (err) {
      console.warn('❌ Invalid token provided for socket auth');
    }
  });

  // existing project/org rooms
// Join rooms
  socket.on('join', ({ token, projectId, orgId, userId }) => {
    if (orgId) socket.join(`org_${orgId}`);
    if (projectId) socket.join(`project_${projectId}`);
    if (userId) socket.join(`user_${userId}`); // ✅ personal room for notifications

    if (projectId) {
      socket.to(`project_${projectId}`).emit('presence:update', { id: socket.id, online: true });
    }
  });

  socket.on('leave', ({ projectId, orgId, userId }) => {
    if (orgId) socket.leave(`org_${orgId}`);
    if (projectId) socket.leave(`project_${projectId}`);
    if (userId) socket.leave(`user_${userId}`);
  });

  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

// Mongo + server
(async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    mongoose.connection.on('error', (err) => console.error('Mongo connection error:', err));
    mongoose.connection.once('open', () => console.log('MongoDB connected'));

    const PORT = process.env.PORT || 8000;
    server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Backend listening on ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
