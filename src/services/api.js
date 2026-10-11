import axios from 'axios';

const API_BASE_URL = "https://ttproject-backend-2.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT Bearer Token if logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('portfolio_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
};

export const projectService = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (project) => api.post('/projects', project),
  update: (id, project) => api.put(`/projects/${id}`, project),
  delete: (id) => api.delete(`/projects/${id}`),
};
export const uploadService = {
  uploadImage: (formData) =>
    api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};
export const skillService = {
  getAll: () => api.get('/skills'),
  create: (skill) => api.post('/skills', skill),
  delete: (id) => api.delete(`/skills/${id}`),
};

export const contactService = {
  submit: (message) => api.post('/contact', message),
  getAll: () => api.get('/contact'),
};

export default api;