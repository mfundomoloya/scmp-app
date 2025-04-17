const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(bodyParser.json());

//using the routes
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('Welcome to the Smart Campus Services Portal API');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});