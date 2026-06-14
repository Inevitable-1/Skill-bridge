import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import {
  User, MapPin, BookOpen, Star, Calendar, Edit3,
  Save, X, Plus, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const branches = [
  'Computer Science', 'Information Technology', 'Electronics',
  'Electrical', 'Mechanical', 'Civil', 'Chemical', 'Biotech',
];

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [skillType, setSkillType] = useState('offered');

  const isOwnProfile = !id || id === String(currentUser?.id);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userId = id || currentUser?.id;
        if (!userId) return;
        const res = await userAPI.getProfile(userId);
        setProfile(res.data);
        setForm({
          name: res.data.name,
          branch: res.data.branch || '',
          year: res.data.year || '',
          bio: res.data.bio || '',
          onlinePreference: res.data.online_preference || 'both',
        });
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id, currentUser]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userAPI.updateProfile({
        name: form.name,
        branch: form.branch || null,
        year: form.year ? parseInt(form.year) : null,
        bio: form.bio,
        onlinePreference: form.onlinePreference,
      });
      setEditing(false);
      const res = await userAPI.getProfile(currentUser.id);
      setProfile(res.data);
      updateUser({ name: form.name });
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      const updatedOffered = skillType === 'offered'
        ? [...(profile.offeredSkills || []).map((s) => s.name), newSkill]
        : (profile.offeredSkills || []).map((s) => s.name);
      const updatedNeeded = skillType === 'needed'
        ? [...(profile.neededSkills || []).map((s) => s.name), newSkill]
        : (profile.neededSkills || []).map((s) => s.name);

      await userAPI.updateProfile({
        offeredSkills: updatedOffered,
        neededSkills: updatedNeeded,
      });

      const res = await userAPI.getProfile(currentUser.id);
      setProfile(res.data);
      setNewSkill('');
      toast.success('Skill added');
    } catch (error) {
      toast.error('Failed to add skill');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Profile not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Profile Header */}
        <div className="card p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-24 h-24 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <User className="w-12 h-12 text-primary-600 dark:text-primary-400" />
                </div>
              )}
              {profile.is_online && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
              )}
            </div>

            <div className="flex-1">
              {editing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field text-xl font-bold"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={form.branch}
                      onChange={(e) => setForm({ ...form, branch: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select branch</option>
                      {branches.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    <select
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select year</option>
                      {[1, 2, 3, 4, 5].map((y) => (
                        <option key={y} value={y}>Year {y}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Write a short bio..."
                  />
                  <select
                    value={form.onlinePreference}
                    onChange={(e) => setForm({ ...form, onlinePreference: e.target.value })}
                    className="input-field"
                  >
                    <option value="online">Online Only</option>
                    <option value="offline">Offline Only</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                    <span className={`badge ${profile.is_verified ? 'badge-success' : 'badge-warning'}`}>
                      {profile.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {profile.branch && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {profile.branch}
                      </span>
                    )}
                    {profile.year && <span>Year {profile.year}</span>}
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.online_preference || 'Both'}
                    </span>
                  </div>
                  {profile.bio && (
                    <p className="mt-3 text-gray-600 dark:text-gray-300">{profile.bio}</p>
                  )}
                </>
              )}
            </div>

            {isOwnProfile && (
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-1">
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-ghost text-sm flex items-center gap-1">
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} className="btn-secondary text-sm flex items-center gap-1">
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {Number(profile.avgRating || 0).toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{profile.totalReviews} reviews</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {profile.completedSessions || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {(profile.offeredSkills?.length || 0) + (profile.neededSkills?.length || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Skills</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Skills Offered</h3>
              <div className="flex flex-wrap gap-2">
                {profile.offeredSkills?.map((skill) => (
                  <span key={skill.id} className="badge-primary">
                    {skill.name}
                  </span>
                ))}
                {(!profile.offeredSkills || profile.offeredSkills.length === 0) && (
                  <span className="text-sm text-gray-400">No skills added yet</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Skills Needed</h3>
              <div className="flex flex-wrap gap-2">
                {profile.neededSkills?.map((skill) => (
                  <span key={skill.id} className="badge bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                    {skill.name}
                  </span>
                ))}
                {(!profile.neededSkills || profile.neededSkills.length === 0) && (
                  <span className="text-sm text-gray-400">No skills added yet</span>
                )}
              </div>
            </div>

            {isOwnProfile && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <select
                  value={skillType}
                  onChange={(e) => setSkillType(e.target.value)}
                  className="input-field w-32"
                >
                  <option value="offered">Offered</option>
                  <option value="needed">Needed</option>
                </select>
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  className="input-field flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <button onClick={handleAddSkill} className="btn-primary text-sm px-4">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
