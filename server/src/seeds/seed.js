const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const skills = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java',
  'C++', 'SQL', 'MongoDB', 'Docker', 'AWS', 'Git',
  'HTML/CSS', 'Tailwind CSS', 'Express.js', 'PostgreSQL',
  'Machine Learning', 'Data Analysis', 'REST APIs', 'GraphQL',
  'Spring Boot', 'Angular', 'Vue.js', 'Flutter',
  'Redis', 'Kubernetes', 'CI/CD', 'Linux',
  'System Design', 'Data Structures', 'Algorithms', 'Problem Solting',
];

const users = [
  {
    name: 'Arjun Mehta',
    email: 'arjun@college.edu',
    password: 'password123',
    branch: 'Computer Science',
    year: 4,
    bio: 'Full-stack developer with experience in React and Node.js. Love helping juniors build projects.',
  },
  {
    name: 'Sneha Kapoor',
    email: 'sneha@college.edu',
    password: 'password123',
    branch: 'Information Technology',
    year: 3,
    bio: 'Data science enthusiast. ML and Python are my go-to tools.',
  },
  {
    name: 'Vikram Singh',
    email: 'vikram@college.edu',
    password: 'password123',
    branch: 'Computer Science',
    year: 4,
    bio: 'Backend specialist with experience in system design and distributed systems.',
  },
  {
    name: 'Priyanka Das',
    email: 'priyanka@college.edu',
    password: 'password123',
    branch: 'Electronics',
    year: 3,
    bio: 'IoT and embedded systems enthusiast. Love building hardware projects.',
  },
  {
    name: 'Karthik Reddy',
    email: 'karthik@college.edu',
    password: 'password123',
    branch: 'Computer Science',
    year: 4,
    bio: 'Cloud and DevOps engineer. AWS certified. Happy to guide on deployment.',
  },
];

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const skillName of skills) {
      await client.query(
        'INSERT INTO skills (name, category) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [skillName, null]
      );
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('password123', salt);

    for (const userData of users) {
      const result = await client.query(
        `INSERT INTO users (name, email, password, branch, year, bio, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [userData.name, userData.email, hashedPassword, userData.branch, userData.year, userData.bio]
      );

      if (result.rows.length > 0) {
        const userId = result.rows[0].id;
        const offeredSkills = ['JavaScript', 'React', 'Python', 'Node.js', 'SQL', 'Git'];
        for (const skillName of offeredSkills) {
          const skillResult = await client.query('SELECT id FROM skills WHERE name = $1', [skillName]);
          if (skillResult.rows.length > 0) {
            await client.query(
              'INSERT INTO user_skills (user_id, skill_id, type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
              [userId, skillResult.rows[0].id, 'offered']
            );
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log('Seed completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed error:', err);
  } finally {
    client.release();
  }
};

if (require.main === module) {
  seed().then(() => process.exit(0));
}

module.exports = seed;
