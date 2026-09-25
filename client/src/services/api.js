import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Attach Authorization header if JWT token is stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('orca_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Central response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'API request failed';
    console.warn(`[ORCA API Error]: ${message}`);
    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

export const marineService = {
  getConditions: (lat, lng, regionId) =>
    api.get('/marine/conditions', { params: { latitude: lat, longitude: lng, regionId } }),
  getObservations: (regionId) =>
    api.get('/marine/observations', { params: { regionId } }),
  getNearby: (lat, lng) =>
    api.get('/marine/nearby', { params: { latitude: lat, longitude: lng } }),
  compare: (loc1, loc2) =>
    api.get('/marine/compare', { params: { loc1, loc2 } })
};

export const fishingService = {
  getZones: (regionId) => api.get('/fishing-zones', { params: { regionId } }),
  getNearby: (lat, lng, radiusKm = 100) =>
    api.get('/fishing-zones/nearby', { params: { latitude: lat, longitude: lng, radiusKm } }),
  analyzePoint: (lat, lng) =>
    api.post('/fishing-zones/analyze', { latitude: lat, longitude: lng })
};

export const riskService = {
  analyze: (lat, lng) => api.post('/risk/analyze', { latitude: lat, longitude: lng }),
  getNearby: (lat, lng) => api.get('/risk/nearby', { params: { latitude: lat, longitude: lng } })
};

export const aiService = {
  query: (message, lat, lng, sessionId) =>
    api.post('/ai/query', { message, latitude: lat, longitude: lng, sessionId }),
  getHistory: (sessionId) => api.get('/ai/history', { params: { sessionId } })
};

export const mapService = {
  getLayers: () => api.get('/map/layers')
};

export const dataService = {
  getSources: () => api.get('/data/sources'),
  getStatus: () => api.get('/data/status')
};

export const alertService = {
  getAlerts: (regionId) => api.get('/alerts', { params: { regionId } }),
  createAlert: (alertData) => api.post('/alerts', alertData)
};

export const healthService = {
  checkHealth: () => api.get('/health')
};

export default api;
