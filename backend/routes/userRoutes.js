const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User'); 
const { getProfile, updateProfile, getLecturers } = require('../controllers/userController');



router.get('/profile', protect, getProfile);


router.put('/profile', protect, updateProfile);


router.get('/', protect, getLecturers);

module.exports = router;