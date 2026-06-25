const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { createNotification } = require('../utils/notifications');

const createSession = async (req, res) => {
  try {
    const { mentorId, skillId, sessionType, date, duration, aiAnalysis } = req.body;
    const menteeId = req.user.id;

    if (!mentorId || !sessionType || !date) {
      return res.status(400).json({ error: 'Mentor, session type, and date are required' });
    }

    const validTypes = ['quick_doubt', 'emergency_help', 'learning', 'project_guidance', 'interview_prep'];
    if (!validTypes.includes(sessionType)) {
      return res.status(400).json({ error: 'Invalid session type' });
    }

    const mentorCheck = await pool.query('SELECT id, name FROM users WHERE id = $1 AND is_verified = true', [mentorId]);
    if (mentorCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    // Set duration based on session type
    let sessionDuration = duration || 60;
    if (sessionType === 'quick_doubt') sessionDuration = 15;
    else if (sessionType === 'emergency_help') sessionDuration = 25;
    else if (sessionType === 'learning') sessionDuration = 60;
    else if (sessionType === 'project_guidance') sessionDuration = 90;
    else if (sessionType === 'interview_prep') sessionDuration = 60;

    const meetingLink = uuidv4();

    const result = await pool.query(
      `INSERT INTO sessions (mentor_id, mentee_id, skill_id, session_type, date, duration, meeting_link, ai_analysis)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [mentorId, menteeId, skillId || null, sessionType, date, sessionDuration, meetingLink, aiAnalysis || null]
    );

    await pool.query(
      `INSERT INTO video_rooms (session_id, room_id, host_id)
       VALUES ($1, $2, $3)`,
      [result.rows[0].id, meetingLink, mentorId]
    );

    await createNotification(
      mentorId,
      'session_request',
      'New Session Request',
      `${req.user.name} wants to schedule a ${sessionType.replace(/_/g, ' ')} session`,
      { sessionId: result.rows[0].id, menteeName: req.user.name }
    );

    res.status(201).json({ session: result.rows[0] });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const approveSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE sessions SET status = 'approved', updated_at = NOW()
       WHERE id = $1 AND mentor_id = $2 AND status = 'pending'
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or already processed' });
    }

    await createNotification(
      result.rows[0].mentee_id,
      'session_approved',
      'Session Approved',
      'Your session has been approved by the mentor',
      { sessionId: result.rows[0].id }
    );

    res.json({ session: result.rows[0] });
  } catch (error) {
    console.error('Approve session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const cancelSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE sessions SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND (mentor_id = $2 OR mentee_id = $2) AND status IN ('pending', 'approved')
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or cannot be cancelled' });
    }

    const session = result.rows[0];
    const notifyUserId = session.mentor_id === userId ? session.mentee_id : session.mentor_id;

    await createNotification(
      notifyUserId,
      'session_cancelled',
      'Session Cancelled',
      'A session has been cancelled',
      { sessionId: session.id }
    );

    res.json({ session });
  } catch (error) {
    console.error('Cancel session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const completeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE sessions SET status = 'completed', updated_at = NOW()
       WHERE id = $1 AND mentor_id = $2 AND status = 'approved'
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or cannot be completed' });
    }

    const session = result.rows[0];

    await pool.query(
      `INSERT INTO learning_progress (user_id, skill_id, sessions_completed, last_session_date)
       VALUES ($1, $2, 1, NOW())
       ON CONFLICT (user_id, skill_id)
       DO UPDATE SET sessions_completed = learning_progress.sessions_completed + 1,
                     last_session_date = NOW(),
                     streak = CASE
                       WHEN learning_progress.last_session_date > NOW() - INTERVAL '48 hours'
                       THEN learning_progress.streak + 1
                       ELSE 1
                     END`,
      [session.mentee_id, session.skill_id]
    );

    res.json({ session });
  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMySessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, role, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*,
             mentor.name as mentor_name, mentor.avatar_url as mentor_avatar,
             mentee.name as mentee_name, mentee.avatar_url as mentee_avatar,
             sk.name as skill_name
      FROM sessions s
      JOIN users mentor ON s.mentor_id = mentor.id
      JOIN users mentee ON s.mentee_id = mentee.id
      LEFT JOIN skills sk ON s.skill_id = sk.id
      WHERE (s.mentor_id = $1 OR s.mentee_id = $1)
    `;
    const params = [userId];
    let paramIndex = 2;

    if (status) {
      query += ` AND s.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (role === 'mentor') {
      query += ` AND s.mentor_id = $1`;
    } else if (role === 'mentee') {
      query += ` AND s.mentee_id = $1`;
    }

    query += ` ORDER BY CASE WHEN s.session_type = 'emergency_help' AND s.status = 'pending' THEN 0 ELSE 1 END, s.date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM sessions WHERE mentor_id = $1 OR mentee_id = $1`,
      [userId]
    );

    res.json({
      sessions: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT s.*,
              mentor.name as mentor_name, mentor.email as mentor_email, mentor.avatar_url as mentor_avatar,
              mentee.name as mentee_name, mentee.email as mentee_email, mentee.avatar_url as mentee_avatar,
              sk.name as skill_name
       FROM sessions s
       JOIN users mentor ON s.mentor_id = mentor.id
       JOIN users mentee ON s.mentee_id = mentee.id
       LEFT JOIN skills sk ON s.skill_id = sk.id
       WHERE s.id = $1 AND (s.mentor_id = $2 OR s.mentee_id = $2)`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session: result.rows[0] });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createSession,
  approveSession,
  cancelSession,
  completeSession,
  getMySessions,
  getSessionById,
};
