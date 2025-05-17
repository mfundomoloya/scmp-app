const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getLecturers,
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'public/storage/avatars';
    require('fs').mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.get('/profile', protect, getProfile);
router.put('/profile', protect, restrictTo('student'), upload.single('avatar'), updateProfile);
router.get('/', protect, restrictTo('student', 'lecturer', 'admin'), getLecturers);

module.exports = router;