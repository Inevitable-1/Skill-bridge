import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socketService from '../services/socket';
import {
  Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, Phone, MessageSquare,
  Users, Hand, Share2, Copy, Check, X, Send, Code, PenTool,
  Lock, Unlock, UserX, Circle, LayoutGrid, Maximize2,
  Presentation, FileText, Brain, Smile,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { getMeetingLink, copyMeetingLink, getWhatsAppShareUrl } from '../utils/meetingLink';
import CollaborativeWhiteboard from '../components/workspace/CollaborativeWhiteboard';
import CodeEditor from '../components/workspace/CodeEditor';
import SharedNotes from '../components/workspace/SharedNotes';
import EmojiPicker from '../components/workspace/EmojiPicker';

const LAYOUTS = [
  { id: 'grid', icon: LayoutGrid, label: 'Grid View' },
  { id: 'speaker', icon: Maximize2, label: 'Speaker View' },
  { id: 'coding', icon: Code, label: 'Coding Mode' },
  { id: 'whiteboard', icon: PenTool, label: 'Whiteboard Mode' },
  { id: 'presentation', icon: Presentation, label: 'Presentation' },
];

const iceConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function VideoTile({ participant, isLocal, isSpeaking, large }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && participant.stream) videoRef.current.srcObject = participant.stream;
  }, [participant.stream]);

  const initials = participant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={`relative rounded-xl overflow-hidden bg-gray-800 ${large ? 'min-h-[300px]' : 'min-h-[140px]'} ${isSpeaking ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-gray-950' : ''}`}>
      {participant.isCameraOff ? (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className={`${large ? 'w-20 h-20 text-2xl' : 'w-12 h-12 text-sm'} rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white font-bold`}>
              {initials}
            </div>
            <VideoOff className={`${large ? 'w-6 h-6' : 'w-4 h-4'} text-white/40`} />
          </div>
        </div>
      ) : (
        <video ref={videoRef} autoPlay playsInline muted={isLocal} className="w-full h-full object-cover" />
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-white text-xs font-medium truncate max-w-[120px]">{participant.name}{isLocal ? ' (You)' : ''}</span>
            {participant.isHost && <span className="px-1 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] font-semibold rounded">HOST</span>}
          </div>
          <div className="flex items-center gap-1">
            {participant.isHandRaised && (
              <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                <Hand className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              </motion.div>
            )}
            {participant.isMuted ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
          </div>
        </div>
      </div>
      {isSpeaking && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1 bg-emerald-500/20 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
            <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-[9px] font-medium">Speaking</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MeetingRoomPage() {
  const { code } = useParams();
  const meetingId = code;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const meetingInfo = location.state || { title: 'Meeting', subject: '' };

  const [meetingData, setMeetingData] = useState(null);
  const isHost = meetingData ? meetingData.host_id === user?.id : false;
  const roomId = meetingId;
  const userName = user?.name || 'Anonymous';

  const [participants, setParticipants] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [meetingTime, setMeetingTime] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isLocked, setIsLocked] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [joined, setJoined] = useState(true);
  const [layout, setLayout] = useState('grid');
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [splitView, setSplitView] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const remoteStreamsRef = useRef(new Map());
  const chatEndRef = useRef(null);
  const screenShareStreamRef = useRef(null);
  const meetingTimeRef = useRef(null);
  const prevChatLenRef = useRef(0);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const { data } = await api.get(`/meetings/${code}`);
        setMeetingData(data.meeting || data);
      } catch (err) {
        console.error('Failed to fetch meeting:', err);
      }
    };
    fetchMeeting();
  }, [code]);

  useEffect(() => {
    const interval = setInterval(() => setMeetingTime(prev => prev + 1), 1000);
    meetingTimeRef.current = interval;
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (activePanel !== 'chat') {
      const newMessages = chatMessages.length - prevChatLenRef.current;
      if (newMessages > 0) {
        const lastMsg = chatMessages[chatMessages.length - 1];
        if (lastMsg && !lastMsg.isSelf) setUnreadCount(prev => prev + newMessages);
      }
    } else {
      setUnreadCount(0);
    }
    prevChatLenRef.current = chatMessages.length;
  }, [chatMessages.length, activePanel]);

  const togglePanel = useCallback((panel) => {
    setActivePanel(prev => prev === panel ? null : panel);
  }, []);

  const createPeerConnection = useCallback((socketId, peerName, peerIsHost) => {
    if (peerConnectionsRef.current.has(socketId)) return peerConnectionsRef.current.get(socketId);
    const pc = new RTCPeerConnection(iceConfig);
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    pc.onicecandidate = (event) => {
      if (event.candidate) socketService.emit('meeting_signal', { roomId, signal: { type: 'candidate', candidate: event.candidate }, targetSocketId: socketId });
    };
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        remoteStreamsRef.current.set(socketId, remoteStream);
        setParticipants(prev => {
          const exists = prev.find(p => p.socketId === socketId);
          if (exists) return prev.map(p => p.socketId === socketId ? { ...p, stream: remoteStream } : p);
          return [...prev, { id: socketId, name: peerName, stream: remoteStream, isHost: peerIsHost, socketId, isMuted: false, isCameraOff: false, isHandRaised: false }];
        });
      }
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setParticipants(prev => prev.filter(p => p.socketId !== socketId));
        peerConnectionsRef.current.delete(socketId);
        remoteStreamsRef.current.delete(socketId);
      }
    };
    peerConnectionsRef.current.set(socketId, pc);
    return pc;
  }, [roomId]);

  const createOffer = useCallback(async (socketId) => {
    const pc = peerConnectionsRef.current.get(socketId);
    if (!pc) return;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketService.emit('meeting_signal', { roomId, signal: { type: 'offer', sdp: pc.localDescription }, targetSocketId: socketId });
    } catch (err) { console.error('Error creating offer:', err); }
  }, [roomId]);

  useEffect(() => {
    let mounted = true;
    if (!meetingData) return;

    const handleParticipants = (data) => {
      const { participants: existingParticipants } = data;
      if (!existingParticipants) return;
      existingParticipants.forEach(({ socketId: peerSocketId, userName: peerName, isHost: peerIsHost }) => {
        createPeerConnection(peerSocketId, peerName, peerIsHost);
        createOffer(peerSocketId);
      });
    };
    const handleUserJoined = (data) => { const { socketId: peerSocketId, userName: peerName, isHost: peerIsHost } = data; createPeerConnection(peerSocketId, peerName, peerIsHost); };
    const handleSignal = async (data) => {
      const { signal, fromSocketId } = data;
      if (signal.type === 'offer') {
        let pc = peerConnectionsRef.current.get(fromSocketId);
        if (!pc) pc = createPeerConnection(fromSocketId, 'Participant', false);
        try { await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp)); const answer = await pc.createAnswer(); await pc.setLocalDescription(answer); socketService.emit('meeting_signal', { roomId, signal: { type: 'answer', sdp: pc.localDescription }, targetSocketId: fromSocketId }); } catch (err) { console.error('Error handling offer:', err); }
      } else if (signal.type === 'answer') {
        const pc = peerConnectionsRef.current.get(fromSocketId);
        if (pc) try { await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp)); } catch (err) { console.error('Error handling answer:', err); }
      } else if (signal.type === 'candidate') {
        const pc = peerConnectionsRef.current.get(fromSocketId);
        if (pc) try { await pc.addIceCandidate(new RTCIceCandidate(signal.candidate)); } catch (err) { console.error('Error adding ICE candidate:', err); }
      }
    };
    const handleUserLeft = (data) => {
      const { socketId: peerSocketId } = data;
      const pc = peerConnectionsRef.current.get(peerSocketId);
      if (pc) { pc.close(); peerConnectionsRef.current.delete(peerSocketId); }
      remoteStreamsRef.current.delete(peerSocketId);
      setParticipants(prev => prev.filter(p => p.socketId !== peerSocketId));
    };
    const handleChatMessage = (data) => {
      const { senderName, message, timestamp } = data;
      setChatMessages(prev => [...prev, { id: Date.now() + Math.random(), senderName, text: message, time: new Date(timestamp || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }), isSelf: senderName === userName }]);
    };
    const handleUserToggledHand = (data) => setParticipants(prev => prev.map(p => p.socketId === data.socketId ? { ...p, isHandRaised: data.isHandRaised } : p));
    const handleUserToggledMute = (data) => setParticipants(prev => prev.map(p => p.socketId === data.socketId ? { ...p, isMuted: data.isMuted } : p));
    const handleUserToggledCamera = (data) => setParticipants(prev => prev.map(p => p.socketId === data.socketId ? { ...p, isCameraOff: data.isCameraOff } : p));
    const handleMeetingEnded = () => { toast('Meeting has been ended by the host'); navigate('/dashboard'); };
    const handleMeetingLocked = (data) => { setIsLocked(data.isLocked); toast(data.isLocked ? 'Meeting has been locked by the host' : 'Meeting has been unlocked'); };
    const handleRemovedFromMeeting = () => { toast.error('You have been removed from the meeting'); if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop()); navigate('/dashboard'); };
    const handleUserMutedByHost = (data) => {
      setIsMuted(data.isMuted);
      if (localStreamRef.current) { const audioTrack = localStreamRef.current.getAudioTracks()[0]; if (audioTrack) audioTrack.enabled = !data.isMuted; }
      setParticipants(prev => prev.map(p => p.socketId === 'local' ? { ...p, isMuted: data.isMuted } : p));
      if (data.isMuted) toast('You have been muted by the host');
    };

    socketService.on('meeting_participants', handleParticipants);
    socketService.on('user_joined_meeting', handleUserJoined);
    socketService.on('meeting_signal', handleSignal);
    socketService.on('user_left_meeting', handleUserLeft);
    socketService.on('new_meeting_chat_message', handleChatMessage);
    socketService.on('user_toggled_hand', handleUserToggledHand);
    socketService.on('user_toggled_mute', handleUserToggledMute);
    socketService.on('user_toggled_camera', handleUserToggledCamera);
    socketService.on('meeting_ended', handleMeetingEnded);
    socketService.on('meeting_locked', handleMeetingLocked);
    socketService.on('removed_from_meeting', handleRemovedFromMeeting);
    socketService.on('user_muted_by_host', handleUserMutedByHost);

    const initMeeting = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        localStreamRef.current = stream; setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setParticipants([{ id: 'local', name: userName, stream, isHost, socketId: 'local', isMuted: false, isCameraOff: false, isHandRaised: false }]);
        socketService.emit('join_meeting', { roomId, userName, isHost });
        setConnectionStatus('connected');
      } catch (err) { console.error('Failed to get media devices:', err); toast.error('Could not access camera/microphone'); setConnectionStatus('disconnected'); }
    };
    initMeeting();

    return () => {
      mounted = false;
      ['meeting_participants', 'user_joined_meeting', 'meeting_signal', 'user_left_meeting', 'new_meeting_chat_message', 'user_toggled_hand', 'user_toggled_mute', 'user_toggled_camera', 'meeting_ended', 'meeting_locked', 'removed_from_meeting', 'user_muted_by_host'].forEach(evt => socketService.off(evt));
      if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(track => track.stop()); localStreamRef.current = null; }
      peerConnectionsRef.current.forEach(pc => pc.close()); peerConnectionsRef.current.clear(); remoteStreamsRef.current.clear();
      socketService.emit('leave_meeting', { roomId });
    };
  }, [roomId, userName, isHost, meetingData, navigate, createPeerConnection, createOffer]);

  useEffect(() => {
    const analyzers = new Map();
    let animationFrame;
    const checkSpeaking = () => {
      let loudestId = null; let loudestVol = 0;
      for (const [socketId, analyser] of analyzers) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        if (avg > 15 && avg > loudestVol) { loudestVol = avg; loudestId = socketId; }
      }
      setSpeakingId(loudestId);
      animationFrame = requestAnimationFrame(checkSpeaking);
    };
    const setupAnalyzers = () => {
      analyzers.forEach((_, key) => { if (!remoteStreamsRef.current.has(key)) { analyzers.get(key)?.disconnect?.(); analyzers.delete(key); } });
      for (const [socketId, stream] of remoteStreamsRef.current) {
        if (analyzers.has(socketId)) continue;
        const audioTrack = stream.getAudioTracks()[0];
        if (!audioTrack || audioTrack.muted) continue;
        try { const ctx = new AudioContext(); const source = ctx.createMediaStreamSource(new MediaStream([audioTrack])); const analyser = ctx.createAnalyser(); analyser.fftSize = 256; source.connect(analyser); analyzers.set(socketId, analyser); } catch {}
      }
    };
    setupAnalyzers(); animationFrame = requestAnimationFrame(checkSpeaking);
    return () => { cancelAnimationFrame(animationFrame); analyzers.forEach(a => a.disconnect?.()); };
  }, [participants.length]);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      const newMuted = !audioTrack.enabled;
      setIsMuted(newMuted);
      socketService.emit('toggle_meeting_mute', { roomId, isMuted: newMuted });
      setParticipants(prev => prev.map(p => p.socketId === 'local' ? { ...p, isMuted: newMuted } : p));
    }
  }, [roomId]);

  const toggleCamera = useCallback(() => {
    if (!localStreamRef.current) return;
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      const newCameraOff = !videoTrack.enabled;
      setIsCameraOn(!newCameraOff);
      socketService.emit('toggle_meeting_camera', { roomId, isCameraOff: newCameraOff });
      setParticipants(prev => prev.map(p => p.socketId === 'local' ? { ...p, isCameraOff: newCameraOff } : p));
    }
  }, [roomId]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      if (screenShareStreamRef.current) { screenShareStreamRef.current.getTracks().forEach(t => t.stop()); screenShareStreamRef.current = null; }
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) peerConnectionsRef.current.forEach(pc => { const sender = pc.getSenders().find(s => s.track?.kind === 'video'); if (sender) sender.replaceTrack(videoTrack); });
      }
      setIsScreenSharing(false); socketService.emit('screen_share_stopped', { roomId }); toast.success('Screen sharing stopped');
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenShareStreamRef.current = screenStream;
        peerConnectionsRef.current.forEach(pc => { const sender = pc.getSenders().find(s => s.track?.kind === 'video'); if (sender) sender.replaceTrack(screenTrack); });
        screenTrack.onended = () => {
          if (localStreamRef.current) { const videoTrack = localStreamRef.current.getVideoTracks()[0]; if (videoTrack) peerConnectionsRef.current.forEach(pc => { const sender = pc.getSenders().find(s => s.track?.kind === 'video'); if (sender) sender.replaceTrack(videoTrack); }); }
          setIsScreenSharing(false); screenShareStreamRef.current = null; socketService.emit('screen_share_stopped', { roomId });
        };
        setIsScreenSharing(true); socketService.emit('screen_share_started', { roomId }); toast.success('Screen sharing started');
      } catch (err) { console.error('Screen share error:', err); toast.error('Could not share screen'); }
    }
  }, [isScreenSharing, roomId]);

  const toggleHand = useCallback(() => {
    const newHandState = !isHandRaised;
    setIsHandRaised(newHandState);
    socketService.emit('toggle_meeting_hand', { roomId, isHandRaised: newHandState });
    setParticipants(prev => prev.map(p => p.socketId === 'local' ? { ...p, isHandRaised: newHandState } : p));
  }, [isHandRaised, roomId]);

  const handleSendMessage = useCallback(() => {
    if (!chatInput.trim()) return;
    socketService.emit('meeting_chat_message', { roomId, message: chatInput.trim() });
    setChatMessages(prev => [...prev, { id: Date.now() + Math.random(), senderName: userName, text: chatInput.trim(), time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }), isSelf: true }]);
    setChatInput('');
  }, [chatInput, userName, roomId]);

  const handleEmojiSelect = useCallback((emoji) => {
    setChatInput(prev => prev + emoji);
  }, []);

  const handleCopyLink = useCallback(() => { if (!meetingId) return; copyMeetingLink(meetingId); setCopiedLink(true); toast.success('Meeting link copied!'); setTimeout(() => setCopiedLink(false), 2000); }, [meetingId]);
  const handleShareWhatsApp = useCallback(() => { if (!meetingId) return; window.open(getWhatsAppShareUrl(meetingInfo.title, meetingId), '_blank'); }, [meetingId, meetingInfo.title]);
  const handleEndMeeting = useCallback(() => { socketService.emit('end_meeting', { roomId }); toast.success('Meeting ended'); navigate('/dashboard'); }, [roomId, navigate]);
  const handleLeaveMeeting = useCallback(() => { if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop()); socketService.emit('leave_meeting', { roomId }); toast('You left the meeting', { icon: '👋' }); navigate('/dashboard'); }, [roomId, navigate]);
  const handleToggleLock = useCallback(() => { const nextLocked = !isLocked; setIsLocked(nextLocked); socketService.emit('toggle_meeting_lock', { roomId, isLocked: nextLocked }); toast(nextLocked ? 'Room locked' : 'Room unlocked'); }, [isLocked, roomId]);
  const handleRemoveParticipant = useCallback((socketId) => { socketService.emit('remove_participant', { roomId, targetSocketId: socketId }); const pc = peerConnectionsRef.current.get(socketId); if (pc) { pc.close(); peerConnectionsRef.current.delete(socketId); } remoteStreamsRef.current.delete(socketId); setParticipants(prev => prev.filter(p => p.socketId !== socketId)); toast.success('Participant removed'); }, [roomId]);
  const handleMuteParticipant = useCallback((socketId) => { socketService.emit('toggle_meeting_mute', { roomId, targetSocketId: socketId, isMuted: true }); setParticipants(prev => prev.map(p => p.socketId === socketId ? { ...p, isMuted: true } : p)); toast.success('Participant muted'); }, [roomId]);
  const handleMuteAll = useCallback(() => { participants.forEach(p => { if (p.socketId !== 'local') socketService.emit('toggle_meeting_mute', { roomId, targetSocketId: p.socketId, isMuted: true }); }); setParticipants(prev => prev.map(p => p.socketId !== 'local' ? { ...p, isMuted: true } : p)); if (localStreamRef.current) { const audioTrack = localStreamRef.current.getAudioTracks()[0]; if (audioTrack) { audioTrack.enabled = false; setIsMuted(true); setParticipants(prev => prev.map(p => p.socketId === 'local' ? { ...p, isMuted: true } : p)); } } toast.success('All participants muted'); }, [participants, roomId]);

  const meetingTitle = meetingInfo.title || meetingInfo.subject || 'Meeting';
  const remoteParticipants = participants.filter(p => p.socketId !== 'local');
  const activePanelCount = [activePanel === 'code', activePanel === 'whiteboard', activePanel === 'chat', activePanel === 'participants', activePanel === 'notes', activePanel === 'ai'].filter(Boolean).length;

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden select-none">
      <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />

      {/* ========== TOP BAR ========== */}
      <motion.header initial={{ y: -56 }} animate={{ y: 0 }} className="h-14 bg-gray-900/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
            <Video className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-white truncate">{meetingTitle}</h1>
            <div className="flex items-center gap-2">
              <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${connectionStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-400' : connectionStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                {connectionStatus === 'connected' ? 'LIVE' : connectionStatus === 'connecting' ? 'CONNECTING' : 'DISCONNECTED'}
              </span>
              <span className="text-gray-400 text-xs">ID: {meetingId}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
            <Circle className="w-2 h-2 text-red-500 fill-red-500 animate-pulse" />
            <span className="text-sm font-mono font-semibold text-white">{formatTime(meetingTime)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-lg">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">{participants.length}</span>
          </div>

          {/* Layout Switcher */}
          <div className="relative">
            <button onClick={() => setShowLayoutMenu(!showLayoutMenu)} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-all" title="Change layout">
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">{LAYOUTS.find(l => l.id === layout)?.label}</span>
            </button>
            <AnimatePresence>
              {showLayoutMenu && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} className="absolute top-full right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 py-1">
                  {LAYOUTS.map((l) => {
                    const Icon = l.icon;
                    return (
                      <button key={l.id} onClick={() => { setLayout(l.id); setShowLayoutMenu(false); }} className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${layout === l.id ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-300 hover:bg-white/5'}`}>
                        <Icon className="w-4 h-4" />
                        <span>{l.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isHost && (
            <>
              <button onClick={handleToggleLock} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all ${isLocked ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span className="hidden sm:inline">{isLocked ? 'Locked' : 'Lock'}</span>
              </button>
              <button onClick={handleEndMeeting} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-all">
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">End</span>
              </button>
            </>
          )}
        </div>
      </motion.header>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── Left Panel: Code / Whiteboard / Notes ── */}
        <AnimatePresence>
          {activePanel && ['code', 'whiteboard', 'notes'].includes(activePanel) && (
            <motion.div key={activePanel} initial={{ width: 0, opacity: 0 }} animate={{ width: activePanel === 'chat' || activePanel === 'participants' ? 320 : '45%', opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="h-full bg-gray-900 border-r border-white/5 overflow-hidden flex flex-col shrink-0">
              <div className="h-10 flex items-center justify-between px-4 bg-gray-900/80 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  {activePanel === 'code' && <><Code className="w-4 h-4 text-emerald-400" /><span className="text-sm font-semibold text-white">Code Editor</span></>}
                  {activePanel === 'whiteboard' && <><PenTool className="w-4 h-4 text-indigo-400" /><span className="text-sm font-semibold text-white">Whiteboard</span></>}
                  {activePanel === 'notes' && <><FileText className="w-4 h-4 text-amber-400" /><span className="text-sm font-semibold text-white">Shared Notes</span></>}
                </div>
                <button onClick={() => setActivePanel(null)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {activePanel === 'code' && <CodeEditor roomId={meetingId} socket={socketService.getSocket()} compact={layout === 'coding'} />}
                {activePanel === 'whiteboard' && <CollaborativeWhiteboard roomId={meetingId} socket={socketService.getSocket()} />}
                {activePanel === 'notes' && <SharedNotes roomId={meetingId} socket={socketService.getSocket()} participants={participants} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Center: Video Grid ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {layout === 'grid' && (
            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 h-full auto-rows-fr">
                {participants.map((p) => (
                  <VideoTile key={p.id} participant={p} isLocal={p.socketId === 'local'} isSpeaking={speakingId === p.socketId} />
                ))}
              </div>
            </div>
          )}
          {layout === 'speaker' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 p-2">
                {remoteParticipants.length > 0 ? (
                  <VideoTile participant={remoteParticipants.find(p => speakingId === p.socketId) || remoteParticipants[0]} isLocal={false} isSpeaking={true} large />
                ) : (
                  <VideoTile participant={participants[0]} isLocal={true} isSpeaking={speakingId === 'local'} large />
                )}
              </div>
              <div className="h-28 px-3 pb-2 flex gap-2 overflow-x-auto custom-scrollbar shrink-0">
                {participants.map((p) => (
                  <div key={p.id} className="h-full w-40 shrink-0">
                    <VideoTile participant={p} isLocal={p.socketId === 'local'} isSpeaking={speakingId === p.socketId} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {(layout === 'coding' || layout === 'whiteboard' || layout === 'presentation') && (
            <div className="flex-1 p-2">
              <div className="h-full rounded-xl overflow-hidden bg-gray-900 border border-white/5">
                {layout === 'coding' && <CodeEditor roomId={meetingId} socket={socketService.getSocket()} />}
                {layout === 'whiteboard' && <CollaborativeWhiteboard roomId={meetingId} socket={socketService.getSocket()} />}
                {layout === 'presentation' && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Presentation className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Share your screen to present</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Small video strip when in coding/whiteboard/presentation mode */}
          {(layout === 'coding' || layout === 'whiteboard' || layout === 'presentation') && (
            <div className="h-24 px-3 pb-2 flex gap-2 overflow-x-auto custom-scrollbar shrink-0">
              {participants.map((p) => (
                <div key={p.id} className="h-full w-32 shrink-0">
                  <VideoTile participant={p} isLocal={p.socketId === 'local'} isSpeaking={speakingId === p.socketId} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right Panel: Chat / Participants / AI ── */}
        <AnimatePresence>
          {activePanel === 'chat' && (
            <motion.div key="chat" initial={{ width: 0, opacity: 0 }} animate={{ width: 340, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="h-full bg-gray-900/80 backdrop-blur-xl border-l border-white/5 flex flex-col overflow-hidden shrink-0">
              <div className="h-10 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-white">Chat</span>
                </div>
                <button onClick={() => setActivePanel(null)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"><X className="w-3.5 h-3.5 text-gray-400" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs text-gray-600">Start the conversation!</p>
                  </div>
                )}
                {chatMessages.map((msg) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col gap-1 ${msg.isSelf ? 'items-end' : ''}`}>
                    <div className="flex items-center gap-2">
                      {!msg.isSelf && <span className="text-xs font-medium text-gray-300">{msg.senderName}</span>}
                      <span className="text-[10px] text-gray-500">{msg.time}</span>
                    </div>
                    <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${msg.isSelf ? 'bg-indigo-500/20 text-indigo-100 rounded-br-sm' : 'bg-white/5 text-gray-200 rounded-bl-sm'}`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                      <Smile className="w-4 h-4 text-gray-400" />
                    </button>
                    <AnimatePresence>
                      {showEmojiPicker && <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />}
                    </AnimatePresence>
                  </div>
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all" />
                  <button onClick={handleSendMessage} disabled={!chatInput.trim()} className="w-9 h-9 flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-all">
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activePanel === 'participants' && (
            <motion.div key="participants" initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="h-full bg-gray-900/80 backdrop-blur-xl border-l border-white/5 flex flex-col overflow-hidden shrink-0">
              <div className="h-10 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-white">Participants</span>
                  <span className="text-xs text-gray-500">({participants.length})</span>
                </div>
                <button onClick={() => setActivePanel(null)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"><X className="w-3.5 h-3.5 text-gray-400" /></button>
              </div>
              {isHost && (
                <div className="p-3 border-b border-white/5">
                  <button onClick={handleMuteAll} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-gray-300 transition-all">
                    <MicOff className="w-3.5 h-3.5" />Mute All
                  </button>
                </div>
              )}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {participants.map((p) => {
                  const pInitials = p.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${p.isHost ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-gray-300'}`}>{pInitials}</div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-white truncate">{p.name}{p.socketId === 'local' ? ' (You)' : ''}</span>
                            {p.isHost && <span className="px-1 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] font-semibold rounded shrink-0">HOST</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {p.isMuted ? <MicOff className="w-3 h-3 text-red-400" /> : <Mic className="w-3 h-3 text-emerald-400" />}
                            {p.isCameraOff ? <VideoOff className="w-3 h-3 text-red-400" /> : <Video className="w-3 h-3 text-emerald-400" />}
                            {p.isHandRaised && <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1 }}><Hand className="w-3 h-3 text-yellow-400" /></motion.div>}
                          </div>
                        </div>
                      </div>
                      {isHost && p.socketId !== 'local' && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleMuteParticipant(p.socketId)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 transition-colors" title="Mute participant"><MicOff className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleRemoveParticipant(p.socketId)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors" title="Remove participant"><UserX className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activePanel === 'ai' && (
            <motion.div key="ai" initial={{ width: 0, opacity: 0 }} animate={{ width: 400, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="h-full bg-gray-900/80 backdrop-blur-xl border-l border-white/5 flex flex-col overflow-hidden shrink-0">
              <div className="h-10 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-white">AI Assistant</span>
                </div>
                <button onClick={() => setActivePanel(null)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"><X className="w-3.5 h-3.5 text-gray-400" /></button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Brain className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium text-gray-400">AI Assistant</p>
                  <p className="text-xs text-gray-600 mt-1 text-center max-w-[200px]">Ask questions about your code, get explanations, or generate snippets</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========== BOTTOM CONTROL BAR ========== */}
      <motion.footer initial={{ y: 80 }} animate={{ y: 0 }} className="h-20 bg-gray-900/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-center px-4 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${isMuted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/5 text-white hover:bg-white/10'}`}>
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button onClick={toggleCamera} className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${!isCameraOn ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/5 text-white hover:bg-white/10'}`}>
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          <button onClick={toggleScreenShare} className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${isScreenSharing ? 'bg-indigo-500/30 text-indigo-300 ring-2 ring-indigo-400/50' : 'bg-white/5 text-white hover:bg-white/10'}`}>
            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </button>
          <button onClick={toggleHand} className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${isHandRaised ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-white/5 text-white hover:bg-white/10'}`}>
            <Hand className="w-5 h-5" />
          </button>

          <div className="w-px h-8 bg-white/10 mx-1" />

          <button onClick={() => togglePanel('whiteboard')} className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${activePanel === 'whiteboard' ? 'bg-indigo-500/30 text-indigo-300 ring-2 ring-indigo-400/50' : 'bg-white/5 text-white hover:bg-white/10'}`} title="Whiteboard"><PenTool className="w-5 h-5" /></button>
          <button onClick={() => togglePanel('code')} className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${activePanel === 'code' ? 'bg-emerald-500/30 text-emerald-300 ring-2 ring-emerald-400/50' : 'bg-white/5 text-white hover:bg-white/10'}`} title="Code Editor"><Code className="w-5 h-5" /></button>
          <button onClick={() => togglePanel('notes')} className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${activePanel === 'notes' ? 'bg-amber-500/30 text-amber-300 ring-2 ring-amber-400/50' : 'bg-white/5 text-white hover:bg-white/10'}`} title="Shared Notes"><FileText className="w-5 h-5" /></button>
          <button onClick={() => togglePanel('ai')} className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${activePanel === 'ai' ? 'bg-purple-500/30 text-purple-300 ring-2 ring-purple-400/50' : 'bg-white/5 text-white hover:bg-white/10'}`} title="AI Assistant"><Brain className="w-5 h-5" /></button>
          <button onClick={() => togglePanel('chat')} className={`relative w-12 h-12 flex items-center justify-center rounded-xl transition-all ${activePanel === 'chat' ? 'bg-indigo-500/30 text-indigo-300 ring-2 ring-indigo-400/50' : 'bg-white/5 text-white hover:bg-white/10'}`} title="Chat">
            <MessageSquare className="w-5 h-5" />
            {unreadCount > 0 && activePanel !== 'chat' && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </button>
          <button onClick={() => togglePanel('participants')} className={`relative w-12 h-12 flex items-center justify-center rounded-xl transition-all ${activePanel === 'participants' ? 'bg-indigo-500/30 text-indigo-300 ring-2 ring-indigo-400/50' : 'bg-white/5 text-white hover:bg-white/10'}`} title="Participants">
            <Users className="w-5 h-5" />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-700 text-gray-200 text-[10px] font-bold rounded-full flex items-center justify-center border border-gray-600">{participants.length}</span>
          </button>
          <button onClick={() => setShowShareModal(true)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 text-white hover:bg-white/10 transition-all" title="Share Meeting"><Share2 className="w-5 h-5" /></button>

          <div className="w-px h-8 bg-white/10 mx-1" />

          <button onClick={handleLeaveMeeting} className="h-12 px-5 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-all">
            <Phone className="w-5 h-5 rotate-[135deg]" />
            <span>Leave</span>
          </button>
        </div>
      </motion.footer>

      {/* ========== SHARE MODAL ========== */}
      <AnimatePresence>
        {showShareModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowShareModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center"><Share2 className="w-5 h-5 text-indigo-400" /></div>
                  <div><h2 className="text-base font-semibold text-white">Share Meeting</h2><p className="text-xs text-gray-400">Invite others to join</p></div>
                </div>
                <button onClick={() => setShowShareModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <div className="p-5">
                <label className="block text-xs font-medium text-gray-400 mb-2">Meeting Link</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 font-mono truncate">{meetingId ? getMeetingLink(meetingId) : ''}</div>
                  <button onClick={handleCopyLink} className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-all ${copiedLink ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'}`}>
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="px-5 pb-5 space-y-2">
                <button onClick={handleShareWhatsApp} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 rounded-xl text-[#25D366] text-sm font-medium transition-all">
                  <MessageSquare className="w-4 h-4" />Share via WhatsApp
                </button>
              </div>
              <div className="px-5 pb-5">
                <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 rounded-lg">
                  <span className="text-xs text-gray-400">Meeting ID:</span>
                  <span className="text-sm font-mono font-semibold text-white">{meetingId}</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Close layout menu on outside click */}
      {showLayoutMenu && <div className="fixed inset-0 z-30" onClick={() => setShowLayoutMenu(false)} />}
    </div>
  );
}
