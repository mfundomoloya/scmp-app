require('dotenv').config({ path: './.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const issuesRoutes = require('./routes/issuesRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingsRoutes = require('./routes/bookingsRoutes');
const schedulesRoutes = require('./routes/schedulesRoutes');
const announcementsRoutes = require('./routes/announcementsRoutes');


const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(bodyParser.json());
app.use(express.json());

//using the routes
app.use('/api/users', userRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/announcements', announcementsRoutes);

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});