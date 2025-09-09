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

// basic setup
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

// rate limiter
const searchLimiter = rateLimit({
  windowMs: 15 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false
});

// attach io
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orgs', require('./routes/orgs'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/members', require('./routes/members'));
app.use('/api/comments', require('./routes/comments'));
const { router: notificationRouter } = require('./routes/notifications');
app.use('/api/notifications', notificationRouter);
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api/search', searchLimiter, require('./routes/search'));

// health check
app.get('/health', (req, res) => res.json({ ok: true }));

// socket.io handlers
io.on('connection', (socket) => {
  console.log('🔌 socket connected', socket.id);

  socket.on('auth', ({ token }) => {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const userId = payload.id;
      socket.join(`user_${userId}`);
      console.log(`✅ User ${userId} joined their private room`);
    } catch {
      console.warn('❌ Invalid token for socket auth');
    }
  });

  socket.on('join', ({ projectId, orgId, userId }) => {
    if (orgId) socket.join(`org_${orgId}`);
    if (projectId) socket.join(`project_${projectId}`);
    if (userId) socket.join(`user_${userId}`);

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

    const PORT = process.env.PORT || 8000;
    server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Backend listening on ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
