const Course = require('../models/Course');

const createCourse = async (req, res) => {
  try {
    console.log('Create course: req.user:', JSON.stringify(req.user, null, 2));
    console.log('Create course: req.body:', JSON.stringify(req.body, null, 2));

    if (req.user.role !== 'admin') {
      console.error('Create course: Unauthorized');
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    const { code, name, subjects, lecturers } = req.body;

    if (!code || !name || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ msg: 'Invalid course data' });
    }

    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({ msg: `Course code already exists: ${code}` });
    }

    const course = new Course({ code, name, subjects, lecturers: lecturers || [] });
    await course.save();
    console.log('Create course: Created:', JSON.stringify(course, null, 2));
    res.status(201).json(course);
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getCourses = async (req, res) => {
  try {
    console.log('Get courses: req.user:', JSON.stringify(req.user, null, 2));

    let query = {};
    if (req.user.role === 'lecturer') {
      query = { lecturers: req.user.id };
    }

    const courses = await Course.find(query).sort({ code: 1 });
    console.log('Get courses: count:', courses.length);
    res.json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { createCourse, getCourses };