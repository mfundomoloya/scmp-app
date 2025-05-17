const User = require('../models/User');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');
const path = require('path');
const fs = require('fs');

// Utility to compute initials
const computeInitials = (firstName, lastName) => {
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${firstInitial}${lastInitial}`;
};

// Get profile of the logged-in user
const getProfile = async (req, res) => {
  try {
    console.log('Get profile: req.user:', JSON.stringify(req.user, null, 2));
    const user = await User.findById(req.user.id).select('firstName lastName email role courseCodes notificationPreferences displayName avatar initials');
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

// Update profile of the logged-in student
const updateProfile = async (req, res) => {
  try {
    console.log('Update profile: req.user:', JSON.stringify(req.user, null, 2));
    console.log('Update profile: req.body:', JSON.stringify(req.body, null, 2));
    console.log('Update profile: req.file:', req.file ? req.file : 'No file uploaded');

    // Extract fields from req.body
    let { courseCodes, emailNotifications, displayName, firstName, lastName } = req.body || {};

    // Handle courseCodes
    let parsedCourseCodes = courseCodes;
    if (courseCodes) {
      try {
        parsedCourseCodes = typeof courseCodes === 'string' ? JSON.parse(courseCodes) : courseCodes;
      } catch (err) {
        console.error('Update profile: Invalid courseCodes JSON');
        return res.status(400).json({ msg: 'Invalid courseCodes format' });
      }
    }

    if (parsedCourseCodes && !Array.isArray(parsedCourseCodes)) {
      console.error('Update profile: Invalid courseCodes format');
      return res.status(400).json({ msg: 'courseCodes must be an array' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      console.error('Update profile: User not found');
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.role !== 'student') {
      console.error('Update profile: Only students can update profile settings');
      return res.status(403).json({ msg: 'Only students can update profile settings' });
    }

    // Validate courseCodes and sync timetables
    if (parsedCourseCodes) {
      const validCourses = await Course.find({ code: { $in: parsedCourseCodes } });
      const validCourseCodes = validCourses.map(course => course.code);
      const invalidCodes = parsedCourseCodes.filter(code => !validCourseCodes.includes(code));
      if (invalidCodes.length > 0) {
        console.error(`Update profile: Invalid course codes: ${invalidCodes.join(', ')}`);
        return res.status(400).json({ msg: `Invalid course codes: ${invalidCodes.join(', ')}` });
      }

      const oldCourseCodes = user.courseCodes || [];
      const newCourseCodes = parsedCourseCodes;

      // Remove user from timetables of old courses
      const coursesToRemove = oldCourseCodes.filter(code => !newCourseCodes.includes(code));
      if (coursesToRemove.length > 0) {
        const courses = await Course.find({ code: { $in: coursesToRemove } });
        const courseIds = courses.map(course => course._id);
        await Timetable.updateMany(
          { courseId: { $in: courseIds }, userIds: user._id },
          { $pull: { userIds: user._id } }
        );
        console.log(`Update profile: Removed user from timetables for courses: ${coursesToRemove.join(', ')}`);
      }

      // Add user to timetables of new courses
      const coursesToAdd = newCourseCodes.filter(code => !oldCourseCodes.includes(code));
      if (coursesToAdd.length > 0) {
        const courses = await Course.find({ code: { $in: coursesToAdd } });
        const courseIds = courses.map(course => course._id);
        await Timetable.updateMany(
          { courseId: { $in: courseIds } },
          { $addToSet: { userIds: user._id } }
        );
        console.log(`Update profile: Added user to timetables for courses: ${coursesToAdd.join(', ')}`);
      }

      user.courseCodes = parsedCourseCodes;
    }

    // Update notification preferences
    if (emailNotifications !== undefined) {
      user.notificationPreferences.emailNotifications = emailNotifications === 'true' || emailNotifications === true;
    }

    // Update display name
    if (displayName) {
      if (displayName.length > 50) {
        console.error('Update profile: Display name too long');
        return res.status(400).json({ msg: 'Display name must be 50 characters or less' });
      }
      user.displayName = displayName;
    }

    // Update firstName and lastName
    if (firstName) {
      if (firstName.length > 50) {
        console.error('Update profile: First name too long');
        return res.status(400).json({ msg: 'First name must be 50 characters or less' });
      }
      user.firstName = firstName;
    }
    if (lastName) {
      if (lastName.length > 50) {
        console.error('Update profile: Last name too long');
        return res.status(400).json({ msg: 'Last name must be 50 characters or less' });
      }
      user.lastName = lastName;
    }

    // Update initials
    user.initials = computeInitials(user.firstName, user.lastName);

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar if exists and not the placeholder
      if (user.avatar && user.avatar !== 'https://placehold.co/100x100') {
        const oldPath = path.join(__dirname, '..', 'public', user.avatar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
          console.log('Update profile: Deleted old avatar:', user.avatar);
        }
      }
      user.avatar = `storage/avatars/${req.file.filename}`;
    }

    await user.save();
    console.log('Update profile: Updated:', JSON.stringify(user, null, 2));
    res.json(user);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
};

const getLecturers = async (req, res) => {
  try {
    console.log('Get lecturers: req.query:', req.query);
    const { role } = req.query;
    if (role !== 'lecturer') {
      return res.status(400).json({ msg: 'Invalid role query' });
    }
const lecturers = await User.find({ role: 'lecturer' }).select('_id firstName lastName email');    console.log('Get lecturers: count:', lecturers.length);
    res.json(lecturers);
  } catch (err) {
    console.error('Error fetching lecturers:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile, getLecturers };