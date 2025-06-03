const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getLecturers,
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { initializeApp } = require('firebase/app');
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, restrictTo('student'), updateProfile);
router.get('/', protect, restrictTo('student', 'lecturer', 'admin'), getLecturers);

module.exports = router;