const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Timetable = require('../models/Timetable');
const csvParser = require('csv-parser');
const fs = require('fs');
const { Readable } = require('stream');

const getRooms = async (req, res) => {
  try {
    console.log('getRooms: Fetching rooms for user:', req.user.id);
    const rooms = await Room.find().select('name capacity maintenance');
    console.log('getRooms: Found rooms:', rooms.length);
    res.json(rooms);
  } catch (err) {
    console.error('getRooms: Error fetching rooms:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const createRoom = async (req, res) => {
  const { name, capacity, maintenance } = req.body;
  try {
    console.log('Create room: Input:', { name, capacity, maintenance });
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ msg: 'Room already exists' });
    }
    const room = new Room({
      name,
      capacity,
      maintenance: maintenance || [],
    });
    await room.save();
    console.log('Create room: Room created:', room.name);
    res.status(201).json(room);
  } catch (err) {
    console.error('Create room error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const importRooms = async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ msg: 'No valid file uploaded' });
  }

  const created = [];
  const errors = [];
  const rows = [];
  const skipDuplicates = req.query.skipDuplicates === 'true';
  console.log('Import rooms: Skip duplicates:', skipDuplicates);

  // Strip BOM if present
  let buffer = req.file.buffer;
  if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    buffer = buffer.slice(3);
    console.log('Import rooms: Stripped BOM from CSV');
  }

  // Validate buffer
  if (buffer.length === 0) {
    return res.status(400).json({ msg: 'CSV file is empty', errors: [] });
  }

  // Log raw buffer to debug
  const rawCSV = buffer.toString('utf8').substring(0, 200);
  console.log('Import rooms: Raw CSV:', rawCSV);

  // Detect delimiter
  const firstLine = buffer.toString('utf8').split('\n')[0];
  const separator = firstLine.includes(';') ? ';' : ',';
  console.log('Import rooms: Detected separator:', separator);

  const fileStream = Readable.from(buffer);
  const parser = csvParser({
    headers: ['name', 'capacity', 'maintenanceStart', 'maintenanceEnd'],
    separator: ',',
    skipEmptyLines: true,
    skipLines: 1,
  });

  parser
    .on('data', async (row) => {
      rows.push(row);
      console.log('Import rooms: Parsed row:', row);
    })
    .on('end', async () => {
      console.log('Import rooms: Collected rows:', rows.length);

      for (const row of rows) {
        try {
          // Validate row completeness
          if (!row.name || typeof row.name !== 'string' || row.name.trim() === '') {
            throw new Error('Invalid or missing name');
          }
          if (!row.capacity) {
            throw new Error('Missing capacity');
          }
          const capacity = parseInt(row.capacity);
          if (isNaN(capacity) || capacity < 1) {
            throw new Error(`Invalid capacity: ${row.capacity}`);
          }
          let maintenance = [];
          if (row.maintenanceStart && row.maintenanceEnd) {
            const startDate = new Date(row.maintenanceStart);
            const endDate = new Date(row.maintenanceEnd);
            if (isNaN(startDate) || isNaN(endDate)) {
              throw new Error(`Invalid maintenance dates: ${row.maintenanceStart}, ${row.maintenanceEnd}`);
            }
            if (startDate > endDate) {
              throw new Error('maintenanceStart must be before maintenanceEnd');
            }
            maintenance = [{ startDate, endDate }];
          }

          const existingRoom = await Room.findOne({ name: row.name.trim() });
          if (existingRoom) {
            if (skipDuplicates) {
              console.log('Import rooms: Skipped existing room:', row.name);
              continue;
            }
            throw new Error('Room already exists');
          }

          const room = new Room({
            name: row.name.trim(),
            capacity,
            maintenance,
          });
          await room.save();
          console.log('Import rooms: Room created:', room.name);
          created.push({ name: room.name, capacity: room.capacity });
        } catch (err) {
          console.warn('Import rooms: Error processing row:', row, err.message);
          errors.push({ row: { ...row }, error: err.message });
        }
      }

      console.log('Import rooms: Processed rows:', rows.length);
      console.log('Import rooms: Error messages:', errors.map(e => e.error));
      console.log('Import rooms: Response:', { created, errors });

      if (created.length === 0) {
        const allDuplicates = errors.length > 0 && errors.every(e => e.error === 'Room already exists');
        const msg = allDuplicates
          ? `No rooms imported: All rooms already exist (${errors.map(e => e.row.name).join(', ')})`
          : errors.length > 0
            ? 'No rooms imported due to row errors'
            : 'No rooms imported: No valid data rows found';
        return res.status(400).json({ msg, errors });
      }

      res.status(201).json({
        message: `Imported ${created.length} room(s) successfully`,
        created,
        errors: errors.length > 0 ? errors : undefined,
      });
    })
    .on('error', (err) => {
      console.error('Import rooms: CSV parse error:', err);
      res.status(500).json({ msg: 'Error processing CSV file', error: err.message });
    });

  fileStream.pipe(parser);
};

