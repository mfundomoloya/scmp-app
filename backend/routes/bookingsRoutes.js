const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createBooking, getBookings, cancelBooking, approveBooking, updateStatus } = require('../controllers/bookingController'); 

router.post('/', auth,createBooking);
router.get('/', auth, getBookings);
router.delete('/:id', auth, cancelBooking);
router.put('/:id/approve', auth, approveBooking);
router.put('/:id/status', auth, updateStatus);


module.exports = router;