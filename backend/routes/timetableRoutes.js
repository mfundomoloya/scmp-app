const express = require('express'); 
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  createTimetable,
  getTimetables,
  getAllTimetables,
  getFilteredTimetables,
  updateTimetable,
  deleteTimetable,
} = require('../controllers/timetableController');

router.get('/', protect, getTimetables);
router.get('/lecturer', protect, restrictTo('lecturer'), getTimetables);
router.get('/filter', protect, getFilteredTimetables);
router.get('/all', protect, restrictTo('admin'), getAllTimetables);
router.post('/', protect, restrictTo('lecturer', 'admin'), createTimetable);
router.put('/:id', protect, restrictTo('lecturer', 'admin'), updateTimetable);
router.delete('/:id', protect, restrictTo('lecturer', 'admin'), deleteTimetable);

module.exports = router;