import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { sessionAPI } from '../services/api';
import {
  Calendar, Clock, CheckCircle, XCircle, Video,
  Filter, ChevronRight, User
} from 'lucide-react';
import toast from 'react-hot-toast';

const sessionTypes = {
  quick_doubt: { label: 'Quick Doubt', color: 'yellow', icon: '❓' },
  learning: { label: 'Learning Session', color: 'blue', icon: '📚' },
  project_guidance: { label: 'Project Guidance', color: 'green', icon: '🚀' },
  interview_prep: { label: 'Interview Prep', color: 'purple', icon: '🎯' },
};

const statusConfig = {
  pending: { label: 'Pending', class: 'badge-warning' },
  approved: { label: 'Approved', class: 'badge-primary' },
  completed: { label: 'Completed', class: 'badge-success' },
  cancelled: { label: 'Cancelled', class: 'badge-danger' },
};

export default function SessionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', role: '' });

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.role) params.role = filter.role;
      const res = await sessionAPI.getMySessions(params);
      setSessions(res.data.sessions);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  const handleApprove = async (id) => {
    try {
      await sessionAPI.approve(id);
      toast.success('Session approved');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to approve session');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this session?')) return;
    try {
      await sessionAPI.cancel(id);
      toast.success('Session cancelled');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to cancel session');
    }
  };

  const handleComplete = async (id) => {
    try {
      await sessionAPI.complete(id);
      toast.success('Session completed');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to complete session');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sessions</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your mentorship sessions
            </p>
          </div>
          <Link to="/mentors" className="btn-primary flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Book New
          </Link>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="input-field w-auto text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filter.role}
              onChange={(e) => setFilter({ ...filter, role: e.target.value })}
              className="input-field w-auto text-sm"
            >
              <option value="">All Roles</option>
              <option value="mentor">As Mentor</option>
              <option value="mentee">As Mentee</option>
            </select>
          </div>
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="card p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No sessions yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Book a session with a mentor to get started
            </p>
            <Link to="/mentors" className="btn-primary inline-flex items-center gap-2">
              Find Mentors
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const typeInfo = sessionTypes[session.session_type] || {};
              const statusInfo = statusConfig[session.status] || {};
              const isMentor = session.mentor_id === user?.id;
              const otherPerson = isMentor
                ? { name: session.mentee_name, avatar: session.mentee_avatar }
                : { name: session.mentor_name, avatar: session.mentor_avatar };

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-5 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{typeInfo.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {typeInfo.label}
                        </h3>
                        <span className={statusInfo.class}>{statusInfo.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {isMentor ? 'Mentee' : 'Mentor'}: {otherPerson.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {session.skill_name && (
                          <span className="badge-primary text-xs">{session.skill_name}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {session.status === 'pending' && isMentor && (
                        <>
                          <button
                            onClick={() => handleApprove(session.id)}
                            className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleCancel(session.id)}
                            className="btn-ghost text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {session.status === 'approved' && (
                        <Link
                          to={`/learning-room/${session.id}`}
                          className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1"
                        >
                          <Video className="w-4 h-4" />
                          Join
                        </Link>
                      )}

                      {session.status === 'approved' && isMentor && (
                        <button
                          onClick={() => handleComplete(session.id)}
                          className="btn-ghost text-sm text-green-600"
                        >
                          Complete
                        </button>
                      )}

                      {['pending', 'approved'].includes(session.status) && (
                        <button
                          onClick={() => handleCancel(session.id)}
                          className="btn-ghost text-sm text-red-600"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
