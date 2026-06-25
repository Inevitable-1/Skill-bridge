const pool = require('../config/db');
const config = require('../config/constants');
const crypto = require('crypto');

function generateMeetingCode() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
}

function getMeetingBaseUrl() {
  const clientUrl = config.clientUrl;
  if (clientUrl && clientUrl.trim().length > 0) {
    return clientUrl.replace(/\/$/, '');
  }
  return 'http://localhost:5173';
}

exports.createMeeting = async (req, res) => {
  try {
    const {
      title, description, subject, date, time, duration,
      meetingType = 'group_class', security = 'public', password,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Meeting title is required' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const meetingCode = generateMeetingCode();
    if (!meetingCode || meetingCode.length < 8) {
      return res.status(500).json({ success: false, message: 'Failed to generate meeting code' });
    }
    const meetingLink = `${getMeetingBaseUrl()}/meeting/${meetingCode}`;

    const validTypes = ['one_on_one', 'group_class', 'workshop', 'interview', 'project'];
    let normalizedType = meetingType.replace(/-/g, '_');
    if (!validTypes.includes(normalizedType)) {
      normalizedType = 'group_class';
    }

    const validSecurity = ['public', 'private', 'password'];
    const normalizedSecurity = validSecurity.includes(security) ? security : 'public';

    const result = await pool.query(
      `INSERT INTO meetings (title, description, subject, host_id, meeting_code, meeting_link, date, time, duration, meeting_type, security, password, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'scheduled')
       RETURNING *`,
      [
        title.trim(),
        (description || '').trim(),
        (subject || '').trim(),
        req.user.id,
        meetingCode,
        meetingLink,
        date || null,
        time || null,
        duration || 60,
        normalizedType,
        normalizedSecurity,
        password || null
      ]
    );

    return res.status(201).json({
      success: true,
      meeting: result.rows[0],
      meetingId: result.rows[0].id,
      meetingCode: result.rows[0].meeting_code,
      meetingLink: result.rows[0].meeting_link,
    });
  } catch (error) {
    console.error('Create meeting error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create meeting',
    });
  }
};

exports.getMeetingByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const result = await pool.query(
      `SELECT m.*, u.name as host_name, u.avatar_url as host_avatar
       FROM meetings m JOIN users u ON m.host_id = u.id
       WHERE m.meeting_code = $1`,
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    return res.json({ success: true, meeting: result.rows[0] });
  } catch (error) {
    console.error('Get meeting error:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Failed to get meeting' });
  }
};

exports.joinMeeting = async (req, res) => {
  try {
    const { code } = req.params;
    const { password, guestName } = req.body;

    const meetingResult = await pool.query(
      'SELECT * FROM meetings WHERE meeting_code = $1',
      [code]
    );

    if (meetingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    const meeting = meetingResult.rows[0];

    if (meeting.security === 'password' && meeting.password !== password) {
      return res.status(403).json({ success: false, message: 'Invalid meeting password' });
    }

    await pool.query(
      'INSERT INTO meeting_participants (meeting_id, user_id, guest_name, role) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
      [meeting.id, req.user ? req.user.id : null, guestName || 'Guest', req.user ? 'host' : 'participant']
    );

    return res.json({ success: true, meeting });
  } catch (error) {
    console.error('Join meeting error:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Failed to join meeting' });
  }
};

exports.getUserMeetings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, u.name as host_name, u.avatar_url as host_avatar,
        (SELECT COUNT(*) FROM meeting_participants mp WHERE mp.meeting_id = m.id) as participant_count
       FROM meetings m JOIN users u ON m.host_id = u.id
       WHERE m.host_id = $1 OR m.id IN (SELECT meeting_id FROM meeting_participants WHERE user_id = $1)
       ORDER BY m.created_at DESC`,
      [req.user.id]
    );

    return res.json({ success: true, meetings: result.rows });
  } catch (error) {
    console.error('Get user meetings error:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Failed to get meetings' });
  }
};

exports.getAllMeetings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, u.name as host_name, u.avatar_url as host_avatar,
        (SELECT COUNT(*) FROM meeting_participants mp WHERE mp.meeting_id = m.id) as participant_count
       FROM meetings m JOIN users u ON m.host_id = u.id
       ORDER BY m.created_at DESC`
    );

    return res.json({ success: true, meetings: result.rows });
  } catch (error) {
    console.error('Get all meetings error:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Failed to get meetings' });
  }
};

exports.endMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE meetings SET status = 'completed', ended_at = NOW() WHERE id = $1 AND host_id = $2",
      [id, req.user.id]
    );
    return res.json({ success: true, message: 'Meeting ended' });
  } catch (error) {
    console.error('End meeting error:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Failed to end meeting' });
  }
};

exports.deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM meetings WHERE id = $1 AND host_id = $2', [id, req.user.id]);
    return res.json({ success: true, message: 'Meeting deleted' });
  } catch (error) {
    console.error('Delete meeting error:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete meeting' });
  }
};
