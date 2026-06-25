import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || '';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.pendingListeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) return;

    try {
      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
        // Register any pending listeners
        this.pendingListeners.forEach((callbacks, event) => {
          callbacks.forEach(cb => this.socket.on(event, cb));
        });
        this.pendingListeners.clear();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
      });

      return this.socket;
    } catch (error) {
      console.error('Socket initialization failed:', error.message);
      return null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      this.pendingListeners.clear();
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  on(event, callback) {
    if (!this.socket) {
      // Socket not created yet, queue for later
      if (!this.pendingListeners.has(event)) {
        this.pendingListeners.set(event, []);
      }
      this.pendingListeners.get(event).push(callback);
      return;
    }
    if (this.socket.connected) {
      this.socket.on(event, callback);
    } else {
      // Socket exists but not connected yet, queue for when it connects
      if (!this.pendingListeners.has(event)) {
        this.pendingListeners.set(event, []);
      }
      this.pendingListeners.get(event).push(callback);
    }
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
    const cbs = this.listeners.get(event);
    if (cbs) {
      const idx = cbs.indexOf(callback);
      if (idx > -1) cbs.splice(idx, 1);
    }
    const pending = this.pendingListeners.get(event);
    if (pending) {
      const idx = pending.indexOf(callback);
      if (idx > -1) pending.splice(idx, 1);
    }
  }

  emit(event, data) {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }

  joinChat(roomId) {
    this.emit('join_chat', roomId);
  }

  leaveChat(roomId) {
    this.emit('leave_chat', roomId);
  }

  sendMessage(roomId, message) {
    this.emit('send_message', { roomId, message });
  }

  joinVideoRoom(roomId) {
    this.emit('join_video_room', roomId);
  }

  leaveVideoRoom(roomId) {
    this.emit('leave_video_room', roomId);
  }

  sendVideoOffer(roomId, offer, targetUserId) {
    this.emit('video_offer', { roomId, offer, targetUserId });
  }

  sendVideoAnswer(roomId, answer, targetUserId) {
    this.emit('video_answer', { roomId, answer, targetUserId });
  }

  sendIceCandidate(roomId, candidate, targetUserId) {
    this.emit('ice_candidate', { roomId, candidate, targetUserId });
  }

  sendWhiteboardUpdate(roomId, drawing) {
    this.emit('whiteboard_update', { roomId, drawing });
  }

  sendNotesUpdate(roomId, notes) {
    this.emit('notes_update', { roomId, notes });
  }

  sendScreenShareStarted(roomId) {
    this.emit('screen_share_started', { roomId });
  }

  sendScreenShareStopped(roomId) {
    this.emit('screen_share_stopped', { roomId });
  }
}

export const socketService = new SocketService();
export default socketService;
