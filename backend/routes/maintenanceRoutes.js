const express = require('express');
  const router = express.Router();
  const auth = require('../middleware/auth');
  const {
    createMaintenanceReport,
    getMaintenanceReports,
    updateMaintenanceReportStatus,
    updateRoomMaintenance,
  } = require('../controllers/maintenanceController');

  router.post('/', auth, createMaintenanceReport);
  router.get('/', auth, getMaintenanceReports);
  router.put('/:id/status', auth, updateMaintenanceReportStatus);
  router.put('/room/:roomId', auth, updateRoomMaintenance);

  module.exports = router;