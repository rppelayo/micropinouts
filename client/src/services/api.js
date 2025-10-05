import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Boards API
export const boardsAPI = {
  getAll: () => api.get('/boards'),
  getById: (id) => api.get(`/boards/${id}`),
  getBoard: (id) => api.get(`/boards/${id}`),
  getPins: (id) => api.get(`/boards/${id}/pins`),
  getBoardPins: (id) => api.get(`/boards/${id}/pins`),
  updatePin: (pinId, data) => api.put(`/pins/${pinId}`, data),
};

// Pins API
export const pinsAPI = {
  getById: (id) => api.get(`/pins/${id}`),
};

// Pin Groups API
export const pinGroupsAPI = {
  getAll: () => api.get('/pin-groups'),
  getPinGroups: () => api.get('/pin-groups'),
};

export default api;

