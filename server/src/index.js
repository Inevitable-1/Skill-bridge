const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const config = require('./config/constants');
const pool = require('./config/db');
const createTables = require('./config/migrate');
const seed = require('./seeds/seed');
const { verifyToken } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const skillRoutes = require('./routes/skills');
const sessionRoutes = require('./routes/sessions');
const chatRoutes = require('./routes/chat');
const videoRoutes = require('./routes/video');
const notificationRoutes = require('./routes/notifications');
const meetingRoutes = require('./routes/meetings');
const adminRoutes = require('./routes/admin');

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
app.use('/api/meetings', meetingRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const onlineUsers = new Map();
const videoRooms = new Map();
const meetingRooms = new Map();

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

  // ─── Meeting Room Events ─────────────────────────────────
  socket.on('join_meeting', (data) => {
    const { roomId, userName, isHost } = data;
    socket.join(`meeting_${roomId}`);

    if (!meetingRooms.has(roomId)) {
      meetingRooms.set(roomId, new Set());
    }

    const participantInfo = {
      socketId: socket.id,
      userId: socket.user.id,
      userName: userName || socket.user.name,
      isHost: isHost || false,
    };
    meetingRooms.get(roomId).add(participantInfo);

    // Send existing participants to the new user
    const existingParticipants = [];
    for (const p of meetingRooms.get(roomId)) {
      if (p.socketId !== socket.id) {
        existingParticipants.push(p);
      }
    }
    socket.emit('meeting_participants', { participants: existingParticipants });

    // Notify others that a new user joined
    socket.to(`meeting_${roomId}`).emit('user_joined_meeting', {
      userId: socket.user.id,
      userName: participantInfo.userName,
      socketId: socket.id,
      isHost: participantInfo.isHost,
    });

    // Store room reference on socket for cleanup
    socket.currentRoom = roomId;

    console.log(`${userName} joined meeting ${roomId} (host: ${isHost}, total: ${meetingRooms.get(roomId).size})`);
  });

  socket.on('leave_meeting', (data) => {
    const { roomId } = data;
    socket.leave(`meeting_${roomId}`);

    if (meetingRooms.has(roomId)) {
      for (const p of meetingRooms.get(roomId)) {
        if (p.socketId === socket.id) {
          meetingRooms.get(roomId).delete(p);
          break;
        }
      }
      if (meetingRooms.get(roomId).size === 0) {
        meetingRooms.delete(roomId);
      }
    }

    socket.to(`meeting_${roomId}`).emit('user_left_meeting', {
      userId: socket.user.id,
      userName: socket.user.name,
      socketId: socket.id,
    });

    console.log(`${socket.user.name} left meeting ${roomId}`);
  });

  socket.on('meeting_signal', (data) => {
    const { roomId, signal, targetSocketId } = data;
    io.to(targetSocketId).emit('meeting_signal', {
      signal,
      fromSocketId: socket.id,
      fromUserId: socket.user.id,
      fromUserName: socket.user.name,
    });
  });

  socket.on('meeting_chat_message', (data) => {
    const { roomId, message } = data;
    const chatMsg = {
      id: Date.now(),
      senderId: socket.user.id,
      senderName: socket.user.name,
      senderAvatar: socket.user.avatar_url,
      text: message,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
    io.to(`meeting_${roomId}`).emit('new_meeting_chat_message', chatMsg);
  });

  socket.on('toggle_meeting_hand', (data) => {
    const { roomId, isHandRaised } = data;
    socket.to(`meeting_${roomId}`).emit('user_toggled_hand', {
      userId: socket.user.id,
      socketId: socket.id,
      userName: socket.user.name,
      isHandRaised,
    });
  });

  socket.on('toggle_meeting_mute', (data) => {
    const { roomId, isMuted } = data;
    socket.to(`meeting_${roomId}`).emit('user_toggled_mute', {
      userId: socket.user.id,
      socketId: socket.id,
      userName: socket.user.name,
      isMuted,
    });
  });

  socket.on('toggle_meeting_camera', (data) => {
    const { roomId, isCameraOff } = data;
    socket.to(`meeting_${roomId}`).emit('user_toggled_camera', {
      userId: socket.user.id,
      socketId: socket.id,
      userName: socket.user.name,
      isCameraOff,
    });
  });

  socket.on('toggle_meeting_lock', (data) => {
    const { roomId, isLocked } = data;
    socket.to(`meeting_${roomId}`).emit('meeting_locked', {
      isLocked,
      lockedBy: socket.user.name,
    });
  });

  // ─── Whiteboard Sync ─────────────────────────────────────
  socket.on('whiteboard_draw', (data) => {
    const { roomId, drawData } = data;
    socket.to(`meeting_${roomId}`).emit('whiteboard_draw', {
      drawData,
      userId: socket.user.id,
      userName: socket.user.name,
    });
  });

  socket.on('whiteboard_clear', (data) => {
    const { roomId } = data;
    socket.to(`meeting_${roomId}`).emit('whiteboard_clear', {
      userId: socket.user.id,
    });
  });

  socket.on('whiteboard_undo', (data) => {
    const { roomId } = data;
    socket.to(`meeting_${roomId}`).emit('whiteboard_undo', {
      userId: socket.user.id,
    });
  });

  socket.on('whiteboard_redo', (data) => {
    const { roomId } = data;
    socket.to(`meeting_${roomId}`).emit('whiteboard_redo', {
      userId: socket.user.id,
    });
  });

  // ─── Code Editor Sync ────────────────────────────────────
  socket.on('code_change', (data) => {
    const { roomId, change } = data;
    socket.to(`meeting_${roomId}`).emit('code_change', {
      change,
      userId: socket.user.id,
      userName: socket.user.name,
    });
  });

  socket.on('code_language_change', (data) => {
    const { roomId, language } = data;
    socket.to(`meeting_${roomId}`).emit('code_language_change', {
      language,
      userId: socket.user.id,
    });
  });

  socket.on('code_cursor_move', (data) => {
    const { roomId, position } = data;
    socket.to(`meeting_${roomId}`).emit('code_cursor_move', {
      position,
      userId: socket.user.id,
      userName: socket.user.name,
    });
  });

  socket.on('code_full_sync', (data) => {
    const { roomId, code, language } = data;
    socket.to(`meeting_${roomId}`).emit('code_full_sync', {
      code,
      language,
      userId: socket.user.id,
    });
  });

  socket.on('end_meeting', (data) => {
    const { roomId } = data;
    io.to(`meeting_${roomId}`).emit('meeting_ended', { roomId });
    meetingRooms.delete(roomId);
  });

  socket.on('remove_participant', (data) => {
    const { roomId, targetSocketId } = data;
    io.to(targetSocketId).emit('removed_from_meeting', { roomId, reason: 'removed_by_host' });
    const targetSocket = io.sockets.sockets.get(targetSocketId);
    if (targetSocket) {
      targetSocket.leave(`meeting_${roomId}`);
    }
    if (meetingRooms.has(roomId)) {
      for (const p of meetingRooms.get(roomId)) {
        if (p.socketId === targetSocketId) {
          meetingRooms.get(roomId).delete(p);
          break;
        }
      }
    }
    socket.to(`meeting_${roomId}`).emit('user_left_meeting', {
      userId: null,
      userName: null,
      socketId: targetSocketId,
    });
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

    for (const [roomId, participants] of meetingRooms.entries()) {
      for (const p of participants) {
        if (p.socketId === socket.id) {
          participants.delete(p);
          io.to(`meeting_${roomId}`).emit('user_left_meeting', {
            userId: socket.user.id,
            userName: socket.user.name,
            socketId: socket.id,
          });
          break;
        }
      }
      if (participants.size === 0) {
        meetingRooms.delete(roomId);
      }
    }
  });
});

const PORT = config.port;

const startServer = async () => {
  try {
    await createTables();
    console.log('Database migration completed');

    await seed();
    console.log('Database seeded with demo accounts');
  } catch (err) {
    console.error('Database initialization error:', err);
  }

  server.listen(PORT, () => {
    console.log(`SkillBridge server running on port ${PORT}`);
  });
};

startServer();

module.exports = { app, server, io };
