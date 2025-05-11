const express = require('express');
  const router = express.Router();
  const {protect} = require('../middleware/auth');
  const multer = require('multer');
  const { createTimetable,
    getTimetables,
    getAllTimetables,
    getFilteredTimetables,
    updateTimetable,
    deleteTimetable, } = require('../controllers/timetableController');

  const upload = multer({ storage: multer.memoryStorage() });

  router.get('/', protect, getTimetables);
  router.get('/filter', protect, getFilteredTimetables);
  // router.post('/import', auth, upload.single('file'), importTimetables);
  router.get('/all', protect, getAllTimetables);
  router.post('/', protect, createTimetable);
  router.put('/:id', protect, updateTimetable);
  router.delete('/:id', protect, deleteTimetable);

  module.exports = router;