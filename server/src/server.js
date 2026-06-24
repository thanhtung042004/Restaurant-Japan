const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const tableRoutes = require('./routes/tables');
const categoryRoutes = require('./routes/categories');
const menuRoutes = require('./routes/menu');
const reservationRoutes = require('./routes/reservations');
const orderRoutes = require('./routes/orders');
const invoiceRoutes = require('./routes/invoices');
const aiRoutes = require('./routes/ai');

connectDB();

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

// Make io accessible to controllers via req.app.get('io')
app.set('io', io);

// Security headers (allow cross-origin for uploaded images)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// app.use(morgan('dev')); 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Restaurant Japan API is running.',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);

  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Kitchen staff join the 'kitchen' room to receive order events
  socket.on('join:kitchen', () => {
    socket.join('kitchen');
    console.log(`Socket ${socket.id} joined kitchen room`);
    socket.emit('joined', { room: 'kitchen' });
  });

  // Front-of-house staff join the 'staff' room
  socket.on('join:staff', () => {
    socket.join('staff');
    console.log(`Socket ${socket.id} joined staff room`);
    socket.emit('joined', { room: 'staff' });
  });

  // Waiter-specific room for order/reservation notifications
  socket.on('join:waiter', () => {
    socket.join('waiter');
    console.log(`Socket ${socket.id} joined waiter room`);
    socket.emit('joined', { room: 'waiter' });
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${socket.id} (${reason})`);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`
  );
});

module.exports = { app, io };
