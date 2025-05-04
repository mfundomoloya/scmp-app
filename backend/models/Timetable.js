const mongoose = require('mongoose');

  const timetableSchema = new mongoose.Schema({
    courseName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    userIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  timetableSchema.index({ roomId: 1, startTime: 1, endTime: 1 });

  module.exports = mongoose.model('Timetable', timetableSchema);