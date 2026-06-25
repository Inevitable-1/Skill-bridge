import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Lock, Eye, EyeOff, UserPlus, Phone, Calendar,
  GraduationCap, BookOpen, Code, ChevronRight, ChevronLeft,
  Check, Upload, X, Award, Briefcase, Target, Users, Hammer, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

const SKILL_CATEGORIES = {
  'Frontend': ['HTML', 'CSS', 'JavaScript', 'React', 'Angular', 'Vue.js', 'Tailwind CSS', 'TypeScript'],
  'Backend': ['Node.js', 'Express.js', 'Java', 'Spring Boot', 'Python', 'FastAPI', 'Django', 'Flask'],
  'Database': ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite'],
  'Programming': ['C', 'C++', 'Java', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust'],
  'AI / ML': ['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'Scikit-Learn'],
  'Cloud': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform'],
  'Cyber Security': ['Ethical Hacking', 'Network Security', 'Penetration Testing', 'Kali Linux', 'OWASP'],
  'DevOps': ['Jenkins', 'CI/CD', 'Docker', 'Kubernetes', 'Linux', 'Git'],
};

const BRANCHES = ['Computer Science', 'Information Technology', 'Electronics', 'Electrical', 'Mechanical', 'Civil', 'Chemical', 'Biotech'];
const DEGREES = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'B.E', 'M.E'];
const YEARS = [1, 2, 3, 4, 5];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const RegisterPage = () => {
  const [step, setStep] = useState(0); // Step 0 = role selection
  const [direction, setDirection] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [registrationResult, setRegistrationResult] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', dob: '', gender: '',
    profilePicture: null, college: '', university: '', branch: '', degree: '', currentYear: '',
    cgpa: '', graduationYear: '', selectedSkills: [], customSkills: '', bio: '', role: '',
    yearsExperience: '', qualification: '', resumeUrl: '', governmentIdUrl: '',
    linkedinUrl: '', githubUrl: '', portfolioUrl: '', location: '', languages: '',
    certificates: '', programmingLanguages: '', projects: '', experience: '',
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const toggleSkill = (skill) => {
    setForm((prev) => {
      const isSelected = prev.selectedSkills.includes(skill);
      return {
        ...prev,
        selectedSkills: isSelected
          ? prev.selectedSkills.filter((s) => s !== skill)
          : [...prev.selectedSkills, skill],
      };
    });
    if (errors.selectedSkills) {
      setErrors((prev) => ({ ...prev, selectedSkills: '' }));
    }
  };

  const selectRole = (role) => {
    setForm({ ...form, role });
    setDirection(1);
    setStep(1);
  };

  const getTotalSteps = () => {
    if (form.role === 'junior') return 4; // Personal, Education, Skills, Review
    if (form.role === 'senior') return 5; // Personal, Education, Skills, Mentor Details, Review
    return 5; // Personal, Education, Skills, Developer Details, Review
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else {
      if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      else if (!/[A-Z]/.test(form.password)) newErrors.password = 'Must contain at least one uppercase letter';
      else if (!/[a-z]/.test(form.password)) newErrors.password = 'Must contain at least one lowercase letter';
      else if (!/[0-9]/.test(form.password)) newErrors.password = 'Must contain at least one number';
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!form.college.trim()) newErrors.college = 'College is required';
    if (!form.branch) newErrors.branch = 'Branch is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (form.selectedSkills.length === 0 && !form.customSkills.trim()) {
      newErrors.selectedSkills = 'Select at least one skill or add custom skills';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCurrentStep = () => {
    switch (step) {
      case 1: return validateStep1();
      case 2: return validateStep2();
      case 3: return validateStep3();
      default: return true;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setDirection(1);
      setStep((s) => Math.min(s + 1, getTotalSteps()));
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    try {
      const skillsList = [...form.selectedSkills];
      if (form.customSkills.trim()) {
        const custom = form.customSkills.split(',').map((s) => s.trim()).filter(Boolean);
        skillsList.push(...custom);
      }

      const roleMap = { junior: 'junior', senior: 'senior', developer: 'developer' };

      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        dob: form.dob,
        gender: form.gender,
        college: form.college,
        university: form.university,
        branch: form.branch,
        degree: form.degree,
        year: form.currentYear ? parseInt(form.currentYear) : null,
        cgpa: form.cgpa,
        graduation_year: form.graduationYear ? parseInt(form.graduationYear) : null,
        skills: skillsList,
        bio: form.bio,
        role: roleMap[form.role] || 'junior',
        years_experience: form.yearsExperience ? parseInt(form.yearsExperience) : null,
        qualification: form.qualification,
        linkedin_url: form.linkedinUrl,
        github_url: form.githubUrl,
        portfolio_url: form.portfolioUrl,
        location: form.location,
        languages: form.languages ? form.languages.split(',').map(s => s.trim()).filter(Boolean) : null,
        certificates: form.certificates ? form.certificates.split(',').map(s => s.trim()).filter(Boolean) : null,
        programming_languages: form.programmingLanguages ? form.programmingLanguages.split(',').map(s => s.trim()).filter(Boolean) : null,
      };

      const result = await register(payload);

      if (result && result.accountStatus === 'pending') {
        setRegistrationResult({ type: 'pending', message: result.message || form.role === 'senior'
          ? 'Your mentor application has been submitted successfully. Please wait until the administrator reviews your application.'
          : 'Your developer application has been submitted successfully. Please wait until the administrator reviews your application.' });
      } else {
        toast.success('Welcome to SkillBridge! Please login.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    }
  };

  const renderInput = (name, label, type = 'text', icon, placeholder, required = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <input
          type={type === 'password' ? (name === 'password' ? (showPassword ? 'text' : 'password') : (showConfirmPassword ? 'text' : 'password')) : type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2.5 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${errors[name] ? 'border-red-500' : 'border-gray-600/50'}`}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => name === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            {name === 'password' ? (showPassword ? <EyeOff size={18} /> : <Eye size={18} />) : (showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />)}
          </button>
        )}
      </div>
      {errors[name] && <p className="mt-1 text-xs text-red-400">{errors[name]}</p>}
    </div>
  );

  const renderSelect = (name, label, options, placeholder, required = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        name={name}
        value={form[name]}
        onChange={handleChange}
        className={`w-full px-3 py-2.5 bg-gray-800/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${form[name] ? 'text-white' : 'text-gray-500'} ${errors[name] ? 'border-red-500' : 'border-gray-600/50'}`}
      >
        <option value="" className="bg-gray-800 text-gray-500">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-gray-800 text-white">{opt}</option>
        ))}
      </select>
      {errors[name] && <p className="mt-1 text-xs text-red-400">{errors[name]}</p>}
    </div>
  );

  // Step 0: Role Selection
  const renderRoleSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">Choose Your Role</h2>
        <p className="text-sm text-gray-400">How would you like to join SkillBridge?</p>
      </div>

      <div className="space-y-3">
        {[
          { value: 'junior', label: 'Student', desc: 'Learn from mentors, join sessions, and grow your skills', icon: BookOpen, color: 'green' },
          { value: 'senior', label: 'Mentor', desc: 'Guide students, share knowledge, and build your reputation', icon: Award, color: 'blue' },
          { value: 'developer', label: 'Developer', desc: 'Contribute to the platform, build features, and collaborate', icon: Hammer, color: 'purple' },
        ].map(({ value, label, desc, icon: Icon, color }) => (
          <motion.button
            key={value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectRole(value)}
            className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
              color === 'green'
                ? 'border-green-500/30 hover:border-green-500 bg-green-500/5 hover:bg-green-500/10'
                : color === 'blue'
                ? 'border-blue-500/30 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/10'
                : 'border-purple-500/30 hover:border-purple-500 bg-purple-500/5 hover:bg-purple-500/10'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                color === 'green' ? 'bg-green-500/20' : color === 'blue' ? 'bg-blue-500/20' : 'bg-purple-500/20'
              }`}>
                <Icon className={`w-6 h-6 ${
                  color === 'green' ? 'text-green-400' : color === 'blue' ? 'text-blue-400' : 'text-purple-400'
                }`} />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{label}</p>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 ml-auto" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <User size={20} className="text-blue-400" />
        Personal Details
      </h3>

      <div className="flex justify-center">
        <label className="relative cursor-pointer group">
          <div className="w-24 h-24 rounded-full bg-gray-800/50 border-2 border-dashed border-gray-600 group-hover:border-blue-500 transition-all flex items-center justify-center overflow-hidden">
            {form.profilePicture ? (
              <img src={URL.createObjectURL(form.profilePicture)} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <Upload size={24} className="mx-auto text-gray-400 group-hover:text-blue-400 transition-colors" />
                <span className="text-[10px] text-gray-500 block mt-1">Upload</span>
              </div>
            )}
          </div>
          <input type="file" name="profilePicture" accept="image/*" onChange={handleChange} className="hidden" />
        </label>
      </div>

      {renderInput('name', 'Full Name', 'text', <User size={18} />, 'Enter your full name', true)}
      {renderInput('email', 'Email', 'email', <Mail size={18} />, 'Enter your email', true)}
      {renderInput('password', 'Password', 'password', <Lock size={18} />, 'Create a password', true)}
      {renderInput('confirmPassword', 'Confirm Password', 'password', <Lock size={18} />, 'Confirm your password', true)}
      {renderInput('phone', 'Phone', 'tel', <Phone size={18} />, 'Enter your phone number')}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Date of Birth</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Calendar size={18} /></span>
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all [color-scheme:dark]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Gender</label>
        <div className="flex gap-3">
          {['Male', 'Female', 'Other'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => { setForm({ ...form, gender: g }); if (errors.gender) setErrors({ ...errors, gender: '' }); }}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${form.gender === g ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-gray-800/50 border-gray-600/50 text-gray-400 hover:border-gray-500'}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
        <p className="text-xs text-gray-400">
          <span className="font-medium text-gray-300">Password rules:</span> At least 8 characters, one uppercase, one lowercase, one number.
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <GraduationCap size={20} className="text-blue-400" />
        Education Details
      </h3>

      {renderInput('college', 'College / Institution', 'text', <GraduationCap size={18} />, 'Enter your college name', true)}
      {renderInput('university', 'University', 'text', <BookOpen size={18} />, 'Enter your university name')}

      <div className="grid grid-cols-2 gap-4">
        {renderSelect('branch', 'Branch / Specialization', BRANCHES, 'Select branch', true)}
        {renderSelect('degree', 'Degree', DEGREES, 'Select degree')}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {renderSelect('currentYear', 'Current Year', YEARS.map(String), 'Select year')}
        {renderInput('cgpa', 'CGPA', 'text', <Award size={18} />, 'e.g. 8.5')}
      </div>

      {renderInput('graduationYear', 'Graduation Year', 'number', <Calendar size={18} />, 'e.g. 2026')}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Code size={20} className="text-blue-400" />
        Skills & Profile
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Select Your Skills <span className="text-red-400">*</span>
        </label>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => (
            <div key={category} className="bg-gray-800/30 rounded-lg border border-gray-700/50 overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-300">{category}</span>
                <motion.div animate={{ rotate: expandedCategory === category ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronRight size={16} className="text-gray-400 rotate-90" />
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedCategory === category && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 flex flex-wrap gap-1.5">
                      {skills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${form.selectedSkills.includes(skill) ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50' : 'bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:border-gray-500 hover:text-gray-300'}`}
                        >
                          {form.selectedSkills.includes(skill) && <Check size={12} className="inline mr-1" />}
                          {skill}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        {errors.selectedSkills && <p className="mt-1 text-xs text-red-400">{errors.selectedSkills}</p>}
      </div>

      {form.selectedSkills.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-1.5">Selected: {form.selectedSkills.length} skill(s)</p>
          <div className="flex flex-wrap gap-1.5">
            {form.selectedSkills.slice(0, 10).map((skill) => (
              <span key={skill} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs flex items-center gap-1">
                {skill}
                <button type="button" onClick={() => toggleSkill(skill)} className="hover:text-blue-100">
                  <X size={12} />
                </button>
              </span>
            ))}
            {form.selectedSkills.length > 10 && (
              <span className="px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded-full text-xs">
                +{form.selectedSkills.length - 10} more
              </span>
            )}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Custom Skills</label>
        <textarea
          name="customSkills"
          value={form.customSkills}
          onChange={handleChange}
          placeholder="Add custom skills separated by commas (e.g., GraphQL, Firebase, Figma)"
          rows={2}
          className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Bio</label>
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          placeholder="Tell us about yourself, your interests, and goals..."
          rows={3}
          className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
        />
      </div>
    </div>
  );

  const renderMentorStep4 = () => (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Award size={20} className="text-blue-400" />
        Mentor Details
      </h3>

      {renderInput('qualification', 'Qualification', 'text', <GraduationCap size={18} />, 'e.g. M.Tech Computer Science')}
      {renderInput('yearsExperience', 'Years of Experience', 'number', <Briefcase size={18} />, 'e.g. 5')}
      {renderInput('linkedinUrl', 'LinkedIn Profile', 'url', <Globe size={18} />, 'https://linkedin.com/in/yourprofile')}
      {renderInput('githubUrl', 'GitHub Profile', 'url', <Code size={18} />, 'https://github.com/yourusername')}
      {renderInput('portfolioUrl', 'Portfolio Website', 'url', <Globe size={18} />, 'https://yoursite.com')}
      {renderInput('location', 'Location', 'text', <Globe size={18} />, 'e.g. Hyderabad, India')}
      {renderInput('languages', 'Languages Known', 'text', <Globe size={18} />, 'Comma separated: English, Hindi, Telugu')}
      {renderInput('certificates', 'Certificates', 'text', <Award size={18} />, 'Comma separated certifications')}
    </div>
  );

  const renderDeveloperStep4 = () => (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Hammer size={20} className="text-blue-400" />
        Developer Details
      </h3>

      {renderInput('programmingLanguages', 'Programming Languages', 'text', <Code size={18} />, 'Comma separated: JavaScript, Python, Go')}
      {renderInput('yearsExperience', 'Years of Experience', 'number', <Briefcase size={18} />, 'e.g. 3')}
      {renderInput('githubUrl', 'GitHub Profile', 'url', <Code size={18} />, 'https://github.com/yourusername')}
      {renderInput('portfolioUrl', 'Portfolio Website', 'url', <Globe size={18} />, 'https://yoursite.com')}
      {renderInput('linkedinUrl', 'LinkedIn Profile', 'url', <Globe size={18} />, 'https://linkedin.com/in/yourprofile')}
      {renderInput('location', 'Location', 'text', <Globe size={18} />, 'e.g. Bangalore, India')}
      {renderInput('languages', 'Languages Known', 'text', <Globe size={18} />, 'Comma separated: English, Hindi')}
      {renderInput('certificates', 'Certificates', 'text', <Award size={18} />, 'Comma separated certifications')}
    </div>
  );

  const renderReviewStep = () => {
    const skillsList = [...form.selectedSkills];
    if (form.customSkills.trim()) {
      const custom = form.customSkills.split(',').map((s) => s.trim()).filter(Boolean);
      skillsList.push(...custom);
    }

    const roleLabels = { junior: 'Student', senior: 'Mentor', developer: 'Developer' };

    return (
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Check size={20} className="text-blue-400" />
          Review & Submit
        </h3>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="text-sm text-blue-300">Registering as: <span className="font-semibold">{roleLabels[form.role]}</span></p>
        </div>

        <div className="space-y-4">
          <ReviewSection title="Personal Details" icon={<User size={16} />}>
            <ReviewItem label="Name" value={form.name} />
            <ReviewItem label="Email" value={form.email} />
            <ReviewItem label="Phone" value={form.phone || 'Not provided'} />
            <ReviewItem label="Date of Birth" value={form.dob || 'Not provided'} />
            <ReviewItem label="Gender" value={form.gender || 'Not selected'} />
          </ReviewSection>

          <ReviewSection title="Education Details" icon={<GraduationCap size={16} />}>
            <ReviewItem label="College" value={form.college} />
            <ReviewItem label="University" value={form.university || 'Not provided'} />
            <ReviewItem label="Branch" value={form.branch || 'Not selected'} />
            <ReviewItem label="Degree" value={form.degree || 'Not selected'} />
          </ReviewSection>

          <ReviewSection title="Skills & Profile" icon={<Code size={16} />}>
            <div>
              <span className="text-gray-400 text-sm">Skills:</span>
              {skillsList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {skillsList.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">None selected</p>
              )}
            </div>
            <ReviewItem label="Bio" value={form.bio || 'Not provided'} />
          </ReviewSection>

          {(form.role === 'senior' || form.role === 'developer') && (
            <ReviewSection title={form.role === 'senior' ? 'Mentor Details' : 'Developer Details'} icon={<Award size={16} />}>
              <ReviewItem label="Qualification" value={form.qualification || 'Not provided'} />
              <ReviewItem label="Experience" value={form.yearsExperience ? `${form.yearsExperience} years` : 'Not provided'} />
              <ReviewItem label="LinkedIn" value={form.linkedinUrl || 'Not provided'} />
              <ReviewItem label="GitHub" value={form.githubUrl || 'Not provided'} />
              <ReviewItem label="Location" value={form.location || 'Not provided'} />
            </ReviewSection>
          )}
        </div>
      </div>
    );
  };

  const ReviewSection = ({ title, icon, children }) => (
    <div className="bg-gray-800/30 rounded-lg border border-gray-700/50 p-3">
      <h4 className="text-sm font-medium text-white flex items-center gap-2 mb-2">
        <span className="text-blue-400">{icon}</span>
        {title}
      </h4>
      <div className="space-y-1.5 pl-6">{children}</div>
    </div>
  );

  const ReviewItem = ({ label, value }) => (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-200 text-right max-w-[60%] truncate">{value}</span>
    </div>
  );

  // Registration pending screen
  if (registrationResult?.type === 'pending') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800/50 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Application Submitted!</h2>
            <p className="text-gray-400 mb-6">{registrationResult.message}</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all"
            >
              Go to Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const stepLabels = form.role === 'junior'
    ? ['Personal', 'Education', 'Skills', 'Review']
    : form.role === 'senior'
    ? ['Personal', 'Education', 'Skills', 'Mentor Info', 'Review']
    : ['Personal', 'Education', 'Skills', 'Developer Info', 'Review'];

  const getStepContent = () => {
    if (step === 0) return renderRoleSelection;
    if (step === 1) return renderStep1;
    if (step === 2) return renderStep2;
    if (step === 3) return renderStep3;
    if (step === 4) {
      if (form.role === 'junior') return renderReviewStep;
      if (form.role === 'senior') return renderMentorStep4;
      return renderDeveloperStep4;
    }
    if (step === 5) return renderReviewStep;
    return renderRoleSelection;
  };

  const currentStepContent = getStepContent();

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800/50 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Code size={24} className="text-blue-400" />
              <h1 className="text-2xl font-bold text-white">SkillBridge</h1>
            </div>
            <p className="text-center text-gray-400 text-sm">
              {step === 0 ? 'Create your account' : `Creating ${form.role === 'junior' ? 'Student' : form.role === 'senior' ? 'Mentor' : 'Developer'} account`}
            </p>
          </div>

          {/* Stepper - only show after role selection */}
          {step > 0 && (
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between relative">
                {stepLabels.map((label, i) => (
                  <div key={i} className="flex flex-col items-center z-10">
                    <motion.div
                      animate={{
                        backgroundColor: step > i ? '#3b82f6' : step === i + 1 ? '#3b82f6' : '#374151',
                        scale: step === i + 1 ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    >
                      {step > i + 1 ? (
                        <Check size={16} className="text-white" />
                      ) : (
                        <span className={step >= i + 1 ? 'text-white' : 'text-gray-400'}>{i + 1}</span>
                      )}
                    </motion.div>
                    <span className={`text-[10px] mt-1.5 font-medium ${step >= i + 1 ? 'text-blue-400' : 'text-gray-500'}`}>
                      {label}
                    </span>
                  </div>
                ))}
                <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-gray-700 -z-0">
                  <motion.div
                    animate={{ width: `${((step - 1) / (stepLabels.length - 1)) * 100}%` }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="h-full bg-blue-500"
                  />
                </div>
              </div>
              <p className="text-center text-xs text-gray-500 mt-3">Step {step} of {stepLabels.length}</p>
            </div>
          )}

          {/* Form Content */}
          <div className="px-6 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {currentStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-800/50 mt-5">
            {step > 0 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50 transition-all"
              >
                <ChevronLeft size={18} />
                Back
              </button>
            ) : (
              <div />
            )}

            {step === 0 ? (
              <div />
            ) : step < getTotalSteps() ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25"
              >
                Next
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-green-500/25"
              >
                <UserPlus size={18} />
                Create Account
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
