const Announcement = require('../models/Announcement');
const User = require('../models/User');
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

    const { title, content, isPublished, publishDate, sendEmail } = req.body;

    if (!title || !content) {
      console.error('Create announcement: Missing required fields');
      return res.status(400).json({ msg: 'Title and content are required' });
    }

    const announcement = new Announcement({
      title,
      content,
      createdBy: req.user.id,
      isPublished: isPublished || false,
      publishDate: publishDate ? new Date(publishDate) : null,
    });

    await announcement.save();
    console.log('Create announcement: Created:', JSON.stringify(announcement, null, 2));

    if (announcement.isPublished && sendEmail) {
      const recipients = await User.find({ role: { $in: ['student', 'lecturer'] } }).select('email');
      if (recipients.length > 0) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: recipients.map(user => user.email).join(','),
          subject: `Campus Announcement: ${title}`,
          text: `Dear Student/Lecturer,\n\nA new announcement has been posted:\n\nTitle: ${title}\nContent: ${content}\n\nPlease check the Smart Campus Services Portal for details.\n\nRegards,\nSmart Campus Team`,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`Create announcement: Notification sent to: ${recipients.map(user => user.email).join(',')}`);
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
    const query = req.user.role === 'admin'
      ? {}
      : { isPublished: true, $or: [{ publishDate: { $lte: new Date() } }, { publishDate: null }] };
    const announcements = await Announcement.find(query)
      .populate('createdBy', 'email')
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

    const { title, content, isPublished, publishDate, sendEmail } = req.body;

    if (!title || !content) {
      console.error('Update announcement: Missing required fields');
      return res.status(400).json({ msg: 'Title and content are required' });
    }

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      console.error('Update announcement: Announcement not found');
      return res.status(404).json({ msg: 'Announcement not found' });
    }

    announcement.title = title;
    announcement.content = content;
    announcement.isPublished = isPublished || false;
    announcement.publishDate = publishDate ? new Date(publishDate) : null;

    await announcement.save();
    console.log('Update announcement: Updated:', JSON.stringify(announcement, null, 2));

    if (announcement.isPublished && !announcement.publishDate && sendEmail) {
      const recipients = await User.find({ role: { $in: ['student', 'lecturer'] } }).select('email');
      if (recipients.length > 0) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: recipients.map(user => user.email).join(','),
          subject: `Updated Announcement: ${title}`,
          text: `Dear Student/Lecturer,\n\nAn announcement has been updated:\n\nTitle: ${title}\nContent: ${content}\n\nPlease check the Smart Campus Services Portal for details.\n\nRegards,\nSmart Campus Team`,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`Update announcement: Notification sent to: ${recipients.map(user => user.email).join(',')}`);
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