const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createRoom = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;

    let roomId;
    if (sessionId) {
      const existing = await pool.query(
        'SELECT room_id FROM video_rooms WHERE session_id = $1',
        [sessionId]
      );
      if (existing.rows.length > 0) {
        roomId = existing.rows[0].room_id;
      } else {
        roomId = uuidv4();
        await pool.query(
          'INSERT INTO video_rooms (session_id, room_id, host_id) VALUES ($1, $2, $3)',
          [sessionId, roomId, userId]
        );
      }
    } else {
      roomId = uuidv4();
      await pool.query(
        'INSERT INTO video_rooms (room_id, host_id) VALUES ($1, $2)',
        [roomId, userId]
      );
    }

    res.json({ roomId });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await pool.query(
      'SELECT * FROM video_rooms WHERE room_id = $1 AND is_active = true',
      [roomId]
    );

    if (room.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found or inactive' });
    }

    res.json({ room: room.rows[0] });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await pool.query(
      'SELECT * FROM video_rooms WHERE room_id = $1',
      [roomId]
    );

    if (room.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.rows[0].host_id === userId) {
      await pool.query('UPDATE video_rooms SET is_active = false WHERE room_id = $1', [roomId]);
    }

    res.json({ message: 'Left room successfully' });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createRoom, joinRoom, leaveRoom };
