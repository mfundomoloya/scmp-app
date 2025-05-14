const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getLecturers,
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

// const upload = require('../middleware/multer');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, restrictTo('student'), updateProfile);
router.get('/', protect, restrictTo('student', 'lecturer'), getLecturers);

module.exports = router;