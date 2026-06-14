const pool = require('../config/db');

const matchMentors = async (req, res) => {
  try {
    const { skill, branch, year, rating, availability, onlinePreference } = req.query;
    const userId = req.user ? req.user.id : null;

    let query = `
      SELECT DISTINCT u.id, u.name, u.branch, u.year, u.bio, u.avatar_url,
             u.online_preference, u.is_online, u.availability,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(DISTINCT r.id) as total_reviews,
             array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) as skills,
             COUNT(DISTINCT CASE WHEN us.type = 'offered' THEN s.id END) as skills_offered_count
      FROM users u
      LEFT JOIN ratings r ON u.id = r.mentor_id
      JOIN user_skills us ON u.id = us.user_id AND us.type = 'offered'
      LEFT JOIN skills s ON us.skill_id = s.id
      WHERE u.is_verified = true
    `;
    const params = [];
    let paramIndex = 1;

    if (userId) {
      query += ` AND u.id != $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (skill) {
      query += ` AND s.name ILIKE $${paramIndex}`;
      params.push(`%${skill}%`);
      paramIndex++;
    }

    if (branch) {
      query += ` AND u.branch = $${paramIndex}`;
      params.push(branch);
      paramIndex++;
    }

    if (year) {
      query += ` AND u.year >= $${paramIndex}`;
      params.push(parseInt(year));
      paramIndex++;
    }

    if (rating) {
      query += ` AND COALESCE(AVG(r.rating), 0) >= $${paramIndex}`;
      params.push(parseFloat(rating));
      paramIndex++;
    }

    if (onlinePreference) {
      query += ` AND (u.online_preference = $${paramIndex} OR u.online_preference = 'both')`;
      params.push(onlinePreference);
      paramIndex++;
    }

    query += `
      GROUP BY u.id
      ORDER BY skills_offered_count DESC, avg_rating DESC, u.last_seen DESC
    `;

    const result = await pool.query(query, params);

    const mentors = result.rows.map((m) => ({
      ...m,
      avgRating: parseFloat(m.avg_rating),
      totalReviews: parseInt(m.total_reviews),
      skills: m.skills ? m.skills.filter(Boolean) : [],
      matchScore: calculateMatchScore(m, { skill, branch, year }),
    }));

    mentors.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ mentors, total: mentors.length });
  } catch (error) {
    console.error('Match mentors error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

function calculateMatchScore(mentor, criteria) {
  let score = 0;

  if (criteria.skill && mentor.skills) {
    const skillMatch = mentor.skills.some(
      (s) => s && s.toLowerCase().includes(criteria.skill.toLowerCase())
    );
    if (skillMatch) score += 40;
  }

  if (criteria.branch && mentor.branch === criteria.branch) {
    score += 20;
  }

  if (criteria.year && mentor.year >= parseInt(criteria.year)) {
    score += 15;
  }

  score += Math.min(mentor.avgRating * 5, 25);

  return score;
}

const getSkillGraph = async (req, res) => {
  try {
    const skillsResult = await pool.query(`
      SELECT s.id, s.name, s.category,
             COUNT(DISTINCT us.user_id) as user_count,
             array_agg(DISTINCT jsonb_build_object(
               'id', u.id,
               'name', u.name,
               'avatar_url', u.avatar_url,
               'year', u.year,
               'type', us.type
             )) as users
      FROM skills s
      LEFT JOIN user_skills us ON s.id = us.skill_id
      LEFT JOIN users u ON us.user_id = u.id
      GROUP BY s.id, s.name, s.category
      ORDER BY user_count DESC
    `);

    const nodes = [];
    const edges = [];
    let nodeId = 0;

    const skillNodes = {};
    for (const skill of skillsResult.rows) {
      skillNodes[skill.id] = nodeId;
      nodes.push({
        id: `skill-${skill.id}`,
        type: 'skillNode',
        data: {
          label: skill.name,
          category: skill.category,
          userCount: skill.user_count,
          users: skill.users,
        },
        position: { x: (nodeId % 5) * 280, y: Math.floor(nodeId / 5) * 200 },
      });
      nodeId++;
    }

    for (const skill of skillsResult.rows) {
      if (skill.users) {
        const mentors = skill.users.filter((u) => u.type === 'offered');
        for (const mentor of mentors) {
          const mentees = skill.users.filter((u) => u.type === 'needed');
          for (const mentee of mentees) {
            edges.push({
              id: `e-${mentor.id}-${mentee.id}-${skill.id}`,
              source: `skill-${skill.id}`,
              target: `skill-${skill.id}`,
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#4F46E5' },
            });
          }
        }
      }
    }

    res.json({ nodes, edges, skills: skillsResult.rows });
  } catch (error) {
    console.error('Get skill graph error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { matchMentors, getSkillGraph };
