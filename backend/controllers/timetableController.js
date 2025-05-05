const mongoose = require('mongoose');
  const Timetable = require('../models/Timetable');
  const User = require('../models/User');
  const Room = require('../models/Room');
const csvParser = require('csv-parser');
  const { Readable } = require('stream');

  // GET /api/timetable
  const getUserTimetable = async (req, res) => {
    try {
      console.log('Get user timetable: req.user:', JSON.stringify(req.user, null, 2));

      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        console.error('Get user timetable: User not found:', req.user.email);
        return res.status(400).json({ msg: 'User not found' });
      }

      const timetables = await Timetable.find({ userIds: user._id })
        .populate('roomId', 'name maintenance')
        .sort({ startTime: 1 });

      console.log('Get user timetable: count:', timetables.length);
      console.log('Get user timetable: results:', JSON.stringify(timetables, null, 2));
      res.json(timetables);
    } catch (err) {
      console.error('Error fetching user timetable:', err);
      res.status(500).json({ msg: 'Server error' });
    }
  };

  // POST /api/timetable/import
  const importTimetables = async (req, res) => {
    try {
      console.log('Import timetables: req.user:', JSON.stringify(req.user, null, 2));

      if (req.user.role !== 'admin') {
        console.error('Import timetables: Unauthorized');
        return res.status(403).json({ msg: 'Unauthorized' });
      }

      if (!req.file) {
        console.error('Import timetables: No file uploaded');
        return res.status(400).json({ msg: 'CSV file is required' });
      }

      const results = [];
      const errors = [];
      let rowIndex = 0;

      const parser = csvParser({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const stream = Readable.from(req.file.buffer.toString());
      stream.pipe(parser);

      for await (const row of parser) {
        rowIndex++;
        try {
          const { courseName, roomName, day, startTime, endTime, userEmails } = row;
          console.log('Import timetables: Processing row:', row);

          // Validate inputs
          if (!courseName || courseName.length < 3) {
            errors.push(`Row ${rowIndex}: Invalid course name`);
            continue;
          }

          if (!['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(day)) {
            errors.push(`Row ${rowIndex}: Invalid day`);
            continue;
          }

          const room = await Room.findOne({ name: roomName });
          if (!room) {
            errors.push(`Row ${rowIndex}: Room not found: ${roomName}`);
            continue;
          }

          const emailArray = userEmails ? userEmails.split(',').map(email => email.trim()) : [];
          if (emailArray.length === 0) {
            errors.push(`Row ${rowIndex}: At least one user email is required`);
            continue;
          }

          const users = await User.find({ email: { $in: emailArray } });
          if (users.length !== emailArray.length) {
            const foundEmails = users.map(u => u.email);
            const missingEmails = emailArray.filter(e => !foundEmails.includes(e));
            errors.push(`Row ${rowIndex}: Users not found: ${missingEmails.join(', ')}`);
            continue;
          }

          const [startHour, startMinute] = startTime.split(':').map(Number);
          const [endHour, endMinute] = endTime.split(':').map(Number);
          const startDate = new Date(2025, 0, 1, startHour, startMinute);
          const endDate = new Date(2025, 0, 1, endHour, endMinute);

          if (isNaN(startDate) || isNaN(endDate)) {
            errors.push(`Row ${rowIndex}: Invalid time format`);
            continue;
          }
          if (startDate >= endDate) {
            errors.push(`Row ${rowIndex}: Start time must be before end time`);
            continue;
          }

          // Check for overlapping schedules
          const overlapping = await Timetable.findOne({
            roomId: room._id,
            day,
            $or: [
              { startTime: { $lt: endDate, $gte: startDate } },
              { endTime: { $gt: startDate, $lte: endDate } },
              { startTime: { $lte: startDate }, endTime: { $gte: endDate } },
            ],
          });
          if (overlapping) {
            errors.push(`Row ${rowIndex}: Schedule conflicts with existing timetable`);
            continue;
          }

          // Create timetable entry
          const timetable = new Timetable({
            courseName,
            roomId: room._id,
            userIds: users.map(u => u._id),
            startTime: startDate,
            endTime: endDate,
            day,
          });

          await timetable.save();
          results.push(timetable);
        } catch (err) {
          console.error(`Import timetables: Error at row ${rowIndex}:`, err);
          errors.push(`Row ${rowIndex}: Failed to process - ${err.message}`);
        }
      }

      console.log('Import timetables: Results:', results.length, 'Errors:', errors.length);
      res.status(200).json({
        message: `Imported ${results.length} timetables successfully`,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (err) {
      console.error('Import timetables: Server error:', err);
      res.status(500).json({ msg: 'Server error' });
    }
  };

  const getAllTimetables = async (req, res) => {
    try {
      console.log('Get all timetables: req.user:', JSON.stringify(req.user, null, 2));

      if (req.user.role !== 'admin') {
        console.error('Get all timetables: Unauthorized');
        return res.status(403).json({ msg: 'Unauthorized' });
      }

      const timetables = await Timetable.find()
        .populate('roomId', 'name')
        .populate('userIds', 'name email role')
        .sort({ day: 1, startTime: 1 });

      console.log('Get all timetables: count:', timetables.length);
      res.json(timetables);
    } catch (err) {
      console.error('Error fetching all timetables:', err);
      res.status(500).json({ msg: 'Server error' });
    }
  };


  const updateTimetable = async (req, res) => {
    try {
      console.log('Update timetable: req.user:', JSON.stringify(req.user, null, 2));
      console.log('Update timetable: req.body:', JSON.stringify(req.body, null, 2));

      if (req.user.role !== 'admin') {
        console.error('Update timetable: Unauthorized');
        return res.status(403).json({ msg: 'Unauthorized' });
      }

      const { courseName, roomName, day, startTime, endTime, userEmails } = req.body;

      if (!courseName || courseName.length < 3) {
        return res.status(400).json({ msg: 'Invalid course name' });
      }

      if (!['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(day)) {
        return res.status(400).json({ msg: 'Invalid day' });
      }

      const room = await Room.findOne({ name: roomName });
      if (!room) {
        return res.status(400).json({ msg: `Room not found: ${roomName}` });
      }

      const emailArray = userEmails ? userEmails.split(',').map(email => email.trim()) : [];
      if (emailArray.length === 0) {
        return res.status(400).json({ msg: 'At least one user email is required' });
      }

      const users = await User.find({ email: { $in: emailArray } });
      if (users.length !== emailArray.length) {
        const foundEmails = users.map(u => u.email);
        const missingEmails = emailArray.filter(e => !foundEmails.includes(e));
        return res.status(400).json({ msg: `Users not found: ${missingEmails.join(', ')}` });
      }

      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const startDate = new Date(2025, 0, 1, startHour, startMinute);
      const endDate = new Date(2025, 0, 1, endHour, endMinute);

      if (isNaN(startDate) || isNaN(endDate)) {
        return res.status(400).json({ msg: 'Invalid time format' });
      }
      if (startDate >= endDate) {
        return res.status(400).json({ msg: 'Start time must be before end time' });
      }

      const overlapping = await Timetable.findOne({
        _id: { $ne: req.params.id },
        roomId: room._id,
        day,
        $or: [
          { startTime: { $lt: endDate, $gte: startDate } },
          { endTime: { $gt: startDate, $lte: endDate } },
          { startTime: { $lte: startDate }, endTime: { $gte: endDate } },
        ],
      });
      if (overlapping) {
        return res.status(400).json({ msg: 'Schedule conflicts with existing timetable' });
      }

      const timetable = await Timetable.findById(req.params.id);
      if (!timetable) {
        return res.status(404).json({ msg: 'Timetable not found' });
      }

      timetable.courseName = courseName;
      timetable.roomId = room._id;
      timetable.userIds = users.map(u => u._id);
      timetable.startTime = startDate;
      timetable.endTime = endDate;
      timetable.day = day;

      await timetable.save();
      console.log('Update timetable: Updated:', JSON.stringify(timetable, null, 2));
      res.json(timetable);
    } catch (err) {
      console.error('Error updating timetable:', err);
      res.status(500).json({ msg: 'Server error' });
    }
  };

  const deleteTimetable = async (req, res) => {
    try {
      console.log('Delete timetable: req.user:', JSON.stringify(req.user, null, 2));
      console.log('Delete timetable: id:', req.params.id);

      if (req.user.role !== 'admin') {
        console.error('Delete timetable: Unauthorized');
        return res.status(403).json({ msg: 'Unauthorized' });
      }

      const timetable = await Timetable.findById(req.params.id);
      if (!timetable) {
        return res.status(404).json({ msg: 'Timetable not found' });
      }

      await timetable.deleteOne();
      console.log('Delete timetable: Deleted:', req.params.id);
      res.json({ msg: 'Timetable deleted' });
    } catch (err) {
      console.error('Error deleting timetable:', err);
      res.status(500).json({ msg: 'Server error' });
    }
  };

  module.exports = { getUserTimetable, importTimetables, getAllTimetables, updateTimetable, deleteTimetable };