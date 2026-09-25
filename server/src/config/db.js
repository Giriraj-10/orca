const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

let isDbConnected = false;

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    isDbConnected = true;
    logger.success(`MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return true;
  } catch (error) {
    isDbConnected = false;
    logger.warn(`MongoDB Connection Failed: ${error.message}`);
    logger.warn('ORCA is operating with high-availability in-memory datasets and cache.');
    return false;
  }
};

const getDbStatus = () => {
  return {
    isConnected: isDbConnected && mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || 'local-fallback',
    name: mongoose.connection.name || 'orca'
  };
};

module.exports = {
  connectDB,
  getDbStatus
};
