const express = require('express');
  const router = express.Router();
  const auth = require('../middleware/auth');
  const { createCourse, getCourses } = require('../controllers/courseController');

  router.post('/', auth, createCourse);
  router.get('/', auth, getCourses);

  module.exports = router;