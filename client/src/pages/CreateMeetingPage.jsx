import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getMeetingLink, copyMeetingLink, copyInvitationText, getWhatsAppShareUrl, getEmailShareUrl } from '../utils/meetingLink';
import {
  Video, Calendar, Clock, Lock, Globe, Users, BookOpen,
  MessageSquare, Briefcase, Code, Presentation, Share2,
  Copy, Check, X, ChevronDown, Eye, EyeOff, Globe2, Link2, Clipboard
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const meetingTypes = [
  { value: 'one-on-one', label: 'One-to-One Mentoring', icon: Users },
  { value: 'group_class', label: 'Group Class', icon: Users },
  { value: 'workshop', label: 'Workshop', icon: Presentation },
  { value: 'interview', label: 'Interview Session', icon: Briefcase },
  { value: 'project', label: 'Project Discussion', icon: Code },
];

const durationOptions = [15, 30, 45, 60, 90, 120];

const getTimezoneInfo = () => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = new Date().getTimezoneOffset();
  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset / 60);
  const mins = absOffset % 60;
  const sign = offset <= 0 ? '+' : '-';
  const offsetStr = `UTC${sign}${hours}${mins > 0 ? ':' + String(mins).padStart(2, '0') : ''}`;

  const tzAbbreviations = {
    'Asia/Kolkata': 'IST',
    'America/New_York': 'EST',
    'America/Chicago': 'CST',
    'America/Denver': 'MST',
    'America/Los_Angeles': 'PST',
    'Europe/London': 'GMT',
    'Europe/Berlin': 'CET',
    'Asia/Tokyo': 'JST',
    'Asia/Shanghai': 'CST',
    'Australia/Sydney': 'AEDT',
  };
  const abbr = tzAbbreviations[tz] || '';
  return { tz, offsetStr, abbr, display: abbr ? `${tz} (${abbr})` : `${tz} (${offsetStr})` };
};

const getDefaultDate = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getDefaultTime = () => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

