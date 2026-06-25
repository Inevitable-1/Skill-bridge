const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/db');
const { generateToken } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail, sendApprovalEmail, sendRejectionEmail } = require('../services/emailService');
const { createNotification } = require('../utils/notifications');

const register = async (req, res) => {
  try {
    const { name, email, password, branch, year, role, phone, dob, gender, college, university, degree, cgpa, graduation_year, skills, customSkills, bio, years_experience, qualification, resume_url, government_id_url, linkedin_url, github_url, portfolio_url, location, languages, certificates, programming_languages } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' });
    }

    const validRoles = ['admin', 'senior', 'junior', 'developer'];
    let userRole = validRoles.includes(role) ? role : 'junior';

    // Map 'mentor' to 'senior'
    if (role === 'mentor') userRole = 'senior';

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Determine account_status based on role
    // Students (junior) are active immediately, mentors/developers need approval
    const accountStatus = (userRole === 'senior' || userRole === 'developer') ? 'pending' : 'active';

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, branch, year, verification_token, phone, dob, gender, college, university, degree, cgpa, graduation_year, bio, account_status, years_experience, qualification, resume_url, government_id_url, linkedin_url, github_url, portfolio_url, location, languages, certificates, programming_languages)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
       RETURNING id, name, email, role, branch, year, is_verified, created_at, account_status`,
      [name, email, hashedPassword, userRole, branch || null, year || null, verificationToken, phone || null, dob || null, gender || null, college || null, university || null, degree || null, cgpa || null, graduation_year || null, bio || null, accountStatus, years_experience || null, qualification || null, resume_url || null, government_id_url || null, linkedin_url || null, github_url || null, portfolio_url || null, location || null, languages || null, certificates || null, programming_languages || null]
    );

    const user = result.rows[0];

    // Handle skills
    if (skills && Array.isArray(skills) && skills.length > 0) {
      for (const skillName of skills) {
        let skillResult = await pool.query('SELECT id FROM skills WHERE name = $1', [skillName]);
        if (skillResult.rows.length === 0) {
          skillResult = await pool.query('INSERT INTO skills (name) VALUES ($1) RETURNING id', [skillName]);
        }
        await pool.query(
          'INSERT INTO user_skills (user_id, skill_id, type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [user.id, skillResult.rows[0].id, 'offered']
        );
      }
    }

    // Handle custom skills
    if (customSkills && Array.isArray(customSkills) && customSkills.length > 0) {
      for (const skill of customSkills) {
        await pool.query(
          'INSERT INTO custom_skills (user_id, skill_name) VALUES ($1, $2)',
          [user.id, skill]
        );
      }
    }

    sendVerificationEmail(email, verificationToken).catch(console.error);

    // If mentor or developer, notify admins
    if (userRole === 'senior' || userRole === 'developer') {
      const admins = await pool.query('SELECT id FROM users WHERE role = $1', ['admin']);
      for (const admin of admins.rows) {
        await createNotification(admin.id, 'new_application', 'New Application', `${userRole === 'senior' ? 'Mentor' : 'Developer'} application from ${name}`, { userId: user.id, role: userRole });
      }
    }

    const message = accountStatus === 'pending'
      ? 'Your mentor application has been submitted successfully. Please wait until the administrator reviews your application.'
      : 'Registration successful. Please check your email to verify your account.';

    res.status(201).json({
      message,
      token: accountStatus === 'pending' ? null : generateToken(user.id),
      accountStatus,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        year: user.year,
        isVerified: user.is_verified,
        accountStatus: user.account_status,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query(
      'SELECT id, name, email, password, role, branch, year, bio, avatar_url, is_verified, is_online, account_status FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check account status for mentor/developer
    if ((user.role === 'senior' || user.role === 'developer') && user.account_status === 'pending') {
      return res.status(403).json({ error: 'Your account is awaiting administrator approval.', accountStatus: 'pending' });
    }

    if ((user.role === 'senior' || user.role === 'developer') && user.account_status === 'rejected') {
      return res.status(403).json({ error: 'Your application has been rejected. Please contact support.', accountStatus: 'rejected' });
    }

    await pool.query('UPDATE users SET is_online = true, last_seen = NOW() WHERE id = $1', [user.id]);

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        year: user.year,
        bio: user.bio,
        avatarUrl: user.avatar_url,
        isVerified: user.is_verified,
        isOnline: true,
        accountStatus: user.account_status,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

const logout = async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_online = false, last_seen = NOW() WHERE id = $1', [req.user.id]);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error during logout' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const result = await pool.query(
      'UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = $1 RETURNING id, name, email',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Server error during email verification' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000);

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
      [resetToken, resetExpiry, email]
    );

    sendPasswordResetEmail(email, resetToken).catch(console.error);

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const result = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hashedPassword, result.rows[0].id]
    );

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error during password reset' });
  }
};

module.exports = { register, login, logout, verifyEmail, forgotPassword, resetPassword };
