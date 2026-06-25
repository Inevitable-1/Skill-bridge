import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import AIChat from '../ai/AIChat';
import EmergencyHelpModal from '../ai/EmergencyHelpModal';
import ErrorBoundary from '../ui/ErrorBoundary';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle } from 'lucide-react';

export default function Layout() {
  const { user } = useAuth();
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  const showEmergencyButton = user && user.role === 'junior';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="pt-16">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* AI Chat - Available on every page */}
      <ErrorBoundary>
        <AIChat />
      </ErrorBoundary>

      {/* Emergency Help Button - Only for junior/students */}
      {showEmergencyButton && (
        <button
          onClick={() => setEmergencyOpen(true)}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full shadow-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 hover:shadow-xl"
          title="Emergency Help - Get urgent assistance from a senior mentor"
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium text-sm hidden sm:inline">Emergency Help</span>
        </button>
      )}

      {/* Emergency Help Modal */}
      <ErrorBoundary>
        <EmergencyHelpModal
          isOpen={emergencyOpen}
          onClose={() => setEmergencyOpen(false)}
        />
      </ErrorBoundary>
    </div>
  );
}
