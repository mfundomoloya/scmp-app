const express = require('express');
  const router = express.Router();
  const auth = require('../middleware/auth');
  const multer = require('multer');
  const { getUserTimetable, importTimetables } = require('../controllers/timetableController');

  const upload = multer({ storage: multer.memoryStorage() });

  router.get('/', auth, getUserTimetable);
  router.post('/import', auth, upload.single('file'), importTimetables);

  module.exports = router;