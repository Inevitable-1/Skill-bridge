const pool = require('../config/db');

const createNotification = async (userId, type, title, message, data = null) => {
  try {
    await pool.query(
      'INSERT INTO notifications (user_id, type, title, message, data) VALUES ($1, $2, $3, $4, $5)',
      [userId, type, title, message, data ? JSON.stringify(data) : null]
    );
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = { createNotification };
