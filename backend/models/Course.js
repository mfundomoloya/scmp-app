const mongoose = require('mongoose');

  const courseSchema = new mongoose.Schema({
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 4,
      maxlength: 10,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    subjects: [{
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    }], lecturers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    }],
  }, { timestamps: true });

  module.exports = mongoose.model('Course', courseSchema);