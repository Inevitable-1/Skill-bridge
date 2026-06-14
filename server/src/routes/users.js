const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadAvatar, searchUsers, getOnlineMentors } = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/search', auth, searchUsers);
router.get('/online-mentors', auth, getOnlineMentors);
router.get('/:id', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/avatar', auth, upload.single('avatar'), uploadAvatar);

module.exports = router;
