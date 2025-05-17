const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Timetable = require('../models/Timetable');
const Course = require('../models/Course');

dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env');
  process.exit(1);
}

async function cleanOrphanedTimetables() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Get all valid course IDs
  const courses = await Course.find({}, '_id');
  const validCourseIds = courses.map(c => c._id);

  // Delete timetables whose courseId is not in the list of valid course IDs
  const result = await Timetable.deleteMany({
    courseId: { $nin: validCourseIds }
  });

  console.log(`Deleted ${result.deletedCount} timetables with non-existent courseId`);

  await mongoose.disconnect();
}

cleanOrphanedTimetables().catch(err => {
  console.error(err);
  process.exit(1);
});