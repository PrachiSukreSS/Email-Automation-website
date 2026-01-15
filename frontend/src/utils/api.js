import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
            'Content-Type': 'application/json',
      },
});

// Request interceptor to add auth token
api.interceptors.request.use(
      (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                  config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
      },
      (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
      (response) => response,
      (error) => {
            if (error.response?.status === 401) {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/login';
            }
            return Promise.reject(error);
      }
);

// -------------------- AUTH API --------------------
export const authAPI = {
      register: (data) => api.post('/api/auth/register', data),
      login: (data) => api.post('/api/auth/login', data),
      getCurrentUser: () => api.get('/api/auth/me'),
};

// -------------------- CONTACTS API --------------------
export const contactsAPI = {
      getAll: (skip = 0, limit = 100) =>
            api.get(`/api/contacts/?skip=${skip}&limit=${limit}`),

      getById: (id) => api.get(`/api/contacts/${id}`),

      create: (data) => api.post('/api/contacts/', data),

      update: (id, data) => api.put(`/api/contacts/${id}`, data),

      delete: (id) => api.delete(`/api/contacts/${id}`),

      bulkImport: (file) => {
            const formData = new FormData();
            formData.append('file', file);

            return api.post('/api/contacts/bulk', formData, {
                  headers: {
                        'Content-Type': 'multipart/form-data',
                  },
            });
      },
};

// -------------------- TEMPLATES API --------------------
export const templatesAPI = {
      getAll: (skip = 0, limit = 100) =>
            api.get(`/api/templates/?skip=${skip}&limit=${limit}`),

      getById: (id) => api.get(`/api/templates/${id}`),

      create: (data) => api.post('/api/templates/', data),

      update: (id, data) => api.put(`/api/templates/${id}`, data),

      delete: (id) => api.delete(`/api/templates/${id}`),
};

// -------------------- CAMPAIGNS API (FIXED) --------------------
export const campaignsAPI = {
      getAll: (skip = 0, limit = 100) =>
            api.get(`/api/campaigns/?skip=${skip}&limit=${limit}`),

      getById: (id) => api.get(`/api/campaigns/${id}`),

      create: (data) => {
            // 🔥 Normalize payload to match FastAPI expectations
            const payload = {
                  name: data.name,
                  template_id: data.template_id ?? null,
                  contact_ids:
                        data.contact_ids && data.contact_ids.length > 0
                              ? data.contact_ids
                              : null,
                  scheduled_at: data.scheduled_at || null,
            };

            return api.post('/api/campaigns/', payload);
      },

      send: (id) => api.post(`/api/campaigns/${id}/send`),

      getAnalytics: (id) => api.get(`/api/campaigns/${id}/analytics`),

      getEmails: (id, skip = 0, limit = 100) =>
            api.get(`/api/campaigns/${id}/emails?skip=${skip}&limit=${limit}`),

      delete: (id) => api.delete(`/api/campaigns/${id}`),
};

// -------------------- DASHBOARD API --------------------
export const dashboardAPI = {
      getStats: () => api.get('/api/dashboard/stats'),
};

export default api;
