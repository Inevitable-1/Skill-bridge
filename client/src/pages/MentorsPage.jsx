import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { skillAPI, userAPI } from '../services/api';
import {
  Search, Filter, Star, MapPin, Calendar, Video,
  ChevronDown, X, Users, Clock, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const skillCategories = [
  'Programming', 'Web Development', 'Data Science', 'Machine Learning',
  'Mobile Development', 'Cloud Computing', 'DevOps', 'Cybersecurity',
  'UI/UX Design', 'Blockchain', 'IoT', 'Robotics',
];

export default function MentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    skill: '',
    branch: '',
    rating: '',
    onlinePreference: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (filters.skill) params.skill = filters.skill;
      if (filters.branch) params.branch = filters.branch;
      if (filters.rating) params.rating = filters.rating;
      if (filters.onlinePreference) params.onlinePreference = filters.onlinePreference;

      const res = await skillAPI.matchMentors(params);
      setMentors(res.data.mentors);
    } catch (error) {
      toast.error('Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchMentors, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, filters]);

  const clearFilters = () => {
    setFilters({ skill: '', branch: '', rating: '', onlinePreference: '' });
    setSearchQuery('');
  };

  const activeFilters = Object.values(filters).filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Mentors</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Discover senior students who can guide you
            </p>
          </div>
          <Link
            to="/mentors?instant=true"
            className="btn-primary flex items-center gap-2 animate-pulse-glow"
          >
            <Zap className="w-4 h-4" />
            Need Help Now
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by skill, name, or keyword..."
                className="input-field pl-11"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-ghost flex items-center gap-2 relative ${
                showFilters ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : ''
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilters > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <select
                    value={filters.skill}
                    onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option value="">All Skills</option>
                    {skillCategories.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    value={filters.branch}
                    onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option value="">All Branches</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">IT</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Mechanical">Mechanical</option>
                  </select>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                  </select>
                  <select
                    value={filters.onlinePreference}
                    onChange={(e) => setFilters({ ...filters, onlinePreference: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option value="">Any Mode</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                {activeFilters > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-3 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear filters
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loading ? 'Searching...' : `${mentors.length} mentor${mentors.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Mentor Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <div className="card p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No mentors found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor, idx) => (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className="card overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    {mentor.avatar_url ? (
                      <img
                        src={mentor.avatar_url}
                        alt={mentor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <span className="text-primary-600 font-bold">{mentor.name?.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/mentors/${mentor.id}`}
                        className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 transition-colors"
                      >
                        {mentor.name}
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        {mentor.branch && <span>{mentor.branch}</span>}
                        {mentor.year && <span>&middot; Year {mentor.year}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {Number(mentor.avg_rating || mentor.avgRating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(mentor.skills || []).slice(0, 4).map((skill, i) => (
                      <span key={i} className="badge-primary text-xs py-0.5 px-2">
                        {skill}
                      </span>
                    ))}
                    {(mentor.skills || []).length > 4 && (
                      <span className="badge text-xs py-0.5 px-2 bg-gray-100 dark:bg-gray-800 text-gray-500">
                        +{mentor.skills.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {mentor.online_preference || 'Both'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {mentor.total_reviews || mentor.totalReviews || 0} reviews
                    </span>
                    {mentor.is_online && (
                      <span className="flex items-center gap-1 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        Online
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/book-session/${mentor.id}`}
                      className="btn-primary text-sm flex-1 flex items-center justify-center gap-1"
                    >
                      <Calendar className="w-4 h-4" />
                      Book Session
                    </Link>
                    <Link
                      to={`/chat?start=${mentor.id}`}
                      className="btn-secondary text-sm px-4"
                    >
                      Chat
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
