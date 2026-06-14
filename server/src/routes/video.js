const express = require('express');
const router = express.Router();
const { createRoom, joinRoom, leaveRoom } = require('../controllers/videoController');
const { auth } = require('../middleware/auth');

router.post('/room', auth, createRoom);
router.post('/room/:roomId/join', auth, joinRoom);
router.post('/room/:roomId/leave', auth, leaveRoom);

module.exports = router;
