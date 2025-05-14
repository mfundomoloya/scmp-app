const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, restrictTo } = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/', protect, admin, createAnnouncement);
router.get('/', protect, getAnnouncements);
router.put('/:id', protect, admin, updateAnnouncement);
router.delete('/:id', protect, admin, deleteAnnouncement);
router.get('/lecturer', protect, restrictTo('lecturer'), getAnnouncements);


module.exports = router;