import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { analyzeEmergencyIssue } from '../../services/aiAssistant';
import { userAPI, sessionAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  AlertTriangle, X, Zap, Clock, Send, UserCheck,
  Bot, ArrowRight, Loader2, CheckCircle
} from 'lucide-react';

const SESSION_TYPES = [
  { id: 'quick_doubt', label: 'Quick Doubt', duration: 15, color: 'blue', icon: '❓' },
  { id: 'emergency_help', label: 'Emergency Help', duration: 25, color: 'red', icon: '🚨' },
  { id: 'learning', label: 'Learning Session', duration: 60, color: 'green', icon: '📚' },
  { id: 'project_guidance', label: 'Project Guidance', duration: 90, color: 'purple', icon: '🚀' },
  { id: 'interview_prep', label: 'Interview Prep', duration: 60, color: 'yellow', icon: '🎯' },
];

const EMERGENCY_SKILLS = [
  'JavaScript', 'React', 'Node.js', 'Python', 'TypeScript',
  'CSS', 'HTML', 'SQL', 'Git', 'Java', 'C++',
  'System Design', 'Data Structures', 'Algorithms', 'REST APIs',
];

export default function EmergencyHelpModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [issue, setIssue] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [matchedMentors, setMatchedMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedSkill('');
      setIssue('');
      setAiAnalysis(null);
      setMatchedMentors([]);
      setSelectedMentor(null);
      setSessionCreated(false);
    }
  }, [isOpen]);

  const handleAnalyzeIssue = async () => {
    if (!issue.trim()) {
      toast.error('Please describe your issue');
      return;
    }

    setLoading(true);
    try {
      const topics = analyzeEmergencyIssue(issue);
      setAiAnalysis({
        topics,
        summary: `The AI detected these topics in your issue: ${topics.join(', ')}. `,
        suggestion: 'A mentor with expertise in these areas can provide personalized guidance.',
      });

      // Find matching mentors
      const mentorsRes = await userAPI.getOnlineMentors({ skill: selectedSkill || topics[0] });
      setMatchedMentors(mentorsRes.data.mentors || []);
      setStep(3);
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('Failed to analyze issue');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSession = async (mentorId) => {
    setLoading(true);
    try {
      const now = new Date();
      const sessionDate = new Date(now.getTime() + 5 * 60000); // 5 minutes from now

      await sessionAPI.create({
        mentorId: mentorId,
        sessionType: 'emergency_help',
        date: sessionDate.toISOString(),
        duration: 25,
        skillId: null,
      });

      setSessionCreated(true);
      setStep(4);
      toast.success('Emergency session request sent!');
    } catch (error) {
      console.error('Create session error:', error);
      toast.error('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Emergency Help</h2>
                  <p className="text-red-100 text-sm">Get urgent help from a senior mentor</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= s
                        ? 'bg-white text-red-500'
                        : 'bg-white/20 text-white/60'
                    }`}
                  >
                    {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                  </div>
                  {s < 4 && (
                    <div className={`flex-1 h-1 rounded ${step > s ? 'bg-white' : 'bg-white/20'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Step 1: Select Skill */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Select the topic you need help with:
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Choose the skill area where you're stuck.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {EMERGENCY_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => {
                        setSelectedSkill(skill);
                        setStep(2);
                      }}
                      className={`p-3 rounded-xl border-2 text-left transition-all text-sm ${
                        selectedSkill === skill
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <span className="font-medium text-gray-900 dark:text-white">{skill}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Describe Issue */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Describe your issue:
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  The AI will analyze your problem and find the best mentor to help.
                </p>
                <textarea
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="Example: I'm trying to implement a useEffect hook that fetches data when the component mounts, but it keeps re-rendering infinitely..."
                  className="w-full h-40 p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white resize-none"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleAnalyzeIssue}
                    disabled={!issue.trim() || loading}
                    className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Bot className="w-4 h-4" />
                        Analyze with AI
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: AI Analysis + Matched Mentors */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                {/* AI Analysis */}
                {aiAnalysis && (
                  <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Bot className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">AI Analysis</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">{aiAnalysis.summary}</p>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">{aiAnalysis.suggestion}</p>
                      </div>
                    </div>
                  </div>
                )}

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Available Mentors:
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  These mentors are online and can help with {selectedSkill || 'your issue'}.
                </p>

                {matchedMentors.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">No mentors currently available for this skill.</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try a different skill or check back later.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matchedMentors.slice(0, 5).map((mentor) => (
                      <div
                        key={mentor.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedMentor?.id === mentor.id
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                              <span className="text-primary-600 font-medium text-sm">
                                {mentor.name?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{mentor.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {mentor.branch} &middot; Year {mentor.year}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRequestSession(mentor.id)}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Zap className="w-4 h-4" />
                                Request 25-min Session
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setStep(2)}
                  className="mt-4 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                  Back
                </button>
              </motion.div>
            )}

            {/* Step 4: Session Created */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Emergency Request Sent!
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  A {selectedMentor ? `25-minute emergency session with ${selectedMentor.name}` : '25-minute emergency session'} has been requested.
                  {selectedMentor ? ` ${selectedMentor.name}` : ' The mentor'} will review your request shortly.
                </p>
                <div className="flex items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Session duration: 25 minutes</span>
                </div>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  Close
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
