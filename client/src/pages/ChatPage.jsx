import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatAPI } from '../services/api';
import { Send, Search, MessageCircle, ArrowLeft, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket();
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const startUserId = searchParams.get('start');

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await chatAPI.getRooms();
        setRooms(res.data.chatRooms);

        if (startUserId) {
          const chatRes = await chatAPI.startChat(startUserId);
          const existingRoom = res.data.chatRooms.find(
            (r) => r.id === chatRes.data.roomId
          );
          if (!existingRoom) {
            setRooms((prev) => [
              {
                id: chatRes.data.roomId,
                other_user_id: chatRes.data.otherUser.id,
                other_user_name: chatRes.data.otherUser.name,
                other_user_avatar: chatRes.data.otherUser.avatar_url,
                other_user_online: chatRes.data.otherUser.is_online,
              },
              ...prev,
            ]);
          }
          selectRoom(chatRes.data.roomId);
        }
      } catch (error) {
        console.error('Load rooms error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, [startUserId]);

  useEffect(() => {
    if (!socket?.getSocket()) return;

    const handleNewMessage = (message) => {
      if (activeRoom && message.chat_room_id === activeRoom) {
        setMessages((prev) => [...prev, message]);
      }
      setRooms((prev) =>
        prev.map((r) =>
          r.id === message.chat_room_id
            ? { ...r, last_message: message.message, last_message_at: message.created_at }
            : r
        )
      );
    };

    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, [socket, activeRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectRoom = async (roomId) => {
    setActiveRoom(roomId);
    socket.joinChat(roomId);
    try {
      const res = await chatAPI.getMessages(roomId);
      setMessages(res.data.messages);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom) return;

    setSending(true);
    try {
      socket.sendMessage(activeRoom, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const activeRoomData = rooms.find((r) => r.id === activeRoom);

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <div
        className={`w-full md:w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col ${
          activeRoom ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="input-field pl-10 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-3 p-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No conversations yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => selectRoom(room.id)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left ${
                    activeRoom === room.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <div className="relative">
                    {room.other_user_avatar ? (
                      <img
                        src={room.other_user_avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <span className="text-primary-600 text-sm font-medium">
                          {room.other_user_name?.charAt(0)}
                        </span>
                      </div>
                    )}
                    {room.other_user_online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {room.other_user_name}
                      </p>
                      {room.unread_count > 0 && (
                        <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                          {room.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {room.last_message || 'No messages yet'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 ${
          !activeRoom ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveRoom(null)}
                  className="md:hidden btn-ghost p-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {activeRoomData?.other_user_avatar ? (
                  <img
                    src={activeRoomData.other_user_avatar}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <span className="text-primary-600 text-sm font-medium">
                      {activeRoomData?.other_user_name?.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {activeRoomData?.other_user_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activeRoomData?.other_user_online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                        isOwn
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isOwn ? 'text-white/60' : 'text-gray-400'
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="btn-primary px-4 py-3 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose from your existing chats or start a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
