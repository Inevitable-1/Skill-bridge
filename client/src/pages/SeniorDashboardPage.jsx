import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { sessionAPI } from '../services/api';
import CountdownTimer from '../components/ai/CountdownTimer';
import {
  Calendar, Users, BookOpen, Clock, Star, ArrowRight,
  TrendingUp, MessageCircle, Video, CheckCircle, AlertTriangle,
  AlertCircle, Zap, X, User, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SeniorDashboardPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ pending: 0, completed: 0, upcoming: 0, totalStudents: 0, emergencyPending: 0 });
  const [loading, setLoading] = useState(true);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const sessionsRes = await sessionAPI.getMySessions({ limit: 10 });
        setSessions(sessionsRes.data.sessions);

        const pending = sessionsRes.data.sessions.filter((s) => s.status === 'pending' && s.session_type !== 'emergency_help').length;
        const completed = sessionsRes.data.sessions.filter((s) => s.status === 'completed').length;
        const upcoming = sessionsRes.data.sessions.filter((s) => s.status === 'approved').length;
        const emergencyPending = sessionsRes.data.sessions.filter((s) => s.status === 'pending' && s.session_type === 'emergency_help').length;
        const uniqueMentees = new Set(sessionsRes.data.sessions.map((s) => s.mentee_id)).size;

        // Find active emergency session
        const activeEmergencySession = sessionsRes.data.sessions.find(
          (s) => s.session_type === 'emergency_help' && s.status === 'approved'
        );

        setStats({ pending, completed, upcoming, totalStudents: uniqueMentees, emergencyPending });
        if (activeEmergencySession) {
          setActiveEmergency(activeEmergencySession);
          setShowTimer(true);
        }
      } catch (error) {
        console.error('Dashboard load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleApproveEmergency = async (sessionId) => {
    try {
      await sessionAPI.approve(sessionId);
      const sessionsRes = await sessionAPI.getMySessions({ limit: 10 });
      setSessions(sessionsRes.data.sessions);
      const emergency = sessionsRes.data.sessions.find(
        (s) => s.id === sessionId && s.status === 'approved'
      );
      if (emergency) {
        setActiveEmergency(emergency);
        setShowTimer(true);
      }
      toast.success('Emergency session approved!');
    } catch (error) {
      console.error('Approve error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const emergencySessions = sessions.filter((s) => s.session_type === 'emergency_help' && s.status === 'pending');
  const regularSessions = sessions.filter((s) => s.session_type !== 'emergency_help' || s.status !== 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-8"
      >
        {/* Welcome */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Mentor Dashboard
              </h1>
              <span className="badge-primary">Senior</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Welcome back, {user?.name?.split(' ')[0]}! Here's your mentoring overview.
            </p>
          </div>
          <Link
            to="/sessions"
            className="btn-primary flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            View Sessions
          </Link>
        </motion.div>

        {/* Emergency Active Session Timer */}
        {showTimer && activeEmergency && (
          <motion.div variants={fadeUp}>
            <CountdownTimer
              duration={activeEmergency.duration || 25}
              label={`Emergency Session with ${activeEmergency.mentee_name || 'Student'}`}
              isRunning={true}
              onComplete={() => {
                setShowTimer(false);
                setActiveEmergency(null);
              }}
            />
          </motion.div>
        )}

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Emergency Requests', value: stats.emergencyPending, icon: AlertTriangle, color: 'red' },
            { label: 'Pending Requests', value: stats.pending, icon: Clock, color: 'yellow' },
            { label: 'Upcoming Sessions', value: stats.upcoming, icon: Calendar, color: 'blue' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'green' },
            { label: 'Students Mentored', value: stats.totalStudents, icon: Users, color: 'purple' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`card p-5 ${stat.color === 'red' && stat.value > 0 ? 'border-2 border-red-500 dark:border-red-400' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Emergency & Session Requests */}
          <motion.div variants={fadeUp} className="lg:col-span-2 space-y-6">
            {/* Emergency Requests - Priority */}
            {emergencySessions.length > 0 && (
              <div className="card border-2 border-red-500 dark:border-red-400">
                <div className="p-6 border-b border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">
                        Emergency Requests ({emergencySessions.length})
                      </h2>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        These students need urgent help
                      </p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-red-100 dark:divide-red-900/30">
                  {emergencySessions.map((session) => (
                    <div key={session.id} className="p-4 bg-red-50/50 dark:bg-red-900/5 hover:bg-red-100/50 dark:hover:bg-red-900/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {session.session_type?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              with {session.mentee_name || 'Student'} &middot; {session.duration} min
                            </p>
                            {session.ai_analysis && (
                              <p className="text-xs text-red-600 dark:text-red-400 mt-1 italic">
                                AI Analysis: {session.ai_analysis}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveEmergency(session.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <Zap className="w-4 h-4" />
                            Accept
                          </button>
                          <button
                            onClick={() => sessionAPI.cancel(session.id)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Session Requests */}
            <div className="card">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Session Requests
                  </h2>
                  <Link to="/sessions" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                    View all <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {regularSessions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No session requests yet</p>
                    <p className="text-sm mt-1">Students will request mentorship sessions with you.</p>
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Current Skill</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">React</span>
                        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">65%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: '65%' }} />
                      </div>
                      <Link
                        to="/skill-tree"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        Continue Learning <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  regularSessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                            <span className="text-primary-600 font-medium text-sm">
                              {session.mentee_name?.charAt(0) || 'S'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {session.session_type?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              with {session.mentee_name || 'Student'} &middot; {new Date(session.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.status === 'pending' && (
                            <Link
                              to="/sessions"
                              className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                              Review
                            </Link>
                          )}
                          <span
                            className={`badge ${
                              session.status === 'completed'
                                ? 'badge-success'
                                : session.status === 'approved'
                                ? 'badge-primary'
                                : session.status === 'pending'
                                ? 'badge-warning'
                                : 'badge-danger'
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="card">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Upcoming Sessions
                  </h2>
                </div>
              </div>
              <div className="p-8 text-center">
                <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No upcoming sessions. Sessions will appear here once students book with you.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeUp} className="space-y-4">
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Mentor Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/sessions"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">Review Requests</p>
                    <p className="text-xs text-gray-500">{stats.pending} pending</p>
                  </div>
                </Link>
                <Link
                  to="/chat"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">Messages</p>
                    <p className="text-xs text-gray-500">Chat with students</p>
                  </div>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Star className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">My Profile</p>
                    <p className="text-xs text-gray-500">Manage your skills</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Mentor Stats Card */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Your Impact</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Sessions Completed</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Students Helped</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.totalStudents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Pending Reviews</span>
                  <span className="font-semibold text-yellow-600">{stats.pending}</span>
                </div>
                {stats.emergencyPending > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-500">Emergency Requests</span>
                    <span className="font-semibold text-red-600">{stats.emergencyPending}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Available Mentors Today */}
            <div className="card">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Available Mentors</h3>
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">Today</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {AVAILABLE_MENTORS.map((mentor) => (
                  <div key={mentor.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">{mentor.avatar}</span>
                        </div>
                        {mentor.online && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{mentor.name}</p>
                          {mentor.online && <span className="text-[10px] text-green-600 dark:text-green-400">Online</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{mentor.skill}</span>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{mentor.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {mentor.availableAt ? `Available at ${mentor.availableAt}` : 'Available Now'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to="/profile" className="flex-1 px-2.5 py-1.5 text-center text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        View Profile
                      </Link>
                      <Link to="/chat" className="flex-1 px-2.5 py-1.5 text-center text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        Chat
                      </Link>
                      <Link to="/sessions" className="flex-1 px-2.5 py-1.5 text-center text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                        Book
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
