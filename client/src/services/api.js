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

export const weatherService = {
  getCurrent: (lat, lng, targetDate) =>
    api.get('/weather/current', { params: { latitude: lat, longitude: lng, targetDate } }),
  getForecast: (lat, lng) =>
    api.get('/weather/forecast', { params: { latitude: lat, longitude: lng } })
};

export const marineService = {
  getConditions: (lat, lng, regionId, targetDate) =>
    api.get('/marine/conditions', { params: { latitude: lat, longitude: lng, regionId, targetDate } }),
  getForecast: (lat, lng) =>
    api.get('/marine/forecast', { params: { latitude: lat, longitude: lng } }),
  getTides: (lat, lng, date) =>
    api.get('/marine/tides', { params: { latitude: lat, longitude: lng, date } }),
  getObservations: (regionId) =>
    api.get('/marine/observations', { params: { regionId } }),
  getNearby: (lat, lng) =>
    api.get('/marine/nearby', { params: { latitude: lat, longitude: lng } }),
  compare: (loc1, loc2) =>
    api.get('/marine/compare', { params: { loc1, loc2 } })
};

export const oceanService = {
  getSST: (lat, lng) =>
    api.get('/ocean/sst', { params: { latitude: lat, longitude: lng } }),
  getChlorophyll: (lat, lng) =>
    api.get('/ocean/chlorophyll', { params: { latitude: lat, longitude: lng } })
};

export const fishingService = {
  getZones: (lat, lng, radiusKm) =>
    api.get('/fishing-zones', { params: { latitude: lat, longitude: lng, radiusKm } }),
  getNearby: (lat, lng, radiusKm = 100) =>
    api.get('/fishing-zones/nearby', { params: { latitude: lat, longitude: lng, radiusKm } }),
  analyzePoint: (lat, lng) =>
    api.post('/fishing-zones/analyze', { latitude: lat, longitude: lng })
};

export const riskService = {
  analyze: (lat, lng) => api.post('/risk/analyze', { latitude: lat, longitude: lng }),
  getNearby: (lat, lng) => api.get('/risk/nearby', { params: { latitude: lat, longitude: lng } })
};

export const geoService = {
  searchLocation: (query) => api.get('/geocode/search', { params: { q: query } }),
  checkGeofence: (lat, lng) => api.post('/geofence/check', { latitude: lat, longitude: lng }),
  getAllGeofences: () => api.get('/geofence/all'),
  calculateRoute: (startLat, startLng, destLat, destLng, vesselSpeedKnots = 10) =>
    api.post('/routes/safest', { startLat, startLng, destLat, destLng, vesselSpeedKnots })
};

export const aiService = {
  query: (message, lat, lng, sessionId, targetDate) =>
    api.post('/ai/query', { message, latitude: lat, longitude: lng, sessionId, targetDate }),
  getHistory: (sessionId) => api.get('/ai/history', { params: { sessionId } })
};

export const mapService = {
  getLayers: (lat, lng) => api.get('/map/layers', { params: { latitude: lat, longitude: lng } })
};

export const dataService = {
  getSources: () => api.get('/system/data-sources'),
  getStatus: () => api.get('/system/status')
};

export const alertService = {
  getAlerts: (lat, lng, radiusKm) => api.get('/alerts', { params: { latitude: lat, longitude: lng, radiusKm } }),
  createAlert: (alertData) => api.post('/alerts', alertData)
};

export const healthService = {
  checkHealth: () => api.get('/health')
};

export default api;
