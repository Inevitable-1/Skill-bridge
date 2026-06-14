import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import socketService from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, token, isAuthenticated } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    socketService.on('user_online', ({ userId, isOnline }) => {
      setOnlineUsers((prev) => {
        const next = new Map(prev);
        if (isOnline) {
          next.set(userId, true);
        } else {
          next.delete(userId);
        }
        return next;
      });
    });

    socketService.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socketService.on('message_notification', (data) => {
      setNotifications((prev) => [
        {
          type: 'message',
          title: 'New Message',
          message: data.message.sender_name + ': ' + data.message.message,
          data: { roomId: data.roomId },
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    return () => {
      socketService.off('user_online');
      socketService.off('notification');
      socketService.off('message_notification');
    };
  }, [isAuthenticated, token]);

  const isUserOnline = useCallback(
    (userId) => onlineUsers.has(userId),
    [onlineUsers]
  );

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const value = {
    socket: socketService,
    onlineUsers,
    notifications,
    unreadCount,
    isUserOnline,
    addNotification,
    clearUnread,
    setNotifications,
    setUnreadCount,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
