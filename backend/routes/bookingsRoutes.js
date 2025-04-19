const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createBooking, getBookings, cancelBooking  } = require('../controllers/bookingController'); 

router.post('/bookings', auth,createBooking);
router.get('/bookings', auth, getBookings);
router.delete('/bookings/:id', auth, cancelBooking);


module.exports = router;