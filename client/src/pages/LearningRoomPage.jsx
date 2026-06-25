import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { sessionAPI, videoAPI } from '../services/api';
import { useWebRTC } from '../hooks/useWebRTC';
import {
  Video, VideoOff, Mic, MicOff, MonitorUp, PhoneOff, Send,
  PenTool, Code, Bot, MessageCircle, FileText, Map
} from 'lucide-react';
import toast from 'react-hot-toast';
import CollaborativeWhiteboard from '../components/workspace/CollaborativeWhiteboard';
import CodeEditor from '../components/workspace/CodeEditor';
import AIExplanationPanel from '../components/workspace/AIExplanationPanel';

const TABS = [
  { id: 'video', icon: Video, label: 'Video' },
  { id: 'whiteboard', icon: PenTool, label: 'Whiteboard' },
  { id: 'code', icon: Code, label: 'Code' },
  { id: 'ai', icon: Bot, label: 'AI' },
  { id: 'chat', icon: MessageCircle, label: 'Chat' },
  { id: 'notes', icon: FileText, label: 'Notes' },
  { id: 'roadmap', icon: Map, label: 'Roadmap' },
];

const ROADMAP_STEPS = {
  'React': [
    { title: 'JSX & Components', desc: 'Learn JSX syntax and functional components', status: 'completed' },
    { title: 'Props & State', desc: 'Understand data flow with props and useState', status: 'completed' },
    { title: 'Hooks Deep Dive', desc: 'Master useEffect, useRef, useContext, useReducer', status: 'in-progress' },
    { title: 'Performance', desc: 'React.memo, useMemo, useCallback optimization', status: 'pending' },
    { title: 'Advanced Patterns', desc: 'Compound components, render props, HOCs', status: 'pending' },
    { title: 'Testing', desc: 'Unit and integration testing with Jest & React Testing Library', status: 'pending' },
  ],
  'JavaScript': [
    { title: 'Fundamentals', desc: 'Variables, types, operators, control flow', status: 'completed' },
    { title: 'Functions & Scope', desc: 'Closures, hoisting, execution context', status: 'completed' },
    { title: 'Async Programming', desc: 'Promises, async/await, event loop', status: 'in-progress' },
    { title: 'ES6+ Features', desc: 'Destructuring, spread, modules, optional chaining', status: 'pending' },
    { title: 'DOM Manipulation', desc: 'Events, traversal, manipulation APIs', status: 'pending' },
    { title: 'Design Patterns', desc: 'Observer, Factory, Singleton, Module patterns', status: 'pending' },
  ],
  'Python': [
    { title: 'Syntax & Basics', desc: 'Variables, data types, operators', status: 'completed' },
    { title: 'Data Structures', desc: 'Lists, dicts, sets, tuples, comprehensions', status: 'completed' },
    { title: 'OOP', desc: 'Classes, inheritance, polymorphism, dunder methods', status: 'in-progress' },
    { title: 'File I/O & Error Handling', desc: 'Context managers, exceptions, logging', status: 'pending' },
    { title: 'Decorators & Generators', desc: 'Advanced Python patterns', status: 'pending' },
    { title: 'Testing & Packaging', desc: 'pytest, virtual envs, pip packaging', status: 'pending' },
  ],
  'TypeScript': [
    { title: 'Type Basics', desc: 'Primitive types, interfaces, type aliases', status: 'completed' },
    { title: 'Generics', desc: 'Generic functions, classes, constraints', status: 'completed' },
    { title: 'Utility Types', desc: 'Partial, Pick, Omit, Record, conditional types', status: 'in-progress' },
    { title: 'Advanced Typing', desc: 'Discriminated unions, mapped types, template literals', status: 'pending' },
    { title: 'Type Guards', desc: 'Runtime type narrowing and assertion functions', status: 'pending' },
    { title: 'Project Config', desc: 'tsconfig, path aliases, declaration files', status: 'pending' },
  ],
  'Node.js': [
    { title: 'Core Modules', desc: 'fs, path, http, events, streams', status: 'completed' },
    { title: 'Express Basics', desc: 'Routing, middleware, request/response', status: 'completed' },
    { title: 'REST API Design', desc: 'CRUD, status codes, versioning, validation', status: 'in-progress' },
    { title: 'Authentication', desc: 'JWT, sessions, OAuth, password hashing', status: 'pending' },
    { title: 'Database Integration', desc: 'MongoDB/PostgreSQL with ORMs', status: 'pending' },
    { title: 'Production', desc: 'Docker, PM2, logging, monitoring', status: 'pending' },
  ],
};

