const express = require('express');
  const router = express.Router();
  const auth = require('../middleware/auth');
  const multer = require('multer');
  const { getUserTimetable, importTimetables, updateTimetable, deleteTimetable, getAllTimetables, createTimetable } = require('../controllers/timetableController');

  const upload = multer({ storage: multer.memoryStorage() });

  router.get('/', auth, getUserTimetable);
  router.post('/import', auth, upload.single('file'), importTimetables);
  router.get('/all', auth, getAllTimetables);
  router.post('/', auth, createTimetable);
  router.put('/:id', auth, updateTimetable);
  router.delete('/:id', auth, deleteTimetable);

  module.exports = router;