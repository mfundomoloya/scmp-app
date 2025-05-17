const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Timetable = require('../models/Timetable');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d)) return 'Invalid Date';
  return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
};

const formatTime = (time) => {
  const t = new Date(`1970-01-01T${time}:00`);
  if (isNaN(t)) return 'Invalid Time';
  return t.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Johannesburg' });
};

const createBooking = async (req, res) => {
  const { room, date, startTime, endTime, courseId } = req.body;
  try {
    if (!room || !date || !startTime || !endTime) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ msg: 'Invalid date format' });
    }

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

    // Check timetable conflicts
    const dayName = parsedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const timetableConflicts = await Timetable.find({
      roomId: roomData._id,
      day: dayName,
    }).populate('courseId', 'code');
    const hasTimetableConflict = timetableConflicts.some(t => {
      const tStart = new Date(t.startTime).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false });
      const tEnd = new Date(t.endTime).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false });
      return startTime < tEnd && endTime > tStart;
    });
    if (hasTimetableConflict) {
      return res.status(400).json({ msg: 'Room is reserved for a timetable slot' });
    }

    const isLecturer = req.user.role === 'lecturer';
    const bookingData = {
      userId: req.user.id,
      room,
      date: parsedDate,
      startTime,
      endTime,
      status: isLecturer ? 'confirmed' : 'pending',
    };

    if (isLecturer) {
      bookingData.courseId = courseId || null;
      bookingData.lecturerId = req.user.id;
    }

    const booking = new Booking(bookingData);
    await booking.save();
    const formattedDate = formatDate(booking.date);
    console.log('Booking created:', { id: booking._id });

    if (isLecturer) {
      const user = await User.findById(booking.userId);
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Booking Confirmed',
        text: `Your booking for ${booking.room} on ${formattedDate} from ${startTime} to ${endTime} has been confirmed.`,
      });

      const notification = new Notification({
        userId: booking.userId,
        message: `Your booking for ${booking.room} on ${formattedDate} from ${startTime} to ${endTime} has been confirmed.`,
        read: false,
      });
      await notification.save();

      const io = req.app.get('io');
      io.to(booking.userId.toString()).emit('notification', notification);
    }

    res.status(201).json(booking);
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getBookings = async (req, res) => {
  try {
    console.log('Get bookings: req.user:', JSON.stringify(req.user, null, 2));
    let query = {};
    if (req.user.role === 'lecturer') {
      query.lecturerId = req.user.id;
    }
    const bookings = await Booking.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('roomId', 'name')
      .populate('courseId', 'code name')
      .lean();
    
    // Normalize startTime and endTime to HH:mm
    const normalizedBookings = bookings.map(booking => {
      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);
      return {
        ...booking,
        startTime: isNaN(start)
          ? booking.startTime
          : start.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false }),
        endTime: isNaN(end)
          ? booking.endTime
          : end.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false }),
      };
    });

    console.log('Get bookings: count:', normalizedBookings.length);
    res.json(normalizedBookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user.id }, { lecturerId: req.user.id }],
    });
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found or unauthorized' });
    }
    booking.status = 'cancelled';
    await booking.save();
    console.log('Booking cancelled:', { id: booking._id });

    const formattedDate = formatDate(booking.date);
    const formattedStartTime = formatTime(booking.startTime);
    const formattedEndTime = formatTime(booking.endTime);

    const user = await User.findById(booking.userId);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Booking Cancelled',
      text: `Your booking for ${booking.room} on ${formattedDate} from ${formattedStartTime} to ${formattedEndTime} has been cancelled.`,
    });

    const notification = new Notification({
      userId: booking.userId,
      message: `Your booking for ${booking.room} on ${formattedDate} from ${formattedStartTime} to ${formattedEndTime} has been cancelled.`,
      read: false,
    });
    await notification.save();

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

    const user = await User.findById(booking.userId);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Booking Status Updated to ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      text: `Your booking for ${booking.room} on ${formattedDate} from ${formattedStartTime} to ${formattedEndTime} has been updated to ${status}.`,
    });

    const notification = new Notification({
      userId: booking.userId,
      message: `Your booking for ${booking.room} on ${formattedDate} from ${formattedStartTime} to ${formattedEndTime} has been updated to ${status}.`,
      read: false,
    });
    await notification.save();

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

    const user = await User.findById(booking.userId);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Booking Approved',
      text: `Your booking for ${booking.room} on ${formattedDate} from ${formattedStartTime} to ${formattedEndTime} has been approved.`,
    });

    const notification = new Notification({
      userId: booking.userId,
      message: `Your booking for ${booking.room} on ${formattedDate} from ${formattedStartTime} to ${formattedEndTime} has been approved.`,
      read: false,
    });
    await notification.save();

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
    const { date, room } = req.query;
    if (!date) {
      return res.status(400).json({ msg: 'Date is required' });
    }
    const selectedDate = new Date(date);
    if (isNaN(selectedDate)) {
      return res.status(400).json({ msg: 'Invalid date format' });
    }

    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    const rooms = room ? await Room.findOne({ name: room }) : await Room.find();
    if (!rooms || (room && !rooms)) {
      return res.status(404).json({ msg: 'Room(s) not found' });
    }

    const roomList = Array.isArray(rooms) ? rooms : [rooms];
    const slots = [];

    for (const room of roomList) {
      const bookings = await Booking.find({
        room: room.name,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'cancelled' },
      });

      const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
      const timetables = await Timetable.find({
        roomId: room._id,
        day: dayName,
      });

      const availableSlots = [];
      let currentTime = new Date(startOfDay.setHours(8, 0, 0, 0));
      const endTime = new Date(startOfDay.setHours(17, 0, 0, 0));

      while (currentTime < endTime) {
        const slotEnd = new Date(currentTime.getTime() + 30 * 60 * 1000);
        const isBooked = bookings.some(
          (b) => new Date(`1970-01-01T${b.startTime}`) < slotEnd && new Date(`1970-01-01T${b.endTime}`) > currentTime
        );
        const isTimetable = timetables.some(
          (t) => new Date(t.startTime) < slotEnd && new Date(t.endTime) > currentTime
        );
        const isMaintenance = room.maintenance.some(
          (m) => new Date(m.startDate) <= slotEnd && new Date(m.endDate) >= currentTime
        );
        if (!isBooked && !isTimetable && !isMaintenance) {
          availableSlots.push({
            startTime: currentTime.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false }),
            endTime: slotEnd.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false }),
          });
        }
        currentTime = slotEnd;
      }

      slots.push({
        roomId: room._id,
        roomName: room.name,
        availableSlots,
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