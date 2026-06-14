import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, Users, Video, MessageCircle, BookOpen, Award,
  ArrowRight, Star, ChevronRight, Zap, Shield, Globe
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const features = [
  {
    icon: Users,
    title: 'Find Mentors',
    description: 'Discover senior students who excel in your areas of interest and connect instantly.',
  },
  {
    icon: Video,
    title: 'Live Sessions',
    description: 'Join one-on-one video calls with screen sharing, whiteboard, and real-time chat.',
  },
  {
    icon: MessageCircle,
    title: 'Instant Chat',
    description: 'Message mentors anytime for quick doubts and ongoing project discussions.',
  },
  {
    icon: BookOpen,
    title: 'Skill Tree',
    description: 'Visualize campus knowledge with our interactive skill graph and find learning paths.',
  },
  {
    icon: Award,
    title: 'Ratings & Badges',
    description: 'Build your reputation through mentorship and earn recognition as a top mentor.',
  },
  {
    icon: Zap,
    title: 'Instant Help',
    description: 'Click "Need Help Now" and get matched with an available mentor in seconds.',
  },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: '3rd Year CSE',
    text: 'SkillBridge helped me find a great mentor for my web dev project. The live sessions with whiteboard were incredibly helpful!',
    rating: 5,
  },
  {
    name: 'Rahul Verma',
    role: '4th Year ECE',
    text: 'As a mentor, I love helping juniors. The platform makes it easy to schedule sessions and share knowledge.',
    rating: 5,
  },
  {
    name: 'Ananya Patel',
    role: '2nd Year IT',
    text: 'The skill tree visualization is amazing! I could see exactly who to connect with for machine learning guidance.',
    rating: 4,
  },
];

const stats = [
  { label: 'Active Students', value: '2,500+' },
  { label: 'Sessions Completed', value: '8,000+' },
  { label: 'Skills Available', value: '150+' },
  { label: 'Average Rating', value: '4.8/5' },
];

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
            <motion.div variants={fadeUp} className="mb-6">
              <span className="badge-primary">
                <GraduationCap className="w-4 h-4 mr-2" />
                Campus Peer Mentorship Platform
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
            >
              Learn from Peers,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">
                Grow Together
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto"
            >
              Connect with senior students for mentorship, doubt clarification,
              project guidance, and interview preparation. Your campus learning
              journey starts here.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center gap-2 group">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                Sign In
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-primary-600">{stat.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
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
              Everything You Need to Learn
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              A complete platform combining networking, video calls, chat, and
              skill mapping for effective peer-to-peer learning.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, idx) => {
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
              How SkillBridge Works
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Get started in three simple steps
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                description: 'Sign up with your college email, add your skills, and set your availability.',
              },
              {
                step: '02',
                title: 'Find Your Mentor',
                description: 'Search by skill, filter by rating, and find the perfect mentor for your needs.',
              },
              {
                step: '03',
                title: 'Start Learning',
                description: 'Book a session, join the video call, and start learning with shared notes and whiteboard.',
              },
            ].map((item, idx) => (
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

      {/* Testimonials */}
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
              Loved by Students
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                className="card p-8"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-sm">
                      {t.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
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
              Ready to Start Learning?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-xl text-white/80 mb-10"
            >
              Join thousands of students who are already learning from their peers.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 text-lg group"
              >
                Create Free Account
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SB</span>
              </div>
              <span className="text-xl font-bold text-white">
                Skill<span className="text-primary-400">Bridge</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Secure & Private
              </span>
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Campus Focused
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; 2026 SkillBridge. Built for students, by students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
