const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('multer');
const { createRoom, getRooms, updateRoom, deleteRoom, importRooms } = require('../controllers/roomController');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', protect, getRooms);
router.post('/', [protect, admin], createRoom);
router.put('/:id', [protect, admin], updateRoom);
router.delete('/:id', [protect, admin], deleteRoom);
router.post('/import', [protect, admin, upload.single('file')], importRooms);

module.exports = router;