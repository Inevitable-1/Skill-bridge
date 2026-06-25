import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  Video, VideoOff, Mic, MicOff, Users, Clock, BookOpen,
  User, ArrowRight, Settings, ChevronLeft, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MeetingLobbyPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [guestName, setGuestName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [joining, setJoining] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const { data } = await api.get(`/meetings/${code}`);
        setMeeting(data.meeting || data);
      } catch (err) {
        setError(err.response?.data?.error || 'Meeting not found');
      } finally {
        setLoading(false);
      }
    };
    fetchMeeting();
  }, [code]);

  useEffect(() => {
    if (user?.name) setGuestName(user.name);
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    const startCamera = async () => {
      if (cameraOn) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          if (cancelled) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch {
          setCameraOn(false);
        }
      }
    };
    startCamera();
    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [cameraOn]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!guestName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (meeting?.security === 'password' && password !== meeting.password) {
      toast.error('Incorrect meeting password');
      return;
    }
    setJoining(true);
    navigate(`/meeting/${code}/room`, {
      state: { guestName: guestName.trim(), cameraOn, micOn },
    });
  };

  const formatDate = (d) => {
    if (!d) return '—';
    if (d.includes('-') && !d.includes('T')) {
      const [y, m, day] = d.split('-');
      const date = new Date(Number(y), Number(m) - 1, Number(day));
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };
  const formatTime = (t) => {
    if (!t) return '—';
    if (t.match(/^\d{2}:\d{2}/)) {
      const [h, m] = t.split(':');
      const d = new Date();
      d.setHours(Number(h), Number(m), 0, 0);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // ─── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Loading meeting info…</p>
        </div>
      </div>
    );
  }

  // ─── Error ──────────────────────────────────────────────
  if (error || !meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 max-w-sm"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <VideoOff className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Meeting Not Found</h2>
          <p className="text-gray-400 text-sm">
            This meeting link is invalid or the session has ended.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── Main ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-gray-400">Meeting Lobby</span>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-5 gap-6"
        >
          {/* ─── Left: Meeting Info (3 cols) ───────────── */}
          <div className="lg:col-span-3 space-y-5">
            {/* Title & badge */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {meeting.title}
                </h1>
                {meeting.meeting_type && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/20 text-primary-400 border border-primary-500/30">
                    {meeting.meeting_type}
                  </span>
                )}
              </div>
            </div>

            {/* Info card */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-5 space-y-4">
              {/* Host */}
              <div className="flex items-center gap-3">
                {meeting.host_avatar ? (
                  <img
                    src={meeting.host_avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-600/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-400" />
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400">Hosted by</p>
                  <p className="text-white font-medium">{meeting.host_name}</p>
                </div>
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-3">
                {meeting.subject && (
                  <InfoRow icon={BookOpen} label="Subject" value={meeting.subject} />
                )}
                <InfoRow
                  icon={Clock}
                  label="Date"
                  value={formatDate(meeting.scheduled_at || meeting.date)}
                />
                <InfoRow
                  icon={Clock}
                  label="Time"
                  value={formatTime(meeting.scheduled_at || meeting.date)}
                />
                <InfoRow
                  icon={Clock}
                  label="Duration"
                  value={meeting.duration ? `${meeting.duration} min` : '—'}
                />
                <InfoRow
                  icon={Users}
                  label="Participants"
                  value={meeting.participant_count ?? meeting.participants ?? '0'}
                />
                <InfoRow
                  icon={Shield}
                  label="Security"
                  value={meeting.security === 'password' ? 'Password Protected' : meeting.security === 'private' ? 'Private' : 'Public'}
                  highlight={meeting.security === 'password'}
                />
              </div>

              {/* Description */}
              {meeting.description && (
                <p className="text-sm text-gray-400 leading-relaxed pt-2 border-t border-white/5">
                  {meeting.description}
                </p>
              )}
            </div>
          </div>

          {/* ─── Right: Controls (2 cols) ─────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Camera preview */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden">
              <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                {cameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <VideoOff className="w-10 h-10 text-gray-600 mb-2" />
                    <p className="text-xs text-gray-600">Camera off</p>
                  </div>
                )}

                {/* Toggle overlays */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  <ToggleBtn
                    active={!cameraOn}
                    onClick={() => setCameraOn((c) => !c)}
                    onIcon={<Video className="w-4 h-4" />}
                    offIcon={<VideoOff className="w-4 h-4" />}
                    isOff={!cameraOn}
                  />
                  <ToggleBtn
                    active={!micOn}
                    onClick={() => setMicOn((m) => !m)}
                    onIcon={<Mic className="w-4 h-4" />}
                    offIcon={<MicOff className="w-4 h-4" />}
                    isOff={!micOn}
                  />
                </div>
              </div>
            </div>

            {/* Join form */}
            <form
              onSubmit={handleJoin}
              className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-5 space-y-4"
            >
              <h3 className="text-white font-semibold">Join as</h3>

              {/* Name */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                />
              </div>

              {/* Password (conditional) */}
              {meeting.security === 'password' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Meeting Password</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Join button */}
              <button
                type="submit"
                disabled={joining || !guestName.trim()}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm
                  bg-gradient-to-r from-blue-600 to-purple-600
                  hover:from-blue-500 hover:to-purple-500
                  active:scale-[0.98] transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
              >
                {joining ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Join Meeting
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-gray-600 text-center">
                Make sure your camera and mic work before joining.
              </p>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────

function InfoRow({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] text-gray-500 leading-none">{label}</p>
        <p className={`text-sm font-medium ${highlight ? 'text-amber-400' : 'text-white'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function ToggleBtn({ onClick, onIcon, offIcon, isOff }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
        isOff
          ? 'bg-red-500/80 hover:bg-red-500 text-white'
          : 'bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm'
      }`}
    >
      {isOff ? offIcon : onIcon}
    </button>
  );
}
