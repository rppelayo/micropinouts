import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/micropinouts/api-php';

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin Authentication
export const adminAuth = {
  login: (username, password) => 
    adminApi.post('/admin/login', { username, password }),
  
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }
};

// Admin Boards API
export const adminBoardsAPI = {
  getAll: () => adminApi.get('/admin/boards'),
  getById: (id) => adminApi.get(`/admin/boards/${id}`),
  getByCategory: (category) => adminApi.get(`/admin/wiring-guide/boards?category=${category}`),
  create: (boardData) => adminApi.post('/admin/boards', boardData),
  update: (id, boardData) => adminApi.put(`/admin/boards/${id}`, boardData),
  delete: (id) => adminApi.delete(`/admin/boards/${id}`),
  publish: (id, published) => adminApi.put(`/admin/boards/${id}/publish`, { published }),
  getPins: (id) => adminApi.get(`/admin/boards/${id}/pins`),
  createFromFritzing: (boardData, fritzingData) => 
    adminApi.post('/admin/boards/from-fritzing', { boardData, fritzingData })
};

// Admin Pins API
export const adminPinsAPI = {
  update: (id, pinData) => adminApi.put(`/admin/pins/${id}`, pinData),
  delete: (id) => adminApi.delete(`/admin/pins/${id}`)
};

// Admin Wiring Guides API (plural - for managing existing guides)
export const adminWiringGuidesAPI = {
  getAll: () => adminApi.get('/admin/wiring-guides'),
  getById: (id) => adminApi.get(`/admin/wiring-guide/${id}`),
  publish: (id, published) => adminApi.put(`/admin/wiring-guide/${id}/publish`, { published }),
  update: (id, data) => adminApi.put(`/admin/wiring-guide/${id}`, data),
  delete: (id) => adminApi.delete(`/admin/wiring-guide/${id}`)
};

// Admin Pin Groups API
export const adminPinGroupsAPI = {
  getAll: () => adminApi.get('/admin/pin-groups'),
  create: (groupData) => adminApi.post('/admin/pin-groups', groupData)
};

// Admin Categories API
export const adminCategoriesAPI = {
  getAll: () => adminApi.get('/admin/categories')
};

// Admin Upload API
export const adminUploadAPI = {
  uploadFritzing: (formData) => 
    adminApi.post('/admin/upload-fritzing', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  testFritzingData: () => adminApi.post('/admin/test-fritzing-data')
};

// Admin Wiring Guide API (singular - for generating new guides)
export const adminWiringGuideAPI = {
  preview: (data) => adminApi.post('/admin/wiring-guide/preview', data),
  generate: (data) => adminApi.post('/admin/wiring-guide/generate', data)
};

export default adminApi;