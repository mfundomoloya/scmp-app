const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createBooking, getBookings, cancelBooking, approveBooking, updateStatus, getAvailableSlots } = require('../controllers/bookingController'); 

router.post('/', auth,createBooking);
router.get('/', auth, getBookings);
router.delete('/:id', auth, cancelBooking);
router.put('/:id/approve', auth, approveBooking);
router.put('/:id/status', auth, updateStatus);
router.get('/available', auth, getAvailableSlots);

module.exports = router;