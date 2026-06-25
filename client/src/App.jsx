import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

import ErrorBoundary from './components/ui/ErrorBoundary';
import IntroAnimation from './components/intro/IntroAnimation';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import SeniorDashboardPage from './pages/SeniorDashboardPage';
import JuniorDashboardPage from './pages/JuniorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';
import MyMentorsPage from './pages/MyMentorsPage';
import SkillTreePage from './pages/SkillTreePage';
import SessionsPage from './pages/SessionsPage';
import ChatPage from './pages/ChatPage';
import LearningRoomPage from './pages/LearningRoomPage';
import BookSessionPage from './pages/BookSessionPage';
import NotificationsPage from './pages/NotificationsPage';
import CreateMeetingPage from './pages/CreateMeetingPage';
import MeetingLobbyPage from './pages/MeetingLobbyPage';
import MeetingRoomPage from './pages/MeetingRoomPage';
import AdminApplicationsPage from './pages/AdminApplicationsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminMeetingsPage from './pages/AdminMeetingsPage';
import AdminSessionsPage from './pages/AdminSessionsPage';
import AdminMessagesPage from './pages/AdminMessagesPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

function RootRoute() {
  return <IntroAnimation />;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <ErrorBoundary>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: '12px',
                  background: '#1e293b',
                  color: '#f1f5f9',
                },
              }}
            />
            <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<RootRoute />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Role-based dashboards */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <JuniorDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/senior/dashboard"
                element={
                  <ProtectedRoute>
                    <SeniorDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/applications"
                element={
                  <ProtectedRoute>
                    <AdminApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/meetings"
                element={
                  <ProtectedRoute>
                    <AdminMeetingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/sessions"
                element={
                  <ProtectedRoute>
                    <AdminSessionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/messages"
                element={
                  <ProtectedRoute>
                    <AdminMessagesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute>
                    <AdminSettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:id"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-mentors"
                element={
                  <ProtectedRoute>
                    <MyMentorsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentors/:id"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/skill-tree"
                element={
                  <ProtectedRoute>
                    <SkillTreePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sessions"
                element={
                  <ProtectedRoute>
                    <SessionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book-session/:mentorId"
                element={
                  <ProtectedRoute>
                    <BookSessionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learning-room/:sessionId"
                element={
                  <ProtectedRoute>
                    <LearningRoomPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Meeting Routes */}
              <Route
                path="/create-meeting"
                element={
                  <ProtectedRoute>
                    <CreateMeetingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meeting/:code"
                element={
                  <ProtectedRoute>
                    <MeetingLobbyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meeting/:code/room"
                element={
                  <ProtectedRoute>
                    <MeetingRoomPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
            </Routes>
          </ErrorBoundary>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}
