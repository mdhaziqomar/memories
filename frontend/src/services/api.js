import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const apiService = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiService.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => apiService.post('/auth/login', credentials),
  register: (userData) => apiService.post('/auth/register', userData),
  verify: () => apiService.get('/auth/verify'),
  getProfile: () => apiService.get('/auth/profile'),
  updateProfile: (data) => apiService.put('/auth/profile', data),
  generateInviteCode: (data) => apiService.post('/auth/invite-codes', data),
};

// Media API calls
export const mediaAPI = {
  getMedia: (params = {}) => apiService.get('/media', { params }),
  getMediaById: (id) => apiService.get(`/media/${id}`),
  uploadMedia: (formData) => apiService.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  likeMedia: (id) => apiService.post(`/media/${id}/like`),
  tagUser: (id, data) => apiService.post(`/media/${id}/tag`, data),
};

// Events API calls
export const eventsAPI = {
  getEvents: () => apiService.get('/events'),
  getEventById: (id) => apiService.get(`/events/${id}`),
  createEvent: (data) => apiService.post('/events', data),
  updateEvent: (id, data) => apiService.put(`/events/${id}`, data),
  deleteEvent: (id) => apiService.delete(`/events/${id}`),
};

// Users API calls
export const usersAPI = {
  getUsers: () => apiService.get('/users'),
  getActiveUsers: () => apiService.get('/users/active'),
  toggleUserStatus: (id) => apiService.patch(`/users/${id}/toggle-status`),
};

// Generic file upload helper
export const uploadFile = async (file, endpoint = '/media/upload', additionalData = {}) => {
  const formData = new FormData();
  formData.append('media', file);
  
  Object.keys(additionalData).forEach(key => {
    formData.append(key, additionalData[key]);
  });

  return apiService.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      // You can use this for progress bars
      console.log(`Upload Progress: ${percentCompleted}%`);
    },
  });
};

export { apiService };
export default apiService; 