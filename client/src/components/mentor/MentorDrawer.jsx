import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Star, MapPin, Mail, Phone, Globe, Clock, Calendar, Users, Award,
  BookOpen, Briefcase, GraduationCap, ExternalLink, Download, MessageCircle,
  ChevronDown, ChevronUp, Linkedin, Github
} from 'lucide-react';
import PreviousSessionsModal from './PreviousSessionsModal';

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

export default function MentorDrawer({ mentor, onClose, onMessage, onBookSession }) {
  const [showSessions, setShowSessions] = useState(false);

  if (!mentor) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full sm:w-[520px] bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
        >
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary-500 to-primary-700" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative pt-20 pb-6 px-6">
              <div className="flex flex-col items-center text-center mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-xl mb-4"
                >
                  <span className="text-white font-bold text-4xl">{getInitials(mentor.name)}</span>
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{mentor.name}</h2>
                <p className="text-primary-600 dark:text-primary-400 font-semibold mb-2">{mentor.role}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{mentor.primarySubject} Mentor</p>

                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">{mentor.rating}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${
                    mentor.online
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${mentor.online ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-sm font-medium">{mentor.online ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: GraduationCap, label: mentor.qualification, sublabel: mentor.college },
                  { icon: Briefcase, label: `${mentor.experience} Years Experience`, sublabel: mentor.company },
                  { icon: Users, label: `${mentor.studentsMentored} Students`, sublabel: 'Mentored' },
                  { icon: Award, label: `${mentor.sessionsCompleted} Sessions`, sublabel: 'Completed' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center"
                  >
                    <item.icon className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{item.sublabel}</p>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-5">
                <Section title="About">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{mentor.bio}</p>
                </Section>

                <Section title="Contact">
                  <div className="space-y-2">
                    <InfoRow icon={Mail} value={mentor.email} />
                    <InfoRow icon={Phone} value={mentor.phone} />
                    <InfoRow icon={MapPin} value={mentor.location} />
                  </div>
                </Section>

                <Section title="University">
                  <div className="space-y-2">
                    <InfoRow icon={GraduationCap} value={mentor.university} />
                    <InfoRow icon={BookOpen} value={mentor.college} />
                  </div>
                </Section>

                <Section title="Languages">
                  <div className="flex flex-wrap gap-2">
                    {mentor.languages.map((lang, i) => (
                      <span key={i} className="text-xs font-medium px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full">
                        {lang}
                      </span>
                    ))}
                  </div>
                </Section>

                <Section title="Skills">
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills.map((skill, i) => (
                      <span key={i} className="text-xs font-semibold px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </Section>

                <Section title="Availability">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{mentor.availableDays.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{mentor.availableTime}</span>
                    </div>
                  </div>
                </Section>

                {mentor.certificates.length > 0 && (
                  <Section title="Certificates">
                    <div className="space-y-2">
                      {mentor.certificates.map((cert, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                <Section title="Stats">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: mentor.studentsMentored, label: 'Students' },
                      { value: mentor.projectsGuided, label: 'Projects' },
                      { value: mentor.sessionsCompleted, label: 'Sessions' },
                    ].map((stat, i) => (
                      <div key={i} className="text-center bg-primary-50 dark:bg-primary-900/20 rounded-xl py-3">
                        <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{stat.value}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Joined">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Member since {formatDate(mentor.joinedDate)}</p>
                </Section>

                <Section title="Social Links">
                  <div className="flex gap-3">
                    {mentor.social.linkedin && (
                      <a href={mentor.social.linkedin} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-sm font-medium">
                        <Linkedin className="w-4 h-4" /> LinkedIn
                      </a>
                    )}
                    {mentor.social.github && (
                      <a href={mentor.social.github} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                        <Github className="w-4 h-4" /> GitHub
                      </a>
                    )}
                    {mentor.social.portfolio && (
                      <a href={mentor.social.portfolio} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors text-sm font-medium">
                        <Globe className="w-4 h-4" /> Portfolio
                      </a>
                    )}
                  </div>
                </Section>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium">
                  <Download className="w-4 h-4" />
                  Download Resume
                </button>

                <div className="space-y-3 pt-2 pb-4">
                  <button
                    onClick={() => onMessage(mentor)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold shadow-lg shadow-primary-500/25"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                  <button
                    onClick={() => onBookSession(mentor)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold shadow-lg shadow-blue-500/25"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Session
                  </button>
                  <button
                    onClick={() => setShowSessions(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors font-medium"
                  >
                    <BookOpen className="w-4 h-4" />
                    View Previous Sessions
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {showSessions && (
        <PreviousSessionsModal
          sessions={mentor.sessions}
          mentorName={mentor.name}
          onClose={() => setShowSessions(false)}
        />
      )}
    </>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-primary-500 flex-shrink-0" />
      <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
    </div>
  );
}