const updateRoom = async (req, res) => {
  const { id } = req.params;
  const { name, capacity, maintenance } = req.body;
  try {
    console.log('Update room: Input:', { id, name, capacity, maintenance });
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }
    if (name && name !== room.name) {
      const existingRoom = await Room.findOne({ name });
      if (existingRoom) {
        return res.status(400).json({ msg: 'Room name already exists' });
      }
      room.name = name.trim();
    }
    if (capacity !== undefined) {
      const parsedCapacity = parseInt(capacity);
      if (isNaN(parsedCapacity) || parsedCapacity < 1) {
        return res.status(400).json({ msg: 'Invalid capacity: must be a positive number' });
      }
      room.capacity = parsedCapacity;
    }
    if (maintenance) {
      const validatedMaintenance = maintenance.map(m => {
        const startDate = new Date(m.startDate);
        const endDate = new Date(m.endDate);
        if (isNaN(startDate) || isNaN(endDate)) {
          throw new Error('Invalid maintenance dates');
        }
        if (startDate > endDate) {
          throw new Error('maintenanceStart must be before maintenanceEnd');
        }
        return { startDate, endDate };
      });
      room.maintenance = validatedMaintenance;
    }
    await room.save();
    console.log('Update room: Room updated:', room.name);
    res.json(room);
  } catch (err) {
    console.error('Update room error:', err.message);
    res.status(400).json({ msg: err.message || 'Invalid input' });
  }
};

const deleteRoom = async (req, res) => {
  const { id } = req.params;
  try {
    console.log('Delete room: Input:', { id });
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }
    const activeBookings = await Booking.find({
      room: id,
      endTime: { $gte: new Date() },
    });
    if (activeBookings.length > 0) {
      return res.status(400).json({ msg: 'Cannot delete room with active bookings' });
    }
    await room.deleteOne();
    console.log('Delete room: Room deleted:', room.name);
    res.json({ msg: 'Room deleted successfully' });
  } catch (err) {
    console.error('Delete room error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getAvailableRooms = async (req, res) => {
  try {
    console.log('Get available rooms: req.user:', JSON.stringify(req.user, null, 2));
    console.log('Get available rooms: req.query:', JSON.stringify(req.query, null, 2));

    const { date } = req.query;
    if (!date) {
      console.error('Get available rooms: Date required');
      return res.status(400).json({ msg: 'Date is required' });
    }

    // Parse date to start and end of day
    const targetDate = new Date(date);
    if (isNaN(targetDate)) {
      console.error('Get available rooms: Invalid date format');
      return res.status(400).json({ msg: 'Invalid date format' });
    }
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find rooms under maintenance
    const roomsUnderMaintenance = await Room.find({
      maintenance: {
        $elemMatch: {
          startDate: { $lte: endOfDay },
          endDate: { $gte: startOfDay },
        },
      },
    }).select('_id');

    const maintenanceRoomIds = roomsUnderMaintenance.map(room => room._id.toString());

    // Find booked/scheduled rooms
    const bookedTimetables = await Timetable.find({
      startTime: { $gte: startOfDay, $lte: endOfDay },
    }).select('roomId');

    const bookedBookings = await Booking.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'Cancelled' },
    }).select('roomId');

    const bookedRoomIds = [
      ...bookedTimetables.map(t => t.roomId.toString()),
      ...bookedBookings.map(b => b.roomId.toString()),
    ];

    // Combine unavailable room IDs
    const unavailableRoomIds = [...new Set([...maintenanceRoomIds, ...bookedRoomIds])];

    // Find available rooms
    const rooms = await Room.find({
      _id: { $nin: unavailableRoomIds },
    }).lean();

    console.log('Get available rooms: count:', rooms.length);
    res.json(
      rooms.map(room => ({
        roomId: room._id,
        roomName: room.name,
        capacity: room.capacity,
        location: room.maintenance.length > 0 ? 'Maintenance Scheduled' : 'Available',
      }))
    );
  } catch (err) {
    console.error('Error fetching available rooms:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { getRooms, createRoom, importRooms, updateRoom, deleteRoom, getAvailableRooms };