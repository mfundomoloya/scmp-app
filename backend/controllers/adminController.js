const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');

const getAdminStats = async (req, res) => {
  try {
    console.log('Get admin stats: req.user:', JSON.stringify(req.user, null, 2));

    // Ensure only admins can access
    if (req.user.role !== 'admin') {
      console.error('Get admin stats: Unauthorized');
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    // Active Bookings: Count bookings where status is not 'cancelled'
    const activeBookings = await Booking.countDocuments({ status: { $ne: 'cancelled' } });

    // Available Rooms: Count rooms with no active maintenance
    const availableRooms = await Room.countDocuments({ maintenance: { $size: 0 } });

    // Maintenance Issues: Count rooms with active maintenance requests
    const maintenanceIssues = await Room.countDocuments({ maintenance: { $not: { $size: 0 } } });

    // Users Registered: Count all users
    const usersRegistered = await User.countDocuments();

    const stats = {
      activeBookings,
      availableRooms,
      maintenanceIssues,
      usersRegistered,
    };

    console.log('Get admin stats: Stats:', JSON.stringify(stats, null, 2));
    res.json(stats);
  } catch (err) {
    console.error('Get admin stats: Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { getAdminStats };