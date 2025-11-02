// import axios from 'axios';

// // Use explicit API URL without /api since we're adding it in the endpoints
// // const API_BASE_URL = 'http://localhost:5000';
// const API_BASE_URL = 'https://society-backend-9n7y.onrender.com';

// // Create axios instance with base URL
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Add request interceptor to include auth token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
//     console.log('Request data:', config.data);
//     return config;
//   },
//   (error) => {
//     console.error('Request error:', error);
//     return Promise.reject(error);
//   }
// );

// // Add response interceptor
// api.interceptors.response.use(
//   (response) => {
//     console.log('Response received:', response);
//     return response;
//   },
//   (error) => {
//     console.error('API Error:', {
//       url: error.config?.url,
//       method: error.config?.method,
//       status: error.response?.status,
//       data: error.response?.data,
//       message: error.message
//     });
    
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
    
//     return Promise.reject(error);
//   }
// );

// // Update all API endpoints - include /api in each endpoint
// export const authAPI = {
//   login: (email, password) => api.post('/api/auth/login', { email, password }),
//   register: (userData) => api.post('/api/auth/register', userData),
//   verifyOTP: (userId, otp) => api.post('/api/auth/verify-otp', { userId, otp }),
//   getMe: () => api.get('/api/auth/me')
// };

// export const flatAPI = {
//   getAll: () => api.get('/api/flats'),
//   create: (flatData) => api.post('/api/flats', flatData),
//   update: (id, flatData) => api.put(`/api/flats/${id}`, flatData),
//   delete: (id) => api.delete(`/api/flats/${id}`)
// };

// export const noticeAPI = {
//   getAll: () => api.get('/api/notices'),
//   create: (noticeData) => api.post('/api/notices', noticeData),
//   update: (id, noticeData) => api.put(`/api/notices/${id}`, noticeData),
//   delete: (id) => api.delete(`/api/notices/${id}`)
// };

// export const complaintAPI = {
//   getAll: () => api.get('/api/complaints'),
//   create: (formData) => api.post('/api/complaints', formData, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
//   update: (id, complaintData) => api.put(`/api/complaints/${id}`, complaintData)
// };

// export const maintenanceAPI = {
//   getAll: () => api.get('/api/maintenance'),
//   create: (maintenanceData) => api.post('/api/maintenance', maintenanceData),
//   createOrder: (id) => api.post(`/api/maintenance/${id}/create-order`),
//   simulatePayment: (id) => api.post(`/api/maintenance/${id}/simulate-payment`),
//   verifyPayment: (id, paymentData) => api.post(`/api/maintenance/${id}/verify-payment`, paymentData),
//   getPaymentDetails: (paymentId) => api.get(`/api/maintenance/payment/${paymentId}`), // ADDED THIS LINE
//   getById: (id) => api.get(`/api/maintenance/${id}`),
//   update: (id, maintenanceData) => api.put(`/api/maintenance/${id}`, maintenanceData),
//   delete: (id) => api.delete(`/api/maintenance/${id}`),
//   bulkCreate: (bills) => api.post('/api/maintenance/bulk', { bills })
// };

// export const memoryAPI = {
//   getAll: () => api.get('/api/memory-lane'),
//   create: (formData) => api.post('/api/memory-lane', formData, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
//   like: (id) => api.post(`/api/memory-lane/${id}/like`),
//   comment: (id, text) => api.post(`/api/memory-lane/${id}/comment`, { text })
// };

// // Add user API if needed
// export const userAPI = {
//   getAll: () => api.get('/api/users'),
//   getResidents: () => api.get('/api/users?role=resident')
// };

import axios from 'axios';

const API_BASE_URL = 'https://society-backend-9n7y.onrender.com';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Add 10 second timeout for production
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
    console.log('Request data:', config.data);
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
    console.log('Response received:', response);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Don't redirect automatically to avoid loops in production
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Update all API endpoints - include /api in each endpoint
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (userData) => api.post('/api/auth/register', userData),
  verifyOTP: (userId, otp) => api.post('/api/auth/verify-otp', { userId, otp }),
  getMe: () => api.get('/api/auth/me')
};

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

// Add user API if needed
export const userAPI = {
  getAll: () => api.get('/api/users'),
  getResidents: () => api.get('/api/users?role=resident')
};

export default api;