import { motion } from 'framer-motion';
import { Star, Clock, Calendar, BookOpen, Award } from 'lucide-react';

const SKILL_COLORS = {
  'React': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  'Python': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  'Java': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  'JavaScript': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  'Node.js': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  'C++': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  'SQL': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
  'default': 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

const getSkillColor = (skill) => SKILL_COLORS[skill] || SKILL_COLORS.default;

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('');
}

export default function MentorCard({ mentor, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={() => onClick(mentor)}
      className="group cursor-pointer relative overflow-hidden rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <span className="text-white font-bold text-xl">{getInitials(mentor.name)}</span>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
              mentor.online ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {mentor.name}
            </h3>
            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
              {mentor.role}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-gray-900 dark:text-white">{mentor.rating}</span>
          </div>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{mentor.experience} Years</span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{mentor.sessionsCompleted} Sessions</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Award className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400">{mentor.qualification}</span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400">{mentor.college}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {mentor.skills.slice(0, 3).map((skill, i) => (
            <span key={i} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${getSkillColor(skill)}`}>
              {skill}
            </span>
          ))}
          {mentor.skills.length > 3 && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              +{mentor.skills.length - 3}
            </span>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700/50 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Last: {formatDate(mentor.lastSessionDate)}</span>
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-medium ${
            mentor.online ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
          }`}>
            <div className={`w-2 h-2 rounded-full ${mentor.online ? 'bg-green-500' : 'bg-gray-400'}`} />
            {mentor.online ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
