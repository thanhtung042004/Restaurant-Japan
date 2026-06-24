import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Token to headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for Error Handling
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Co loi xay ra, vui long thu lai.';
    return Promise.reject({
      message,
      status: error.response?.status,
      original: error,
    });
  }
);

// AUTH ENDPOINTS
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/updatedetails', data),
  uploadAvatar: (formData) => API.put('/auth/updatedetails', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// USER ENDPOINTS
export const userAPI = {
  getUsers: (params) => API.get('/users', { params }),
  getUserById: (id) => API.get(`/users/${id}`),
  createUser: (data) => API.post('/users', data),
  updateUser: (id, data) => API.put(`/users/${id}`, data),
  deleteUser: (id) => API.delete(`/users/${id}`),
  resetPassword: (id, data) => API.put(`/users/${id}/reset-password`, data),
};

// CATEGORY ENDPOINTS
export const categoryAPI = {
  getCategories: () => API.get('/categories'),
  getAllCategories: () => API.get('/categories/all'),
  createCategory: (formData) => API.post('/categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCategory: (id, formData) => API.put(`/categories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteCategory: (id) => API.delete(`/categories/${id}`),
};

// MENU ENDPOINTS
export const menuAPI = {
  getItems: (params) => API.get('/menu', { params }),
  getItemById: (id) => API.get(`/menu/${id}`),
  createItem: (formData) => API.post('/menu', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateItem: (id, formData) => API.put(`/menu/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteItem: (id) => API.delete(`/menu/${id}`),
  toggleAvailability: (id) => API.patch(`/menu/${id}/toggle-availability`),
};

// TABLE ENDPOINTS
export const tableAPI = {
  getTables: () => API.get('/tables'),
  getTableById: (id) => API.get(`/tables/${id}`),
  updateStatus: (id, status) => API.put(`/tables/${id}/status`, { status }),
  createTable: (data) => API.post('/tables', data),
  updateTable: (id, data) => API.put(`/tables/${id}`, data),
  deleteTable: (id) => API.delete(`/tables/${id}`),
};

// RESERVATION ENDPOINTS
export const reservationAPI = {
  getReservations: (params) => API.get('/reservations', { params }),
  getById: (id) => API.get(`/reservations/${id}`),
  create: (data) => API.post('/reservations', data),
  confirm: (id, tableId) => API.put(`/reservations/${id}/confirm`, { tableId }),
  cancel: (id) => API.put(`/reservations/${id}/cancel`),
  updateStatus: (id, status) => API.put(`/reservations/${id}/status`, { status }),
};

// ORDER ENDPOINTS
export const orderAPI = {
  getOrders: (params) => API.get('/orders', { params }),
  getById: (id) => API.get(`/orders/${id}`),
  getKitchenOrders: () => API.get('/orders/kitchen'),
  create: (data) => API.post('/orders', data),
  addItems: (id, items) => API.put(`/orders/${id}/items`, { items }),
  updateStatus: (id, status) => API.put(`/orders/${id}/status`, { status }),
  cancel: (id) => API.put(`/orders/${id}/cancel`),
  updateItemStatus: (orderId, itemId, status) => 
    API.put(`/orders/${orderId}/items/${itemId}/status`, { status }),
};

// INVOICE ENDPOINTS
export const invoiceAPI = {
  getInvoices: (params) => API.get('/invoices', { params }),
  getById: (id) => API.get(`/invoices/${id}`),
  create: (data) => API.post('/invoices', data),
  getStatistics: () => API.get('/invoices/statistics'),
  getDailyRevenue: () => API.get('/invoices/daily-revenue'),
  getMonthlyRevenue: () => API.get('/invoices/monthly-revenue'),
  getTopItems: () => API.get('/invoices/top-items'),
  getPeakHours: () => API.get('/invoices/peak-hours'),
};

// AI ENDPOINTS
export const aiAPI = {
  getFoodSuggestion: (message) => API.post('/ai/food-suggestion', { message }),
  getBusinessAnalysis: (question) => API.post('/ai/business-analysis', { question }),
  getChatHistory: (type) => API.get('/ai/history', { params: { type } }),
};

export default API;
