const pool = require('../config/db');

const getOrCreateChatRoom = async (userId1, userId2) => {
  const [minId, maxId] = [Math.min(userId1, userId2), Math.max(userId1, userId2)];

  let result = await pool.query(
    'SELECT id FROM chat_rooms WHERE user1_id = $1 AND user2_id = $2',
    [minId, maxId]
  );

  if (result.rows.length > 0) {
    return result.rows[0].id;
  }

  result = await pool.query(
    'INSERT INTO chat_rooms (user1_id, user2_id) VALUES ($1, $2) RETURNING id',
    [minId, maxId]
  );

  return result.rows[0].id;
};

const getChatRooms = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT cr.id, cr.created_at,
              CASE WHEN cr.user1_id = $1 THEN u2.id ELSE u1.id END as other_user_id,
              CASE WHEN cr.user1_id = $1 THEN u2.name ELSE u1.name END as other_user_name,
              CASE WHEN cr.user1_id = $1 THEN u2.avatar_url ELSE u1.avatar_url END as other_user_avatar,
              CASE WHEN cr.user1_id = $1 THEN u2.is_online ELSE u1.is_online END as other_user_online,
              (SELECT message FROM messages WHERE chat_room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message,
              (SELECT created_at FROM messages WHERE chat_room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
              (SELECT COUNT(*) FROM messages WHERE chat_room_id = cr.id AND receiver_id = $1 AND is_read = false) as unread_count
       FROM chat_rooms cr
       JOIN users u1 ON cr.user1_id = u1.id
       JOIN users u2 ON cr.user2_id = u2.id
       WHERE cr.user1_id = $1 OR cr.user2_id = $1
       ORDER BY last_message_at DESC NULLS LAST`,
      [userId]
    );

    res.json({ chatRooms: result.rows });
  } catch (error) {
    console.error('Get chat rooms error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const roomCheck = await pool.query(
      'SELECT * FROM chat_rooms WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [roomId, userId]
    );

    if (roomCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT m.*, sender.name as sender_name, sender.avatar_url as sender_avatar
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       WHERE m.chat_room_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [roomId, parseInt(limit), offset]
    );

    await pool.query(
      'UPDATE messages SET is_read = true WHERE chat_room_id = $1 AND receiver_id = $2 AND is_read = false',
      [roomId, userId]
    );

    res.json({ messages: result.rows.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { message } = req.body;
    const senderId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const roomCheck = await pool.query(
      'SELECT * FROM chat_rooms WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [roomId, senderId]
    );

    if (roomCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const receiverId = roomCheck.rows[0].user1_id === senderId
      ? roomCheck.rows[0].user2_id
      : roomCheck.rows[0].user1_id;

    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, chat_room_id, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [senderId, receiverId, roomId, message.trim()]
    );

    const senderResult = await pool.query('SELECT name, avatar_url FROM users WHERE id = $1', [senderId]);
    const msg = {
      ...result.rows[0],
      sender_name: senderResult.rows[0].name,
      sender_avatar: senderResult.rows[0].avatar_url,
    };

    res.status(201).json({ message: msg });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const startChat = async (req, res) => {
  try {
    const { userId: otherUserId } = req.body;
    const currentUserId = req.user.id;

    if (!otherUserId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (currentUserId === otherUserId) {
      return res.status(400).json({ error: 'Cannot chat with yourself' });
    }

    const roomId = await getOrCreateChatRoom(currentUserId, otherUserId);

    const otherUser = await pool.query(
      'SELECT id, name, avatar_url, is_online FROM users WHERE id = $1',
      [otherUserId]
    );

    res.json({ roomId, otherUser: otherUser.rows[0] });
  } catch (error) {
    console.error('Start chat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getChatRooms, getMessages, sendMessage, startChat };
