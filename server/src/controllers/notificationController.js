const pool = require('../config/db');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM notifications WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    if (unreadOnly === 'true') {
      query += ` AND is_read = false`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    const unreadCount = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.json({
      notifications: result.rows,
      unreadCount: parseInt(unreadCount.rows[0].count),
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.json({ message: 'All marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const addRating = async (req, res) => {
  try {
    const { sessionId, rating, review } = req.body;
    const menteeId = req.user.id;

    if (!sessionId || !rating) {
      return res.status(400).json({ error: 'Session ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const session = await pool.query(
      'SELECT * FROM sessions WHERE id = $1 AND mentee_id = $2 AND status = $3',
      [sessionId, menteeId, 'completed']
    );

    if (session.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or not completed' });
    }

    const existingRating = await pool.query(
      'SELECT id FROM ratings WHERE session_id = $1 AND mentee_id = $2',
      [sessionId, menteeId]
    );

    if (existingRating.rows.length > 0) {
      return res.status(409).json({ error: 'Already rated this session' });
    }

    const result = await pool.query(
      `INSERT INTO ratings (session_id, mentor_id, mentee_id, rating, review)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [sessionId, session.rows[0].mentor_id, menteeId, rating, review || null]
    );

    res.status(201).json({ rating: result.rows[0] });
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMentorRatings = async (req, res) => {
  try {
    const { mentorId } = req.params;

    const result = await pool.query(
      `SELECT r.*, mentee.name as mentee_name, mentee.avatar_url as mentee_avatar,
              sk.name as skill_name
       FROM ratings r
       JOIN users mentee ON r.mentee_id = mentee.id
       LEFT JOIN sessions s ON r.session_id = s.id
       LEFT JOIN skills sk ON s.skill_id = sk.id
       WHERE r.mentor_id = $1
       ORDER BY r.created_at DESC`,
      [mentorId]
    );

    const stats = await pool.query(
      `SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total_reviews,
              COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
              COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
              COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
              COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
              COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
       FROM ratings WHERE mentor_id = $1`,
      [mentorId]
    );

    res.json({
      ratings: result.rows,
      stats: stats.rows[0],
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.avatar_url, u.branch, u.year,
              COALESCE(AVG(r.rating), 0) as avg_rating,
              COUNT(DISTINCT r.id) as total_reviews,
              COUNT(DISTINCT s.id) as completed_sessions
       FROM users u
       LEFT JOIN ratings r ON u.id = r.mentor_id
       LEFT JOIN sessions s ON u.id = s.mentor_id AND s.status = 'completed'
       WHERE u.is_verified = true
       GROUP BY u.id
       HAVING COUNT(DISTINCT r.id) > 0
       ORDER BY avg_rating DESC, total_reviews DESC
       LIMIT 20`
    );

    res.json({ leaderboard: result.rows });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  addRating,
  getMentorRatings,
  getLeaderboard,
};
