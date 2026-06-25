import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Bell, Database, Server, Users, CheckCircle, Info, ToggleLeft, ToggleRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AdminSettingsPage() {
  const [notifications, setNotifications] = useState({
    newApplications: true,
    approvalsRejections: true,
    maintenanceMode: false,
  });

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const accountStatuses = [
    { role: 'Student Account', status: 'Active', color: 'green' },
    { role: 'Mentor Account', status: 'Pending Approval', color: 'yellow' },
    { role: 'Developer Account', status: 'Pending Approval', color: 'yellow' },
  ];

  const notificationSettings = [
    {
      key: 'newApplications',
      label: 'Email notifications for new applications',
      description: 'Receive an email when a new mentor or developer application is submitted.',
    },
    {
      key: 'approvalsRejections',
      label: 'Email notifications for approvals/rejections',
      description: 'Receive an email when an application is approved or rejected.',
    },
    {
      key: 'maintenanceMode',
      label: 'Platform maintenance mode',
      description: 'When enabled, only admins can access the platform.',
    },
  ];

  const systemStats = [
    { label: 'Total registered users', value: '1,247', icon: Users, color: 'blue' },
    { label: 'Database status', value: 'Connected', icon: Database, color: 'green' },
    { label: 'Server status', value: 'Running', icon: Server, color: 'emerald' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Platform Settings
            </h1>
            <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">Admin</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            View and manage platform configuration.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Platform Information */}
          <motion.div variants={fadeUp} className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Info className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Information</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Platform Name', value: 'SkillBridge' },
                { label: 'Version', value: '1.0.0' },
                { label: 'Environment', value: 'Production' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Account Settings */}
          <motion.div variants={fadeUp} className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Settings</h2>
            </div>
            <div className="space-y-4">
              {accountStatuses.map((item) => (
                <div key={item.role} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.role}</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 text-${item.color}-500`} />
                    <span className="font-medium text-gray-900 dark:text-white">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div variants={fadeUp} className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Settings</h2>
            </div>
            <div className="space-y-4">
              {notificationSettings.map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                  </div>
                  <button
                    onClick={() => toggleNotification(item.key)}
                    className="flex-shrink-0"
                  >
                    {notifications[item.key] ? (
                      <ToggleRight className="w-10 h-10 text-primary-600" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* System Status */}
          <motion.div variants={fadeUp} className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Settings className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h2>
            </div>
            <div className="space-y-4">
              {systemStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                        <Icon className={`w-4 h-4 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{stat.value}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
