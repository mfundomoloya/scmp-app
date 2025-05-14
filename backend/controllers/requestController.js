const Request = require('../models/Request');
const User = require('../models/User');
const Course = require('../models/Course');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const createRequest = async (req, res) => {
  try {
    const { type, courseId, lecturerId } = req.body;
    if (!type || !courseId || !lecturerId) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    const lecturer = await User.findById(lecturerId);
    if (!lecturer || lecturer.role !== 'lecturer') {
      return res.status(404).json({ msg: 'Lecturer not found' });
    }

    const request = new Request({
      type,
      studentId: req.user.id,
      courseId,
      lecturerId,
      status: 'Pending',
    });
    await request.save();

    const student = await User.findById(req.user.id);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: lecturer.email,
      subject: `New Request: ${type}`,
      text: `A new request has been submitted by ${student.name || student.email} for ${course.name}. Please review it in the Smart Campus Portal.`,
    };
    await transporter.sendMail(mailOptions);

    res.status(201).json(request);
  } catch (err) {
    console.error('Error creating request:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getStudentRequests = async (req, res) => {
  try {
    const requests = await Request.find({ studentId: req.user.id })
      .populate('courseId', 'name code')
      .populate('lecturerId', 'name email')
      .lean();
    const formattedRequests = requests.map(r => ({
      id: r._id,
      type: r.type,
      course: r.courseId?.name || 'N/A',
      lecturer: r.lecturerId?.name || r.lecturerId?.email || 'N/A',
      status: r.status,
      date: new Date(r.createdAt).toLocaleDateString('en-ZA'),
    }));
    res.json(formattedRequests);
  } catch (err) {
    console.error('Error fetching student requests:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getLecturerRequests = async (req, res) => {
  try {
    const requests = await Request.find({ lecturerId: req.user.id, status: 'Pending' })
      .populate('courseId', 'name code')
      .populate('studentId', 'name email')
      .lean();
    const formattedRequests = requests.map(r => ({
      id: r._id,
      type: r.type,
      course: r.courseId?.name || 'N/A',
      student: r.studentId?.name || r.studentId?.email || 'N/A',
      status: r.status,
      date: new Date(r.createdAt).toLocaleDateString('en-ZA'),
    }));
    res.json(formattedRequests);
  } catch (err) {
    console.error('Error fetching lecturer requests:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getLecturerRequestHistory = async (req, res) => {
  try {
    const requests = await Request.find({ lecturerId: req.user.id })
      .populate('courseId', 'name code')
      .populate('studentId', 'name email')
      .lean();
    const formattedRequests = requests.map(r => ({
      id: r._id,
      type: r.type,
      course: r.courseId?.name || 'N/A',
      student: r.studentId?.name || r.studentId?.email || 'N/A',
      status: r.status,
      date: new Date(r.createdAt).toLocaleDateString('en-ZA'),
    }));
    res.json(formattedRequests);
  } catch (err) {
    console.error('Error fetching lecturer request history:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ msg: 'Request not found' });
    }

    if (request.lecturerId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    request.status = status;
    await request.save();

    const student = await User.findById(request.studentId);
    const course = await Course.findById(request.courseId);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: `Request ${status}: ${request.type}`,
      text: `Your request for ${course.name} has been ${status.toLowerCase()}. Check the Smart Campus Portal for details.`,
    };
    await transporter.sendMail(mailOptions);

    res.json(request);
  } catch (err) {
    console.error('Error updating request status:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  createRequest,
  getStudentRequests,
  getLecturerRequests,
  getLecturerRequestHistory,
  updateRequestStatus,
};