export default function CreateMeetingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const timezoneInfo = getTimezoneInfo();

  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    meetingType: 'group_class',
    date: getDefaultDate(),
    time: getDefaultTime(),
    duration: 60,
    security: 'public',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedInvitation, setCopiedInvitation] = useState(false);
  const [timeError, setTimeError] = useState('');

  const isTimeInPast = () => {
    const now = new Date();
    const selected = new Date(`${form.date}T${form.time}:00`);
    return selected <= now;
  };

  useEffect(() => {
    if (isTimeInPast()) {
      setTimeError('Meeting time cannot be in the past');
    } else {
      setTimeError('');
    }
  }, [form.date, form.time]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => {
    return {
      title: form.title.trim(),
      description: form.description.trim(),
      subject: form.subject.trim(),
      meetingType: form.meetingType,
      date: form.date,
      time: form.time,
      duration: Number(form.duration),
      security: form.security,
      password: form.security === 'password' ? form.password : undefined,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Please enter a meeting title');
      return;
    }

    if (isTimeInPast()) {
      toast.error('Meeting time cannot be in the past');
      return;
    }

    if (form.security === 'password' && !form.password.trim()) {
      toast.error('Please enter a meeting password');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await api.post('/meetings/create', buildPayload());
      const meeting = data.meeting;
      if (!meeting || !meeting.meeting_code) {
        toast.error('Meeting created but no meeting code received. Please try again.');
        return;
      }
      setCreatedMeeting(meeting);
      setShowSuccessModal(true);
      toast.success('Meeting created successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Something went wrong';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const meetingLink = createdMeeting?.meeting_code
    ? getMeetingLink(createdMeeting.meeting_code)
    : '';

  const handleCopyLink = () => {
    if (!createdMeeting?.meeting_code) return;
    copyMeetingLink(createdMeeting.meeting_code);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!createdMeeting?.meeting_code) return;
    window.open(getWhatsAppShareUrl(createdMeeting.title, createdMeeting.meeting_code), '_blank');
  };

  const handleShareEmail = () => {
    if (!createdMeeting?.meeting_code) return;
    window.open(getEmailShareUrl(createdMeeting.title, createdMeeting.meeting_code), '_blank');
  };

  const handleCopyInvitation = () => {
    if (!createdMeeting?.meeting_code) return;
    copyInvitationText(createdMeeting.title, createdMeeting.meeting_code);
    setCopiedInvitation(true);
    toast.success('Invitation copied to clipboard');
    setTimeout(() => setCopiedInvitation(false), 2000);
  };

  const handleJoinMeeting = () => {
    setShowSuccessModal(false);
    navigate(`/meeting/${createdMeeting.meeting_code}`);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setCreatedMeeting(null);
    navigate('/dashboard');
  };

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200';
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/30">
            <Video className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Create Meeting</h1>
            <p className="text-gray-400 text-sm">Set up a new mentoring session</p>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl"
        >
          {/* Title */}
          <div>
            <label className={labelClass}>Meeting Title *</label>
            <input
              type="text"
              placeholder="e.g. React Advanced Patterns Review"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={inputClass}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
              placeholder="What will this meeting cover?"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Subject */}
          <div>
            <label className={labelClass}>Subject</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="e.g. React.js, System Design, DSA"
                value={form.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          {/* Meeting Type */}
          <div>
            <label className={labelClass}>Meeting Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {meetingTypes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleChange('meetingType', value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    form.meetingType === value
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date, Time, Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  type="date"
                  value={form.date}
                  min={getDefaultDate()}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className={`${inputClass} pl-10 [color-scheme:dark]`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className={`${inputClass} pl-10 [color-scheme:dark] ${timeError ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Globe2 className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">{timezoneInfo.display}</span>
              </div>
              {timeError && (
                <p className="text-xs text-red-400 mt-1">{timeError}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Duration</label>
              <div className="relative">
                <select
                  value={form.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer pr-10`}
                >
                  {durationOptions.map((d) => (
                    <option key={d} value={d} className="bg-slate-900 text-white">
                      {d} min
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Security Options */}
          <div>
            <label className={labelClass}>Security</label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleChange('security', 'public')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all duration-200 ${
                  form.security === 'public'
                    ? 'bg-green-600/20 border-green-500/50 text-green-300'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Globe className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Public Link</p>
                  <p className="text-xs opacity-70">Anyone with the link can join</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleChange('security', 'password')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all duration-200 ${
                  form.security === 'password'
                    ? 'bg-amber-600/20 border-amber-500/50 text-amber-300'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Lock className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Password Protected</p>
                  <p className="text-xs opacity-70">Participants need a password to join</p>
                </div>
              </button>
            </div>

            <AnimatePresence>
              {form.security === 'password' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="relative mt-3">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter meeting password"
                      value={form.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={`${inputClass} pl-10 pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating Meeting...
              </>
            ) : (
              <>
                <Video className="w-5 h-5" />
                Create Meeting
              </>
            )}
          </motion.button>
        </motion.form>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && createdMeeting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl"
            >
              {/* Close */}
              <div className="flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Checkmark Animation */}
              <div className="flex flex-col items-center text-center -mt-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-green-600/20 border-2 border-green-500 flex items-center justify-center mb-4"
                >
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <Check className="w-8 h-8 text-green-400" />
                  </motion.div>
                </motion.div>

                <h2 className="text-xl font-bold text-white mb-1">Meeting Created Successfully!</h2>
                <p className="text-gray-400 text-sm mb-4">{createdMeeting.title}</p>

                {/* Preview Card */}
                <div className="w-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4 mb-5">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <Video className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="text-sm font-semibold text-white">{createdMeeting.title}</span>
                    </div>
                    {(createdMeeting.date || createdMeeting.time) && (
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-sm text-gray-300">
                          {createdMeeting.date || 'Today'}{createdMeeting.time ? ` at ${createdMeeting.time}` : ''}
                          {createdMeeting.duration ? ` \u00b7 ${createdMeeting.duration} min` : ''}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5">
                      <Link2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="text-sm text-indigo-300 truncate">{meetingLink}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-all duration-200 text-sm"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button
                      onClick={handleCopyInvitation}
                      className="flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg border border-white/10 transition-all duration-200 text-sm"
                    >
                      {copiedInvitation ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                      {copiedInvitation ? 'Copied!' : 'Copy Invite'}
                    </button>
                  </div>

                  <button
                    onClick={handleShareWhatsApp}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium rounded-lg transition-all duration-200 text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Share via WhatsApp
                  </button>

                  <button
                    onClick={handleShareEmail}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg border border-white/10 transition-all duration-200 text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Share via Email
                  </button>

                  <button
                    onClick={handleJoinMeeting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-indigo-600/20 text-sm"
                  >
                    <Video className="w-4 h-4" />
                    Join Meeting
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
