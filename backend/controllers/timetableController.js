const Timetable = require('../models/Timetable');
const Course = require('../models/Course');
const Room = require('../models/Room');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const detectConflicts = (timetables) => {
  const conflicts = [];
  for (let i = 0; i < timetables.length; i++) {
    for (let j = i + 1; j < timetables.length; j++) {
      const t1 = timetables[i];
      const t2 = timetables[j];
      if (t1.day === t2.day) {
        const t1Start = new Date(t1.startTime);
        const t1End = new Date(t1.endTime);
        const t2Start = new Date(t2.startTime);
        const t2End = new Date(t2.endTime);
        if (t1Start < t2End && t2Start < t1End) {
          conflicts.push({
            timetable1: { id: t1._id, course: t1.courseId.code, subject: t1.subject, day: t1.day, startTime: t1.startTime, endTime: t1.endTime },
            timetable2: { id: t2._id, course: t2.courseId.code, subject: t2.subject, day: t2.day, startTime: t2.startTime, endTime: t2.endTime },
          });
        }
      }
    }
  }
  return conflicts;
};

const createTimetable = async (req, res) => {
  try {
    console.log('Create timetable: req.body:', JSON.stringify(req.body, null, 2));
    console.log('Create timetable: req.user:', JSON.stringify(req.user, null, 2));

    if (req.user.role !== 'admin') {
      console.error('Create timetable: Unauthorized');
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    const { courseCode, subject, roomName, day, startTime, endTime, lecturerEmails } = req.body;

    if (!courseCode || !subject || !roomName || !day || !startTime || !endTime) {
      console.error('Create timetable: Missing required fields');
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const course = await Course.findOne({ code: courseCode });
    if (!course) {
      console.error(`Create timetable: Course not found: ${courseCode}`);
      return res.status(404).json({ msg: `Course not found: ${courseCode}` });
    }
    if (!course.subjects.includes(subject)) {
      console.error(`Create timetable: Subject not found in course: ${subject}`);
      return res.status(400).json({ msg: `Subject not found in course: ${subject}` });
    }

    const room = await Room.findOne({ name: roomName });
    if (!room) {
      console.error(`Create timetable: Room not found: ${roomName}`);
      return res.status(404).json({ msg: `Room not found: ${roomName}` });
    }

    console.log(`Create timetable: Finding students for course: ${courseCode}`);
    const students = await User.find({ courseCodes: courseCode, role: 'student' }).select('_id email role');
    console.log(`Create timetable: Found ${students.length} students:`, JSON.stringify(students, null, 2));
    if (students.length === 0) {
      console.warn(`Create timetable: No students found for course: ${courseCode}`);
    }

    let lecturers = [];
    if (lecturerEmails) {
      const lecturerEmailArray = lecturerEmails.split(',').map(email => email.trim());
      lecturers = await User.find({ email: { $in: lecturerEmailArray }, role: 'lecturer' }).select('_id email role');
      console.log(`Create timetable: Found ${lecturers.length} lecturers:`, JSON.stringify(lecturers, null, 2));
      if (lecturers.length !== lecturerEmailArray.length) {
        console.error('Create timetable: Some lecturers not found');
        return res.status(404).json({ msg: 'One or more lecturers not found' });
      }
    }

    const userIds = [...students, ...lecturers];
    console.log(`Create timetable: Total users assigned: ${userIds.length}`);

    const startTimeDate = new Date(`1970-01-01T${startTime}:00`);
    const endTimeDate = new Date(`1970-01-01T${endTime}:00`);
    if (isNaN(startTimeDate) || isNaN(endTimeDate)) {
      console.error('Create timetable: Invalid time format');
      return res.status(400).json({ msg: 'Invalid time format' });
    }
    if (endTimeDate <= startTimeDate) {
      console.error('Create timetable: End time must be after start time');
      return res.status(400).json({ msg: 'End time must be after start time' });
    }

    const timetable = new Timetable({
      courseId: course._id,
      subject,
      roomId: room._id,
      userIds: userIds.map(user => user._id),
      startTime: startTimeDate,
      endTime: endTimeDate,
      day,
    });

    await timetable.save();
    console.log('Create timetable: Created:', JSON.stringify(timetable, null, 2));

    const populatedTimetable = await Timetable.findById(timetable._id)
      .populate('courseId', 'code name')
      .populate('roomId', 'name')
      .populate('userIds', 'email role');

    const recipients = populatedTimetable.userIds.map(user => user.email);
    if (recipients.length > 0) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipients.join(','),
        subject: `Timetable Created: ${course.code} - ${subject}`,
        text: `Dear Student/Lecturer,\n\nA timetable has been created:\n- Course: ${course.code} (${course.name})\n- Subject: ${subject}\n- Room: ${room.name}\n- Day: ${day}\n- Time: ${startTime} - ${endTime}\n\nPlease check your timetable in the Smart Campus Services Portal.\n\nRegards,\nSmart Campus Team`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Create timetable: Notification sent to: ${recipients.join(',')}`);
      } catch (emailErr) {
        console.error('Create timetable: Error sending email:', emailErr);
      }
    }

    res.status(201).json(populatedTimetable);
  } catch (err) {
    console.error('Create timetable: Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getTimetables = async (req, res) => {
  try {
    console.log('Get timetables: req.user:', JSON.stringify(req.user, null, 2));
    const query = req.user.role === 'student' ? { userIds: req.user.id } : {};
    const timetables = await Timetable.find(query)
      .populate('courseId', 'code name')
      .populate('roomId', 'name maintenance')
      .populate('userIds', 'email role')
      .sort({ startTime: 1 });
    console.log('Get timetables: count:', timetables.length);
    const conflicts = detectConflicts(timetables);
    res.json({ timetables, conflicts });
  } catch (err) {
    console.error('Error fetching timetables:', err);
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
      .populate('courseId', 'code name')
      .populate('roomId', 'name maintenance')
      .populate('userIds', 'email role')
      .sort({ startTime: 1 });
    console.log('Get all timetables: count:', timetables.length);
    const conflicts = detectConflicts(timetables);
    res.json({ timetables, conflicts });
  } catch (err) {
    console.error('Error fetching all timetables:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getFilteredTimetables = async (req, res) => {
  try {
    console.log('Get filtered timetables: req.user:', JSON.stringify(req.user, null, 2));
    console.log('Get filtered timetables: req.query:', JSON.stringify(req.query, null, 2));

    const { courseCode } = req.query;
    if (!courseCode) {
      console.error('Get filtered timetables: Course code is required');
      return res.status(400).json({ msg: 'Course code is required' });
    }

    const course = await Course.findOne({ code: courseCode });
    if (!course) {
      console.error(`Get filtered timetables: Course not found: ${courseCode}`);
      return res.status(404).json({ msg: `Course not found: ${courseCode}` });
    }

    const query = req.user.role === 'student'
      ? { courseId: course._id, userIds: req.user.id }
      : { courseId: course._id };

    const timetables = await Timetable.find(query)
      .populate('courseId', 'code name')
      .populate('roomId', 'name maintenance')
      .populate('userIds', 'email role')
      .sort({ startTime: 1 });

    console.log('Get filtered timetables: count:', timetables.length);
    const conflicts = detectConflicts(timetables);
    res.json({ timetables, conflicts });
  } catch (err) {
    console.error('Error fetching filtered timetables:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const updateTimetable = async (req, res) => {
  try {
    console.log('Update timetable: req.body:', JSON.stringify(req.body, null, 2));
    console.log('Update timetable: req.user:', JSON.stringify(req.user, null, 2));
    console.log('Update timetable: req.params.id:', req.params.id);

    if (req.user.role !== 'admin') {
      console.error('Update timetable: Unauthorized');
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    const { courseCode, subject, roomName, day, startTime, endTime, lecturerEmails } = req.body;

    if (!courseCode || !subject || !roomName || !day || !startTime || !endTime) {
      console.error('Update timetable: Missing required fields');
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      console.error('Update timetable: Timetable not found');
      return res.status(404).json({ msg: 'Timetable not found' });
    }

    const course = await Course.findOne({ code: courseCode });
    if (!course) {
      console.error(`Update timetable: Course not found: ${courseCode}`);
      return res.status(404).json({ msg: `Course not found: ${courseCode}` });
    }
    if (!course.subjects.includes(subject)) {
      console.error(`Update timetable: Subject not found in course: ${subject}`);
      return res.status(400).json({ msg: `Subject not found in course: ${subject}` });
    }

    const room = await Room.findOne({ name: roomName });
    if (!room) {
      console.error(`Update timetable: Room not found: ${roomName}`);
      return res.status(404).json({ msg: `Room not found: ${roomName}` });
    }

    console.log(`Update timetable: Finding students for course: ${courseCode}`);
    const students = await User.find({ courseCodes: courseCode, role: 'student' }).select('_id email role');
    console.log(`Update timetable: Found ${students.length} students:`, JSON.stringify(students, null, 2));

    let lecturers = [];
    if (lecturerEmails) {
      const lecturerEmailArray = lecturerEmails.split(',').map(email => email.trim());
      lecturers = await User.find({ email: { $in: lecturerEmailArray }, role: 'lecturer' }).select('_id email role');
      console.log(`Update timetable: Found ${lecturers.length} lecturers:`, JSON.stringify(lecturers, null, 2));
      if (lecturers.length !== lecturerEmailArray.length) {
        console.error('Update timetable: Some lecturers not found');
        return res.status(404).json({ msg: 'One or more lecturers not found' });
      }
    }

    const userIds = [...students, ...lecturers];
    console.log(`Update timetable: Total users assigned: ${userIds.length}`);

    const startTimeDate = new Date(`1970-01-01T${startTime}:00`);
    const endTimeDate = new Date(`1970-01-01T${endTime}:00`);
    if (isNaN(startTimeDate) || isNaN(endTimeDate)) {
      console.error('Update timetable: Invalid time format');
      return res.status(400).json({ msg: 'Invalid time format' });
    }
    if (endTimeDate <= startTimeDate) {
      console.error('Update timetable: End time must be after start time');
      return res.status(400).json({ msg: 'End time must be after start time' });
    }

    timetable.courseId = course._id;
    timetable.subject = subject;
    timetable.roomId = room._id;
    timetable.userIds = userIds.map(user => user._id);
    timetable.startTime = startTimeDate;
    timetable.endTime = endTimeDate;
    timetable.day = day;

    await timetable.save();
    console.log('Update timetable: Updated:', JSON.stringify(timetable, null, 2));

    const populatedTimetable = await Timetable.findById(timetable._id)
      .populate('courseId', 'code name')
      .populate('roomId', 'name')
      .populate('userIds', 'email role');

    res.json(populatedTimetable);
  } catch (err) {
    console.error('Update timetable: Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const deleteTimetable = async (req, res) => {
  try {
    console.log('Delete timetable: req.user:', JSON.stringify(req.user, null, 2));
    console.log('Delete timetable: req.params.id:', req.params.id);

    if (req.user.role !== 'admin') {
      console.error('Delete timetable: Unauthorized');
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      console.error('Delete timetable: Timetable not found');
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

module.exports = {
  createTimetable,
  getTimetables,
  getAllTimetables,
  getFilteredTimetables,
  updateTimetable,
  deleteTimetable,
};