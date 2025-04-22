const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');

// Create a booking
const createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { room, date, startTime, endTime } = req.body;

  try {
    console.log('Creating booking:', { userId: req.user.id, room, date, startTime, endTime });

    // Check for clashing bookings
    const existingBooking = await Booking.findOne({
      room,
      date: new Date(date),
      $or: [
        { startTime: { $lte: endTime }, endTime: { $gte: startTime } },
      ],
      status: { $ne: 'cancelled' },
    });

    if (existingBooking) {
      return res.status(400).json({ msg: 'Room is already booked for this time slot' });
    }

    const booking = new Booking({
      userId: req.user.id,
      room,
      date: new Date(date),
      startTime,
      endTime,
    });

    await booking.save();
    console.log('Booking created:', booking);

    res.json({ msg: 'Booking created successfully', booking });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// List bookings
const getBookings = async (req, res) => {
  try {
    const bookings = req.user.role === 'admin' 
      ? await Booking.find().populate('userId', 'name email')
      : await Booking.find({ userId: req.user.id });
    res.json(bookings);
  } catch (err) {
    console.error('Get bookings error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
  const { id } = req.params;

  try {
    console.log('Cancelling booking:', { id, userId: req.user.id });

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    booking.status = 'cancelled';
    await booking.save();
    console.log('Booking cancelled:', booking);

    res.json({ msg: 'Booking cancelled successfully' });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

//Approve a booking
const approveBooking = async (req, res) => {
  const { id } = req.params;

  try {
    console.log('Approving booking:', { id: req.params.id, userId: req.user.id });
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      console.log('Booking not found:', { id: req.params.id });
      return res.status(404).json({ msg: 'Booking not found' });
    }
    if (req.user.role !== 'admin') {
      console.log('Unauthorized approval attempt:', { userId: req.user.id, role: req.user.role });
      return res.status(403).json({ msg: 'Only admins can approve bookings' });
    }
    booking.status = 'confirmed';
    await booking.save();
    console.log('Booking approved:', { id: booking._id, status: booking.status });
    res.json(booking);
  } catch (err) {
    console.error('Approve booking error:', err);
    res.status(500).json({ msg: 'Server error' });
  }

    // Check for overlapping confirmed bookings
    const existingBooking = await Booking.findOne({
      room: booking.room,
      date: booking.date,
      $or: [
        { startTime: { $lte: booking.endTime }, endTime: { $gte: booking.startTime } },
      ],
      status: 'confirmed',
      _id: { $ne: booking._id },
    });

    if (existingBooking) {
      return res.status(400).json({ msg: 'Room is already booked for this time slot' });
    }
};

module.exports = { createBooking, getBookings, cancelBooking, approveBooking };