const DEFAULT_ROADMAP = [
  { title: 'Foundations', desc: 'Core concepts and fundamentals', status: 'completed' },
  { title: 'Intermediate', desc: 'Building real projects', status: 'completed' },
  { title: 'Advanced Topics', desc: 'Deep dive into complex areas', status: 'in-progress' },
  { title: 'Best Practices', desc: 'Code quality, patterns, conventions', status: 'pending' },
  { title: 'Testing & Deployment', desc: 'CI/CD, monitoring, production readiness', status: 'pending' },
  { title: 'Mastery', desc: 'Teaching, contributing, architecture decisions', status: 'pending' },
];

export default function LearningRoomPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [session, setSession] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [activeTab, setActiveTab] = useState('video');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [editorCode, setEditorCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionDuration, setSessionDuration] = useState(0);
  const messagesEndRef = useRef(null);

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
    const timer = setInterval(() => setSessionDuration((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!roomId || !socket?.getSocket()) return;

    const handleUserJoined = async ({ userId, userName }) => {
      toast(`${userName} joined the room`);
      const stream = await startLocalStream();
      if (stream) call(userId);
    };
    const handleUserLeft = ({ userName }) => toast(`${userName} left the room`);
    const handleOffer = async ({ offer, fromUserId }) => await answer(offer, fromUserId);
    const handleAnswerSignal = async ({ answer: ans }) => await handleAnswer(ans);
    const handleIce = async ({ candidate }) => await handleIceCandidate(candidate);
    const handleNewMessage = (message) => setMessages((prev) => [...prev, message]);
    const handleNotes = ({ notes: newNotes }) => setNotes(newNotes);

    socket.on('user_joined_video', handleUserJoined);
    socket.on('user_left_video', handleUserLeft);
    socket.on('video_offer', handleOffer);
    socket.on('video_answer', handleAnswerSignal);
    socket.on('ice_candidate', handleIce);
    socket.on('new_message', handleNewMessage);
    socket.on('notes_update', handleNotes);
    socket.joinVideoRoom(roomId);

    return () => {
      socket.off('user_joined_video', handleUserJoined);
      socket.off('user_left_video', handleUserLeft);
      socket.off('video_offer', handleOffer);
      socket.off('video_answer', handleAnswerSignal);
      socket.off('ice_candidate', handleIce);
      socket.off('new_message', handleNewMessage);
      socket.off('notes_update', handleNotes);
      socket.leaveVideoRoom(roomId);
    };
  }, [roomId, socket, startLocalStream, call, answer, handleAnswer, handleIceCandidate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (localStream) {
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

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const roadmapSteps = ROADMAP_STEPS[session?.skill_name] || DEFAULT_ROADMAP;

  const statusColors = {
    'completed': 'bg-emerald-500',
    'in-progress': 'bg-amber-500',
    'pending': 'bg-gray-300 dark:bg-gray-600',
  };

  const statusLabels = {
    'completed': 'Completed',
    'in-progress': 'In Progress',
    'pending': 'Not Started',
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-950">
      {/* Room Info Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white">{session?.skill_name || 'Session'}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-600/20 text-primary-400 font-medium">
            {session?.session_type === '1-on-1' ? '1-on-1 Mentoring' : session?.session_type || 'Learning Session'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>with <span className="text-white font-medium">{session?.mentor_name || session?.learner_name || 'Participant'}</span></span>
          <span className="tabular-nums">{formatDuration(sessionDuration)}</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center px-4 gap-1 bg-gray-900 border-b border-gray-800 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'text-primary-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Video Tab */}
        {activeTab === 'video' && (
          <div className="h-full p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-950">
            {/* Remote Video */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-800">
              {remoteStream ? (
                <video id="remote-video" autoPlay playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl text-gray-400">{session?.mentor_name?.charAt(0) || 'M'}</span>
                  </div>
                  <p className="text-gray-500 text-sm">Waiting for participant...</p>
                </div>
              )}
              <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                {session?.mentor_name || 'Mentor'}
              </div>
            </div>

            {/* Local Video */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-800">
              {localStream && !isVideoOff ? (
                <video id="local-video" autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary-900/50 flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl text-primary-400">{user?.name?.charAt(0) || 'Y'}</span>
                  </div>
                  <p className="text-gray-500 text-sm">Camera off</p>
                </div>
              )}
              <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                You
              </div>
            </div>
          </div>
        )}

        {/* Whiteboard Tab */}
        {activeTab === 'whiteboard' && (
          <div className="h-full">
            <CollaborativeWhiteboard roomId={roomId} socket={socket} />
          </div>
        )}

        {/* Code Tab */}
        {activeTab === 'code' && (
          <div className="h-full">
            <CodeEditor roomId={roomId} socket={socket} onCodeChange={setEditorCode} />
          </div>
        )}

        {/* AI Tab */}
        {activeTab === 'ai' && (
          <div className="h-full">
            <AIExplanationPanel code={editorCode} language={session?.skill_name?.toLowerCase() || 'javascript'} />
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageCircle className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              )}
              {messages.map((msg, idx) => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <div key={msg.id || idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                      isOwn
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-gray-800 text-white rounded-bl-md'
                    }`}>
                      {!isOwn && (
                        <p className="text-[10px] font-medium mb-0.5 opacity-70">{msg.sender_name}</p>
                      )}
                      <p>{msg.message}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-800 bg-gray-900">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                <button type="submit" className="px-3 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="h-full p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm text-white">Shared Notes</h3>
              <span className="text-[10px] text-gray-500">Synced in real-time</span>
            </div>
            <textarea
              value={notes}
              onChange={handleNotesChange}
              className="flex-1 w-full resize-none bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder="Start taking notes here..."
            />
          </div>
        )}

        {/* Roadmap Tab */}
        {activeTab === 'roadmap' && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold text-white mb-1">Learning Roadmap</h2>
              <p className="text-sm text-gray-400 mb-6">
                Track your progress for <span className="text-primary-400 font-medium">{session?.skill_name || 'this skill'}</span>
              </p>

              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-800" />

                <div className="space-y-1">
                  {roadmapSteps.map((step, idx) => (
                    <div key={idx} className="relative flex gap-4 py-3">
                      <div className="relative z-10 mt-1">
                        <div className={`w-3 h-3 rounded-full border-2 border-gray-950 ${statusColors[step.status]}`} />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-sm font-medium ${
                            step.status === 'completed' ? 'text-emerald-400' :
                            step.status === 'in-progress' ? 'text-amber-400' : 'text-gray-400'
                          }`}>
                            {step.title}
                          </h4>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            step.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                            step.status === 'in-progress' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-500'
                          }`}>
                            {statusLabels[step.status]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Controls - Always Visible */}
      <div className="bg-gray-900 border-t border-gray-800 px-6 py-3">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            } text-white`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            } text-white`}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              isScreenSharing ? 'bg-primary-500 hover:bg-primary-600' : 'bg-gray-700 hover:bg-gray-600'
            } text-white`}
          >
            <MonitorUp className="w-5 h-5" />
          </button>
          <button
            onClick={handleHangup}
            className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-all duration-200"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
