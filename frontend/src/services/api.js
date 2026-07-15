import axios from 'axios';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const api = axios.create({
  baseURL: isLocal ? '/api/v1' : 'https://backend-ashy-seven-83.vercel.app/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to automatically attach Authorization headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aura_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error normalization
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

// ─── Auth APIs ──────────────────────────────────────────────────────────────────
export const authApi = {
  requestOtp: (emailOrPhone, role) => api.post('/auth/request-otp', { emailOrPhone, role }),
  verifyOtp: (emailOrPhone, otp, role) => api.post('/auth/verify-otp', { emailOrPhone, otp, role }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (data) => api.post('/auth/signup', data),
};

// ─── Projects ──────────────────────────────────────────────────────────────────
export const projectsApi = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  getAnalytics: (id) => api.get(`/projects/${id}/analytics`),
  getGlobalAnalytics: () => api.get('/projects/analytics/global'),
};

// ─── Units ─────────────────────────────────────────────────────────────────────
export const unitsApi = {
  getAll: (params) => api.get('/units', { params }),
  getById: (id) => api.get(`/units/${id}`),
  updateAvailability: (id, availability) => api.patch(`/units/${id}/availability`, { availability }),
};

// ─── Bookings ──────────────────────────────────────────────────────────────────
export const bookingsApi = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  approve: (id) => api.patch(`/bookings/${id}/approve`),
  cancel: (id) => api.delete(`/bookings/${id}`),
};

// ─── Ledger ────────────────────────────────────────────────────────────────────
export const ledgerApi = {
  getAll: (params) => api.get('/ledger', { params }),
  getById: (id) => api.get(`/ledger/${id}`),
};

export default api;
