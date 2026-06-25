import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../services/api';
import {
  Users, Clock, CheckCircle, XCircle, Eye, Search, Filter,
  GraduationCap, Briefcase, Mail, Phone, MapPin, Globe,
  Code, Award, ChevronDown, ExternalLink, X, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'all', label: 'All', icon: Users },
  { id: 'mentor', label: 'Mentor Applications', icon: GraduationCap },
  { id: 'developer', label: 'Developer Applications', icon: Code },
];

const STATUS_FILTERS = [
  { id: 'all', label: 'All', icon: Filter },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'approved', label: 'Approved', icon: CheckCircle },
  { id: 'rejected', label: 'Rejected', icon: XCircle },
];

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function AdminApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialType = searchParams.get('type') || 'all';
  const initialStatus = searchParams.get('status') || 'all';

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialType);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [appDetails, setAppDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, appId: null });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== 'all') params.set('type', activeTab);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    setSearchParams(params, { replace: true });
  }, [activeTab, statusFilter, setSearchParams]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== 'all') params.type = activeTab;
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await adminAPI.getApplications(params);
      setApplications(res.data.applications);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [activeTab, statusFilter]);

  const filteredApplications = applications.filter((app) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (app.name && app.name.toLowerCase().includes(q)) ||
      (app.email && app.email.toLowerCase().includes(q))
    );
  });

  const viewDetails = async (app) => {
    setSelectedApp(app);
    setDetailsLoading(true);
    try {
      const res = await adminAPI.getApplicationDetails(app.id);
      setAppDetails(res.data.application);
    } catch (error) {
      toast.error('Failed to load details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveApplication(id);
      toast.success('Application approved!');
      setApplications((apps) => apps.filter((a) => a.id !== id));
      setSelectedApp(null);
      setAppDetails(null);
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async () => {
    try {
      await adminAPI.rejectApplication(rejectModal.appId, rejectReason);
      toast.success('Application rejected');
      setApplications((apps) => apps.filter((a) => a.id !== rejectModal.appId));
      setRejectModal({ open: false, appId: null });
      setRejectReason('');
      setSelectedApp(null);
      setAppDetails(null);
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Applications</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Review and manage mentor and developer applications</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((sf) => (
              <button
                key={sf.id}
                onClick={() => setStatusFilter(sf.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === sf.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-1 ring-primary-300 dark:ring-primary-700'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <sf.icon className="w-3.5 h-3.5" />
                {sf.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-primary-300 dark:focus:border-primary-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="flex gap-2 mt-1">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-14" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="card p-12 text-center">
            <UserCheck className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No applications found.</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'Try adjusting your search or filters.'
                : statusFilter !== 'all'
                  ? `No ${statusFilter} applications to display.`
                  : 'No applications to review.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-5 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {app.name?.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{app.name}</h3>
                      <span className={`badge px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[app.status] || STATUS_STYLES.pending}`}>
                        {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{app.email}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 flex-wrap">
                      {app.qualification && <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{app.qualification}</span>}
                      {app.college && <span className="flex items-center gap-1"><Award className="w-3 h-3" />{app.college}</span>}
                      {app.years_experience && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{app.years_experience} years exp</span>}
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Applied {formatDate(app.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => viewDetails(app)}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {app.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(app.id)}
                        className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {app.status !== 'rejected' && (
                      <button
                        onClick={() => setRejectModal({ open: true, appId: app.id })}
                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Details Drawer */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedApp(null); setAppDetails(null); }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[520px] bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Application Details</h2>
                <button
                  onClick={() => { setSelectedApp(null); setAppDetails(null); }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {detailsLoading ? (
                <div className="p-6 space-y-4">
                  <div className="flex flex-col items-center animate-pulse">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mb-3" />
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : appDetails ? (
                <div className="p-6 space-y-6">
                  {/* Profile Header */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-3">
                      <span className="text-white font-bold text-3xl">
                        {appDetails.name?.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{appDetails.name}</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                      {appDetails.role === 'senior' ? 'Mentor Application' : 'Developer Application'}
                    </p>
                    <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[appDetails.status] || STATUS_STYLES.pending}`}>
                      {appDetails.status ? appDetails.status.charAt(0).toUpperCase() + appDetails.status.slice(1) : 'Pending'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <DetailSection title="Contact">
                      <DetailRow icon={Mail} value={appDetails.email} />
                      <DetailRow icon={Phone} value={appDetails.phone || 'Not provided'} />
                      <DetailRow icon={MapPin} value={appDetails.location || 'Not provided'} />
                    </DetailSection>

                    <DetailSection title="Education">
                      <DetailRow icon={GraduationCap} value={`${appDetails.qualification || 'N/A'} - ${appDetails.degree || 'N/A'}`} />
                      <DetailRow icon={GraduationCap} value={appDetails.college || 'Not provided'} sublabel="College" />
                      <DetailRow icon={GraduationCap} value={appDetails.university || 'Not provided'} sublabel="University" />
                      {appDetails.years_experience && (
                        <DetailRow icon={Briefcase} value={`${appDetails.years_experience} years`} sublabel="Experience" />
                      )}
                    </DetailSection>

                    {appDetails.skills && appDetails.skills.length > 0 && (
                      <DetailSection title="Skills">
                        <div className="flex flex-wrap gap-2">
                          {appDetails.skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </DetailSection>
                    )}

                    {appDetails.programming_languages && appDetails.programming_languages.length > 0 && (
                      <DetailSection title="Programming Languages">
                        <div className="flex flex-wrap gap-2">
                          {appDetails.programming_languages.map((lang, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </DetailSection>
                    )}

                    {appDetails.bio && (
                      <DetailSection title="Bio">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{appDetails.bio}</p>
                      </DetailSection>
                    )}

                    <DetailSection title="Links">
                      {appDetails.linkedin_url && <DetailRow icon={Globe} value={appDetails.linkedin_url} link />}
                      {appDetails.github_url && <DetailRow icon={Code} value={appDetails.github_url} link />}
                      {appDetails.portfolio_url && <DetailRow icon={Globe} value={appDetails.portfolio_url} link />}
                      {appDetails.resume_url && <DetailRow icon={ExternalLink} value="Resume" link />}
                    </DetailSection>

                    <DetailSection title="Applied">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{formatDate(appDetails.created_at)}</p>
                    </DetailSection>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    {appDetails.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(appDetails.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve
                      </button>
                    )}
                    {appDetails.status !== 'rejected' && (
                      <button
                        onClick={() => setRejectModal({ open: true, appId: appDetails.id })}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => { setSelectedApp(null); setAppDetails(null); }}
                      className="w-full px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal.open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setRejectModal({ open: false, appId: null }); setRejectReason(''); }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-[60] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Reject Application</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Provide a reason for rejection (optional):
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={3}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { setRejectModal({ open: false, appId: null }); setRejectReason(''); }}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                >
                  Reject
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{title}</h4>
      <div className="space-y-2 pl-1">{children}</div>
    </div>
  );
}

function DetailRow({ icon: Icon, value, sublabel, link }) {
  if (link && value && value !== 'Not provided') {
    return (
      <a
        href={value.startsWith('http') ? value : `https://${value}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{value}</span>
      </a>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <div>
        <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
        {sublabel && <span className="text-xs text-gray-400 ml-2">{sublabel}</span>}
      </div>
    </div>
  );
}
