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
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://scmp-app-sepia.vercel.app/', // Frontend URL (Vite default)
    methods: ['GET', 'POST'],
  },
});
const PORT = process.env.PORT || 5000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/storage/avatars');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });


// Middleware
app.use(cors({ origin: 'https://scmp-app-sepia.vercel.app/' }));
app.use(bodyParser.json());
app.use(express.json({ extended: false }));
// Apply rate limiter, excluding Socket.IO endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  skip: (req) => req.path.startsWith('/socket.io/'), // Exclude Socket.IO
});
app.use(limiter);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

//using the routes
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

// Socket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.log('Socket auth: No token provided');
    return next(new Error('Authentication error: No token'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    console.log('Socket auth: Token verified for user:', socket.user.id);
    next();
  } catch (err) {
    console.log('Socket auth error:', err.message);
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('join', (userId) => {
    console.log('User joined room:', userId);
    socket.join(userId);
  });
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', socket.id, reason);
  });
});

// Make io accessible to controllers
app.set('io', io);


// Check for critical environment variables
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

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('Welcome to the Smart Campus Services Portal API');
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;