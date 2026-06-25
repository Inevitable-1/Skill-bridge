const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { auth } = require('../middleware/auth');

router.post('/create', auth, meetingController.createMeeting);
router.get('/my', auth, meetingController.getUserMeetings);
router.get('/all', auth, meetingController.getAllMeetings);
router.get('/:code', meetingController.getMeetingByCode);
router.post('/:code/join', meetingController.joinMeeting);
router.put('/:id/end', auth, meetingController.endMeeting);
router.delete('/:id', auth, meetingController.deleteMeeting);

module.exports = router;
