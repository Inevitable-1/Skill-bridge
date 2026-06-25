import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillbridge_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath === '/login' || currentPath === '/register';
      const isPublicPage = currentPath === '/' || currentPath === '/forgot-password';

      if (!isLoginPage && !isPublicPage) {
        localStorage.removeItem('skillbridge_token');
        localStorage.removeItem('skillbridge_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  searchUsers: (params) => api.get('/users/search', { params }),
  getOnlineMentors: (params) => api.get('/users/online-mentors', { params }),
};

export const skillAPI = {
  matchMentors: (params) => api.get('/skills/match', { params }),
  getSkillGraph: () => api.get('/skills/graph'),
};

export const sessionAPI = {
  create: (data) => api.post('/sessions', data),
  approve: (id) => api.put(`/sessions/${id}/approve`),
  cancel: (id) => api.put(`/sessions/${id}/cancel`),
  complete: (id) => api.put(`/sessions/${id}/complete`),
  getMySessions: (params) => api.get('/sessions', { params }),
  getById: (id) => api.get(`/sessions/${id}`),
};

export const chatAPI = {
  getRooms: () => api.get('/chat/rooms'),
  startChat: (userId) => api.post('/chat/start', { userId }),
  getMessages: (roomId, params) => api.get(`/chat/${roomId}/messages`, { params }),
  sendMessage: (roomId, message) => api.post(`/chat/${roomId}/messages`, { message }),
};

export const videoAPI = {
  createRoom: (sessionId) => api.post('/video/room', { sessionId }),
  joinRoom: (roomId) => api.post(`/video/room/${roomId}/join`),
  leaveRoom: (roomId) => api.post(`/video/room/${roomId}/leave`),
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  addRating: (data) => api.post('/notifications/rating', data),
  getMentorRatings: (mentorId) => api.get(`/notifications/ratings/${mentorId}`),
  getLeaderboard: () => api.get('/notifications/leaderboard'),
};

export const adminAPI = {
  getApplications: (params) => api.get('/admin/applications', { params }),
  getApplicationDetails: (id) => api.get(`/admin/applications/${id}`),
  approveApplication: (id) => api.post(`/admin/applications/${id}/approve`),
  rejectApplication: (id, reason) => api.post(`/admin/applications/${id}/reject`, { reason }),
  getStats: () => api.get('/admin/stats'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  suspendUser: (id) => api.put(`/admin/users/${id}/suspend`),
  activateUser: (id) => api.put(`/admin/users/${id}/activate`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllMeetings: (params) => api.get('/admin/meetings', { params }),
  getAllSessions: (params) => api.get('/admin/sessions', { params }),
};

export default api;
