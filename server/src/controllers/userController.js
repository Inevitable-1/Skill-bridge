const pool = require('../config/db');
const upload = require('../middleware/upload');

const getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await pool.query(
      `SELECT id, name, email, role, branch, year, bio, avatar_url, availability,
              online_preference, is_verified, is_online, last_seen, created_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const offeredSkills = await pool.query(
      `SELECT s.id, s.name, s.category FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       WHERE us.user_id = $1 AND us.type = 'offered'`,
      [id]
    );

    const neededSkills = await pool.query(
      `SELECT s.id, s.name, s.category FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       WHERE us.user_id = $1 AND us.type = 'needed'`,
      [id]
    );

    const ratingResult = await pool.query(
      `SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total_reviews
       FROM ratings WHERE mentor_id = $1`,
      [id]
    );

    const sessionsResult = await pool.query(
      `SELECT COUNT(*) as completed_sessions
       FROM sessions WHERE (mentor_id = $1 OR mentee_id = $1) AND status = 'completed'`,
      [id]
    );

    const user = userResult.rows[0];
    res.json({
      ...user,
      offeredSkills: offeredSkills.rows,
      neededSkills: neededSkills.rows,
      avgRating: parseFloat(ratingResult.rows[0].avg_rating),
      totalReviews: parseInt(ratingResult.rows[0].total_reviews),
      completedSessions: parseInt(sessionsResult.rows[0].completed_sessions),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, branch, year, bio, availability, onlinePreference, offeredSkills, neededSkills } = req.body;

    const result = await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        branch = COALESCE($2, branch),
        year = COALESCE($3, year),
        bio = COALESCE($4, bio),
        availability = COALESCE($5, availability),
        online_preference = COALESCE($6, online_preference),
        updated_at = NOW()
       WHERE id = $7
       RETURNING id, name, email, branch, year, bio, avatar_url, availability, online_preference`,
      [name, branch, year, bio, availability ? JSON.stringify(availability) : null, onlinePreference, userId]
    );

    if (offeredSkills && Array.isArray(offeredSkills)) {
      await pool.query('DELETE FROM user_skills WHERE user_id = $1 AND type = $2', [userId, 'offered']);
      for (const skillName of offeredSkills) {
        let skillResult = await pool.query('SELECT id FROM skills WHERE name = $1', [skillName]);
        if (skillResult.rows.length === 0) {
          skillResult = await pool.query('INSERT INTO skills (name) VALUES ($1) RETURNING id', [skillName]);
        }
        await pool.query(
          'INSERT INTO user_skills (user_id, skill_id, type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [userId, skillResult.rows[0].id, 'offered']
        );
      }
    }

    if (neededSkills && Array.isArray(neededSkills)) {
      await pool.query('DELETE FROM user_skills WHERE user_id = $1 AND type = $2', [userId, 'needed']);
      for (const skillName of neededSkills) {
        let skillResult = await pool.query('SELECT id FROM skills WHERE name = $1', [skillName]);
        if (skillResult.rows.length === 0) {
          skillResult = await pool.query('INSERT INTO skills (name) VALUES ($1) RETURNING id', [skillName]);
        }
        await pool.query(
          'INSERT INTO user_skills (user_id, skill_id, type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [userId, skillResult.rows[0].id, 'needed']
        );
      }
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, req.user.id]);

    res.json({ avatarUrl });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q, branch, year, skill, availability, onlinePreference, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT DISTINCT u.id, u.name, u.email, u.role, u.branch, u.year, u.bio, u.avatar_url,
             u.online_preference, u.is_online, u.last_seen,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(DISTINCT r.id) as total_reviews
      FROM users u
      LEFT JOIN ratings r ON u.id = r.mentor_id
      LEFT JOIN user_skills us ON u.id = us.user_id
      LEFT JOIN skills s ON us.skill_id = s.id
      WHERE u.is_verified = true
    `;
    const params = [];
    let paramIndex = 1;

    if (q) {
      query += ` AND (u.name ILIKE $${paramIndex} OR u.bio ILIKE $${paramIndex} OR s.name ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (branch) {
      query += ` AND u.branch = $${paramIndex}`;
      params.push(branch);
      paramIndex++;
    }

    if (year) {
      query += ` AND u.year = $${paramIndex}`;
      params.push(parseInt(year));
      paramIndex++;
    }

    if (skill) {
      query += ` AND s.name ILIKE $${paramIndex}`;
      params.push(`%${skill}%`);
      paramIndex++;
    }

    if (availability) {
      query += ` AND u.availability ? $${paramIndex}`;
      params.push(availability);
      paramIndex++;
    }

    if (onlinePreference) {
      query += ` AND u.online_preference = $${paramIndex}`;
      params.push(onlinePreference);
      paramIndex++;
    }

    query += ` GROUP BY u.id ORDER BY avg_rating DESC, u.last_seen DESC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    const countQuery = `
      SELECT COUNT(DISTINCT u.id) FROM users u
      LEFT JOIN user_skills us ON u.id = us.user_id
      LEFT JOIN skills s ON us.skill_id = s.id
      WHERE u.is_verified = true
    `;
    const countResult = await pool.query(countQuery);

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getOnlineMentors = async (req, res) => {
  try {
    const { skill } = req.query;

    let query = `
      SELECT DISTINCT u.id, u.name, u.role, u.branch, u.year, u.avatar_url, u.online_preference,
             COALESCE(AVG(r.rating), 0) as avg_rating
      FROM users u
      LEFT JOIN ratings r ON u.id = r.mentor_id
      JOIN user_skills us ON u.id = us.user_id AND us.type = 'offered'
      LEFT JOIN skills s ON us.skill_id = s.id
      WHERE u.is_online = true AND u.is_verified = true
    `;
    const params = [];

    if (skill) {
      query += ` AND s.name ILIKE $1`;
      params.push(`%${skill}%`);
    }

    query += ` GROUP BY u.id ORDER BY avg_rating DESC`;

    const result = await pool.query(query, params);
    res.json({ mentors: result.rows });
  } catch (error) {
    console.error('Get online mentors error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar, searchUsers, getOnlineMentors };
