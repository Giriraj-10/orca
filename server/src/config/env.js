const dotenv = require('dotenv');
const path = require('path');

// Try loading from root .env or local server .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/orca',
  JWT_SECRET: process.env.JWT_SECRET || 'orca_jwt_secret_dev_key_secure_marine_agents_9921',
  DATA_MODE: (process.env.DATA_MODE || 'demo').toUpperCase(),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
