const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');
const { createBooking, getBookings, cancelBooking, approveBooking, updateStatus, getAvailableSlots } = require('../controllers/bookingController');

const isLecturer = (req, res, next) => {
  if (req.user.role !== 'lecturer') {
    return res.status(403).json({ msg: 'Access denied. Lecturer role required.' });
  }
  next();
};

router.post('/', protect, createBooking);
router.get('/', protect, getBookings);
router.delete('/:id', protect, cancelBooking);
router.get('/available', protect, getAvailableSlots); // Maps to /api/rooms/available
router.get('/rooms/available', protect, getAvailableSlots); // For lecturer compatibility
router.put('/:id/approve', [protect, admin], approveBooking);
router.put('/:id/status', [protect, admin], updateStatus);
router.get('/lecturer', [protect, isLecturer], getBookings);

module.exports = router;