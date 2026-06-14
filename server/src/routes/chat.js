const express = require('express');
const router = express.Router();
const { getChatRooms, getMessages, sendMessage, startChat } = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

router.get('/rooms', auth, getChatRooms);
router.post('/start', auth, startChat);
router.get('/:roomId/messages', auth, getMessages);
router.post('/:roomId/messages', auth, sendMessage);

module.exports = router;
