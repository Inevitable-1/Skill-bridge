const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/auth');
const {
  getPendingApplications, getApplicationDetails, approveApplication, rejectApplication, getAdminStats,
  getAllUsers, getUserDetails, updateUserRole, suspendUser, activateUser, deleteUser,
  getAllMeetings, getAllSessions
} = require('../controllers/adminController');

router.get('/applications', auth, authorizeRoles('admin'), getPendingApplications);
router.get('/applications/:id', auth, authorizeRoles('admin'), getApplicationDetails);
router.post('/applications/:id/approve', auth, authorizeRoles('admin'), approveApplication);
router.post('/applications/:id/reject', auth, authorizeRoles('admin'), rejectApplication);
router.get('/stats', auth, authorizeRoles('admin'), getAdminStats);

router.get('/users', auth, authorizeRoles('admin'), getAllUsers);
router.get('/users/:id', auth, authorizeRoles('admin'), getUserDetails);
router.put('/users/:id/role', auth, authorizeRoles('admin'), updateUserRole);
router.put('/users/:id/suspend', auth, authorizeRoles('admin'), suspendUser);
router.put('/users/:id/activate', auth, authorizeRoles('admin'), activateUser);
router.delete('/users/:id', auth, authorizeRoles('admin'), deleteUser);

router.get('/meetings', auth, authorizeRoles('admin'), getAllMeetings);
router.get('/sessions', auth, authorizeRoles('admin'), getAllSessions);

module.exports = router;
