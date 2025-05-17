const express = require('express');
  const router = express.Router();
  const { protect } = require('../middleware/auth');
  const {
    createMaintenanceReport,
    getMaintenanceReports,
    updateMaintenanceReportStatus,
    updateRoomMaintenance,
  } = require('../controllers/maintenanceController');

  router.post('/', protect, createMaintenanceReport);
  router.get('/', protect, getMaintenanceReports);
  router.put('/:id/status', protect, updateMaintenanceReportStatus);
  router.put('/room/:roomId', protect, updateRoomMaintenance);
  router.get('/reports', protect, getMaintenanceReports);

  module.exports = router;