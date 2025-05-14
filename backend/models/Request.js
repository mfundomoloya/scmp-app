const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., "Reschedule Class", "Special Request"
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  details: { type: String }, // Additional info
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Request', requestSchema);