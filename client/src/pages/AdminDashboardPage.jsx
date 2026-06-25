import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import {
  Calendar, Users, BookOpen, Clock, ArrowRight,
  Shield, UserCheck, AlertCircle, CheckCircle, XCircle,
  GraduationCap, Code, Settings, MessageCircle
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const StatCard = ({ label, value, icon: Icon, color, to, onClick }) => {
  const colorMap = {
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
    pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
  };

  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
    else if (onClick) onClick();
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={handleClick}
      className={`card p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/10 ${to ? 'hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await adminAPI.getStats();
        setStats(res.data.stats);
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
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase">
            {user?.name}
          </h1>
          <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
            Admin
          </span>
        </motion.div>

        {/* Application Stats */}
        <motion.div variants={fadeUp}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Applications</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
              label="Pending Mentors"
              value={stats?.pendingMentors || 0}
              icon={Clock}
              color="yellow"
              to="/admin/applications?type=mentor&status=pending"
            />
            <StatCard
              label="Pending Developers"
              value={stats?.pendingDevelopers || 0}
              icon={Clock}
              color="orange"
              to="/admin/applications?type=developer&status=pending"
            />
            <StatCard
              label="Approved Mentors"
              value={stats?.approvedMentors || 0}
              icon={CheckCircle}
              color="green"
              to="/admin/applications?type=mentor&status=approved"
            />
            <StatCard
              label="Approved Developers"
              value={stats?.approvedDevelopers || 0}
              icon={CheckCircle}
              color="emerald"
              to="/admin/applications?type=developer&status=approved"
            />
            <StatCard
              label="Rejected"
              value={stats?.rejectedApplications || 0}
              icon={XCircle}
              color="red"
              to="/admin/applications?status=rejected"
            />
          </div>
        </motion.div>

        {/* Platform Overview */}
        <motion.div variants={fadeUp}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Students"
              value={stats?.totalStudents || 0}
              icon={GraduationCap}
              color="blue"
              to="/admin/users?role=junior"
            />
            <StatCard
              label="Total Mentors"
              value={stats?.totalMentors || 0}
              icon={Users}
              color="purple"
              to="/admin/users?role=senior"
            />
            <StatCard
              label="Total Developers"
              value={stats?.totalDevelopers || 0}
              icon={Code}
              color="cyan"
              to="/admin/users?role=developer"
            />
            <StatCard
              label="Active Meetings"
              value={stats?.activeMeetings || 0}
              icon={Calendar}
              color="pink"
              to="/admin/meetings?status=live"
            />
            <StatCard
              label="Total Sessions"
              value={stats?.totalSessions || 0}
              icon={BookOpen}
              color="indigo"
              to="/admin/sessions"
            />
            <StatCard
              label="Completed Sessions"
              value={stats?.completedSessions || 0}
              icon={CheckCircle}
              color="green"
              to="/admin/sessions?status=completed"
            />
            <StatCard
              label="Pending Sessions"
              value={stats?.pendingSessions || 0}
              icon={Clock}
              color="yellow"
              to="/admin/sessions?status=pending"
            />
          </div>
        </motion.div>

        {/* Platform Health & Admin Actions */}
        <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-6">
          {/* Platform Health */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Platform Health</h3>
            <div className="space-y-3">
              <Link
                to="/admin/users"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/10"
              >
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Users</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {(stats?.totalStudents || 0) + (stats?.totalMentors || 0) + (stats?.totalDevelopers || 0)}
                </span>
              </Link>
              <div className="flex items-center justify-between p-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Session Completion Rate</span>
                <span className="font-semibold text-green-600">
                  {stats?.totalSessions > 0
                    ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Active Meetings</span>
                <span className="font-semibold text-blue-600">{stats?.activeMeetings || 0}</span>
              </div>
              <Link
                to="/admin/applications?status=pending"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/10"
              >
                <span className="text-sm text-gray-500 dark:text-gray-400">Pending Applications</span>
                <span className="font-semibold text-yellow-600">
                  {(stats?.pendingMentors || 0) + (stats?.pendingDevelopers || 0)}
                </span>
              </Link>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Admin Actions</h3>
            <div className="space-y-3">
              <Link
                to="/admin/applications?status=pending"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/10"
              >
                <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Review Applications</p>
                  <p className="text-xs text-gray-500">{(stats?.pendingMentors || 0) + (stats?.pendingDevelopers || 0)} pending</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>
              <Link
                to="/admin/messages"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/10"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Messages</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>
              <Link
                to="/admin/settings"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/10"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Platform Settings</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
