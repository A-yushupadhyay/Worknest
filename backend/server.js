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

// ===================
// Environment Variables
// ===================
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI not set in env. Exiting.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET not set — auth endpoints will fail.');
}

// Allowed CORS origins (local + deployed frontend)
const allowedOrigins = [
  'http://localhost:5173',
  'https://worknest-delta.vercel.app'
];

// ===================
// CORS Middleware
// ===================
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  credentials: true
}));

// ===================
// Middlewares
// ===================
app.use(express.json());
app.use(passport.initialize());
require('./config/passport'); // passport strategies

// Rate limiter
const searchLimiter = rateLimit({
  windowMs: 15 * 1000, // 15 seconds
  max: 8,
  standardHeaders: true,
  legacyHeaders: false
});

// Attach Socket.IO to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ===================
// API Routes
// ===================
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

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// ===================
// Socket.IO Setup
// ===================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  socket.on('auth', ({ token }) => {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.join(`user_${payload.id}`);
      console.log(`✅ User ${payload.id} joined private room`);
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

  socket.on('disconnect', () => console.log('Socket disconnected', socket.id));
});

// ===================
// Start Mongo + Server
// ===================
(async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const PORT = process.env.PORT || 8000;
    server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Backend listening on ${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();
