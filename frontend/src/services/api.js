import axios from 'axios';

const API_BASE_URL = 'https://society-backend-9n7y.onrender.com';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // 45 seconds is enough for cold starts
});

// Retry function for cold starts
const retryRequest = async (config, retries = 3, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await api(config);
      return response;
    } catch (error) {
      if (error.isTimeout && i < retries - 1) {
        console.log(`Retry ${i + 1}/${retries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - Backend is starting up:', error.config?.url);
      return Promise.reject({
        message: 'Server is starting up. Please wait and try again.',
        isTimeout: true
      });
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        message: 'Cannot connect to server. The backend might be starting up.',
        isNetworkError: true
      });
    }

    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    
    return Promise.reject(error);
  }
);

// Auth API endpoints with retry for cold starts
export const authAPI = {
  login: (email, password) => retryRequest({
    method: 'post',
    url: '/api/auth/login',
    data: { email, password }
  }),
  register: (userData) => retryRequest({
    method: 'post',
    url: '/api/auth/register',
    data: userData
  }),
  verifyOTP: (userId, otp) => api.post('/api/auth/verify-otp', { userId, otp }),
  getMe: () => api.get('/api/auth/me')
};

// Keep other APIs as-is (they'll use the normal instance)
export const flatAPI = {
  getAll: () => api.get('/api/flats'),
  create: (flatData) => api.post('/api/flats', flatData),
  update: (id, flatData) => api.put(`/api/flats/${id}`, flatData),
  delete: (id) => api.delete(`/api/flats/${id}`)
};

export const noticeAPI = {
  getAll: () => api.get('/api/notices'),
  create: (noticeData) => api.post('/api/notices', noticeData),
  update: (id, noticeData) => api.put(`/api/notices/${id}`, noticeData),
  delete: (id) => api.delete(`/api/notices/${id}`)
};

export const complaintAPI = {
  getAll: () => api.get('/api/complaints'),
  create: (formData) => api.post('/api/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, complaintData) => api.put(`/api/complaints/${id}`, complaintData)
};

export const maintenanceAPI = {
  getAll: () => api.get('/api/maintenance'),
  create: (maintenanceData) => api.post('/api/maintenance', maintenanceData),
  createOrder: (id) => api.post(`/api/maintenance/${id}/create-order`),
  simulatePayment: (id) => api.post(`/api/maintenance/${id}/simulate-payment`),
  verifyPayment: (id, paymentData) => api.post(`/api/maintenance/${id}/verify-payment`, paymentData),
  getPaymentDetails: (paymentId) => api.get(`/api/maintenance/payment/${paymentId}`),
  getById: (id) => api.get(`/api/maintenance/${id}`),
  update: (id, maintenanceData) => api.put(`/api/maintenance/${id}`, maintenanceData),
  delete: (id) => api.delete(`/api/maintenance/${id}`),
  bulkCreate: (bills) => api.post('/api/maintenance/bulk', { bills })
};

export const memoryAPI = {
  getAll: () => api.get('/api/memory-lane'),
  create: (formData) => api.post('/api/memory-lane', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  like: (id) => api.post(`/api/memory-lane/${id}/like`),
  comment: (id, text) => api.post(`/api/memory-lane/${id}/comment`, { text })
};

export const userAPI = {
  getAll: () => api.get('/api/users'),
  getResidents: () => api.get('/api/users?role=resident')
};

export const healthAPI = {
  check: () => api.get('/api/health', { timeout: 10000 })
};

export default api;