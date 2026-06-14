const express = require('express');
const router = express.Router();
const { matchMentors, getSkillGraph } = require('../controllers/skillController');
const { auth, optionalAuth } = require('../middleware/auth');

router.get('/match', optionalAuth, matchMentors);
router.get('/graph', auth, getSkillGraph);

module.exports = router;
