import { config } from '../config/env.js';

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found.`
  });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Safe logging: never print sensitive body keys
  const sanitizedBody = { ...req.body };
  if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
  if (sanitizedBody.confirmPassword) sanitizedBody.confirmPassword = '[REDACTED]';
  
  console.error(`[Error] ${req.method} ${req.originalUrl} - Status: ${statusCode}:`, err.message);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
};
