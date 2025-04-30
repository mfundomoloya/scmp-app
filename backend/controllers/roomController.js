const Room = require('../models/Room');
const Booking = require('../models/Booking');
const csvParser = require('csv-parser');
const fs = require('fs');
  const { Readable } = require('stream');

  const getRooms = async (req, res) => {
    try {
      const rooms = await Room.find();
      console.log('Get rooms: Fetched:', rooms.length);
      res.json(rooms);
    } catch (err) {
      console.error('Get rooms error:', err);
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
        maintenance: maintenance || []
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
    const skipDuplicates = req.query.skipDuplicates === 'true';
    console.log('Import rooms: Skip duplicates:', skipDuplicates);
   
    // Strip BOM if present
    let buffer = req.file.buffer;
    if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      buffer = buffer.slice(3);
      console.log('Import rooms: Stripped BOM from CSV');
    }

    // Log buffer as string to debug
    console.log('Import rooms: Raw CSV:', buffer.toString('utf8').substring(0, 100));

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
        console.log('Import rooms: Parsed row:', row);
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
              return;
            }
            throw new Error('Room already exists');
          }

          const room = new Room({
            name: row.name.trim(),
            capacity,
            maintenance
          });
          await room.save();
          console.log('Import rooms: Room created:', room.name);
          created.push({ name: room.name, capacity: room.capacity });
        } catch (err) {
          console.warn('Import rooms: Error processing row:', row, err.message);
          errors.push({ row: { ...row }, error: err.message });
        }
      })
      .on('end', () => {
        console.log('Import rooms: Response:', { created, errors });
        if (created.length === 0) {
          const allDuplicates = errors.length > 0 && errors.every(e => e.error === 'Room already exists');
          const msg = allDuplicates
            ? `No rooms imported: All rooms already exist (${errors.map(e => e.row.name).join(', ')})`
            : 'No rooms imported due to errors';
          return res.status(400).json({ msg, errors });
        }
        res.status(201).json({
          message: `Imported ${created.length} rooms successfully`,
          created,
          errors: errors.length > 0 ? errors : undefined
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
        endTime: { $gte: new Date() }
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

  module.exports = { getRooms, createRoom, importRooms, updateRoom, deleteRoom };