const express = require('express');
const router = express.Router();
const {
  createRequest,
  getStudentRequests,
  getLecturerRequests,
  updateRequestStatus,
} = require('../controllers/requestController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/', protect, restrictTo('student'), createRequest);
router.get('/student', protect, restrictTo('student'), getStudentRequests);
router.get('/lecturer/history', protect, restrictTo('lecturer'), getLecturerRequests);
router.put('/:id', protect, restrictTo('lecturer'), updateRequestStatus);
router.get('/lecturer', protect, restrictTo('lecturer'), getLecturerRequests);


module.exports = router;