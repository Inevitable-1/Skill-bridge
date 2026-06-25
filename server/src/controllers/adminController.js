const pool = require('../config/db');
const { createNotification } = require('../utils/notifications');
const { sendApprovalEmail, sendRejectionEmail } = require('../services/emailService');

const getPendingApplications = async (req, res) => {
  try {
    const { type } = req.query; // 'mentor' or 'developer' or 'all'
    let query = `
      SELECT id, name, email, phone, role, college, university, degree, qualification,
             years_experience, bio, avatar_url, account_status, created_at,
             resume_url, linkedin_url, github_url, portfolio_url, location,
             languages, certificates, programming_languages
      FROM users
      WHERE account_status = 'pending'
    `;
    const params = [];

    if (type === 'mentor') {
      query += ` AND role = 'senior'`;
    } else if (type === 'developer') {
      query += ` AND role = 'developer'`;
    } else {
      query += ` AND role IN ('senior', 'developer')`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ applications: result.rows });
  } catch (error) {
    console.error('Get pending applications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getApplicationDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, name, email, phone, role, branch, year, college, university, degree, cgpa, graduation_year,
              qualification, years_experience, bio, avatar_url, account_status, created_at,
              resume_url, government_id_url, linkedin_url, github_url, portfolio_url, location,
              languages, certificates, programming_languages, dob, gender
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Get skills
    const skillsResult = await pool.query(
      `SELECT s.name FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = $1`,
      [id]
    );

    // Get custom skills
    const customSkillsResult = await pool.query(
      `SELECT skill_name FROM custom_skills WHERE user_id = $1`,
      [id]
    );

    const user = result.rows[0];
    user.skills = skillsResult.rows.map(s => s.name);
    user.customSkills = customSkillsResult.rows.map(s => s.skill_name);

    res.json({ application: user });
  } catch (error) {
    console.error('Get application details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const result = await pool.query(
      `UPDATE users SET account_status = 'approved', approved_by = $1, approved_date = NOW(), rejection_reason = NULL
       WHERE id = $2 AND account_status = 'pending'
       RETURNING id, name, email, role, account_status`,
      [adminId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found or already processed' });
    }

    const user = result.rows[0];
    const roleLabel = user.role === 'senior' ? 'Mentor' : 'Developer';

    // Notify the user
    await createNotification(
      user.id,
      'application_approved',
      'Congratulations!',
      `Your ${roleLabel} Account has been approved. You can now login and start ${user.role === 'senior' ? 'mentoring students' : 'contributing to the platform'}.`,
      { approvedBy: adminId }
    );

    // Send email
    sendApprovalEmail(user.email, user.name, user.role).catch(console.error);

    res.json({ message: 'Application approved successfully', user });
  } catch (error) {
    console.error('Approve application error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const result = await pool.query(
      `UPDATE users SET account_status = 'rejected', approved_by = $1, approved_date = NOW(), rejection_reason = $2
       WHERE id = $3 AND account_status = 'pending'
       RETURNING id, name, email, role, account_status`,
      [adminId, reason || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found or already processed' });
    }

    const user = result.rows[0];
    const roleLabel = user.role === 'senior' ? 'Mentor' : 'Developer';

    // Notify the user
    await createNotification(
      user.id,
      'application_rejected',
      'Application Update',
      `Your application has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      { rejectedBy: adminId, reason }
    );

    // Send email
    sendRejectionEmail(user.email, user.name, reason).catch(console.error);

    res.json({ message: 'Application rejected', user });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const stats = {};

    // Pending mentor applications
    const pendingMentors = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'senior' AND account_status = 'pending'`);
    stats.pendingMentors = parseInt(pendingMentors.rows[0].count);

    // Pending developer applications
    const pendingDevs = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'developer' AND account_status = 'pending'`);
    stats.pendingDevelopers = parseInt(pendingDevs.rows[0].count);

    // Approved mentor applications
    const approvedMentors = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'senior' AND account_status = 'approved'`);
    stats.approvedMentors = parseInt(approvedMentors.rows[0].count);

    // Approved developer applications
    const approvedDevs = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'developer' AND account_status = 'approved'`);
    stats.approvedDevelopers = parseInt(approvedDevs.rows[0].count);

    // Rejected applications
    const rejected = await pool.query(`SELECT COUNT(*) FROM users WHERE account_status = 'rejected'`);
    stats.rejectedApplications = parseInt(rejected.rows[0].count);

    // Total students (junior)
    const students = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'junior'`);
    stats.totalStudents = parseInt(students.rows[0].count);

    // Total mentors (senior)
    const mentors = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'senior'`);
    stats.totalMentors = parseInt(mentors.rows[0].count);

    // Total developers
    const developers = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'developer'`);
    stats.totalDevelopers = parseInt(developers.rows[0].count);

    // Active meetings
    const activeMeetings = await pool.query(`SELECT COUNT(*) FROM meetings WHERE status IN ('scheduled', 'live')`);
    stats.activeMeetings = parseInt(activeMeetings.rows[0].count);

    // Total sessions
    const totalSessions = await pool.query(`SELECT COUNT(*) FROM sessions`);
    stats.totalSessions = parseInt(totalSessions.rows[0].count);

    // Completed sessions
    const completedSessions = await pool.query(`SELECT COUNT(*) FROM sessions WHERE status = 'completed'`);
    stats.completedSessions = parseInt(completedSessions.rows[0].count);

    // Pending sessions
    const pendingSessions = await pool.query(`SELECT COUNT(*) FROM sessions WHERE status = 'pending'`);
    stats.pendingSessions = parseInt(pendingSessions.rows[0].count);

    res.json({ stats });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (role) {
      conditions.push(`u.role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (status) {
      conditions.push(`u.account_status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users u ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const usersResult = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.college, u.university,
              u.degree, u.qualification, u.years_experience, u.bio, u.avatar_url,
              u.account_status, u.created_at, u.resume_url, u.linkedin_url,
              u.github_url, u.portfolio_url, u.location, u.languages,
              u.certificates, u.programming_languages
       FROM users u ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const users = [];
    for (const user of usersResult.rows) {
      const skillsResult = await pool.query(
        `SELECT s.name FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = $1`,
        [user.id]
      );
      users.push({ ...user, skills: skillsResult.rows.map(s => s.name) });
    }

    res.json({ users, totalCount, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, name, email, phone, role, branch, year, college, university, degree, cgpa, graduation_year,
              qualification, years_experience, bio, avatar_url, account_status, created_at,
              resume_url, government_id_url, linkedin_url, github_url, portfolio_url, location,
              languages, certificates, programming_languages, dob, gender
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const skillsResult = await pool.query(
      `SELECT s.name FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = $1`,
      [id]
    );

    const customSkillsResult = await pool.query(
      `SELECT skill_name FROM custom_skills WHERE user_id = $1`,
      [id]
    );

    const user = result.rows[0];
    user.skills = skillsResult.rows.map(s => s.name);
    user.customSkills = customSkillsResult.rows.map(s => s.skill_name);

    res.json({ user });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const result = await pool.query(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role, account_status`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    await createNotification(
      user.id,
      'role_changed',
      'Role Updated',
      `Your role has been updated to ${role}.`,
      { changedBy: req.user.id }
    );

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE users SET account_status = 'rejected' WHERE id = $1 RETURNING id, name, email, role, account_status`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    await createNotification(
      user.id,
      'account_suspended',
      'Account Suspended',
      'Your account has been suspended by an administrator.',
      { suspendedBy: req.user.id }
    );

    res.json({ message: 'User suspended successfully', user });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE users SET account_status = 'active' WHERE id = $1 RETURNING id, name, email, role, account_status`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    await createNotification(
      user.id,
      'account_activated',
      'Account Activated',
      'Your account has been activated by an administrator.',
      { activatedBy: req.user.id }
    );

    res.json({ message: 'User activated successfully', user });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING id, name, email`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllMeetings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`m.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM meetings m ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const meetingsResult = await pool.query(
      `SELECT m.*, u.name AS host_name,
              (SELECT COUNT(*) FROM meeting_participants mp WHERE mp.meeting_id = m.id) AS participant_count
       FROM meetings m
       LEFT JOIN users u ON m.host_id = u.id
       ${whereClause}
       ORDER BY m.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    res.json({ meetings: meetingsResult.rows, totalCount, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get all meetings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllSessions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`s.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM sessions s ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const sessionsResult = await pool.query(
      `SELECT s.*, mentor.name AS mentor_name, mentee.name AS mentee_name
       FROM sessions s
       LEFT JOIN users mentor ON s.mentor_id = mentor.id
       LEFT JOIN users mentee ON s.mentee_id = mentee.id
       ${whereClause}
       ORDER BY s.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    res.json({ sessions: sessionsResult.rows, totalCount, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get all sessions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getPendingApplications, getApplicationDetails, approveApplication, rejectApplication, getAdminStats,
  getAllUsers, getUserDetails, updateUserRole, suspendUser, activateUser, deleteUser,
  getAllMeetings, getAllSessions
};
