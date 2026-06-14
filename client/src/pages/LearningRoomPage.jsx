import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { sessionAPI, videoAPI } from '../services/api';
import { useWebRTC } from '../hooks/useWebRTC';
import {
  Video, VideoOff, Mic, MicOff, MonitorUp, MessageCircle,
  PenTool, FileText, PhoneOff, Send, Users, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LearningRoomPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [session, setSession] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [drawing, setDrawing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPoint = useRef(null);

  const {
    localStream, remoteStream, isMuted, isVideoOff, isScreenSharing,
    startLocalStream, call, answer, handleAnswer, handleIceCandidate,
    toggleMute, toggleVideo, toggleScreenShare, hangup
  } = useWebRTC(roomId, user?.id, socket?.getSocket());

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await sessionAPI.getById(sessionId);
        setSession(res.data.session);

        const roomRes = await videoAPI.createRoom(sessionId);
        setRoomId(roomRes.data.roomId);
      } catch (error) {
        toast.error('Failed to load session');
        navigate('/sessions');
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, [sessionId, navigate]);

  useEffect(() => {
    if (!roomId || !socket?.getSocket()) return;

    const handleUserJoined = async ({ userId, userName }) => {
      toast(`${userName} joined the room`);
      const stream = await startLocalStream();
      if (stream) {
        call(userId);
      }
    };

    const handleUserLeft = ({ userName }) => {
      toast(`${userName} left the room`);
    };

    const handleOffer = async ({ offer, fromUserId }) => {
      await answer(offer, fromUserId);
    };

    const handleAnswerSignal = async ({ answer: ans }) => {
      await handleAnswer(ans);
    };

    const handleIce = async ({ candidate }) => {
      await handleIceCandidate(candidate);
    };

    const handleNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleNotes = ({ notes: newNotes }) => {
      setNotes(newNotes);
    };

    const handleWhiteboard = ({ drawing: newDrawing }) => {
      setDrawing(newDrawing);
    };

    socket.on('user_joined_video', handleUserJoined);
    socket.on('user_left_video', handleUserLeft);
    socket.on('video_offer', handleOffer);
    socket.on('video_answer', handleAnswerSignal);
    socket.on('ice_candidate', handleIce);
    socket.on('new_message', handleNewMessage);
    socket.on('notes_update', handleNotes);
    socket.on('whiteboard_update', handleWhiteboard);

    socket.joinVideoRoom(roomId);

    return () => {
      socket.off('user_joined_video', handleUserJoined);
      socket.off('user_left_video', handleUserLeft);
      socket.off('video_offer', handleOffer);
      socket.off('video_answer', handleAnswerSignal);
      socket.off('ice_candidate', handleIce);
      socket.off('new_message', handleNewMessage);
      socket.off('notes_update', handleNotes);
      socket.off('whiteboard_update', handleWhiteboard);
      socket.leaveVideoRoom(roomId);
    };
  }, [roomId, socket, startLocalStream, call, answer, handleAnswer, handleIceCandidate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (localStream && canvasRef.current) {
      const video = document.getElementById('local-video');
      if (video) video.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream) {
      const video = document.getElementById('remote-video');
      if (video) video.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    socket.sendMessage(roomId, newMessage.trim());
    const msg = {
      id: Date.now(),
      sender_id: user.id,
      sender_name: user.name,
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage('');
  };

  const handleNotesChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    socket.sendNotesUpdate(roomId, val);
  };

  const handleHangup = () => {
    hangup();
    videoAPI.leaveRoom(roomId);
    navigate('/sessions');
  };

  // Whiteboard drawing
  const startDraw = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    lastPoint.current = { x, y };
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();

    const newDrawing = [...drawing, { from: lastPoint.current, to: { x, y } }];
    setDrawing(newDrawing);
    socket.sendWhiteboardUpdate(roomId, newDrawing);
    lastPoint.current = { x, y };
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setDrawing([]);
    socket.sendWhiteboardUpdate(roomId, []);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      {/* Video Section */}
      <div className="flex-1 flex flex-col bg-gray-900 relative">
        {/* Video Grid */}
        <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Remote Video */}
          <div className="relative bg-gray-800 rounded-2xl overflow-hidden flex items-center justify-center">
            {remoteStream ? (
              <video
                id="remote-video"
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl text-gray-400">
                    {session?.mentor_name?.charAt(0) || 'M'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">Waiting for participant...</p>
              </div>
            )}
            <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/50 rounded-lg text-white text-xs">
              {session?.mentor_name || 'Mentor'}
            </div>
          </div>

          {/* Local Video */}
          <div className="relative bg-gray-800 rounded-2xl overflow-hidden flex items-center justify-center">
            {localStream && !isVideoOff ? (
              <video
                id="local-video"
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
                style={{ transform: 'scaleX(-1)' }}
              />
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary-900 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl text-primary-400">
                    {user?.name?.charAt(0) || 'Y'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">Camera off</p>
              </div>
            )}
            <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/50 rounded-lg text-white text-xs">
              You
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 px-6 py-4">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
              } text-white`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
              } text-white`}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleScreenShare}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isScreenSharing ? 'bg-primary-500 hover:bg-primary-600' : 'bg-gray-700 hover:bg-gray-600'
              } text-white`}
            >
              <MonitorUp className="w-5 h-5" />
            </button>
            <button
              onClick={handleHangup}
              className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-all"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-full lg:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          {[
            { id: 'chat', icon: MessageCircle, label: 'Chat' },
            { id: 'notes', icon: FileText, label: 'Notes' },
            { id: 'whiteboard', icon: PenTool, label: 'Board' },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Chat */}
          {activeTab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => {
                  const isOwn = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id || idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                          isOwn
                            ? 'bg-primary-600 text-white rounded-br-md'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
                        }`}
                      >
                        {!isOwn && (
                          <p className="text-[10px] font-medium mb-0.5 opacity-70">
                            {msg.sender_name}
                          </p>
                        )}
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="input-field text-sm"
                  />
                  <button type="submit" className="btn-primary px-3 py-2">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Notes */}
          {activeTab === 'notes' && (
            <div className="flex-1 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm text-gray-900 dark:text-white">Shared Notes</h3>
                <span className="text-[10px] text-gray-400">Synced in real-time</span>
              </div>
              <textarea
                value={notes}
                onChange={handleNotesChange}
                className="w-full h-[calc(100%-3rem)] resize-none input-field text-sm font-mono"
                placeholder="Start taking notes here..."
              />
            </div>
          )}

          {/* Whiteboard */}
          {activeTab === 'whiteboard' && (
            <div className="flex-1 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm text-gray-900 dark:text-white">Whiteboard</h3>
                <button onClick={clearCanvas} className="btn-ghost text-xs">
                  Clear
                </button>
              </div>
              <canvas
                ref={canvasRef}
                width={400}
                height={500}
                className="w-full flex-1 bg-white border border-gray-200 rounded-xl cursor-crosshair"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
