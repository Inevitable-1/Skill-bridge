import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Bell, ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AdminMessagesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-8"
      >
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Mail className="w-8 h-8 text-primary-600" />
              Messages
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Manage platform communications and messaging.
          </p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <div className="card p-8">
            <div className="text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Admin Inbox
              </h2>

              <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                Message management is available through the main chat system.
                Admins can monitor platform communications through the notification system.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/chat"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Go to Chat
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/notifications"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  View Notifications
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
