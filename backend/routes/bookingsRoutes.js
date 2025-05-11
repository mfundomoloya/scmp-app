const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');
const { createBooking, getBookings, cancelBooking, approveBooking, updateStatus, getAvailableSlots } = require('../controllers/bookingController'); 

router.post('/', protect,createBooking);
router.get('/', protect, getBookings);
router.delete('/:id', protect, cancelBooking);
router.put('/:id/approve', [protect, admin], approveBooking);
router.put('/:id/status', [protect, admin], updateStatus);
router.get('/available', protect, getAvailableSlots);

module.exports = router;