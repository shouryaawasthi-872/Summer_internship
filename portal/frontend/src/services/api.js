import axios from 'axios';

/**
 * Base URL resolution:
 *  - Local dev  : Vite proxy forwards /api → http://localhost:5000  (no baseURL needed)
 *  - Production : VITE_API_URL env variable set in Vercel dashboard points to Render backend
 */
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL: BASE_URL, withCredentials: true });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ────────────────────────────────────────────────────
export const authAPI = {
  login:          (data) => api.post('/auth/login', data),
  register:       (data) => api.post('/auth/register', data),
  me:             ()     => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/password', data),
};

// ── Users ───────────────────────────────────────────────────
export const usersAPI = {
  getAll:       (params) => api.get('/users', { params }),
  getById:      (id)     => api.get(`/users/${id}`),
  update:       (id, d)  => api.put(`/users/${id}`, d),
  remove:       (id)     => api.delete(`/users/${id}`),
  assignMentor: (d)      => api.post('/users/assign-mentor', d),
  toggleActive: (id)     => api.put(`/users/${id}/toggle`),
  getStats:     ()       => api.get('/users/stats'),
};

// ── Internships ─────────────────────────────────────────────
export const internshipsAPI = {
  getAll:  (p)     => api.get('/internships', { params: p }),
  getById: (id)    => api.get(`/internships/${id}`),
  create:  (d)     => api.post('/internships', d),
  update:  (id, d) => api.put(`/internships/${id}`, d),
  remove:  (id)    => api.delete(`/internships/${id}`),
  approve: (id, d) => api.put(`/internships/${id}/approve`, d),
};

// ── Applications ────────────────────────────────────────────
export const applicationsAPI = {
  apply:             (d)      => api.post('/applications', d),
  getAll:            (params) => api.get('/applications', { params }),
  getById:           (id)     => api.get(`/applications/${id}`),
  review:            (id, d)  => api.put(`/applications/${id}/review`, d),
  submitCertificate: (id, d)  => api.put(`/applications/${id}/certificate`, d),
};

// ── Documents ───────────────────────────────────────────────
export const documentsAPI = {
  upload: (form)  => api.post('/documents', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: ()      => api.get('/documents'),
  review: (id, d) => api.put(`/documents/${id}/review`, d),
  remove: (id)    => api.delete(`/documents/${id}`),
};

// ── Meetings ────────────────────────────────────────────────
export const meetingsAPI = {
  create: (d)     => api.post('/meetings', d),
  getAll: ()      => api.get('/meetings'),
  update: (id, d) => api.put(`/meetings/${id}`, d),
  remove: (id)    => api.delete(`/meetings/${id}`),
};

// ── Marks ───────────────────────────────────────────────────
export const marksAPI = {
  save:              (d)     => api.post('/marks', d),
  getAll:            ()      => api.get('/marks'),
  verifyCertificate: (id, d) => api.put(`/marks/${id}/verify-certificate`, d),
};

// ── Notifications ───────────────────────────────────────────
export const notificationsAPI = {
  getAll:      () => api.get('/notifications'),
  markRead:    (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// ── CGPA ────────────────────────────────────────────────────
export const cgpaAPI = {
  getAll:      (params) => api.get('/cgpa', { params }),
  getStudents: ()       => api.get('/cgpa/students'),
  upsert:      (d)      => api.post('/cgpa', d),
  remove:      (id)     => api.delete(`/cgpa/${id}`),
};
