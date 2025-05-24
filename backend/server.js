require('dotenv').config({ path: './.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingsRoutes = require('./routes/bookingsRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const announcementsRoutes = require('./routes/announcementsRoutes');
const notificationRoutes = require('./routes/notification');
const roomRoutes = require('./routes/roomsRoutes');
const courseRoutes = require('./routes/courseRoutes');
const requestRoutes = require('./routes/requestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;




// Middleware
app.use(cors({ 
    origin: 'https://scmp-app-sepia.vercel.app', // or '*'
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.options('*', cors({
    origin: 'https://scmp-app-sepia.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(bodyParser.json());
app.use(express.json({ extended: false }));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Smart Campus Services Portal API');
});

// Validate environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS', 'FRONTEND_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('Error: Missing environment variables:', missingEnvVars.join(', '));
  throw new Error(`Missing environment variables: ${missingEnvVars.join(', ')}`);
}

// Check environment variables
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env file');
  process.exit(1);
}
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('Error: EMAIL_USER or EMAIL_PASS is not defined in .env file');
  process.exit(1);
}

console.log('ENV loaded:', {
  MONGODB_URI: process.env.MONGODB_URI ? '[REDACTED]' : undefined,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET ? '[REDACTED]' : undefined,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS ? '[REDACTED]' : undefined,
  FRONTEND_URL: process.env.FRONTEND_URL,
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Vercel serverless export
module.exports = app;