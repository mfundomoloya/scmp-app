const Booking = require('../models/Booking');
const User = require('../models/User');
const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper function to format dates as dd-mm-yyyy
const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d)) return 'Invalid Date';  // Check if the date is invalid
  return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
};

// Helper function to format time as HH:mm
const formatTime = (dateString) => {
  const t = new Date(dateString);
  if (isNaN(t)) return 'Invalid Time';  // Check if time is invalid
  return t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};


// Format booking date and times
const formattedDate = formatDate(booking.date);
const formattedStartTime = formatTime(booking.startTime);  // Format start time
const formattedEndTime = formatTime(booking.endTime);  // Format end time



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

const getBookings = async (req, res) => {
  try {
    console.log('Fetching bookings for:', { userId: req.user.id, role: req.user.role });
    const bookings = req.user.role === 'admin'
      ? await Booking.find().populate('userId', 'name email')
      : await Booking.find({ userId: req.user.id });
    res.json(bookings);
  } catch (err) {
    console.error('Get bookings error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

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
      text: `Your booking for ${booking.room} on ${formattedDate} from ${formattedStartTime} to ${formattedEndTime} has been cancelled.`,
    });

    // Create in-app notification
    const notification = new Notification({
      userId: booking.userId,
      message: `Your booking for ${booking.room} on ${formattedDate} has been cancelled.`,
      read: false,
    });
    await notification.save();

    // Emit WebSocket notification
    const io = req.app.get('io');
    io.to(booking.userId.toString()).emit('notification', notification);

    res.json(booking);
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

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
      text: `Your booking for ${booking.room} on ${formattedDate} from ${formattedStartTime} to ${formattedEndTime} has been updated to ${status}.`,
    });

    // Create in-app notification
    const notification = new Notification({
      userId: booking.userId,
      message: `Your booking for ${booking.room} on ${formattedDate} has been updated to ${status}.`,
      read: false,
    });
    await notification.save();

    // Emit WebSocket notification
    const io = req.app.get('io');
    io.to(booking.userId.toString()).emit('notification', notification);

    res.json(booking);
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

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
      text: `Your booking for ${booking.room} on ${formattedDate} from ${formattedStartTime} to ${formattedEndTime} has been approved.`,
    });

    // Create in-app notification
    const notification = new Notification({
      userId: booking.userId,
      message: `Your booking for ${booking.room} on ${formattedDate} has been approved.`,
      read: false,
    });
    await notification.save();

    // Emit WebSocket notification
    const io = req.app.get('io');
    io.to(booking.userId.toString()).emit('notification', notification);

    res.json(booking);
  } catch (err) {
    console.error('Approve booking error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getAvailableSlots = async (req, res) => {
  const { room, date } = req.query;
  if (!room || !date) {
    return res.status(400).json({ message: 'Room and date are required' });
  }

  try {
    const bookings = await Booking.find({
      room,
      date: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lte: new Date(date).setHours(23, 59, 59, 999),
      },
      status: { $ne: 'cancelled' },
    });

    // Define operating slots
    const operatingHours = [
      '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
      '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
    ];

    // Format time helper
    const formatTime = (time) => {
      const t = new Date(time);
      return t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    // Generate booked slots like '08:00-09:00'
    const bookedSlots = bookings.map((booking) => {
      const start = formatTime(booking.startTime);
      const end = formatTime(booking.endTime);
      return `${start}-${end}`;
    });

    // Filter out slots that are already booked
    const availableSlots = operatingHours.filter((slot) => !bookedSlots.includes(slot));

    res.json(availableSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = { createBooking, getBookings, cancelBooking, updateStatus, approveBooking, getAvailableSlots };