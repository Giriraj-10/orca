const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  logger.error(`API Error: ${err.message} (${req.method} ${req.originalUrl})`);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    disclaimer: 'ORCA Resilient Marine Intelligence Engine'
  });
};

module.exports = {
  notFound,
  errorHandler
};
