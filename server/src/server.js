const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const marineRoutes = require('./routes/marineRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const oceanRoutes = require('./routes/oceanRoutes');
const fishingZoneRoutes = require('./routes/fishingZoneRoutes');
const riskRoutes = require('./routes/riskRoutes');
const geospatialRoutes = require('./routes/geospatialRoutes');
const aiRoutes = require('./routes/aiRoutes');
const mapRoutes = require('./routes/mapRoutes');
const dataRoutes = require('./routes/dataRoutes');
const alertRoutes = require('./routes/alertRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5000',
    env.CLIENT_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Connect Database (resilient - continues gracefully even if Mongo offline)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/marine', marineRoutes);
app.use('/api/ocean', oceanRoutes);
app.use('/api/fishing-zones', fishingZoneRoutes);
app.use('/api/pfz', fishingZoneRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api', geospatialRoutes); // mounts /api/geocode/search, /api/geofence/check, /api/routes/safest
app.use('/api/ai', aiRoutes);
app.use('/api/chat', aiRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/system', dataRoutes); // mounts /api/system/data-sources, /api/system/status
app.use('/api/alerts', alertRoutes);

// Base route for quick status & OpenAPI summary
app.get('/api', (req, res) => {
  res.json({
    name: 'ORCA — Marine EcOsystem Reasoning with Collaborative Agents',
    version: '2.0.0',
    status: 'ONLINE',
    mode: env.DATA_MODE,
    architecture: 'API-Driven Collaborative Multi-Agent Marine Intelligence',
    endpoints: [
      '/api/health',
      '/api/weather/current',
      '/api/weather/forecast',
      '/api/marine/conditions',
      '/api/marine/forecast',
      '/api/marine/tides',
      '/api/marine/compare',
      '/api/ocean/sst',
      '/api/ocean/chlorophyll',
      '/api/pfz/nearby',
      '/api/pfz/latest',
      '/api/risk/analyze',
      '/api/geocode/search',
      '/api/geofence/check',
      '/api/routes/safest',
      '/api/ai/query',
      '/api/map/layers',
      '/api/alerts',
      '/api/system/data-sources',
      '/api/system/status'
    ]
  });
});

// 404 & Central Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = env.PORT || 5000;

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    logger.success(`=======================================================`);
    logger.success(`🌊 ORCA Marine Intelligence Server Online on port ${PORT}`);
    logger.success(`📍 Mode: ${env.DATA_MODE.toUpperCase()} | AI: ${env.GEMINI_API_KEY ? 'Gemini 1.5' : 'Deterministic Engine'}`);
    logger.success(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    logger.success(`=======================================================`);
  });
}

module.exports = { app, server };
