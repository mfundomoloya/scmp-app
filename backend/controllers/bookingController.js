const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const nodemailer = require('nodemailer');

//transporter for email notifications
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Create a booking
const createBooking = async (req, res) => {
  const { room, date, startTime, endTime } = req.body;
  try {
    if (!room || !date || !startTime || !endTime) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ msg: 'Invalid date format' });
    }

    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
      room,
      date: {
        $gte: new Date(parsedDate.setHours(0, 0, 0, 0)),
        $lte: new Date(parsedDate.setHours(23, 59, 59, 999)),
      },
      status: { $ne: 'cancelled' },
      $or: [
        { startTime: { $lte: endTime }, endTime: { $gte: startTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
      ],
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({ msg: 'Room is already booked for this time slot' });
    }

    const booking = new Booking({
      userId: req.user.id,
      room,
      date: parsedDate,
      startTime,
      endTime,
      status: 'pending',
    });
    await booking.save();
    console.log('Booking created:', { id: booking._id });
    res.status(201).json(booking);
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
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
    booking.status = 'cancelled';
    await booking.save();
    console.log('Booking cancelled:', { id: booking._id });

    // Send email notification
    const user = await User.findById(booking.userId);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Booking Cancelled',
      text: `Your booking for ${booking.room} on ${new Date(booking.date).toLocaleDateString()} from ${booking.startTime} to ${booking.endTime} has been cancelled.`,
    });

    // Create in-app notification
    const notification = new Notification({
      userId: booking.userId,
      message: `Your booking for ${booking.room} on ${new Date(booking.date).toLocaleDateString()} has been cancelled.`,
      read: false,
    });
    await notification.save();

    res.json(booking);
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

//Approve a booking
const approveBooking = async (req, res) => {
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

    // Send email notification
    const user = await User.findById(booking.userId);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Booking Approved',
      text: `Your booking for ${booking.room} on ${new Date(booking.date).toLocaleDateString()} from ${booking.startTime} to ${booking.endTime} has been approved.`,
    });

    // Create in-app notification
    const notification = new Notification({
      userId: booking.userId,
      message: `Your booking for ${booking.room} on ${new Date(booking.date).toLocaleDateString()} has been approved.`,
      read: false,
    });
    await notification.save();

    res.json(booking);
  } catch (err) {
    console.error('Approve booking error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

//Updating a booking
const updateStatus = async (req, res) => {
  const { status } = req.body;
  try {
    console.log('Updating booking status:', { id: req.params.id, status, userId: req.user.id });
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      console.log('Booking not found:', { id: req.params.id });
      return res.status(404).json({ msg: 'Booking not found' });
    }
    if (req.user.role !== 'admin') {
      console.log('Unauthorized status update attempt:', { userId: req.user.id, role: req.user.role });
      return res.status(403).json({ msg: 'Only admins can update booking status' });
    }
    booking.status = status;
    await booking.save();
    console.log('Booking status updated:', { id: booking._id, status });

    // Send email notification
    const user = await User.findById(booking.userId);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Booking Status Updated to ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      text: `Your booking for ${booking.room} on ${new Date(booking.date).toLocaleDateString()} from ${booking.startTime} to ${booking.endTime} has been updated to ${status}.`,
    });

    //in-app notification
    const notification = new Notification({
      userId: booking.userId,
      message: `Your booking for ${booking.room} on ${new Date(booking.date).toLocaleDateString()} has been updated to ${status}.`,
      read: false,
    });
    await notification.save();

    res.json(booking);
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { createBooking, getBookings, cancelBooking, approveBooking, updateStatus };