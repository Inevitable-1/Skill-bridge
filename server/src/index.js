const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const config = require('./config/constants');
const pool = require('./config/db');
const { verifyToken } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const skillRoutes = require('./routes/skills');
const sessionRoutes = require('./routes/sessions');
const chatRoutes = require('./routes/chat');
const videoRoutes = require('./routes/video');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
  },
});

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const onlineUsers = new Map();
const videoRooms = new Map();

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));

    const decoded = verifyToken(token);
    const result = await pool.query(
      'SELECT id, name, avatar_url FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) return next(new Error('User not found'));

    socket.user = result.rows[0];
    next();
  } catch (err) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.name} (${socket.user.id})`);

  onlineUsers.set(socket.user.id, socket.id);

  pool.query('UPDATE users SET is_online = true WHERE id = $1', [socket.user.id])
    .catch(console.error);

  io.emit('user_online', { userId: socket.user.id, isOnline: true });

  socket.on('join_chat', (roomId) => {
    socket.join(`chat_${roomId}`);
  });

  socket.on('leave_chat', (roomId) => {
    socket.leave(`chat_${roomId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { roomId, message } = data;
      if (!message || !message.trim()) return;

      const roomResult = await pool.query(
        'SELECT * FROM chat_rooms WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
        [roomId, socket.user.id]
      );

      if (roomResult.rows.length === 0) return;

      const receiverId = roomResult.rows[0].user1_id === socket.user.id
        ? roomResult.rows[0].user2_id
        : roomResult.rows[0].user1_id;

      const result = await pool.query(
        `INSERT INTO messages (sender_id, receiver_id, chat_room_id, message)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [socket.user.id, receiverId, roomId, message.trim()]
      );

      const msgData = {
        ...result.rows[0],
        sender_name: socket.user.name,
        sender_avatar: socket.user.avatar_url,
      };

      io.to(`chat_${roomId}`).emit('new_message', msgData);

      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message_notification', {
          roomId,
          message: msgData,
        });
      }
    } catch (error) {
      console.error('Socket send_message error:', error);
    }
  });

  socket.on('join_video_room', (roomId) => {
    socket.join(`video_${roomId}`);
    videoRooms.set(roomId, videoRooms.get(roomId) || new Set());
    videoRooms.get(roomId).add(socket.user.id);

    socket.to(`video_${roomId}`).emit('user_joined_video', {
      userId: socket.user.id,
      userName: socket.user.name,
      avatarUrl: socket.user.avatar_url,
    });
  });

  socket.on('leave_video_room', (roomId) => {
    socket.leave(`video_${roomId}`);
    if (videoRooms.has(roomId)) {
      videoRooms.get(roomId).delete(socket.user.id);
      if (videoRooms.get(roomId).size === 0) {
        videoRooms.delete(roomId);
      }
    }

    socket.to(`video_${roomId}`).emit('user_left_video', {
      userId: socket.user.id,
      userName: socket.user.name,
    });
  });

  socket.on('video_offer', (data) => {
    const { roomId, offer, targetUserId } = data;
    const targetSocketId = onlineUsers.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('video_offer', {
        offer,
        fromUserId: socket.user.id,
        fromUserName: socket.user.name,
      });
    }
  });

  socket.on('video_answer', (data) => {
    const { roomId, answer, targetUserId } = data;
    const targetSocketId = onlineUsers.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('video_answer', {
        answer,
        fromUserId: socket.user.id,
      });
    }
  });

  socket.on('ice_candidate', (data) => {
    const { roomId, candidate, targetUserId } = data;
    const targetSocketId = onlineUsers.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('ice_candidate', {
        candidate,
        fromUserId: socket.user.id,
      });
    }
  });

  socket.on('whiteboard_update', (data) => {
    const { roomId, drawing } = data;
    socket.to(`video_${roomId}`).emit('whiteboard_update', {
      drawing,
      userId: socket.user.id,
    });
  });

  socket.on('notes_update', (data) => {
    const { roomId, notes } = data;
    socket.to(`video_${roomId}`).emit('notes_update', {
      notes,
      userId: socket.user.id,
    });
  });

  socket.on('screen_share_started', (data) => {
    const { roomId } = data;
    socket.to(`video_${roomId}`).emit('screen_share_started', {
      userId: socket.user.id,
    });
  });

  socket.on('screen_share_stopped', (data) => {
    const { roomId } = data;
    socket.to(`video_${roomId}`).emit('screen_share_stopped', {
      userId: socket.user.id,
    });
  });

  socket.on('send_notification', (data) => {
    const { targetUserId, notification } = data;
    const targetSocketId = onlineUsers.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('notification', notification);
    }
  });

  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.user.name}`);
    onlineUsers.delete(socket.user.id);

    await pool.query(
      'UPDATE users SET is_online = false, last_seen = NOW() WHERE id = $1',
      [socket.user.id]
    ).catch(console.error);

    io.emit('user_online', { userId: socket.user.id, isOnline: false });

    for (const [roomId, users] of videoRooms.entries()) {
      if (users.has(socket.user.id)) {
        users.delete(socket.user.id);
        io.to(`video_${roomId}`).emit('user_left_video', {
          userId: socket.user.id,
          userName: socket.user.name,
        });
        if (users.size === 0) videoRooms.delete(roomId);
      }
    }
  });
});

const PORT = config.port;
server.listen(PORT, () => {
  console.log(`SkillBridge server running on port ${PORT}`);
});

module.exports = { app, server, io };
