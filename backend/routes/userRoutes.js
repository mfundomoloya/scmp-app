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
  // ... other config
};
initializeApp(firebaseConfig);
const storage = getStorage();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, restrictTo('student'), updateProfile);
router.get('/', protect, restrictTo('student', 'lecturer', 'admin'), getLecturers);
router.post('/upload-avatar', async (req, res) => {
  const file = req.files.file;
  const storageRef = ref(storage, `avatars/${req.user.id}-${Date.now()}`);
  await uploadBytes(storageRef, file.data);
  const url = await getDownloadURL(storageRef);
  res.json({ url });
});
module.exports = router;