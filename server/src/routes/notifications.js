const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, addRating, getMentorRatings, getLeaderboard } = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

router.get('/', auth, getNotifications);
router.put('/:id/read', auth, markAsRead);
router.put('/read-all', auth, markAllAsRead);
router.post('/rating', auth, addRating);
router.get('/ratings/:mentorId', auth, getMentorRatings);
router.get('/leaderboard', auth, getLeaderboard);

module.exports = router;
