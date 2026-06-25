import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userAPI, sessionAPI } from '../services/api';
import {
  Calendar, Clock, BookOpen, Video, MessageCircle,
  Target, Mic, ArrowLeft, CheckCircle, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const sessionTypes = [
  {
    id: 'quick_doubt',
    name: 'Quick Doubt',
    description: 'Get a quick answer to your question',
    icon: MessageCircle,
    color: 'yellow',
    duration: '15 min',
  },
  {
    id: 'emergency_help',
    name: 'Emergency Help',
    description: 'Urgent help for immediate issues',
    icon: AlertTriangle,
    color: 'red',
    duration: '25 min',
  },
  {
    id: 'learning',
    name: 'Learning Session',
    description: 'In-depth learning on a topic',
    icon: BookOpen,
    color: 'blue',
    duration: '60 min',
  },
  {
    id: 'project_guidance',
    name: 'Project Guidance',
    description: 'Get help with your project',
    icon: Target,
    color: 'green',
    duration: '90 min',
  },
  {
    id: 'interview_prep',
    name: 'Interview Preparation',
    description: 'Practice and prepare for interviews',
    icon: Mic,
    color: 'purple',
    duration: '60 min',
  },
];

export default function BookSessionPage() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const loadMentor = async () => {
      try {
        const res = await userAPI.getProfile(mentorId);
        setMentor(res.data);
      } catch (error) {
        toast.error('Mentor not found');
        navigate('/my-mentors');
      } finally {
        setLoading(false);
      }
    };
    loadMentor();
  }, [mentorId, navigate]);

  const handleBook = async () => {
    if (!selectedType || !selectedDate || !selectedTime) {
      return toast.error('Please fill all required fields');
    }

    const selectedSessionType = sessionTypes.find(t => t.id === selectedType);
    const duration = selectedSessionType?.id === 'emergency_help' ? 25
      : selectedSessionType?.id === 'quick_doubt' ? 15
      : selectedSessionType?.id === 'project_guidance' ? 90
      : 60;

    setBooking(true);
    try {
      const dateTime = new Date(`${selectedDate}T${selectedTime}`);
      await sessionAPI.create({
        mentorId: parseInt(mentorId),
        skillId: selectedSkill || undefined,
        sessionType: selectedType,
        date: dateTime.toISOString(),
        duration,
      });
      toast.success('Session booked! Waiting for mentor approval.');
      navigate('/sessions');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to book session');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!mentor) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Mentor Card */}
        <div className="card p-6">
          <div className="flex items-center gap-4">
            {mentor.avatar_url ? (
              <img src={mentor.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span className="text-primary-600 text-2xl font-bold">{mentor.name?.charAt(0)}</span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{mentor.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">
                {mentor.branch} &middot; Year {mentor.year}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {mentor.offeredSkills?.map((skill) => (
                  <span key={skill.id} className="badge-primary text-xs">{skill.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Session Type */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Session Type</h3>
          <div className="grid grid-cols-2 gap-3">
            {sessionTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedType === type.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 text-${type.color}-600`} />
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{type.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{type.description}</p>
                  <p className="text-xs text-gray-400 mt-2">{type.duration}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Skill Selection */}
        {mentor.offeredSkills?.length > 0 && (
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Skill (Optional)</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.offeredSkills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => setSelectedSkill(selectedSkill === skill.id ? '' : skill.id)}
                  className={`badge cursor-pointer transition-all ${
                    selectedSkill === skill.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 hover:bg-primary-200'
                  }`}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date & Time */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Date & Time</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={today}
                  className="input-field pl-11"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="input-field pl-11"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Book Button */}
        <button
          onClick={handleBook}
          disabled={!selectedType || !selectedDate || !selectedTime || booking}
          className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {booking ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Book Session
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
