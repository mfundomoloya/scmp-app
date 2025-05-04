const Booking = require('../models/Booking');
const Room = require('../models/Room');
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
  return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;};

// Helper function to format time as HH:mm
const formatTime = (dateString) => {
  const t = new Date(dateString);
  if (isNaN(t)) return 'Invalid Time';  // Check if time is invalid
  return t.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour24: false, timeZone: 'Africa/Johannesburg' });
};


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

        // Check room maintenance
        const roomData = await Room.findOne({ name: room });
        if (!roomData) {
          return res.status(404).json({ msg: 'Room not found' });
        }
        const isUnderMaintenance = roomData.maintenance.some((m) => {
          const start = new Date(m.startDate);
          const end = new Date(m.endDate);
          return parsedDate >= start && parsedDate <= end;
        });
        if (isUnderMaintenance) {
          return res.status(400).json({ msg: 'Room is under maintenance on this date' });
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
    const formattedDate = formatDate(booking.date);
    console.log('Booking created:', { id: booking._id });
    res.status(201).json(booking);
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getBookings = async (req, res) => {
  try {
    console.log('Get bookings: req.user:', JSON.stringify(req.user, null, 2));
    if (!req.user || !req.user.id || !req.user.email) {
      console.error('Get bookings: Missing req.user, req.user.id, or req.user.email');
      return res.status(401).json({ msg: 'Invalid user authentication' });
    }
    let query;
    if (req.user.role === 'admin') {
      query = {};
    } else {
      console.log('Get bookings: Querying by email for student:', req.user.email);
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        console.error('Get bookings: User not found for email:', req.user.email);
        // Fallback: Raw MongoDB query
        console.log('Get bookings: Attempting raw MongoDB query by userId:', req.user.id);
        const bookings = await Booking.find({ userId: new mongoose.Types.ObjectId(req.user.id) })
          .populate('userId', 'name email')
          .sort({ date: -1 });
        console.log('Get bookings: raw MongoDB query result:', JSON.stringify(bookings, null, 2));
        if (bookings.length > 0) {
          console.log('Get bookings: Found bookings via raw query');
          res.json(bookings);
          return;
        }
        return res.status(400).json({ msg: 'User not found and no bookings found' });
      }
      console.log('Get bookings: Found user:', user._id.toString());
      query = { userId: user._id };
    }
    console.log('Get bookings: query:', JSON.stringify(query));
    const bookings = await Booking.find(query)
      .populate('userId', 'name email')
      .sort({ date: -1 });
    console.log('Get bookings: raw query result:', JSON.stringify(bookings, null, 2));
    console.log('Get bookings: rooms:', bookings.map(b => b.room));
    console.log('Get bookings: count:', bookings.length);
    console.log('Get bookings: userIds:', bookings.map(b => b.userId?._id?.toString()));
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
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

    const formattedDate = formatDate(booking.date);
    const formattedStartTime = formatTime(booking.startTime);
    const formattedEndTime = formatTime(booking.endTime);

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

    const formattedDate = formatDate(booking.date);
    const formattedStartTime = formatTime(booking.startTime);
    const formattedEndTime = formatTime(booking.endTime);

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
      message: `Your booking for ${booking.room} on ${formattedDate} from ${formattedStartTime} to 
                ${formattedEndTime} has been updated to ${status}.`,
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

    const formattedDate = formatDate(booking.date);
    const formattedStartTime = formatTime(booking.startTime);
    const formattedEndTime = formatTime(booking.endTime);

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
      message: `Your booking for ${booking.room} on ${formattedDate} from ${formattedStartTime} to 
                ${formattedEndTime} has been approved.`,
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
  try {
    const { date, roomId } = req.query;
    if (!date) {
      return res.status(400).json({ msg: 'Date is required' });
    }
    const selectedDate = new Date(date);
    if (isNaN(selectedDate)) {
      return res.status(400).json({ msg: 'Invalid date format' });
    }

    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    const rooms = roomId ? await Room.findById(roomId) : await Room.find();
    if (!rooms || (roomId && !rooms)) {
      return res.status(404).json({ msg: 'Room(s) not found' });
    }

    const roomList = Array.isArray(rooms) ? rooms : [rooms];
    const slots = [];

    for (const room of roomList) {
      const bookings = await Booking.find({
        room: room._id,
        startTime: { $lte: endOfDay },
        endTime: { $gte: startOfDay }
      });

      const availableSlots = [];
      let currentTime = new Date(startOfDay.setHours(8, 0, 0, 0));
      const endTime = new Date(startOfDay.setHours(17, 0, 0, 0));

      while (currentTime < endTime) {
        const slotEnd = new Date(currentTime.getTime() + 30 * 60 * 1000);
        const isBooked = bookings.some(
          (b) => b.startTime < slotEnd && b.endTime > currentTime
        );
        const isMaintenance = room.maintenance.some(
          (m) => m.startDate <= slotEnd && m.endDate >= currentTime
        );
        if (!isBooked && !isMaintenance) {
          availableSlots.push({
            startTime: new Date(currentTime),
            endTime: slotEnd
          });
        }
        currentTime = slotEnd;
      }

      slots.push({
        roomId: room._id,
        roomName: room.name,
        availableSlots
      });
    }

    console.log('Get available slots: Returning slots for', slots.length, 'rooms');
    res.json(slots);
  } catch (err) {
    console.error('Get available slots error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};


module.exports = { createBooking, getBookings, cancelBooking, updateStatus, approveBooking, getAvailableSlots };