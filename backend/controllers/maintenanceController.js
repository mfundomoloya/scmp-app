const mongoose = require('mongoose');
const MaintenanceReport = require('../models/MaintenanceReport');
const User = require('../models/User');
const Room = require('../models/Room');

const createMaintenanceReport = async (req, res) => {
  try {
    const { roomId, description } = req.body;
    console.log('Create maintenance report: req.user:', JSON.stringify(req.user, null, 2));
    console.log('Create maintenance report: Input:', { roomId, description });

    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
      console.error('Create maintenance report: Invalid roomId:', roomId);
      return res.status(400).json({ msg: 'Valid room ID is required' });
    }
    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      console.error('Create maintenance report: Invalid description:', description);
      return res.status(400).json({ msg: 'Description must be at least 10 characters' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      console.error('Create maintenance report: User not found:', req.user.id);
      return res.status(400).json({ msg: 'User not found' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      console.error('Create maintenance report: Room not found:', roomId);
      return res.status(400).json({ msg: 'Room not found' });
    }

    const report = new MaintenanceReport({
      userId: user._id,
      roomId,
      description: description.trim(),
      status: 'open',
    });

    await report.save();
    const populatedReport = await MaintenanceReport.findById(report._id)
      .populate('userId', 'name email')
      .populate('roomId', 'name');

    console.log('Create maintenance report: Saved:', populatedReport);
    res.status(201).json(populatedReport);
  } catch (err) {
    console.error('Error creating maintenance report:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getMaintenanceReports = async (req, res) => {
  try {
    console.log('Get maintenance reports: req.user:', JSON.stringify(req.user, null, 2));
    let query = {};
    if (req.user.role !== 'admin') {
      const user = await User.findById(req.user.id);
      if (!user) {
        console.error('Get maintenance reports: User not found:', req.user.id);
        return res.status(400).json({ msg: 'User not found' });
      }
      query.userId = user._id;
    }

    console.log('Get maintenance reports: query:', JSON.stringify(query));
    const reports = await MaintenanceReport.find(query)
      .populate('userId', 'name email')
      .populate('roomId', 'name')
      .sort({ createdAt: -1 });

    console.log('Get maintenance reports: count:', reports.length);
    console.log('Get maintenance reports: results:', JSON.stringify(reports, null, 2));
    res.json(reports);
  } catch (err) {
    console.error('Error fetching maintenance reports:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const updateMaintenanceReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    const report = await MaintenanceReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: 'Maintenance report not found' });
    }

    report.status = status;
    await report.save();

    const populatedReport = await MaintenanceReport.findById(report._id)
      .populate('userId', 'name email')
      .populate('roomId', 'name');

    console.log('Update maintenance report: Updated:', populatedReport);
    res.json(populatedReport);
  } catch (err) {
    console.error('Error updating maintenance report:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const updateRoomMaintenance = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { startDate, endDate } = req.body;
    console.log('Update room maintenance: req.user:', JSON.stringify(req.user, null, 2));
    console.log('Update room maintenance: Input:', { roomId, startDate, endDate });

    if (req.user.role !== 'admin') {
      console.error('Update room maintenance: Unauthorized');
      return res.status(400).json({ msg: 'Unauthorized' });
    }

    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
      console.error('Update room maintenance: Invalid roomId:', roomId);
      return res.status(400).json({ msg: 'Valid room ID is required' });
    }

    if (!startDate || !endDate) {
      console.error('Update room maintenance: Missing dates:', { startDate, endDate });
      return res.status(400).json({ msg: 'Start and end dates are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) {
      console.error('Update room maintenance: Invalid date format:', { startDate, endDate });
      return res.status(400).json({ msg: 'Invalid date format' });
    }
    if (start >= end) {
      console.error('Update room maintenance: Start date must be before end date');
      return res.status(400).json({ msg: 'Start date must be before end date' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      console.error('Update room maintenance: Room not found:', roomId);
      return res.status(400).json({ msg: 'Room not found' });
    }

    room.maintenance = room.maintenance || [];
    room.maintenance.push({ startDate: start, endDate: end });
    await room.save();

    console.log('Update room maintenance: Updated room:', room);
    res.json(room);
  } catch (err) {
    console.error('Error updating room maintenance:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  createMaintenanceReport,
  getMaintenanceReports,
  updateMaintenanceReportStatus,
  updateRoomMaintenance,
};