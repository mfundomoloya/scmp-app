const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking'); 

router.get('/', (req, res) => {
    res.send('Booking route is working!');
  });

module.exports = router;