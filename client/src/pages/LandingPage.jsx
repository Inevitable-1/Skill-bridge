import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Video, MessageCircle, BookOpen, Award,
  ArrowRight, ChevronRight, Zap, Shield, Globe,
  Code, Database, Brain, Cloud, Lock, BarChart3,
  Mail, Linkedin, Github, ExternalLink, Target, Lightbulb, Rocket
} from 'lucide-react';
import Logo from '../components/ui/Logo';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const features = [
  {
    icon: Video,
    title: 'Live Mentorship Sessions',
    description: 'One-on-one video calls with screen sharing, collaborative whiteboard, and real-time chat for effective learning.',
  },
  {
    icon: MessageCircle,
    title: 'Instant Communication',
    description: 'Message mentors directly for quick doubts, project discussions, and ongoing guidance.',
  },
  {
    icon: BookOpen,
    title: 'Skill Graph',
    description: 'Interactive skill visualization to map your learning journey and discover optimal learning paths.',
  },
  {
    icon: Users,
    title: 'Mentor Matching',
    description: 'Smart matching system that connects you with the right mentors based on skills, availability, and ratings.',
  },
  {
    icon: Award,
    title: 'Ratings & Recognition',
    description: 'Build your reputation through mentorship quality and earn recognition as a top mentor or learner.',
  },
  {
    icon: Zap,
    title: 'Instant Help',
    description: 'Get matched with available mentors in seconds when you need immediate assistance.',
  },
];

const whyChoose = [
  {
    icon: Target,
    title: 'Purpose-Built for Education',
    description: 'Designed specifically for academic mentorship, not repurposed from generic meeting tools.',
  },
  {
    icon: Shield,
    title: 'Verified Mentors',
    description: 'All mentors go through admin approval to ensure quality and trustworthiness.',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'Enterprise-grade security with role-based access control and data protection.',
  },
  {
    icon: Globe,
    title: 'Campus-Focused',
    description: 'Built for colleges, universities, and professional learning communities.',
  },
  {
    icon: Lightbulb,
    title: 'AI-Powered Assistance',
    description: 'Built-in AI learning assistant to help with doubts, code reviews, and study guidance.',
  },
  {
    icon: Rocket,
    title: 'Career Growth',
    description: 'From skill development to interview preparation, support your complete career journey.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Create Your Profile',
    description: 'Sign up, list your skills, and set your availability. Mentors get admin-approved for quality.',
  },
  {
    step: '02',
    title: 'Find a Mentor',
    description: 'Browse by skill, filter by expertise and ratings, and find the perfect match for your needs.',
  },
  {
    step: '03',
    title: 'Start Learning',
    description: 'Book a session, join the video call, and learn with shared notes, whiteboard, and screen sharing.',
  },
];

const technologies = [
  { name: 'React', icon: Code, color: '#61DAFB' },
  { name: 'Node.js', icon: Server, color: '#339933' },
  { name: 'PostgreSQL', icon: Database, color: '#4479A1' },
  { name: 'Socket.io', icon: Zap, color: '#010101' },
  { name: 'WebRTC', icon: Video, color: '#FF6B35' },
  { name: 'AI/ML', icon: Brain, color: '#FF6F61' },
  { name: 'Docker', icon: Cloud, color: '#2496ED' },
  { name: 'Cloud', icon: Cloud, color: '#FF9900' },
];

function Server(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-primary-950" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
            >
              Build Skills.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">
                Connect with Experts.
              </span>
              <br />
              Grow Your Career.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              A modern mentorship and collaborative learning platform that connects
              students, mentors, educators, and professionals through live learning,
              project collaboration, interview preparation, and career guidance.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center gap-2 group">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features" className="btn-secondary text-lg px-8 py-4">
                Learn More
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                About SkillBridge
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                SkillBridge is a comprehensive mentorship platform designed for
                educational institutions, professional communities, and career-focused
                organizations. We bridge the gap between knowledge seekers and
                experienced mentors.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Whether you're a student preparing for interviews, a professional
                looking to upskill, or an organization building a mentorship
                program — SkillBridge provides the tools you need.
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-6">
              {[
                { icon: Users, label: 'Mentor-Mentee Matching' },
                { icon: Video, label: 'Live Video Sessions' },
                { icon: MessageCircle, label: 'Real-Time Chat' },
                { icon: BarChart3, label: 'Skill Tracking' },
                { icon: Brain, label: 'AI Assistance' },
                { icon: Shield, label: 'Admin Approval' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <item.icon className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Features Built for Learning
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Everything you need for effective mentorship and collaborative learning.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  whileHover={{ y: -5 }}
                  className="card p-8 hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-5">
                    <Icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Why Choose SkillBridge */}
      <section className="py-24 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Why Choose SkillBridge
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Built for quality, trust, and real learning outcomes.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {whyChoose.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  className="flex gap-4 p-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              How It Works
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Get started in three simple steps.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {steps.map((item) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                className="relative"
              >
                <div className="text-8xl font-black text-primary-100 dark:text-primary-900/30 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-12 pl-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-24 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Built with Modern Technology
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Powered by industry-leading tools and frameworks.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-wrap justify-center gap-6"
          >
            {technologies.map((tech) => {
              const Icon = tech.icon;
              return (
                <motion.div
                  key={tech.name}
                  variants={fadeUp}
                  whileHover={{ y: -3, scale: 1.05 }}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                >
                  <Icon className="w-6 h-6" style={{ color: tech.color }} />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{tech.name}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-primary-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-bold text-white mb-6"
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-xl text-white/80 mb-10"
            >
              Join SkillBridge and start your mentorship journey today.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 text-lg group"
              >
                Create Account
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Get in Touch
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-600 dark:text-gray-300"
            >
              Have questions? We'd love to hear from you.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeUp} className="text-center p-8 card">
              <Mail className="w-8 h-8 text-primary-600 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Email</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">contact@skillbridge.com</p>
            </motion.div>
            <motion.div variants={fadeUp} className="text-center p-8 card">
              <Linkedin className="w-8 h-8 text-primary-600 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">LinkedIn</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">SkillBridge</p>
            </motion.div>
            <motion.div variants={fadeUp} className="text-center p-8 card">
              <Github className="w-8 h-8 text-primary-600 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">GitHub</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">skillbridge</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 dark:bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <Logo linked={false} className="mb-4 [&_span:first-child]:text-white [&_span:last-child]:text-white [&_span:last-child]:dark:text-white" />
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                A modern mentorship and collaborative learning platform connecting
                students, mentors, and professionals.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">About</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white text-sm transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms & Conditions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              &copy; 2026 SkillBridge. All Rights Reserved.
            </p>
            <div className="flex items-center gap-4 text-gray-500 text-sm">
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Secure & Private
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
