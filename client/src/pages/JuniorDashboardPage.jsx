import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { sessionAPI, skillAPI } from '../services/api';
import {
  Calendar, Users, BookOpen, Clock, Star, ArrowRight,
  TrendingUp, Zap, MessageCircle, AlertTriangle, Bot,
  BarChart3, Target
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function JuniorDashboardPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({ pending: 0, completed: 0, upcoming: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [sessionsRes, matchRes] = await Promise.all([
          sessionAPI.getMySessions({ limit: 5 }),
          skillAPI.matchMentors({ limit: 4 }),
        ]);

        setSessions(sessionsRes.data.sessions);
        setRecommendations(matchRes.data.mentors);

        const pending = sessionsRes.data.sessions.filter((s) => s.status === 'pending').length;
        const completed = sessionsRes.data.sessions.filter((s) => s.status === 'completed').length;
        const upcoming = sessionsRes.data.sessions.filter((s) => s.status === 'approved').length;
        setStats({ pending, completed, upcoming });
      } catch (error) {
        console.error('Dashboard load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
                Welcome back, {user?.name?.split(' ')[0]}!
              </h1>
              <span className="badge bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">Junior</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Here's what's happening with your learning journey
            </p>
          </div>
          <Link
            to="/my-mentors"
            className="btn-primary flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Need Help Now
          </Link>
        </motion.div>

        {/* Quick Actions Row - AI, Emergency, Find Mentor, Schedule */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => document.querySelector('[data-ai-chat]')?.click()}
            className="card p-5 hover:shadow-lg transition-all duration-200 cursor-pointer group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Ask AI Assistant</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Get instant help with any topic</p>
          </button>

          <Link
            to="/my-mentors"
            className="card p-5 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">My Mentors</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Browse expert mentors</p>
          </Link>

          <Link
            to="/sessions"
            className="card p-5 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Schedule Session</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Book a learning session</p>
          </Link>

          <Link
            to="/skill-tree"
            className="card p-5 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Learning Progress</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">View your skill graph</p>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending Requests', value: stats.pending, icon: Clock, color: 'yellow' },
            { label: 'Upcoming Sessions', value: stats.upcoming, icon: Calendar, color: 'blue' },
            { label: 'Completed', value: stats.completed, icon: BookOpen, color: 'green' },
            { label: 'Mentors Found', value: recommendations.length, icon: Users, color: 'purple' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="card p-5">
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
          {/* Recent Sessions */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <div className="card">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Sessions</h2>
                  <Link to="/sessions" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                    View all <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {sessions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No sessions yet</p>
                    <Link to="/my-mentors" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
                      Find a mentor to get started
                    </Link>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                            <span className="text-primary-600 font-medium text-sm">
                              {session.mentor_name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {session.session_type?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              with {session.mentor_name} &middot; {new Date(session.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
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
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions Sidebar */}
          <motion.div variants={fadeUp} className="space-y-4">
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/my-mentors"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">My Mentors</p>
                    <p className="text-xs text-gray-500">Browse by skill</p>
                  </div>
                </Link>
                <Link
                  to="/skill-tree"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">Skill Graph</p>
                    <p className="text-xs text-gray-500">Explore connections</p>
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
                    <p className="text-xs text-gray-500">Chat with mentors</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recommended Mentors */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recommended Mentors</h3>
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((mentor) => (
                  <Link
                    key={mentor.id}
                    to={`/mentors/${mentor.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <span className="text-primary-600 text-xs font-medium">
                        {mentor.name?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{mentor.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-500">{Number(mentor.avg_rating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
