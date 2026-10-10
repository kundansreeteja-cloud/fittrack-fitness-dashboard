import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || `Error ${error.response.status}`;
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // No response received
      return Promise.reject(new Error('Cannot connect to server. Is the backend running?'));
    }
    return Promise.reject(error);
  }
);

// Workout API
export const workoutAPI = {
  getAll: (params = {}) => api.get('/workouts', { params }),
  getStats: () => api.get('/workouts/stats'),
  getById: (id) => api.get(`/workouts/${id}`),
  create: (data) => api.post('/workouts', data),
  update: (id, data) => api.put(`/workouts/${id}`, data),
  delete: (id) => api.delete(`/workouts/${id}`),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
