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

require('dotenv').config();

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

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('Welcome to the Smart Campus Services Portal API');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});