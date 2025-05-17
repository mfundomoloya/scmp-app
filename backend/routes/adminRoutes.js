const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/auth');
const { getAdminStats } = require('../controllers/adminController');

router.get('/stats', protect, getAdminStats);

module.exports = router;