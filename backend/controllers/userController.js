const User = require('../models/User');
const Course = require('../models/Course');

  const getProfile = async (req, res) => {
    try {
      console.log('Get profile: req.user:', JSON.stringify(req.user, null, 2));
      const user = await User.findById(req.user.id).select('name email role courseCodes notificationPreferences displayName avatar');
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
      console.log('Update profile: req.file:', req.file ? req.file : 'No file uploaded');

      const { courseCodes, emailNotifications, displayName } = req.body;

      // Parse JSON if courseCodes is a string (from FormData)
      let parsedCourseCodes = courseCodes;
      if (typeof courseCodes === 'string') {
        try {
          parsedCourseCodes = JSON.parse(courseCodes);
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

      // Validate courseCodes
      if (parsedCourseCodes) {
        const validCourses = await Course.find({ code: { $in: parsedCourseCodes } });
        const validCourseCodes = validCourses.map(course => course.code);
        const invalidCodes = parsedCourseCodes.filter(code => !validCourseCodes.includes(code));
        if (invalidCodes.length > 0) {
          console.error(`Update profile: Invalid course codes: ${invalidCodes.join(', ')}`);
          return res.status(400).json({ msg: `Invalid course codes: ${invalidCodes.join(', ')}` });
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

      // Handle avatar upload
      if (req.file) {
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(req.file.mimetype)) {
          console.error('Update profile: Invalid file type');
          return res.status(400).json({ msg: 'Only JPEG and PNG images are allowed' });
        }
        if (req.file.size > 5 * 1024 * 1024) {
          console.error('Update profile: File too large');
          return res.status(400).json({ msg: 'Image must be less than 5MB' });
        }
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
      res.status(500).json({ msg: 'Server error' });
    }
  };
  module.exports = { getProfile, updateProfile };