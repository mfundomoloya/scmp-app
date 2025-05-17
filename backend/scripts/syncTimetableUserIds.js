const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Timetable = require('../models/Timetable');
const User = require('../models/User');
const Course = require('../models/Course');

dotenv.config();

async function syncTimetableUserIds() {
  await mongoose.connect(process.env.MONGODB_URI);

  const timetables = await Timetable.find().populate('courseId');
  let updatedCount = 0;

  for (const timetable of timetables) {
    if (!timetable.courseId) continue;
    const students = await User.find({ courseCodes: timetable.courseId.code, role: 'student' }).select('_id');
    const lecturers = await User.find({ _id: { $in: timetable.userIds }, role: 'lecturer' }).select('_id');
    const newUserIds = [
      ...students.map(s => s._id.toString()),
      ...lecturers.map(l => l._id.toString())
    ];
    const oldUserIds = timetable.userIds.map(id => id.toString());
    // Only update if changed
    if (newUserIds.sort().join(',') !== oldUserIds.sort().join(',')) {
      timetable.userIds = [...new Set(newUserIds)];
      await timetable.save();
      updatedCount++;
    }
  }

  console.log(`Updated ${updatedCount} timetables with current students.`);
  await mongoose.disconnect();
}

syncTimetableUserIds().catch(err => {
  console.error(err);
  process.exit(1);
});