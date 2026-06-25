import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Users, X, Filter, SortAsc, ArrowUpDown,
  Calendar, BookOpen, ChevronDown
} from 'lucide-react';
import MentorCard from '../components/mentor/MentorCard';
import MentorDrawer from '../components/mentor/MentorDrawer';

const MY_MENTORS = [];

const SUBJECTS = [
  'All', 'Java', 'React', 'Data Structures', 'Cyber Security',
  'Cloud Computing', 'Python', 'Node.js', 'C++', 'SQL', 'DevOps'
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently Met' },
  { value: 'sessions', label: 'Most Sessions' },
  { value: 'rating', label: 'Highest Rating' },
  { value: 'alpha', label: 'Alphabetical' },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'high_rated', label: 'Highest Rated' },
  { value: 'recent', label: 'Recently Met' },
];

export default function MyMentorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubject, setActiveSubject] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const filteredMentors = useMemo(() => {
    let result = [...MY_MENTORS];

    if (activeSubject !== 'All') {
      result = result.filter(m =>
        m.primarySubject === activeSubject ||
        m.skills.some(s => s.toLowerCase() === activeSubject.toLowerCase())
      );
    }

    if (filterBy === 'online') {
      result = result.filter(m => m.online);
    } else if (filterBy === 'offline') {
      result = result.filter(m => !m.online);
    } else if (filterBy === 'high_rated') {
      result = result.filter(m => m.rating >= 4.8);
    } else if (filterBy === 'recent') {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      result = result.filter(m => new Date(m.lastSessionDate) >= twoWeeksAgo);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.primarySubject.toLowerCase().includes(q) ||
        m.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.lastSessionDate) - new Date(a.lastSessionDate));
        break;
      case 'sessions':
        result.sort((a, b) => b.sessionsCompleted - a.sessionsCompleted);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'alpha':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [searchQuery, activeSubject, sortBy, filterBy]);

  const handleMessage = (mentor) => {
    window.location.href = `/chat?start=${mentor.id}`;
  };

  const handleBookSession = (mentor) => {
    window.location.href = `/book-session/${mentor.id}`;
  };

  if (MY_MENTORS.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-40 h-40 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
            <Users className="w-20 h-20 text-primary-400 dark:text-primary-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">No mentors yet</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
            You'll see mentors here after attending your first mentoring session.
          </p>
          <Link
            to="/create-meeting"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold shadow-lg shadow-primary-500/25"
          >
            <Calendar className="w-5 h-5" />
            Book First Session
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Mentors</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Mentors you've learned from
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Users className="w-4 h-4" />
            {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, skill, or subject..."
                className="input-field pl-11"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors font-medium text-sm ${
                showFilters || filterBy !== 'all'
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors font-medium text-sm"
              >
                <ArrowUpDown className="w-4 h-4" />
                Sort
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showSort && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => { setSortBy(option.value); setShowSort(false); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          sortBy === option.value
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-700/50 mt-2">
                  {FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilterBy(option.value)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                        filterBy === option.value
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-700/50">
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() => setActiveSubject(subject)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                  activeSubject === subject
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''}
            {activeSubject !== 'All' && ` for "${activeSubject}"`}
          </p>
          {(searchQuery || activeSubject !== 'All' || filterBy !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setActiveSubject('All'); setFilterBy('all'); }}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>

        {filteredMentors.length === 0 ? (
          <div className="card p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No mentors found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search, filters, or subject selection
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                onClick={setSelectedMentor}
              />
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedMentor && (
          <MentorDrawer
            mentor={selectedMentor}
            onClose={() => setSelectedMentor(null)}
            onMessage={handleMessage}
            onBookSession={handleBookSession}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
