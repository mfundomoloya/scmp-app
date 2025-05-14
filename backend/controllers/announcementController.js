const Announcement = require('../models/Announcement');
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

const createAnnouncement = async (req, res) => {
  try {
    console.log('Create announcement: req.body:', JSON.stringify(req.body, null, 2));
    console.log('Create announcement: req.user:', JSON.stringify(req.user, null, 2));

    const { title, content, courseId, isCampusWide, isPublished, publishDate, sendEmail } = req.body;
    const isLecturer = req.user.role === 'lecturer';

    if (!title || !content) {
      console.error('Create announcement: Missing required fields');
      return res.status(400).json({ msg: 'Title and content are required' });
    }

    const announcementData = {
      title,
      content,
      createdBy: req.user.id,
      isPublished: isPublished || false,
      publishDate: publishDate ? new Date(publishDate) : null,
    };

    if (isLecturer) {
      announcementData.lecturerId = req.user.id;
      announcementData.courseId = courseId || null;
      announcementData.isCampusWide = req.user.role === 'admin' ? (isCampusWide || false) : false;
    } else if (req.user.role === 'admin') {
      announcementData.courseId = courseId || null;
      announcementData.isCampusWide = isCampusWide || false;
    }

    const announcement = new Announcement(announcementData);
    await announcement.save();
    console.log('Create announcement: Created:', JSON.stringify(announcement, null, 2));

    if (announcement.isPublished && sendEmail) {
      let recipients = [];
      if (announcement.courseId) {
        const course = await Course.findById(announcement.courseId).populate('students', 'email');
        recipients = course.students.map(student => student.email);
      } else if (announcement.isCampusWide) {
        recipients = (await User.find({ role: { $in: ['student', 'lecturer'] } }).select('email')).map(user => user.email);
      }

      if (recipients.length > 0) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: recipients.join(','),
          subject: `Campus Announcement: ${title}`,
          text: `Dear ${announcement.courseId ? 'Student' : 'Campus Member'},\n\nA new announcement has been posted:\n\nTitle: ${title}\nContent: ${content}\n${announcement.courseId ? `Course: ${course.code}` : ''}\n\nPlease check the Smart Campus Services Portal for details.\n\nRegards,\nSmart Campus Team`,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`Create announcement: Notification sent to: ${recipients.join(',')}`);
        } catch (emailErr) {
          console.error('Create announcement: Error sending email:', emailErr);
        }
      }
    }

    res.status(201).json(announcement);
  } catch (err) {
    console.error('Create announcement: Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    console.log('Get announcements: req.user:', JSON.stringify(req.user, null, 2));
    let query = {};
    if (req.user.role === 'lecturer' && req.path.includes('/lecturer')) {
      query.lecturerId = req.user.id;
    } else if (req.user.role === 'student') {
      query.$or = [
        { isCampusWide: true, isPublished: true },
        { courseId: { $ne: null }, isPublished: true },
      ];
      query.$or.push({ publishDate: { $lte: new Date() } }, { publishDate: null });
    } else if (req.user.role !== 'admin') {
      query.isPublished = true;
      query.$or = [{ publishDate: { $lte: new Date() } }, { publishDate: null }];
    }

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email')
      .populate('courseId', 'code name')
      .sort({ createdAt: -1 });
    console.log('Get announcements: count:', announcements.length);
    res.json(announcements);
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    console.log('Update announcement: req.body:', JSON.stringify(req.body, null, 2));
    console.log('Update announcement: req.params.id:', req.params.id);
    console.log('Update announcement: req.user:', JSON.stringify(req.user, null, 2));

    const { title, content, courseId, isCampusWide, isPublished, publishDate, sendEmail } = req.body;

    if (!title || !content) {
      console.error('Update announcement: Missing required fields');
      return res.status(400).json({ msg: 'Title and content are required' });
    }

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      console.error('Update announcement: Announcement not found');
      return res.status(404).json({ msg: 'Announcement not found' });
    }

    if (announcement.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    announcement.title = title;
    announcement.content = content;
    announcement.courseId = courseId !== undefined ? courseId : announcement.courseId;
    announcement.isCampusWide = req.user.role === 'admin' ? (isCampusWide || false) : announcement.isCampusWide;
    announcement.isPublished = isPublished || false;
    announcement.publishDate = publishDate ? new Date(publishDate) : null;
    announcement.updatedAt = Date.now();

    await announcement.save();
    console.log('Update announcement: Updated:', JSON.stringify(announcement, null, 2));

    if (announcement.isPublished && !announcement.publishDate && sendEmail) {
      let recipients = [];
      if (announcement.courseId) {
        const course = await Course.findById(announcement.courseId).populate('students', 'email');
        recipients = course.students.map(student => student.email);
      } else if (announcement.isCampusWide) {
        recipients = (await User.find({ role: { $in: ['student', 'lecturer'] } }).select('email')).map(user => user.email);
      }

      if (recipients.length > 0) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: recipients.join(','),
          subject: `Updated Announcement: ${title}`,
          text: `Dear ${announcement.courseId ? 'Student' : 'Campus Member'},\n\nAn announcement has been updated:\n\nTitle: ${title}\nContent: ${content}\n${announcement.courseId ? `Course: ${course.code}` : ''}\n\nPlease check the Smart Campus Services Portal for details.\n\nRegards,\nSmart Campus Team`,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`Update announcement: Notification sent to: ${recipients.join(',')}`);
        } catch (emailErr) {
          console.error('Update announcement: Error sending email:', emailErr);
        }
      }
    }

    res.json(announcement);
  } catch (err) {
    console.error('Update announcement: Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    console.log('Delete announcement: req.params.id:', req.params.id);
    console.log('Delete announcement: req.user:', JSON.stringify(req.user, null, 2));

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      console.error('Delete announcement: Announcement not found');
      return res.status(404).json({ msg: 'Announcement not found' });
    }

    if (announcement.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    await announcement.deleteOne();
    console.log('Delete announcement: Deleted:', req.params.id);
    res.json({ msg: 'Announcement deleted' });
  } catch (err) {
    console.error('Error deleting announcement:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
};