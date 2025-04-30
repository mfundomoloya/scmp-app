const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('multer');
const { createRoom, getRooms, updateRoom, deleteRoom, importRooms } = require('../controllers/roomController');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', auth, getRooms);
router.post('/', [auth, admin], createRoom);
router.put('/:id', [auth, admin], updateRoom);
router.delete('/:id', [auth, admin], deleteRoom);
router.post('/import', [auth, admin, upload.single('file')], importRooms);

module.exports = router;