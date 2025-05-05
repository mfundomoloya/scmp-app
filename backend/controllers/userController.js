const User = require('../models/User');
const Course = require('../models/Course');

  const getProfile = async (req, res) => {
    try {
      console.log('Get profile: req.user:', JSON.stringify(req.user, null, 2));
      const user = await User.findById(req.user.id).select('name email role courseCodes');
      if (!user) {
        console.error('Get profile: User not found');
        return res.status(404).json({ msg: 'User not found' });
      }
      console.log('Get profile: Fetched:', JSON.stringify(user, null, 2));
      res.json(user);
    } catch (err) {
      console.error('Error fetching profile:', err);
      res.status(500).json({ msg: 'Server error' });
    }
  };

  const updateProfile = async (req, res) => {
    try {
      console.log('Update profile: req.user:', JSON.stringify(req.user, null, 2));
      console.log('Update profile: req.body:', JSON.stringify(req.body, null, 2));

      const { courseCodes } = req.body;

      if (!Array.isArray(courseCodes)) {
        console.error('Update profile: Invalid courseCodes format');
        return res.status(400).json({ msg: 'courseCodes must be an array' });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        console.error('Update profile: User not found');
        return res.status(404).json({ msg: 'User not found' });
      }

      if (user.role !== 'student') {
        console.error('Update profile: Only students can update courseCodes');
        return res.status(403).json({ msg: 'Only students can update course codes' });
      }

      // Validate courseCodes
      const validCourses = await Course.find({ code: { $in: courseCodes } });
      const validCourseCodes = validCourses.map(course => course.code);
      const invalidCodes = courseCodes.filter(code => !validCourseCodes.includes(code));
      if (invalidCodes.length > 0) {
        console.error(`Update profile: Invalid course codes: ${invalidCodes.join(', ')}`);
        return res.status(400).json({ msg: `Invalid course codes: ${invalidCodes.join(', ')}` });
      }

      user.courseCodes = courseCodes;
      await user.save();
      console.log('Update profile: Updated:', JSON.stringify(user, null, 2));
      res.json(user);
    } catch (err) {
      console.error('Error updating profile:', err);
      res.status(500).json({ msg: 'Server error' });
    }
  };

  module.exports = { getProfile, updateProfile };