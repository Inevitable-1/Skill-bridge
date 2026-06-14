const express = require('express');
const router = express.Router();
const { createSession, approveSession, cancelSession, completeSession, getMySessions, getSessionById } = require('../controllers/sessionController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createSession);
router.get('/', auth, getMySessions);
router.get('/:id', auth, getSessionById);
router.put('/:id/approve', auth, approveSession);
router.put('/:id/cancel', auth, cancelSession);
router.put('/:id/complete', auth, completeSession);

module.exports = router;
